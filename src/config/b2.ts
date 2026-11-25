const cleanEnvVar = (val?: string) => (val ?? "").trim().replace(/^["']|["']$/g, "").trim();

export const getB2KeyId = () => cleanEnvVar(process.env.B2_KEY_ID);
export const getB2ApplicationKey = () => cleanEnvVar(process.env.B2_APPLICATION_KEY);
export const getB2BucketId = () => cleanEnvVar(process.env.B2_BUCKET_ID);
export const getB2BucketName = () => cleanEnvVar(process.env.B2_BUCKET_NAME);

export const B2_BUCKET_ID = cleanEnvVar(process.env.B2_BUCKET_ID);
export const B2_BUCKET_NAME = cleanEnvVar(process.env.B2_BUCKET_NAME);

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
    const errorText = await res.text();
    const maskedKeyId = keyId.length >= 8
      ? `${keyId.slice(0, 4)}...${keyId.slice(-4)}`
      : keyId || "(empty)";
    throw new Error(
      `B2 authorization failed: ${res.status} ${errorText} | Active B2_KEY_ID on server: "${maskedKeyId}" (length: ${keyId.length}, B2_APPLICATION_KEY length: ${appKey.length}). Check Vercel Environment Variables.`
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
