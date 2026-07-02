import React from "react";
import { ShoppingCart, Package, Tag, History, BarChart3, Box } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { id: "order", label: "Lập đơn", icon: ShoppingCart },
    { id: "inventory", label: "Tồn kho", icon: Package },
    { id: "products", label: "Sản phẩm", icon: Tag },
    { id: "history", label: "Lịch sử", icon: History },
    { id: "report", label: "Báo cáo", icon: BarChart3 },
  ];

  return (
    <aside className="w-[236px] flex-none sticky top-0 h-screen overflow-y-auto bg-gradient-to-b from-[#4f46e5] to-[#6d28d9] text-white p-5 flex flex-col shadow-xl select-none max-[680px]:w-[76px] max-[680px]:p-2 max-[680px]:items-center">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-6 max-[680px]:justify-center max-[680px]:pb-4 max-[680px]:w-full">
        <div className="w-[38px] h-[38px] flex-shrink-0 bg-white/20 rounded-xl flex items-center justify-center text-lg shadow-inner">
          <Box className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col max-[680px]:hidden">
          <span className="font-extrabold text-[14.5px] leading-tight tracking-tight">
            Quản lý bán hàng
          </span>
          <span className="text-[10.5px] opacity-75 font-semibold mt-0.5">
            Tổng kho · Đơn hàng
          </span>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex flex-col gap-1.5 flex-1 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[13.5px] transition-all cursor-pointer w-full text-left max-[680px]:flex-col max-[680px]:gap-1 max-[680px]:py-2 max-[680px]:px-1 max-[680px]:text-[10px] max-[680px]:text-center ${
                isActive
                  ? "bg-white text-[#3730a3] shadow-md shadow-indigo-900/20 scale-[1.02]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 max-[680px]:w-5 max-[680px]:h-5 ${isActive ? "text-[#3730a3]" : "text-white"}`} />
              <span className="max-[680px]:text-[9px] max-[680px]:font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="text-[10px] opacity-45 font-bold pt-4 mt-auto border-t border-white/10 max-[680px]:hidden text-center">
        Quản lý bán hàng v2.0
      </div>
    </aside>
  );
}
