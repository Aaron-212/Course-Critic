const idpOrigin = "https://idp.aaron212.com";

export function providerUrl(path: string, returnUrl: URL) {
  const url = new URL(path, idpOrigin);
  if (
    returnUrl.protocol === "https:" &&
    (returnUrl.hostname === "aaron212.com" || returnUrl.hostname.endsWith(".aaron212.com")) &&
    !returnUrl.port &&
    !returnUrl.username &&
    !returnUrl.password
  ) {
    url.searchParams.set("callback_url", returnUrl.href);
  }
  return url.href;
}

function sessionCookie(request: Request, url: URL) {
  const cookieName = `${url.protocol === "https:" ? "__Secure-" : ""}aaron212.session_token`;
  return (request.headers.get("cookie") ?? "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));
}

export function hasSessionCookie(request: Request, url: URL) {
  return !!sessionCookie(request, url);
}

export async function isAuthenticated(
  request: Request,
  url: URL,
  auth: App.Platform["env"]["PLATFORM_AUTH"] | undefined,
) {
  const cookie = sessionCookie(request, url);
  if (!cookie || !auth) return false;

  try {
    return !!(await auth.authenticate(cookie));
  } catch {
    // Keep public pages available if the identity service is down.
    return false;
  }
}

export const accountUrl = new URL("/account", idpOrigin).href;
