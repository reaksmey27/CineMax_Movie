export const getAuthRedirect = (state) => {
  const returnTo = state?.returnTo;
  return typeof returnTo === "string" &&
    (returnTo === "/profile" || /^\/movie\/\d+$/.test(returnTo))
    ? returnTo
    : "/";
};
