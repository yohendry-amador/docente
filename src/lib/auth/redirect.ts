export function getRedirectPathForRole(role?: string | null): string {
  const normalizedRole = role?.toUpperCase()

  if (normalizedRole === "ADMIN") {
    return "/admin"
  }

  if (normalizedRole === "STUDENT") {
    return "/student"
  }

  return "/professor"
}
