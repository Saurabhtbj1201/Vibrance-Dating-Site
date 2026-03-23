const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000").replace(/\/$/, "");
const PLACEHOLDER_URL = `${import.meta.env.BASE_URL}images/placeholder-avatar.png`;

export function resolveImageUrl(url?: string | null): string {
  if (!url) {
    return PLACEHOLDER_URL;
  }

  // Fix historical image URLs saved with localhost in older deployments.
  if (url.startsWith("http://localhost:3000") || url.startsWith("https://localhost:3000")) {
    return `${BACKEND_URL}${url.replace(/^https?:\/\/localhost:3000/, "")}`;
  }

  // Normalize relative API paths to the backend host.
  if (url.startsWith("/api/")) {
    return `${BACKEND_URL}${url}`;
  }

  return url;
}
