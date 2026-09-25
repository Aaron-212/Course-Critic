import type { LayoutServerLoad } from "./$types";

const idpOrigin = "https://idp.aaron212.com";

function providerUrl(path: string, returnUrl: URL) {
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

export const load: LayoutServerLoad = async ({ platform, request, url }) => {
  let authenticated = false;
  const cookieName = `${url.protocol === "https:" ? "__Secure-" : ""}aaron212.session_token`;
  const sessionCookie = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));
  if (sessionCookie && platform?.env.PLATFORM_AUTH) {
    try {
      authenticated = !!(await platform.env.PLATFORM_AUTH.authenticate(sessionCookie));
    } catch {
      // Keep the public course browser available if the identity service is down.
    }
  }

  return {
    authenticated,
    signInUrl: providerUrl("/sign-in", url),
    registerUrl: providerUrl("/register", url),
    accountUrl: new URL("/account", idpOrigin).href,
  };
};
