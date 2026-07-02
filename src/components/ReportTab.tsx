import React, { useState, useEffect } from "react";
import { Order } from "../types";
import { Calendar, BarChart3, TrendingUp, ShoppingBag, PieChart, Info } from "lucide-react";

interface ReportTabProps {
  orders: Order[];
}

export default function ReportTab({ orders }: ReportTabProps) {
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setTuNgay(firstDay.toISOString().slice(0, 10));
    setDenNgay(today.toISOString().slice(0, 10));
  }, []);

  // Filter orders in date range
  const filteredOrders = orders.filter((o) => {
    const orderDate = new Date(o.ngay).toISOString().slice(0, 10);
    return (!tuNgay || orderDate >= tuNgay) && (!denNgay || orderDate <= denNgay);
  });

  // Calculations
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.tongTien, 0);
  const totalOrdersCount = filteredOrders.length;

  // Aggregation by product
  const productStatsMap: { [maSP: string]: { tenSP: string; soLuong: number; doanhThu: number } } = {};

  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productStatsMap[item.maSP]) {
        productStatsMap[item.maSP] = {
          tenSP: item.tenSP,
          soLuong: 0,
          doanhThu: 0,
        };
      }
      productStatsMap[item.maSP].soLuong += item.soLuong;
      productStatsMap[item.maSP].doanhThu += item.thanhTien;
    });
  });

  const productStats = Object.values(productStatsMap).sort((a, b) => b.doanhThu - a.doanhThu);

  // Aggregation by channel
  const channelStatsMap: { [channel: string]: { channel: string; donHang: number; doanhThu: number } } = {};

  filteredOrders.forEach((o) => {
    if (!channelStatsMap[o.cuaHang]) {
      channelStatsMap[o.cuaHang] = {
        channel: o.cuaHang,
        donHang: 0,
        doanhThu: 0,
      };
    }
    channelStatsMap[o.cuaHang].donHang += 1;
    channelStatsMap[o.cuaHang].doanhThu += o.tongTien;
  });

  const channelStats = Object.values(channelStatsMap).sort((a, b) => b.doanhThu - a.doanhThu);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Period Selector */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e8f0]">
        <h2 className="text-[15px] font-bold text-[#1e2130] mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]" />
          Khoảng thời gian báo cáo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#767b8f] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Từ ngày
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
              <Calendar className="w-3.5 h-3.5" /> Đến ngày
            </label>
            <input
              type="date"
              value={denNgay}
              onChange={(e) => setDenNgay(e.target.value)}
              className="w-full px-4 py-2.5 text-[14px] rounded-xl border border-[#e6e8f0] outline-none focus:border-[#4f46e5] text-slate-800 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e8f0] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#767b8f] uppercase tracking-wider">
              Tổng Doanh Thu
            </span>
            <span className="text-[26px] font-extrabold text-[#16a34a] mt-1">
              {totalRevenue.toLocaleString("vi-VN")} đ
            </span>
            <span className="text-[11px] text-[#767b8f] mt-1">
              Giai đoạn đang lọc
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#16a34a]" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e8f0] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#767b8f] uppercase tracking-wider">
              Số Lượng Đơn Hàng
            </span>
            <span className="text-[26px] font-extrabold text-[#4f46e5] mt-1">
              {totalOrdersCount} đơn
            </span>
            <span className="text-[11px] text-[#767b8f] mt-1">
              Đơn hàng thành công
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-[#4f46e5]" />
          </div>
        </div>
      </div>

      {/* 3. Stats by Product */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e8f0]">
        <h3 className="text-[15px] font-bold text-[#1e2130] mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#4f46e5]" />
          Doanh thu chi tiết theo sản phẩm
        </h3>

        {productStats.length === 0 ? (
          <div className="text-center py-6 text-[#767b8f] text-[13px]">
            Chưa có doanh thu sản phẩm nào trong khoảng thời gian này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#e6e8f0] text-[#767b8f] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-2">Tên sản phẩm</th>
                  <th className="py-3 px-2 text-center">Số lượng bán</th>
                  <th className="py-3 px-2 text-right">Doanh thu sản phẩm</th>
                </tr>
              </thead>
              <tbody>
                {productStats.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#e6e8f0] hover:bg-slate-50/40">
                    <td className="py-3 px-2 font-semibold text-slate-800">{item.tenSP}</td>
                    <td className="py-3 px-2 text-center font-bold text-[#4f46e5]">{item.soLuong}</td>
                    <td className="py-3 px-2 text-right font-extrabold text-slate-900">
                      {item.doanhThu.toLocaleString("vi-VN")} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Stats by Channel */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e8f0]">
        <h3 className="text-[15px] font-bold text-[#1e2130] mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-600" />
          Phân tích theo kênh bán hàng
        </h3>

        {channelStats.length === 0 ? (
          <div className="text-center py-6 text-[#767b8f] text-[13px]">
            Chưa có dữ liệu theo kênh bán nào trong khoảng thời gian này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#e6e8f0] text-[#767b8f] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-2">Kênh bán</th>
                  <th className="py-3 px-2 text-center">Tổng số đơn</th>
                  <th className="py-3 px-2 text-right">Tổng Doanh Thu</th>
                </tr>
              </thead>
              <tbody>
                {channelStats.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#e6e8f0] hover:bg-slate-50/40">
                    <td className="py-3 px-2 font-semibold text-slate-800 flex items-center gap-1.5">
                      <span>{item.channel === "Bán online" ? "🌐" : "🏬"}</span>
                      <span>{item.channel}</span>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-slate-700">{item.donHang}</td>
                    <td className="py-3 px-2 text-right font-extrabold text-[#16a34a]">
                      {item.doanhThu.toLocaleString("vi-VN")} đ
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
