"use client";

import { WorkTicket } from "@/lib/db";

interface TicketTableProps {
  tickets: WorkTicket[];
  onEdit: (ticket: WorkTicket) => void;
  onDelete: (id: number) => void;
}

export default function TicketTable({ tickets, onEdit, onDelete }: TicketTableProps) {
  if (tickets.length === 0) {
    return <p className="text-center text-gray-400 py-12">没有找到零件记录</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2 px-3 font-medium">ID</th>
            <th className="py-2 px-3 font-medium">类别</th>
            <th className="py-2 px-3 font-medium">产品代号</th>
            <th className="py-2 px-3 font-medium">零件名称</th>
            <th className="py-2 px-3 font-medium">材质</th>
            <th className="py-2 px-3 font-medium">工序数</th>
            <th className="py-2 px-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-2 px-3 text-gray-400">{t.id}</td>
              <td className="py-2 px-3">{t.category}</td>
              <td className="py-2 px-3 font-mono text-xs">{t.product_code}</td>
              <td className="py-2 px-3">{t.part_name}</td>
              <td className="py-2 px-3 text-gray-600 max-w-[200px] truncate">{t.material}</td>
              <td className="py-2 px-3">{t.process_count}</td>
              <td className="py-2 px-3">
                <div className="flex gap-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => onEdit(t)}
                  >
                    编辑
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => onDelete(t.id)}
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
