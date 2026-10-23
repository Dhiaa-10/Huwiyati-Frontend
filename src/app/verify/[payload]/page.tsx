import React, { Suspense } from "react";
import VerificationView from "../VerificationView";

export const metadata = {
  title: "التحقق من الوثيقة | منظومة هويتي",
  description: "التحقق المباشر من صحة الوثيقة الرسمية",
};

interface VerifyPayloadPageProps {
  params: Promise<{ payload: string }>;
}

export default async function VerifyPayloadPage({ params }: VerifyPayloadPageProps) {
  const { payload } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm font-semibold text-slate-500">جاري التحقق من الوثيقة...</div>}>
      <VerificationView initialPayload={decodeURIComponent(payload)} />
    </Suspense>
  );
}
