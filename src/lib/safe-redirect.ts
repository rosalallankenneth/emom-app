export function getSafeRedirectTo(value?: string) {
  if (!value) return "/";

  try {
    const baseUrl = "https://emom.invalid";
    const url = new URL(value, baseUrl);

    if (url.origin !== baseUrl || !url.pathname.startsWith("/")) {
      return "/";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
