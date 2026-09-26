import type { LayoutServerLoad } from "./$types";
import { accountUrl, hasSessionCookie, providerUrl } from "$lib/server/auth";

export const load: LayoutServerLoad = ({ request, url }) => {
  return {
    hasSessionCookie: hasSessionCookie(request, url),
    signInUrl: providerUrl("/sign-in", url),
    registerUrl: providerUrl("/register", url),
    accountUrl,
  };
};
