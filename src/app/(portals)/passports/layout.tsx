"use client";

import React from "react";
import { UnifiedPortalLayout } from "@/components/layout/UnifiedPortalLayout";

export default function PassportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UnifiedPortalLayout
      portalType="passports"
      portalTitle="مصلحة الهجرة والجوازات والجنسية"
      portalSubtitle="وزارة الداخلية - الجمهورية اليمنية"
    >
      {children}
    </UnifiedPortalLayout>
  );
}
