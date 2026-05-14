export { hashPassword, verifyPassword } from "./auth/password"
export {
  createSession,
  getCurrentUser,
  requireUser,
  requireStoreUser,
  deleteSession,
} from "./auth/session"
export type { AuthUser } from "./auth/session"
// Re-export as getSession for backward compatibility with API routes
export { getCurrentUser as getSession, requireStoreUser as requireAuth } from "./auth/session"
