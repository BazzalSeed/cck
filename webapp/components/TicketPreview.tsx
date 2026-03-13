"use client";

import { useToast } from "@/components/ui/Toast";

interface TicketPreviewProps {
  image: string;
  html: string;
}

export default function TicketPreview({ image, html }: TicketPreviewProps) {
  const { toast } = useToast();

  async function copyTable() {
    try {
      const blob = new Blob([html], { type: "text/html" });
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": blob }),
      ]);
      toast("已复制表格到剪贴板");
    } catch {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      await navigator.clipboard.writeText(tmp.innerText);
      toast("已复制为文本", "info");
    }
  }

  function downloadImage() {
    const link = document.createElement("a");
    link.href = `data:image/jpeg;base64,${image}`;
    link.download = "工单.jpg";
    link.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          onClick={copyTable}
        >
          复制表格
        </button>
        <button
          className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
          onClick={downloadImage}
        >
          下载图片
        </button>
      </div>
      <div className="border rounded overflow-auto">
        <img
          src={`data:image/jpeg;base64,${image}`}
          alt="工单预览"
          className="max-w-full animate-fade-in"
        />
      </div>
    </div>
  );
}
