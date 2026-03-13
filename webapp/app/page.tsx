"use client";

import { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import TicketForm from "@/components/TicketForm";
import TicketPreview from "@/components/TicketPreview";

export default function Home() {
  const [result, setResult] = useState<{ image: string; html: string } | null>(
    null
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-4">填写工单信息</h2>
            <TicketForm onGenerate={setResult} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-4">工单预览</h2>
            {result ? (
              <TicketPreview image={result.image} html={result.html} />
            ) : (
              <p className="text-gray-400 text-center py-16">
                选择参数后点击"生成工单"预览
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
