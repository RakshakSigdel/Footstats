import crypto from "crypto";

export const generateUniqueId = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const generateHmacSha256Hash = (data, secret) => {
  if (!data || !secret) {
    throw new Error("Both data and secret are required to generate a hash.");
  }

  // Create HMAC SHA256 hash and encode it in Base64
  const hash = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64");

  return hash;
}

