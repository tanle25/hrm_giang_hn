import React, { useState, useRef, useEffect } from "react";
import { Product } from "../types";
import { Plus, Edit, Trash2, Image as ImageIcon, AlertCircle, RefreshCw, X } from "lucide-react";

interface ProductsTabProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, "maSP">) => void;
  onUpdateProduct: (maSP: string, updated: Partial<Product>) => void;
  onDeleteProduct: (maSP: string) => void;
}

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=300";

export default function ProductsTab({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}: ProductsTabProps) {
  // Form states
  const [editingMaSP, setEditingMaSP] = useState<string | null>(null);
  const [tenSP, setTenSP] = useState("");
  const [giaBan, setGiaBan] = useState<number | "">("");
  const [tonKho, setTonKho] = useState<number>(0);
  const [tonKhoToiThieu, setTonKhoToiThieu] = useState<number>(0);
  const [anhUrl, setAnhUrl] = useState("");
  const [uploadStatus, setUploadStatus] = useState<{ type: "loading" | "success" | "error" | null; msg: string }>({
    type: null,
    msg: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync edits
  const handleEdit = (p: Product) => {
    setEditingMaSP(p.maSP);
    setTenSP(p.tenSP);
    setGiaBan(p.giaBan);
    setTonKho(p.tonKho);
    setTonKhoToiThieu(p.tonKhoToiThieu);
    setAnhUrl(p.anhUrl);
    setUploadStatus({ type: null, msg: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setEditingMaSP(null);
    setTenSP("");
    setGiaBan("");
    setTonKho(0);
    setTonKhoToiThieu(0);
    setAnhUrl("");
    setUploadStatus({ type: null, msg: "" });
  };

  // Image upload mock using FileReader base64
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus({ type: "loading", msg: "⏳ Đang tải ảnh lên..." });

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAnhUrl(reader.result);
        setUploadStatus({ type: "success", msg: "✅ Tải ảnh thành công" });
      } else {
        setUploadStatus({ type: "error", msg: "⚠️ Không đọc được tệp ảnh" });
      }
    };
    reader.onerror = () => {
      setUploadStatus({ type: "error", msg: "⚠️ Lỗi khi tải tệp ảnh" });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenSP.trim()) {
      alert("Vui lòng nhập tên sản phẩm.");
      return;
    }
    const validatedPrice = Number(giaBan) || 0;
    if (validatedPrice < 0) {
      alert("Giá bán phải lớn hơn hoặc bằng 0.");
      return;
    }

    const finalImage = anhUrl.trim() || PLACEHOLDER_IMG;

    if (editingMaSP) {
      onUpdateProduct(editingMaSP, {
        tenSP: tenSP.trim(),
        giaBan: validatedPrice,
        tonKho,
        tonKhoToiThieu,
        anhUrl: finalImage,
      });
      alert("Đã cập nhật sản phẩm thành công!");
    } else {
      onAddProduct({
        tenSP: tenSP.trim(),
        giaBan: validatedPrice,
        tonKho,
        tonKhoToiThieu,
        anhUrl: finalImage,
      });
      alert("Đã thêm sản phẩm mới thành công!");
    }

    handleReset();
  };

  const handleDelete = (maSP: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xoá sản phẩm "${name}"? Thao tác này không thể hoàn tác.`)) {
      onDeleteProduct(maSP);
    }
  };

  const formattedPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Product Form Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e6e8f0]">
        <h2 className="text-[16px] font-bold text-[#1e2130] mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]" />
          {editingMaSP ? `Sửa sản phẩm: SP-${editingMaSP.slice(-3)}` : "Thêm sản phẩm mới"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Image Upload Area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#767b8f]">Ảnh sản phẩm</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#e6e8f0] rounded-2xl p-5 text-center cursor-pointer bg-[#fafbff] hover:border-[#4f46e5] transition-colors relative overflow-hidden flex flex-col items-center justify-center min-h-[140px]"
            >
              {anhUrl ? (
                <img
                  src={anhUrl}
                  alt="Xem trước"
                  className="max-h-[120px] object-contain rounded-lg shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="w-8 h-8 text-[#767b8f]" />
                  <span className="text-[12.5px] text-[#767b8f] font-medium">
                    📷 <strong className="text-[#4f46e5]">Chạm để chọn ảnh</strong> hoặc dán URL bên dưới
                  </span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {uploadStatus.type && (
              <p
                className={`text-xs font-bold mt-1 ${
                  uploadStatus.type === "success"
                    ? "text-[#16a34a]"
                    : uploadStatus.type === "error"
                    ? "text-[#dc2626]"
                    : "text-[#4f46e5]"
                }`}
              >
                {uploadStatus.msg}
              </p>
            )}

            <input
              type="text"
              placeholder="...hoặc dán liên kết ảnh trực tiếp tại đây"
              value={anhUrl.startsWith("data:image") ? "" : anhUrl}
              onChange={(e) => setAnhUrl(e.target.value)}
              className="w-full px-4 py-2.5 text-[14px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5] mt-2 transition-colors placeholder:text-slate-300"
            />
          </div>

          {/* Text fields */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#767b8f]">Tên sản phẩm</label>
            <input
              type="text"
              placeholder="VD: Trà Thiết Quan Âm Hạng Thượng Hạng"
              value={tenSP}
              onChange={(e) => setTenSP(e.target.value)}
              className="w-full px-4 py-2.5 text-[14px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5] transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#767b8f]">Giá bán (đ)</label>
            <input
              type="number"
              placeholder="Ví dụ: 450000"
              value={giaBan}
              onChange={(e) => setGiaBan(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-4 py-2.5 text-[14px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5] transition-colors"
              required
              min={0}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#767b8f]">Tồn kho ban đầu</label>
              <input
                type="number"
                value={tonKho}
                onChange={(e) => setTonKho(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 text-[14px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5] transition-colors"
                min={0}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#767b8f]">Mức cảnh báo tồn tối thiểu</label>
              <input
                type="number"
                value={tonKhoToiThieu}
                onChange={(e) => setTonKhoToiThieu(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 text-[14px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5] transition-colors"
                min={0}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="flex-1 bg-[#4f46e5] hover:bg-[#3730a3] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {editingMaSP ? <RefreshCw className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingMaSP ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border border-[#e6e8f0] hover:bg-slate-50 text-[#1e2130] rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>

      {/* Product List Table Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e6e8f0] overflow-hidden">
        <h2 className="text-[16px] font-bold text-[#1e2130] mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
          Danh sách sản phẩm hiện tại ({products.length})
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-8 text-[#767b8f]">Chưa có sản phẩm nào. Hãy thêm ở form trên!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#e6e8f0] text-[#767b8f] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-2">Ảnh</th>
                  <th className="py-3 px-2">Mã SP</th>
                  <th className="py-3 px-2">Tên Sản Phẩm</th>
                  <th className="py-3 px-2">Giá Bán</th>
                  <th className="py-3 px-2">Tồn Kho</th>
                  <th className="py-3 px-2 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.maSP} className="border-b border-[#e6e8f0] hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-2">
                      <img
                        src={p.anhUrl || PLACEHOLDER_IMG}
                        alt={p.tenSP}
                        className="w-11 h-11 rounded-lg object-cover border border-[#e6e8f0] bg-indigo-50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                        }}
                      />
                    </td>
                    <td className="py-3 px-2 font-mono text-[#767b8f] font-medium">{p.maSP}</td>
                    <td className="py-3 px-2 font-semibold text-[#1e2130] max-w-[200px] truncate">{p.tenSP}</td>
                    <td className="py-3 px-2 font-bold text-[#16a34a]">{formattedPrice(p.giaBan)}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10.5px] ${
                          p.tonKho <= 0
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : p.tonKho <= p.tonKhoToiThieu
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        }`}
                      >
                        {p.tonKho}
                        {p.tonKho <= p.tonKhoToiThieu && " ⚠️"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.maSP, p.tenSP)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xoá"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
