export const getB2KeyId = () => (process.env.B2_KEY_ID ?? "").trim();
export const getB2ApplicationKey = () => (process.env.B2_APPLICATION_KEY ?? "").trim();
export const getB2BucketId = () => (process.env.B2_BUCKET_ID ?? "").trim();
export const getB2BucketName = () => (process.env.B2_BUCKET_NAME ?? "").trim();

export const B2_BUCKET_ID = (process.env.B2_BUCKET_ID ?? "").trim();
export const B2_BUCKET_NAME = (process.env.B2_BUCKET_NAME ?? "").trim();

const B2_AUTHORIZE_URL =
  "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";

interface B2Session {
  accountId: string;
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
  expiresAt: number;
}

let cachedSession: B2Session | null = null;

export const authorizeB2 = async (): Promise<B2Session> => {
  if (cachedSession && cachedSession.expiresAt > Date.now()) {
    return cachedSession;
  }

  const keyId = getB2KeyId();
  const appKey = getB2ApplicationKey();

  if (!keyId || !appKey) {
    throw new Error(
      "Missing B2 credentials: B2_KEY_ID and B2_APPLICATION_KEY must be set in your environment variables.",
    );
  }

  if (keyId.length <= 12) {
    throw new Error(
      `Invalid B2_KEY_ID "${keyId}": A 12-character Backblaze Account ID was provided instead of the 25-character Application Key ID (keyID). Please check your Backblaze App Keys page.`,
    );
  }

  const credentials = Buffer.from(
    `${keyId}:${appKey}`,
  ).toString("base64");

  const res = await fetch(B2_AUTHORIZE_URL, {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!res.ok) {
    throw new Error(
      `B2 authorization failed: ${res.status} ${await res.text()}`,
    );
  }

  const data = await res.json();

  cachedSession = {
    accountId: data.accountId,
    authorizationToken: data.authorizationToken,
    apiUrl: data.apiUrl,
    downloadUrl: data.downloadUrl,
    // B2 auth tokens are valid for 24h; refresh a little early
    expiresAt: Date.now() + 23 * 60 * 60 * 1000,
  };

  return cachedSession;
};
