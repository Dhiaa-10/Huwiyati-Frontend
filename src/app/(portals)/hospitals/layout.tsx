"use client";

import React from "react";
import { UnifiedPortalLayout } from "@/components/layout/UnifiedPortalLayout";

export default function HospitalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UnifiedPortalLayout
      portalType="hospitals"
      portalTitle="هيئة المستشفيات والمنشآت الصحية"
      portalSubtitle="وزارة الصحة العامة والسكان - الجمهورية اليمنية"
    >
      {children}
    </UnifiedPortalLayout>
  );
}
