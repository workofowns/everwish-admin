const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
export const API_BASE_URL = `${API_BASE}/admin`;
export const MEDIA_BASE_URL = API_BASE; // /media is not under /admin

// ── S3 Folder constants (must match backend S3_FOLDERS) ──────────────────────
export const MEDIA_FOLDERS = {
  CATEGORIES:     "categories",
  SUB_CATEGORIES: "sub-categories",
  TEMPLATES:      "templates",
  WISHES:         "wishes",
  USER_PROFILES:  "users/profiles",
  USER_COVERS:    "users/covers",
} as const;

export type MediaFolder = typeof MEDIA_FOLDERS[keyof typeof MEDIA_FOLDERS];

// ── General JSON API utility ──────────────────────────────────────────────────
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("adminToken");

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || errorData.message || `API Error: ${res.statusText}`);
  }

  return res.json();
};

// ── Media Upload utility (S3 + CloudFront) ───────────────────────────────────
/**
 * Uploads a file to S3 via the backend /media/upload endpoint.
 * Returns the CloudFront CDN URL.
 *
 * @param file    The File object from an <input type="file">
 * @param folder  The S3 destination folder. Use MEDIA_FOLDERS constants.
 * @returns       The public CloudFront URL of the uploaded asset.
 */
export const uploadMedia = async (file: File, folder: MediaFolder): Promise<string> => {
  const token = localStorage.getItem("adminToken");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch(`${MEDIA_BASE_URL}/media/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type — browser sets it with boundary for multipart
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || errorData.message || "Upload failed");
  }

  const data = await res.json();
  return data.url; // CloudFront CDN URL
};
