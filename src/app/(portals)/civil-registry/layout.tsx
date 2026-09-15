"use client";

import React from "react";
import { UnifiedPortalLayout } from "@/components/layout/UnifiedPortalLayout";

export default function CivilRegistryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UnifiedPortalLayout
      portalType="civil-registry"
      portalTitle="مصلحة الأحوال المدنية والسجل المدني"
      portalSubtitle="وزارة الداخلية - الجمهورية اليمنية"
    >
      {children}
    </UnifiedPortalLayout>
  );
}
