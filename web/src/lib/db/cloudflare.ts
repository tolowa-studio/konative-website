/**
 * @deprecated Import from `@/lib/db/client` instead.
 * Retained for backward compatibility during the Cloudflare → Cloud Run migration.
 */
export {
  CloudflareBindingUnavailableError,
  DatabaseUnavailableError,
  getBindings,
  getD1,
  rethrowD1OperationFailure,
  type KonativeBindings,
} from "./client";
