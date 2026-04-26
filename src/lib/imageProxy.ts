const ALLOWED_IMAGE_HOST_SUFFIXES = [".cdninstagram.com", ".fbcdn.net", ".kpopping.com"];
const ALLOWED_IMAGE_HOSTS = ["kpopping.com"];

export function isAllowedProxyImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const hostname = url.hostname.toLowerCase();
    return ALLOWED_IMAGE_HOSTS.includes(hostname) || ALLOWED_IMAGE_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

export function toProxiedImageUrl(url: string): string {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}
