import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// This protects all routes by default
const isProtectedRoute = createRouteMatcher(["/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); // <--- FIXED: Now using await for the async auth check
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};