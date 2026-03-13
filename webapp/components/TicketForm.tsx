"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

interface TicketFormProps {
  onGenerate: (result: { image: string; html: string }) => void;
}

export default function TicketForm({ onGenerate }: TicketFormProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [parts, setParts] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);

  const [category, setCategory] = useState("");
  const [productCode, setProductCode] = useState("");
  const [partName, setPartName] = useState("");
  const [material, setMaterial] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [factoryNumber, setFactoryNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    setLoadingOptions(true);
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoadingOptions(false));
  }, []);

  useEffect(() => {
    setProductCode("");
    setPartName("");
    setMaterial("");
    setProducts([]);
    setParts([]);
    setMaterials([]);
    if (!category) return;
    setLoadingOptions(true);
    fetch(`/api/products?category=${encodeURIComponent(category)}`)
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoadingOptions(false));
  }, [category]);

  useEffect(() => {
    setPartName("");
    setMaterial("");
    setParts([]);
    setMaterials([]);
    if (!category || !productCode) return;
    setLoadingOptions(true);
    fetch(
      `/api/parts?category=${encodeURIComponent(category)}&product_code=${encodeURIComponent(productCode)}`
    )
      .then((r) => r.json())
      .then(setParts)
      .finally(() => setLoadingOptions(false));
  }, [category, productCode]);

  useEffect(() => {
    setMaterial("");
    setMaterials([]);
    if (!category || !productCode || !partName) return;
    setLoadingOptions(true);
    fetch(
      `/api/materials?category=${encodeURIComponent(category)}&product_code=${encodeURIComponent(productCode)}&part_name=${encodeURIComponent(partName)}`
    )
      .then((r) => r.json())
      .then(setMaterials)
      .finally(() => setLoadingOptions(false));
  }, [category, productCode, partName]);

  async function handleGenerate() {
    if (!category || !productCode || !partName || !material) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          product_code: productCode,
          part_name: partName,
          material,
          ticket_number: ticketNumber,
          factory_number: factoryNumber,
          notes,
        }),
      });
      const data = await res.json();
      if (data.error) {
        toast(data.error, "error");
      } else {
        onGenerate(data);
      }
    } catch (e) {
      toast("生成失败: " + (e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setCategory("");
    setProductCode("");
    setPartName("");
    setMaterial("");
    setTicketNumber("");
    setFactoryNumber("");
    setNotes("");
    setProducts([]);
    setParts([]);
    setMaterials([]);
  }

  const selectClass =
    "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed";
  const inputClass =
    "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-4">
      {loadingOptions && (
        <div className="text-xs text-blue-500 text-center">加载选项中…</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">类别</label>
        <select
          className={selectClass}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">请选择类别</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">产品代号</label>
        <select
          className={selectClass}
          value={productCode}
          onChange={(e) => setProductCode(e.target.value)}
          disabled={!category}
        >
          <option value="">请选择产品代号</option>
          {products.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">零件名称</label>
        <select
          className={selectClass}
          value={partName}
          onChange={(e) => setPartName(e.target.value)}
          disabled={!productCode}
        >
          <option value="">请选择零件名称</option>
          {parts.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">材质</label>
        <select
          className={selectClass}
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          disabled={!partName}
        >
          <option value="">请选择材质</option>
          {materials.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">编号</label>
        <input
          className={inputClass}
          type="text"
          value={ticketNumber}
          onChange={(e) => setTicketNumber(e.target.value)}
          placeholder="输入编号"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">出厂编号</label>
        <input
          className={inputClass}
          type="text"
          value={factoryNumber}
          onChange={(e) => setFactoryNumber(e.target.value)}
          placeholder="输入出厂编号"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">注意事项</label>
        <textarea
          className={inputClass}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="输入注意事项"
        />
      </div>

      <div className="flex gap-3">
        <button
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          onClick={handleGenerate}
          disabled={!category || !productCode || !partName || !material || loading}
        >
          {loading ? "生成中..." : "生成工单"}
        </button>
        <button
          className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
          onClick={handleReset}
          type="button"
        >
          重置
        </button>
      </div>
    </div>
  );
}
