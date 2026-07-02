import React, { useState, useEffect } from "react";
import { Order } from "../types";
import { Calendar, Filter, FileText, ChevronDown, ChevronUp, Search } from "lucide-react";

interface HistoryTabProps {
  orders: Order[];
}

export default function HistoryTab({ orders }: HistoryTabProps) {
  // Filters default to current month first day and current day
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");
  const [cuaHang, setCuaHang] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<{ [maDon: string]: boolean }>({});

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setTuNgay(firstDay.toISOString().slice(0, 10));
    setDenNgay(today.toISOString().slice(0, 10));
  }, []);

  const toggleExpand = (maDon: string) => {
    setExpandedOrders((prev) => ({ ...prev, [maDon]: !prev[maDon] }));
  };

  // Extract unique shop channels
  const channels = Array.from(new Set(orders.map((o) => o.cuaHang)));

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    // Date filter
    const orderDate = new Date(o.ngay).toISOString().slice(0, 10);
    const inDateRange = (!tuNgay || orderDate >= tuNgay) && (!denNgay || orderDate <= denNgay);

    // Channel filter
    const matchesChannel = cuaHang === "all" || o.cuaHang === cuaHang;

    // Optional text search (order code or items names)
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !normalizedQuery ||
      o.maDon.toLowerCase().includes(normalizedQuery) ||
      o.items.some((item) => item.tenSP.toLowerCase().includes(normalizedQuery));

    return inDateRange && matchesChannel && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e8f0]">
        <h2 className="text-[15px] font-bold text-[#1e2130] mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]" />
          Bộ lọc lịch sử đơn hàng
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#767b8f] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#767b8f]" /> Từ ngày
            </label>
            <input
              type="date"
              value={tuNgay}
              onChange={(e) => setTuNgay(e.target.value)}
              className="w-full px-4 py-2.5 text-[14px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5] text-slate-800 font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#767b8f] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#767b8f]" /> Đến ngày
            </label>
            <input
              type="date"
              value={denNgay}
              onChange={(e) => setDenNgay(e.target.value)}
              className="w-full px-4 py-2.5 text-[14px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5] text-slate-800 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#767b8f]">Kênh bán hàng</label>
            <select
              value={cuaHang}
              onChange={(e) => setCuaHang(e.target.value)}
              className="w-full px-4 py-2.5 text-[14px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5] bg-white text-slate-800 font-medium"
            >
              <option value="all">Tất cả kênh bán</option>
              {channels.map((chan) => (
                <option key={chan} value={chan}>
                  {chan === "Bán online" ? "🌐" : "🏬"} {chan}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#767b8f]">Tìm kiếm mã đơn / tên SP</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767b8f] opacity-55" />
              <input
                type="text"
                placeholder="Ví dụ: DH-1001, Trà Phổ Nhĩ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[14px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results list */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[#1e2130] px-1">
          Kết quả tìm kiếm ({filteredOrders.length} đơn hàng)
        </h3>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e6e8f0] text-center text-[#767b8f]">
            Không tìm thấy đơn hàng nào khớp với bộ lọc đã chọn.
          </div>
        ) : (
          filteredOrders.map((o) => {
            const isExpanded = !!expandedOrders[o.maDon];
            const dateObj = new Date(o.ngay);
            const dateStr =
              dateObj.toLocaleDateString("vi-VN") +
              " " +
              dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={o.maDon}
                onClick={() => toggleExpand(o.maDon)}
                className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e8f0] cursor-pointer hover:shadow-md hover:border-[#4f46e5]/40 transition-all"
              >
                <div className="flex justify-between items-center text-[15px] font-bold">
                  <span className="text-[#4f46e5] font-mono">{o.maDon}</span>
                  <span className="text-[#16a34a] text-[16px]">{o.tongTien.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#767b8f] mt-1.5 font-medium">
                  <span>{dateStr}</span>
                  <span className="bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-700 flex items-center gap-1 font-semibold">
                    {o.cuaHang === "Bán online" ? "🌐" : "🏬"} {o.cuaHang}
                  </span>
                </div>

                {/* Sub-items details */}
                {isExpanded ? (
                  <div className="mt-4 pt-4 border-t border-dashed border-[#e6e8f0] text-[13px] text-[#1e2130] flex flex-col gap-2">
                    {o.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-0.5">
                        <span className="text-slate-600">
                          {item.tenSP} <strong className="text-slate-900 ml-1">×{item.soLuong}</strong>
                        </span>
                        <span className="font-bold text-slate-800">
                          {item.thanhTien.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    ))}

                    {o.ghiChu && (
                      <div className="text-[12px] text-slate-500 italic mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 flex-shrink-0 text-[#767b8f]" />
                        Ghi chú: {o.ghiChu}
                      </div>
                    )}

                    <div className="flex justify-end mt-2">
                      <span className="text-[11px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
                        Thu gọn <ChevronUp className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end mt-1 text-[11px] text-[#767b8f] font-semibold flex-row items-center gap-0.5">
                    <span>Xem chi tiết</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
