import crypto from "crypto";
import { authorizeB2, getB2BucketId, getB2BucketName, B2_BUCKET_ID, B2_BUCKET_NAME } from "../config/b2";

const DEFAULT_SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

// Once a Cloudflare Worker is deployed in front of B2 (see cloudflare-worker/),
// set this to the Worker's custom domain to route reads through it instead of
// hitting the raw *.backblazeb2.com host directly.
const getCdnBaseUrl = () => process.env.CDN_BASE_URL?.replace(/\/$/, "");

export const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

export const encodeB2FileName = (fileName: string) =>
  fileName.split("/").map(encodeURIComponent).join("/");

interface B2UploadUrl {
  uploadUrl: string;
  authorizationToken: string;
}

export const getB2UploadUrl = async (): Promise<B2UploadUrl> => {

  const session = await authorizeB2();
  const bucketId = getB2BucketId() || B2_BUCKET_ID;

  const res = await fetch(`${session.apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: "POST",
    headers: {
      Authorization: session.authorizationToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ bucketId })
  });

  if (!res.ok) {
    throw new Error(`B2 get_upload_url failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();

  return {
    uploadUrl: data.uploadUrl,
    authorizationToken: data.authorizationToken
  };

};

interface B2UploadResult {
  fileId: string;
  fileName: string;
  size: number;
}

export const uploadFileToB2 = async (
  file: Express.Multer.File,
  keyPrefix: string
): Promise<B2UploadResult> => {

  const { uploadUrl, authorizationToken } = await getB2UploadUrl();

  const buffer = file.buffer;

  const sha1 = crypto.createHash("sha1").update(buffer).digest("hex");

  const fileName = `${keyPrefix}/${Date.now()}-${sanitizeFileName(file.originalname)}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: authorizationToken,
      "X-Bz-File-Name": encodeB2FileName(fileName),
      "Content-Type": file.mimetype || "b2/x-auto",
      "X-Bz-Content-Sha1": sha1,
      "Content-Length": String(buffer.length)
    },
    body: buffer as unknown as BodyInit
  });

  if (!res.ok) {
    throw new Error(`B2 upload failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();

  return {
    fileId: data.fileId,
    fileName: data.fileName,
    size: data.contentLength
  };

};

/**
 * Generates a protected, signed streaming URL for video playback.
 * 
 * - Does NOT expose raw Backblaze B2 authorization tokens.
 * - Does NOT expose the B2 bucket name.
 * - Signed with HMAC-SHA256 and expires after validDurationInSeconds (default 1 hour).
 * - Verified by the Edge Cloudflare Worker which blocks direct browser address-bar copy-pasting.
 */
export const getVideoStreamUrl = (
  fileName: string,
  validDurationInSeconds = DEFAULT_SIGNED_URL_TTL_SECONDS
): string => {
  const cdnBase = getCdnBaseUrl();
  const exp = Math.floor(Date.now() / 1000) + validDurationInSeconds;
  const secret = process.env.STREAM_SECRET || process.env.JWT_SECRET || "tksacademysecretkey";

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${fileName}:${exp}`)
    .digest("hex");

  if (cdnBase) {
    return `${cdnBase}/stream/${encodeB2FileName(fileName)}?exp=${exp}&sig=${signature}`;
  }

  // Fallback to legacy direct URL if no CDN_BASE_URL is configured
  const bucketName = getB2BucketName() || B2_BUCKET_NAME;
  return `https://f005.backblazeb2.com/file/${bucketName}/${encodeB2FileName(fileName)}?exp=${exp}&sig=${signature}`;
};

export const getB2SignedUrl = async (
  fileName: string,
  validDurationInSeconds = DEFAULT_SIGNED_URL_TTL_SECONDS
): Promise<string> => {

  const session = await authorizeB2();

  const res = await fetch(`${session.apiUrl}/b2api/v2/b2_get_download_authorization`, {
    method: "POST",
    headers: {
      Authorization: session.authorizationToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      bucketId: getB2BucketId() || B2_BUCKET_ID,
      fileNamePrefix: fileName,
      validDurationInSeconds
    })
  });

  if (!res.ok) {
    throw new Error(`B2 get_download_authorization failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const bucketName = getB2BucketName() || B2_BUCKET_NAME;

  const path = `/file/${bucketName}/${encodeB2FileName(fileName)}?Authorization=${data.authorizationToken}`;

  return `${getCdnBaseUrl() || session.downloadUrl}${path}`;

};

export const resolveSignedUrl = async (
  fileName?: string | null,
  validDurationInSeconds = DEFAULT_SIGNED_URL_TTL_SECONDS
): Promise<string | null> => {
  if (!fileName) return null;
  return getB2SignedUrl(fileName, validDurationInSeconds);
};

export const createPresignedB2UploadPayload = async (
  keyPrefix: string,
  fileName: string,
  contentType: string
) => {
  const key = `${keyPrefix}/${Date.now()}-${sanitizeFileName(fileName)}`;
  const { uploadUrl, authorizationToken } = await getB2UploadUrl();

  return {
    uploadUrl,
    fileName: key,
    headers: {
      Authorization: authorizationToken,
      "X-Bz-File-Name": encodeB2FileName(key),
      "Content-Type": contentType,
      "X-Bz-Content-Sha1": "do_not_verify",
    },
  };
};

export const deleteB2File = async (
  fileId: string,
  fileName: string
): Promise<void> => {

  const session = await authorizeB2();

  const res = await fetch(`${session.apiUrl}/b2api/v2/b2_delete_file_version`, {
    method: "POST",
    headers: {
      Authorization: session.authorizationToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fileName, fileId })
  });

  if (!res.ok) {
    // best-effort cleanup - don't fail the calling request over a stale/missing B2 file
    console.error(`B2 delete_file_version failed for ${fileName}: ${res.status} ${await res.text()}`);
  }

};
