/**
 * Next.js Edge Middleware — Huwiyati Web Dashboard
 *
 * خط الدفاع الأول: يعمل على Edge قبل تحميل أي React component.
 * مهامه:
 *  1. يمنع الوصول لأي مسار محمي بدون توكن في localStorage.
 *  2. يعيد التوجيه إلى /login عند غياب التوكن.
 *  3. يعيد التوجيه من /login إلى المسار المناسب إذا كانت الجلسة قائمة.
 *
 * ملاحظة: لا يمكن للـ Middleware قراءة localStorage (Edge Runtime).
 * لذا يعمل الـ Middleware على cookie "hwyati_has_session" كـ signal خفيف.
 * التحقق الحقيقي من صلاحيات الدور يتم داخل usePortalGuard (Client Side).
 */

import { NextRequest, NextResponse } from "next/server";

/** المسارات التي تحتاج مصادقة */
const PROTECTED_PREFIXES = [
  "/admin",
  "/civil-registry",
  "/passports",
  "/traffic",
  "/hospitals",
];

/** المسارات العامة (لا تحتاج توكن) */
const PUBLIC_PATHS = ["/login", "/"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isPublic    = PUBLIC_PATHS.includes(pathname);

  // Signal cookie — يُعيَّن من client-side بعد تسجيل الدخول
  const hasSession = req.cookies.get("hwyati_has_session")?.value === "1";

  // ── محمي + بدون جلسة → /login ──────────────────────────────────────────
  if (isProtected && !hasSession) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── /login مع جلسة قائمة → block (يترك للـ client guard التوجيه) ──────
  // لا نحتاج redirect هنا لأن AuthContext سيتولى التوجيه بعد الـ hydration.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * طبّق على كل المسارات ما عدا:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, public assets
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
