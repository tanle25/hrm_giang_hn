import React, { useState } from "react";
import { Product, InventoryHistory } from "../types";
import { Plus, Minus, ArrowUpDown, RefreshCw, AlertTriangle, Check } from "lucide-react";

interface InventoryTabProps {
  products: Product[];
  inventoryHistory: InventoryHistory[];
  onAdjustStock: (maSP: string, qty: number, note: string) => void;
}

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=300";

export default function InventoryTab({ products, inventoryHistory, onAdjustStock }: InventoryTabProps) {
  const [selectedMaSP, setSelectedMaSP] = useState(products[0]?.maSP || "");
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustNote, setAdjustNote] = useState("");

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaSP) {
      alert("Vui lòng chọn một sản phẩm.");
      return;
    }
    if (adjustQty === 0) {
      alert("Vui lòng nhập số lượng điều chỉnh khác 0.");
      return;
    }

    const prod = products.find((p) => p.maSP === selectedMaSP);
    if (!prod) return;

    if (prod.tonKho + adjustQty < 0) {
      alert(`Không thể điều chỉnh! Tồn kho không thể âm. Hiện tại còn ${prod.tonKho} sản phẩm.`);
      return;
    }

    onAdjustStock(selectedMaSP, adjustQty, adjustNote.trim() || "Điều chỉnh tồn kho");
    setAdjustQty(1);
    setAdjustNote("");
    alert("Đã cập nhật tồn kho thành công!");
  };

  const handleQuickAdjust = (maSP: string, delta: number) => {
    const prod = products.find((p) => p.maSP === maSP);
    if (!prod) return;

    if (prod.tonKho + delta < 0) {
      alert("Số lượng tồn kho không thể giảm xuống dưới 0.");
      return;
    }

    onAdjustStock(maSP, delta, "Điều chỉnh nhanh");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Adjustment Form */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e8f0]">
        <h2 className="text-[15px] font-bold text-[#1e2130] mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]" />
          Điều chỉnh tồn kho
        </h2>

        <form onSubmit={handleAdjustSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#767b8f]">Chọn sản phẩm</label>
            <select
              value={selectedMaSP}
              onChange={(e) => setSelectedMaSP(e.target.value)}
              className="w-full px-4 py-2.5 text-[14px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5] bg-white text-[#1e2130] font-medium"
            >
              <option value="" disabled>-- Chọn sản phẩm cần điều chỉnh --</option>
              {products.map((p) => (
                <option key={p.maSP} value={p.maSP}>
                  {p.tenSP} (Còn {p.tonKho} sp) — {p.giaBan.toLocaleString("vi-VN")}đ
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#767b8f]">Số lượng (âm để giảm, VD: -3)</label>
              <input
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 text-[14px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#767b8f]">Ghi chú điều chỉnh</label>
              <input
                type="text"
                placeholder="VD: Nhập thêm hàng, hàng mẫu lỗi, kiểm kho hụt..."
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                className="w-full px-4 py-2.5 text-[14px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4f46e5] hover:bg-[#3730a3] text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-indigo-100 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            📥 Cập nhật tồn kho
          </button>
        </form>
      </div>

      {/* 2. Inventory Status Table List */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e8f0]">
        <h2 className="text-[15px] font-bold text-[#1e2130] mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
          Danh sách tồn kho thực tế
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#e6e8f0] text-[#767b8f] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-2">Sản phẩm</th>
                <th className="py-3 px-2">Tồn Kho</th>
                <th className="py-3 px-2">Tối Thiểu</th>
                <th className="py-3 px-2 text-right">Điều chỉnh nhanh</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isOutOfStock = p.tonKho <= 0;
                const isLowStock = p.tonKho <= p.tonKhoToiThieu && p.tonKho > 0;
                return (
                  <tr
                    key={p.maSP}
                    className={`border-b border-[#e6e8f0] transition-colors ${
                      isOutOfStock
                        ? "bg-red-50/20 hover:bg-red-50/40"
                        : isLowStock
                        ? "bg-amber-50/30 hover:bg-amber-50/50"
                        : "hover:bg-slate-50/50"
                    }`}
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.anhUrl || PLACEHOLDER_IMG}
                          alt={p.tenSP}
                          className="w-10 h-10 rounded-lg object-cover border border-[#e6e8f0] flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                          }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-[#1e2130] truncate">{p.tenSP}</span>
                          <span className="text-[11px] text-[#767b8f] font-mono mt-0.5">{p.maSP}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-600" : "text-slate-800"
                        }`}
                      >
                        {p.tonKho}
                        {isOutOfStock && <span className="text-[10px] bg-red-100 px-1.5 py-0.5 rounded text-red-700">Hết hàng</span>}
                        {isLowStock && <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded text-amber-700">Sắp hết</span>}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-[#767b8f] font-medium">{p.tonKhoToiThieu}</td>
                    <td className="py-3 px-2 text-right">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => handleQuickAdjust(p.maSP, -1)}
                          className="w-7 h-7 bg-white hover:bg-slate-50 border border-[#e6e8f0] rounded-lg font-extrabold text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold px-2.5 text-slate-800">1</span>
                        <button
                          onClick={() => handleQuickAdjust(p.maSP, 1)}
                          className="w-7 h-7 bg-white hover:bg-slate-50 border border-[#e6e8f0] rounded-lg font-extrabold text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Transaction Log History Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e8f0]">
        <h2 className="text-[15px] font-bold text-[#1e2130] mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
          Lịch sử biến động kho gần đây
        </h2>

        {inventoryHistory.length === 0 ? (
          <div className="text-center py-6 text-[#767b8f] text-[13px]">
            Chưa có giao dịch biến động kho nào được ghi nhận.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-[#e6e8f0] text-[#767b8f] font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Thời gian</th>
                  <th className="py-2.5">Mã SP</th>
                  <th className="py-2.5">Sản Phẩm</th>
                  <th className="py-2.5">Thay đổi</th>
                  <th className="py-2.5">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {[...inventoryHistory].reverse().map((h) => {
                  const formattedDate = new Date(h.ngay).toLocaleDateString("vi-VN") + " " + new Date(h.ngay).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                  const isPositive = h.soLuong > 0;
                  return (
                    <tr key={h.id} className="border-b border-[#e6e8f0] hover:bg-slate-50/40">
                      <td className="py-2.5 text-[#767b8f]">{formattedDate}</td>
                      <td className="py-2.5 font-mono text-slate-500 font-medium">{h.maSP}</td>
                      <td className="py-2.5 font-semibold text-slate-800">{h.tenSP}</td>
                      <td className={`py-2.5 font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                        {isPositive ? `+${h.soLuong}` : h.soLuong}
                      </td>
                      <td className="py-2.5 text-slate-500 italic max-w-[150px] truncate" title={h.ghiChu}>
                        {h.ghiChu}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
