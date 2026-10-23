import React, { Suspense } from "react";
import VerificationView from "./VerificationView";

export const metadata = {
  title: "التحقق من صحة الوثائق الرسمية | منظومة هويتي",
  description: "بوابة التحقق الفوري من صحة ومطابقة الوثائق الرسمية الصادرة عن مصلحة الأحوال المدنية والجوازات",
};

interface VerifyPageProps {
  searchParams: Promise<{ payload?: string }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm font-semibold text-slate-500">جاري التحميل...</div>}>
      <VerificationView initialPayload={params.payload} />
    </Suspense>
  );
}
