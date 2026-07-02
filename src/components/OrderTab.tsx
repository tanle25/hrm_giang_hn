import React, { useState } from "react";
import { Product, CartItem, Order } from "../types";
import { Search, Plus, Minus, ShoppingBag, Check, Trash2, Calendar, FileText, ChevronDown, ChevronUp } from "lucide-react";

interface OrderTabProps {
  products: Product[];
  recentOrders: Order[];
  onOrderSubmit: (order: { cuaHang: string; ghiChu: string; items: { maSP: string; soLuong: number }[] }) => void;
}

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=300";

export default function OrderTab({ products, recentOrders, onOrderSubmit }: OrderTabProps) {
  const [cuaHang, setCuaHang] = useState("Bán tại cửa hàng");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ghiChu, setGhiChu] = useState("");

  // Track product-specific purchase quantity in grid
  const [gridQuantities, setGridQuantities] = useState<{ [maSP: string]: number }>({});
  // Track expanded state for recent orders
  const [expandedOrders, setExpandedOrders] = useState<{ [maDon: string]: boolean }>({});

  const toggleOrderExpand = (maDon: string) => {
    setExpandedOrders((prev) => ({ ...prev, [maDon]: !prev[maDon] }));
  };

  const getProductQty = (maSP: string) => gridQuantities[maSP] ?? 1;

  const handleQtyChange = (maSP: string, delta: number) => {
    setGridQuantities((prev) => {
      const current = prev[maSP] ?? 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [maSP]: next };
    });
  };

  const handleAddToCart = (p: Product) => {
    const qty = getProductQty(p.maSP);
    if (qty > p.tonKho) {
      alert(`Không đủ tồn kho! Sản phẩm chỉ còn ${p.tonKho} sản phẩm.`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.maSP === p.maSP);
      if (existing) {
        const nextQty = existing.soLuong + qty;
        if (nextQty > p.tonKho) {
          alert(`Tổng số lượng trong giỏ hàng (${nextQty}) vượt quá tồn kho (${p.tonKho}).`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.maSP === p.maSP ? { ...item, soLuong: nextQty } : item
        );
      } else {
        return [...prevCart, { maSP: p.maSP, tenSP: p.tenSP, giaBan: p.giaBan, anhUrl: p.anhUrl, soLuong: qty }];
      }
    });

    // Reset grid selector for this product
    setGridQuantities((prev) => ({ ...prev, [p.maSP]: 1 }));
  };

  const handleRemoveFromCart = (maSP: string) => {
    setCart((prev) => prev.filter((item) => item.maSP !== maSP));
  };

  const handleCartQtyUpdate = (maSP: string, value: number, tonKho: number) => {
    if (value <= 0) {
      handleRemoveFromCart(maSP);
      return;
    }
    if (value > tonKho) {
      alert(`Vượt quá số lượng tồn kho khả dụng (${tonKho} sản phẩm).`);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.maSP === maSP ? { ...item, soLuong: value } : item))
    );
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.giaBan * item.soLuong, 0);
  };

  const handleConfirmOrder = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng đang trống!");
      return;
    }

    onOrderSubmit({
      cuaHang,
      ghiChu: ghiChu.trim(),
      items: cart.map((c) => ({ maSP: c.maSP, soLuong: c.soLuong })),
    });

    // Clear local state
    setCart([]);
    setGhiChu("");
    alert("Xác nhận tạo đơn hàng thành công!");
  };

  // Filter products by search query
  const filteredProducts = products.filter((p) =>
    p.tenSP.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Shop Info / Channel Choice */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e8f0]">
        <h2 className="text-[15px] font-bold text-[#1e2130] mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]" />
          Thông tin đơn hàng
        </h2>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#767b8f]">Kênh bán hàng</label>
          <select
            value={cuaHang}
            onChange={(e) => setCuaHang(e.target.value)}
            className="w-full px-4 py-3 text-[14.5px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5] bg-white text-[#1e2130] font-medium"
          >
            <option value="Bán tại cửa hàng">🏬 Bán tại cửa hàng</option>
            <option value="Bán online">🌐 Bán online</option>
          </select>
        </div>
      </div>

      {/* 2. Choose Products with Grid Search */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e8f0]">
        <h2 className="text-[15px] font-bold text-[#1e2130] mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]" />
          Chọn sản phẩm
        </h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767b8f] opacity-60" />
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-[14.5px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5] transition-colors"
          />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 mt-5">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center text-[#767b8f] py-8 text-[13.5px]">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isOutOfStock = p.tonKho <= 0;
              const isLowStock = p.tonKho <= p.tonKhoToiThieu && p.tonKho > 0;
              const gridQty = getProductQty(p.maSP);

              return (
                <div
                  key={p.maSP}
                  className="border border-[#e6e8f0] rounded-2xl overflow-hidden bg-white flex flex-col hover:shadow-lg hover:border-[#4f46e5] transition-all"
                >
                  {/* Image Wrap */}
                  <div className="relative w-full h-[110px] bg-[#eef2ff] overflow-hidden">
                    <img
                      src={p.anhUrl || PLACEHOLDER_IMG}
                      alt={p.tenSP}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      {isOutOfStock ? (
                        <span className="bg-red-100 text-red-700 text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                          Hết hàng
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-100 text-amber-700 text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                          Sắp hết ({p.tonKho})
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          Còn {p.tonKho}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-3 flex flex-col flex-1 gap-2">
                    <div className="text-[12.5px] font-bold text-[#1e2130] leading-snug min-h-[34px] line-clamp-2">
                      {p.tenSP}
                    </div>
                    <div className="text-[13.5px] font-extrabold text-[#16a34a]">
                      {p.giaBan.toLocaleString("vi-VN")}đ
                    </div>

                    {/* Qty controller */}
                    <div className="flex items-center gap-1.5 mt-auto">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(p.maSP, -1)}
                        disabled={isOutOfStock}
                        className="w-[28px] h-[28px] rounded-lg border border-[#e6e8f0] bg-slate-50 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={gridQty}
                        disabled={isOutOfStock}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          setGridQuantities((prev) => ({ ...prev, [p.maSP]: val }));
                        }}
                        className="flex-1 min-w-0 text-center py-1 text-[13px] font-semibold border border-[#e6e8f0] rounded-lg bg-white disabled:bg-slate-50"
                      />
                      <button
                        type="button"
                        onClick={() => handleQtyChange(p.maSP, 1)}
                        disabled={isOutOfStock}
                        className="w-[28px] h-[28px] rounded-lg border border-[#e6e8f0] bg-slate-50 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleAddToCart(p)}
                      className={`w-full py-2 rounded-xl text-[12.5px] font-bold text-white transition-all cursor-pointer ${
                        isOutOfStock
                          ? "bg-slate-300 cursor-not-allowed"
                          : "bg-[#4f46e5] hover:bg-[#3730a3] active:scale-98"
                      }`}
                    >
                      + Thêm vào đơn
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Cart Section - Displays if cart has items */}
      {cart.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e8f0]">
          <h2 className="text-[15px] font-bold text-[#1e2130] mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
            Giỏ hàng ({cart.length} món)
          </h2>

          <div className="flex flex-col max-h-[300px] overflow-y-auto divide-y divide-[#e6e8f0] pr-1">
            {cart.map((item) => {
              const originProduct = products.find((prod) => prod.maSP === item.maSP);
              const maxStock = originProduct ? originProduct.tonKho : 999;
              return (
                <div key={item.maSP} className="flex items-center gap-3 py-3">
                  <img
                    src={item.anhUrl || PLACEHOLDER_IMG}
                    alt={item.tenSP}
                    className="w-11 h-11 rounded-lg object-cover border border-[#e6e8f0] flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-[#1e2130] truncate">{item.tenSP}</div>
                    <div className="text-xs text-[#767b8f] mt-0.5">
                      Đơn giá: {item.giaBan.toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                  {/* Cart controller */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCartQtyUpdate(item.maSP, item.soLuong - 1, maxStock)}
                      className="w-6 h-6 border border-[#e6e8f0] rounded-md bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.soLuong}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        handleCartQtyUpdate(item.maSP, val, maxStock);
                      }}
                      className="w-10 text-center py-0.5 text-xs font-semibold border border-[#e6e8f0] rounded-md"
                    />
                    <button
                      onClick={() => handleCartQtyUpdate(item.maSP, item.soLuong + 1, maxStock)}
                      className="w-6 h-6 border border-[#e6e8f0] rounded-md bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  {/* Total for this item */}
                  <div className="text-right min-w-[70px] text-[13.5px] font-bold text-[#1e2130]">
                    {((item.giaBan ?? 0) * (item.soLuong ?? 0)).toLocaleString("vi-VN")}đ
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.maSP)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="total text-right text-[19px] font-extrabold mt-4 text-[#16a34a] pt-4 border-t border-[#e6e8f0]">
            Tổng cộng: {calculateTotal().toLocaleString("vi-VN")} đ
          </div>

          <div className="mt-4 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#767b8f]">Ghi chú đơn hàng (tuỳ chọn)</label>
            <input
              type="text"
              placeholder="Ví dụ: giao trong tuần, khách hẹn gọi trước"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              className="w-full px-4 py-2.5 text-[14px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5]"
            />
          </div>

          <button
            type="button"
            onClick={handleConfirmOrder}
            className="w-full bg-[#16a34a] hover:bg-[#14833c] text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-green-100 cursor-pointer active:scale-98 transition-all mt-4 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            ✅ XÁC NHẬN ĐƠN HÀNG
          </button>
        </div>
      )}

      {/* 4. Recent Orders list */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e8f0]">
        <h2 className="text-[15px] font-bold text-[#1e2130] mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
          Đơn hàng vừa lập gần đây
        </h2>

        {recentOrders.length === 0 ? (
          <div className="text-center py-6 text-[#767b8f] text-[13px]">
            Chưa có đơn hàng nào được tạo trong phiên này.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {recentOrders.slice(0, 10).map((o) => {
              const isExpanded = !!expandedOrders[o.maDon];
              const formattedDate = new Date(o.ngay).toLocaleDateString("vi-VN") + " " + new Date(o.ngay).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

              return (
                <div
                  key={o.maDon}
                  onClick={() => toggleOrderExpand(o.maDon)}
                  className="border border-[#e6e8f0] rounded-xl p-3.5 cursor-pointer hover:shadow-sm hover:border-[#4f46e5]/40 transition-all bg-slate-50/30"
                >
                  <div className="flex justify-between items-center text-[13.5px] font-bold">
                    <span className="text-[#4f46e5]">{o.maDon}</span>
                    <span className="text-[#16a34a]">{o.tongTien.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-[11.5px] text-[#767b8f] mt-1">
                    <span>
                      {o.cuaHang === "Bán online" ? "🌐" : "🏬"} {o.cuaHang} · {formattedDate}
                    </span>
                    <span className="flex items-center gap-0.5 text-[#4f46e5]">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </div>

                  {/* Expandable Order Detail */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-dashed border-[#e6e8f0] text-[12.5px] text-[#1e2130] flex flex-col gap-1.5">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-slate-600 font-medium">
                            {item.tenSP} <span className="font-bold text-slate-800">×{item.soLuong}</span>
                          </span>
                          <span className="font-bold">{item.thanhTien.toLocaleString("vi-VN")}đ</span>
                        </div>
                      ))}
                      {o.ghiChu && (
                        <div className="text-[11.5px] text-[#767b8f] italic mt-1 bg-white p-2 rounded-lg border border-slate-100 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 flex-shrink-0 text-[#767b8f]" />
                          Ghi chú: {o.ghiChu}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
