import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // Dashboard — authenticated users only
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      return Response.redirect(new URL("/login", req.url));
    }

    // STAFF goes to Staff area
    if (user.role === "STAFF") {
      return Response.redirect(new URL("/staff", req.url));
    }

    // ADMIN goes to Admin area
    if (user.role === "ADMIN") {
      return Response.redirect(new URL("/admin", req.url));
    }
  }

  // Staff area — STAFF and ADMIN
  if (pathname.startsWith("/staff")) {
    if (!user) {
      return Response.redirect(new URL("/login", req.url));
    }

    if (user.role !== "STAFF" && user.role !== "ADMIN") {
      return Response.redirect(new URL("/dashboard", req.url));
    }
  }

  // Admin area — ADMIN only
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return Response.redirect(new URL("/login", req.url));
    }

    if (user.role !== "ADMIN") {
      return Response.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/staff/:path*", "/admin/:path*"],
};
