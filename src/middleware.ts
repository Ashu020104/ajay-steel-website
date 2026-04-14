import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {},
  {
    pages: { signIn: "/admin/login" },
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname === "/admin/login") return true;
        return !!token;
      },
    },
  },
);

export const config = { matcher: ["/admin/:path*"] };

