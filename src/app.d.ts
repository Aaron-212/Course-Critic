/// <reference types="@cloudflare/workers-types" />

declare global {
  namespace App {
    interface PageState {
      detailFromApp?: boolean;
    }

    interface Platform {
      env: {
        DB: D1Database;
        PLATFORM_AUTH: {
          authenticate(cookie: string): Promise<{
            user: {
              id: string;
              email: string;
              name: string;
              emailVerified: true;
              role: "admin" | "user";
            };
            expiresAt: string;
          } | null>;
        };
      };
    }
  }
}

export {};
