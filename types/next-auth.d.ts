import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      /** Stable id for `api_keys.user_id` (e.g. Google `sub`). */
      id: string;
    };
  }
}
