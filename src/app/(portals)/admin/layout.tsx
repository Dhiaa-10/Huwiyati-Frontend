"use client";

import React from "react";
import { UnifiedPortalLayout } from "@/components/layout/UnifiedPortalLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UnifiedPortalLayout
      portalType="admin"
      portalTitle="منظومة هويتي - الرقابة المركزية"
      portalSubtitle="بوابة السوبر أدمن (Super Admin) - ديوان عام الوزارة"
    >
      {children}
    </UnifiedPortalLayout>
  );
}
