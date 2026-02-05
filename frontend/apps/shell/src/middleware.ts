import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // If there is a token, the user is authorized.
      // We can add more granular role-based checks here later.
      return !!token;
    },
  },
});

export const config = {
  // Protect these routes.
  // Note: We do NOT protect "/" (Home) so the landing page is accessible.
  // We ONLY protect the functional apps.
  matcher: ["/chat/:path*", "/ingest/:path*", "/control/:path*"],
};
