"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/ui/Navbar";
import { useToast } from "@/components/ui/Toast";
import TicketTable from "@/components/admin/TicketTable";
import TicketModal from "@/components/admin/TicketModal";
import Pagination from "@/components/admin/Pagination";

interface WorkTicket {
  id: number;
  category: string;
  product_code: string;
  part_name: string;
  material: string;
  processes: string;
  process_count: number;
}

interface ModalData {
  id?: number;
  category: string;
  product_code: string;
  part_name: string;
  material: string;
  processes: string;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<WorkTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const limit = 20;

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  const fetchTickets = useCallback(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("search", search);
    if (categoryFilter) params.set("category", categoryFilter);

    fetch(`/api/admin/tickets?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setTickets(data.tickets);
        setTotal(data.total);
      });
  }, [page, search, categoryFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  }

  function openCreate() {
    setModal({
      category: categoryFilter || "",
      product_code: "",
      part_name: "",
      material: "",
      processes: "",
    });
    setShowModal(true);
  }

  function openEdit(ticket: WorkTicket) {
    setModal({
      id: ticket.id,
      category: ticket.category,
      product_code: ticket.product_code,
      part_name: ticket.part_name,
      material: ticket.material,
      processes: ticket.processes,
    });
    setShowModal(true);
  }

  async function handleSave(data: ModalData) {
    if (data.id) {
      await fetch(`/api/admin/tickets/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast("零件已更新");
    } else {
      await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast("零件已创建");
    }
    setShowModal(false);
    setModal(null);
    fetchTickets();
  }

  async function handleDelete(id: number) {
    if (!confirm("确定要删除这条零件记录吗？")) return;
    await fetch(`/api/admin/tickets/${id}`, { method: "DELETE" });
    toast("零件已删除");
    fetchTickets();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="搜索产品代号、零件名称、材质…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-sm rounded bg-gray-100 hover:bg-gray-200 border border-gray-300"
              >
                搜索
              </button>
            </form>
            <select
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部类别</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              className="px-4 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={openCreate}
            >
              新建零件
            </button>
          </div>

          <TicketTable
            tickets={tickets}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
          <Pagination page={page} total={total} limit={limit} onChange={setPage} />
        </div>
      </div>

      {showModal && (
        <TicketModal
          ticket={modal}
          onClose={() => {
            setShowModal(false);
            setModal(null);
          }}
          onSave={handleSave}
        />
      )}
    </main>
  );
}
