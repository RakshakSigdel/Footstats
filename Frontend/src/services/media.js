import api from "./api";

const absoluteUrlPattern = /^https?:\/\//i;

const getMediaBaseUrl = () => {
  const configured = (import.meta.env.VITE_API_BASE_URL || api.defaults.baseURL || "").trim();
  if (!configured) return "";
  return configured.replace(/\/?api\/?$/, "");
};

export const toMediaUrl = (path) => {
  if (!path || typeof path !== "string") return null;
  if (absoluteUrlPattern.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const mediaBase = getMediaBaseUrl();
  return mediaBase ? `${mediaBase}${normalizedPath}` : normalizedPath;
};
