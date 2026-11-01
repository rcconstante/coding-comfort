import {
  convexAuthNextjsMiddleware,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const path = request.nextUrl.pathname;
    if (
      path.startsWith("/admin") &&
      path !== "/admin/login" &&
      !(await convexAuth.isAuthenticated())
    )
      return nextjsMiddlewareRedirect(request, "/admin/login");
  },
  { cookieConfig: { maxAge: 60 * 60 * 8 } },
);
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.png|.*\\.(?:png|ico|svg|pdf)$).*)",
  ],
};
