"use client";

import { PageHeader } from "@/components/shared/page-header";

export function CustomerPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto flex w-full container flex-1 flex-col px-4 pb-6 pt-5 sm:px-8 sm:pb-8 md:px-10 md:pb-10 md:pt-9">
      <PageHeader title={title} description={description} />
      <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:mt-6">
        <p className="text-[14px] font-medium text-text-primary">به‌زودی</p>
        <p className="mt-1.5 text-[12.5px] leading-5 text-muted">
          این بخش هنوز به سرویس متصل نشده است.
        </p>
      </div>
    </main>
  );
}
