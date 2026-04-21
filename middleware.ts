import { auth } from "@/lib/auth";

export default auth((req: any) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/registro");
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth");
  const isApiPublic = nextUrl.pathname === "/api/tenants"; // registro público
  const isPublic = nextUrl.pathname === "/";

  if (isApiAuth || isApiPublic || isPublic) return;

  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
