"use client";

import React from "react";
import { UnifiedPortalLayout } from "@/components/layout/UnifiedPortalLayout";

export default function TrafficLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UnifiedPortalLayout
      portalType="traffic"
      portalTitle="الإدارة العامة للمرور"
      portalSubtitle="وزارة الداخلية - الجمهورية اليمنية"
    >
      {children}
    </UnifiedPortalLayout>
  );
}
