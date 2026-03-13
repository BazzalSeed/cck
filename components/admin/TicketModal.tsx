"use client";

import { useState, useEffect } from "react";

interface TicketModalData {
  id?: number;
  category: string;
  product_code: string;
  part_name: string;
  material: string;
  processes: string;
}

interface TicketModalProps {
  ticket: TicketModalData | null;
  onClose: () => void;
  onSave: (data: TicketModalData) => void;
}

export default function TicketModal({ ticket, onClose, onSave }: TicketModalProps) {
  const [form, setForm] = useState<TicketModalData>({
    category: "",
    product_code: "",
    part_name: "",
    material: "",
    processes: "",
  });

  useEffect(() => {
    if (ticket) {
      setForm(ticket);
    }
  }, [ticket]);

  const isEdit = !!ticket?.id;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  const inputClass =
    "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 m-4">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? "编辑零件" : "新建零件"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">类别</label>
            <input
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">产品代号</label>
            <input
              className={inputClass}
              value={form.product_code}
              onChange={(e) => setForm({ ...form, product_code: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">零件名称</label>
            <input
              className={inputClass}
              value={form.part_name}
              onChange={(e) => setForm({ ...form, part_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">材质</label>
            <input
              className={inputClass}
              value={form.material}
              onChange={(e) => setForm({ ...form, material: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              工序 <span className="text-gray-400 font-normal">(用 " → " 分隔)</span>
            </label>
            <textarea
              className={inputClass}
              rows={3}
              value={form.processes}
              onChange={(e) => setForm({ ...form, processes: e.target.value })}
              placeholder="下料 → 车 → 钳工 → 检验"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {isEdit ? "保存" : "创建"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
