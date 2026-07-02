import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ProductsTab from "./components/ProductsTab";
import OrderTab from "./components/OrderTab";
import InventoryTab from "./components/InventoryTab";
import HistoryTab from "./components/HistoryTab";
import ReportTab from "./components/ReportTab";
import { Product, Order, InventoryHistory } from "./types";
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from "./data/mockData";
import { AlertTriangle, TrendingUp, Info, ShieldAlert, FileDown, FileUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState("order");

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventoryHistory, setInventoryHistory] = useState<InventoryHistory[]>([]);

  // Load from local storage or defaults on mount
  useEffect(() => {
    const cachedProducts = localStorage.getItem("sales_products");
    const cachedOrders = localStorage.getItem("sales_orders");
    const cachedHistory = localStorage.getItem("sales_inventory_history");

    if (cachedProducts) {
      setProducts(JSON.parse(cachedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem("sales_products", JSON.stringify(INITIAL_PRODUCTS));
    }

    if (cachedOrders) {
      setOrders(JSON.parse(cachedOrders));
    } else {
      setOrders(INITIAL_ORDERS);
      localStorage.setItem("sales_orders", JSON.stringify(INITIAL_ORDERS));
    }

    if (cachedHistory) {
      setInventoryHistory(JSON.parse(cachedHistory));
    } else {
      // Seed initial history logs based on initial products
      const seedHistory: InventoryHistory[] = INITIAL_PRODUCTS.map((p, idx) => ({
        id: `LOG-seed-${idx}`,
        maSP: p.maSP,
        tenSP: p.tenSP,
        soLuong: p.tonKho,
        ghiChu: "Khởi tạo tồn kho ban đầu",
        ngay: new Date(Date.now() - 24 * 60 * 60 * 1000 * 5).toISOString(),
      }));
      setInventoryHistory(seedHistory);
      localStorage.setItem("sales_inventory_history", JSON.stringify(seedHistory));
    }
  }, []);

  // Save changes to local storage helper
  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem("sales_products", JSON.stringify(newProducts));
  };

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem("sales_orders", JSON.stringify(newOrders));
  };

  const saveHistory = (newHistory: InventoryHistory[]) => {
    setInventoryHistory(newHistory);
    localStorage.setItem("sales_inventory_history", JSON.stringify(newHistory));
  };

  // --- ACTIONS ---

  // 1. Add Product
  const handleAddProduct = (newProduct: Omit<Product, "maSP">) => {
    // Generate code SP-xxx
    const codes = products.map((p) => {
      const match = p.maSP.match(/SP-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxCodeNum = codes.length > 0 ? Math.max(...codes) : 0;
    const nextCode = `SP-${String(maxCodeNum + 1).padStart(3, "0")}`;

    const productWithCode: Product = {
      ...newProduct,
      maSP: nextCode,
    };

    const updated = [...products, productWithCode];
    saveProducts(updated);

    // Also log to inventory history
    if (newProduct.tonKho > 0) {
      const logEntry: InventoryHistory = {
        id: `LOG-${Date.now()}`,
        maSP: nextCode,
        tenSP: newProduct.tenSP,
        soLuong: newProduct.tonKho,
        ghiChu: "Khai báo tồn kho ban đầu khi tạo mới",
        ngay: new Date().toISOString(),
      };
      saveHistory([...inventoryHistory, logEntry]);
    }
  };

  // 2. Update Product Info
  const handleUpdateProduct = (maSP: string, updatedFields: Partial<Product>) => {
    const updated = products.map((p) => {
      if (p.maSP === maSP) {
        // If stock level has changed directly via edit form, we log the stock discrepancy
        const oldStock = p.tonKho;
        const newStock = updatedFields.tonKho ?? oldStock;
        if (oldStock !== newStock) {
          const delta = newStock - oldStock;
          const logEntry: InventoryHistory = {
            id: `LOG-${Date.now()}`,
            maSP,
            tenSP: updatedFields.tenSP || p.tenSP,
            soLuong: delta,
            ghiChu: "Điều chỉnh tồn kho từ chỉnh sửa thông tin",
            ngay: new Date().toISOString(),
          };
          saveHistory([...inventoryHistory, logEntry]);
        }
        return { ...p, ...updatedFields };
      }
      return p;
    });
    saveProducts(updated);
  };

  // 3. Delete Product
  const handleDeleteProduct = (maSP: string) => {
    const updated = products.filter((p) => p.maSP !== maSP);
    saveProducts(updated);

    // Also clear associated logs for clean slate
    const updatedHistory = inventoryHistory.filter((h) => h.maSP !== maSP);
    saveHistory(updatedHistory);
  };

  // 4. Adjust Stock Levels (Manual stock in / out)
  const handleAdjustStock = (maSP: string, qty: number, note: string) => {
    const targetProduct = products.find((p) => p.maSP === maSP);
    if (!targetProduct) return;

    // Update product stock
    const updatedProducts = products.map((p) =>
      p.maSP === maSP ? { ...p, tonKho: Math.max(0, p.tonKho + qty) } : p
    );
    saveProducts(updatedProducts);

    // Append inventory history transaction log
    const logEntry: InventoryHistory = {
      id: `LOG-${Date.now()}`,
      maSP,
      tenSP: targetProduct.tenSP,
      soLuong: qty,
      ghiChu: note || "Điều chỉnh tồn kho thủ công",
      ngay: new Date().toISOString(),
    };
    saveHistory([...inventoryHistory, logEntry]);
  };

  // 5. Submit Order
  const handleOrderSubmit = (orderData: {
    cuaHang: string;
    ghiChu: string;
    items: { maSP: string; soLuong: number }[];
  }) => {
    // Generate order ID (DH-xxxx)
    const orderNums = orders.map((o) => {
      const match = o.maDon.match(/DH-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxOrderNum = orderNums.length > 0 ? Math.max(...orderNums) : 1000;
    const nextOrderId = `DH-${maxOrderNum + 1}`;

    const orderItemsMapped = orderData.items.map((cartItem) => {
      const prod = products.find((p) => p.maSP === cartItem.maSP);
      const name = prod ? prod.tenSP : "Sản phẩm không xác định";
      const price = prod ? prod.giaBan : 0;
      return {
        maSP: cartItem.maSP,
        tenSP: name,
        giaBan: price,
        soLuong: cartItem.soLuong,
        thanhTien: price * cartItem.soLuong,
      };
    });

    const totalMoney = orderItemsMapped.reduce((sum, item) => sum + item.thanhTien, 0);

    const newOrder: Order = {
      maDon: nextOrderId,
      cuaHang: orderData.cuaHang,
      ghiChu: orderData.ghiChu,
      ngay: new Date().toISOString(),
      items: orderItemsMapped,
      tongTien: totalMoney,
    };

    // 1. Subtract quantities from products
    const updatedProducts = products.map((p) => {
      const ordered = orderData.items.find((item) => item.maSP === p.maSP);
      if (ordered) {
        return { ...p, tonKho: Math.max(0, p.tonKho - ordered.soLuong) };
      }
      return p;
    });
    saveProducts(updatedProducts);

    // 2. Log inventory transaction history logs for items sold
    const newLogs: InventoryHistory[] = orderData.items.map((cartItem, idx) => {
      const prod = products.find((p) => p.maSP === cartItem.maSP);
      return {
        id: `LOG-sale-${Date.now()}-${idx}`,
        maSP: cartItem.maSP,
        tenSP: prod ? prod.tenSP : "Sản phẩm không rõ",
        soLuong: -cartItem.soLuong, // negative for sale
        ghiChu: `Bán đơn hàng ${nextOrderId}`,
        ngay: new Date().toISOString(),
      };
    });
    saveHistory([...inventoryHistory, ...newLogs]);

    // 3. Save order to orders list
    saveOrders([newOrder, ...orders]);
  };

  // Helper stats for warning banner
  const lowStockCount = products.filter((p) => p.tonKho <= p.tonKhoToiThieu).length;

  // Render correct tab page based on active selection
  const renderTabContent = () => {
    switch (activeTab) {
      case "order":
        return <OrderTab products={products} recentOrders={orders} onOrderSubmit={handleOrderSubmit} />;
      case "inventory":
        return (
          <InventoryTab
            products={products}
            inventoryHistory={inventoryHistory}
            onAdjustStock={handleAdjustStock}
          />
        );
      case "products":
        return (
          <ProductsTab
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case "history":
        return <HistoryTab orders={orders} />;
      case "report":
        return <ReportTab orders={orders} />;
      default:
        return <OrderTab products={products} recentOrders={orders} onOrderSubmit={handleOrderSubmit} />;
    }
  };

  // Local storage management backup helpers
  const handleExportData = () => {
    const dataStr = JSON.stringify({ products, orders, inventoryHistory }, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `quan_ly_ban_hang_backup_${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.products && parsed.orders && parsed.inventoryHistory) {
          saveProducts(parsed.products);
          saveOrders(parsed.orders);
          saveHistory(parsed.inventoryHistory);
          alert("Nhập sao lưu dữ liệu thành công!");
        } else {
          alert("Tệp sao lưu không đúng cấu trúc.");
        }
      } catch (err) {
        alert("Có lỗi xảy ra khi đọc tệp sao lưu.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex min-h-screen bg-[#f4f5fa] text-[#1e2130] font-sans antialiased">
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content wrapper */}
      <main className="flex-1 min-w-0 px-4 py-6 md:px-8 max-w-[1000px] mx-auto w-full pb-24">
        {/* Global Warning Banner for Low Stock */}
        {lowStockCount > 0 && (
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-700 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13.5px] font-bold text-amber-800">Cảnh báo tồn kho tối thiểu</h3>
              <p className="text-[12.5px] text-amber-700 mt-0.5">
                Đang có <strong className="font-extrabold">{lowStockCount} sản phẩm</strong> chạm hoặc dưới mức tồn kho tối thiểu. Vui lòng kiểm tra tab <strong>Tồn kho</strong> để bổ sung.
              </p>
            </div>
          </div>
        )}

        {/* Action ribbon for Backup Data */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <h1 className="text-[19px] md:text-[21px] font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
              <span>🎯</span>
              {activeTab === "order" && "Bàn Lập Đơn Hàng"}
              {activeTab === "inventory" && "Quản Lý Kho Hàng"}
              {activeTab === "products" && "Thiết Lập Sản Phẩm"}
              {activeTab === "history" && "Lịch Sử Giao Dịch"}
              {activeTab === "report" && "Báo Cáo Doanh Thu"}
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Phiên quản lý trực quan thông minh
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportData}
              title="Xuất file sao lưu dự phòng"
              className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              Sao lưu dữ liệu
            </button>
            <label className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors">
              <FileUp className="w-3.5 h-3.5 text-slate-500" />
              Nhập sao lưu
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>
          </div>
        </div>

        {/* Tab content area with transition animations */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
