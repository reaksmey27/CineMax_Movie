// ─── getAuthRedirect: safe post-login return URL ──────────────────────────────

export const getAuthRedirect = (state) => {
  const returnTo = state?.returnTo;
  if (
    typeof returnTo === "string" &&
    (returnTo === "/profile" || /^\/movie\/\d+$/.test(returnTo))
  ) {
    return returnTo;
  }

  const backgroundLocation = state?.backgroundLocation;
  const pathname = backgroundLocation?.pathname;
  if (
    typeof pathname === "string" &&
    pathname.startsWith("/") &&
    !pathname.startsWith("//") &&
    !["/login", "/signup", "/register"].includes(pathname)
  ) {
    return `${pathname}${backgroundLocation.search || ""}${backgroundLocation.hash || ""}`;
  }

  return "/";
};
