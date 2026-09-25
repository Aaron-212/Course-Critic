import type { LayoutServerLoad } from "./$types";
import { accountUrl, isAuthenticated, providerUrl } from "$lib/server/auth";

export const load: LayoutServerLoad = async ({ platform, request, url }) => {
  return {
    authenticated: await isAuthenticated(request, url, platform?.env.PLATFORM_AUTH),
    signInUrl: providerUrl("/sign-in", url),
    registerUrl: providerUrl("/register", url),
    accountUrl,
  };
};
