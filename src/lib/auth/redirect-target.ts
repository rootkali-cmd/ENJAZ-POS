import { getCurrentUser } from "./session"

export async function getAppRedirectTarget(): Promise<string> {
  const user = await getCurrentUser()
  if (!user) return "/login"
  if (!user.storeId) return "/onboarding"
  return "/dashboard"
}
