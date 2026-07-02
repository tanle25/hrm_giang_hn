import React, { useState } from "react";
import { Database, CheckCircle, AlertCircle, Copy, Check, CloudLightning, ArrowRight, ShieldAlert, Loader2 } from "lucide-react";
import { SupabaseConnectionStatus, SUPABASE_SQL_SETUP, syncLocalDataToSupabase } from "../supabaseClient";
import { Product, Order, InventoryHistory } from "../types";

interface SupabaseSyncPanelProps {
  status: SupabaseConnectionStatus;
  message: string;
  products: Product[];
  orders: Order[];
  inventoryHistory: InventoryHistory[];
  onRefresh: () => Promise<void>;
  onLocalDataLoaded: (products: Product[], orders: Order[], history: InventoryHistory[]) => void;
}

export default function SupabaseSyncPanel({
  status,
  message,
  products,
  orders,
  inventoryHistory,
  onRefresh,
  onLocalDataLoaded,
}: SupabaseSyncPanelProps) {
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSyncToSupabase = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn đẩy toàn bộ dữ liệu hiện tại từ LocalStorage lên Supabase? Việc này sẽ ghi đè các bản ghi trùng khóa (maSP, maDon, id).")) {
      return;
    }

    setIsSyncing(true);
    setSyncSuccess(null);
    try {
      await syncLocalDataToSupabase(products, orders, inventoryHistory);
      setSyncSuccess("Đồng bộ dữ liệu thành công! Toàn bộ sản phẩm, đơn hàng và lịch sử đã được lưu trữ trên Cloud Supabase.");
      // Refresh state from supabase
      await onRefresh();
    } catch (err: any) {
      console.error(err);
      alert("Lỗi đồng bộ: " + (err?.message || "Không thể tải dữ liệu lên Supabase. Vui lòng kiểm tra lại cấu trúc bảng hoặc kết nối."));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Render styling based on status
  const getStatusStyles = () => {
    switch (status) {
      case "connected":
        return {
          bg: "bg-emerald-50 border-emerald-200",
          text: "text-emerald-800",
          iconBg: "bg-emerald-100 text-emerald-700",
          badge: "bg-emerald-500 text-white",
          label: "Đã Kết Nối",
        };
      case "tables_missing":
        return {
          bg: "bg-amber-50 border-amber-200",
          text: "text-amber-800",
          iconBg: "bg-amber-100 text-amber-700",
          badge: "bg-amber-500 text-white",
          label: "Cần Cấu Hình Bảng",
        };
      case "error":
        return {
          bg: "bg-rose-50 border-rose-200",
          text: "text-rose-800",
          iconBg: "bg-rose-100 text-rose-700",
          badge: "bg-rose-500 text-white",
          label: "Lỗi Kết Nối",
        };
      case "not_configured":
      default:
        return {
          bg: "bg-slate-50 border-slate-200",
          text: "text-slate-800",
          iconBg: "bg-slate-100 text-slate-700",
          badge: "bg-slate-400 text-white",
          label: "Chưa Cấu Hình",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={`mb-5 border rounded-2xl p-5 ${styles.bg} shadow-sm transition-all`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Connection Header & Info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-[280px]">
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${styles.iconBg}`}>
            <Database className="w-5.5 h-5.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[14px] font-extrabold text-slate-800 flex items-center gap-1.5">
                Cổng kết nối Supabase Cloud Database
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${styles.badge}`}>
                {styles.label}
              </span>
            </div>
            <p className="text-[12.5px] text-slate-600 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-center flex-wrap">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Đang làm mới...
              </>
            ) : (
              "Làm mới kết nối"
            )}
          </button>

          {status === "tables_missing" && (
            <button
              onClick={() => setShowSql(!showSql)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1"
            >
              Xem SQL khởi tạo
            </button>
          )}

          {status === "connected" && (
            <button
              onClick={handleSyncToSupabase}
              disabled={isSyncing}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang đồng bộ...
                </>
              ) : (
                <>
                  <CloudLightning className="w-3.5 h-3.5" />
                  Đồng bộ dữ liệu Local lên Cloud
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Success Banner */}
      {syncSuccess && (
        <div className="mt-4 p-3 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{syncSuccess}</span>
        </div>
      )}

      {/* Not Configured Instruction */}
      {status === "not_configured" && (
        <div className="mt-4 pt-4 border-t border-slate-200 text-slate-600 text-xs leading-relaxed">
          <div className="flex items-start gap-2 bg-white/50 p-3 rounded-xl border border-slate-100">
            <ShieldAlert className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-700 mb-1">Cách kết nối Supabase:</p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                <li>Truy cập <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold underline">Supabase.com</a>, tạo dự án mới và lấy <strong>Project URL</strong> cùng <strong>Anon Key</strong>.</li>
                <li>Mở tab <strong>Secrets</strong> ở góc dưới bên trái màn hình AI Studio.</li>
                <li>Thêm 2 biến môi trường: <code className="bg-slate-100 text-rose-600 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code> và <code className="bg-slate-100 text-rose-600 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_ANON_KEY</code>.</li>
                <li>Hệ thống sẽ tự động khởi động lại và kết nối. Bạn cũng sẽ cần tạo các bảng tương ứng trên Supabase SQL Editor.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* SQL Setup Instruction Box */}
      {(status === "tables_missing" || showSql) && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto relative">
            <div className="absolute right-3 top-3 flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-semibold"
                title="Sao chép SQL"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Sao chép SQL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="mt-2 pr-20 whitespace-pre-wrap leading-relaxed max-h-[250px] overflow-y-auto">
              {SUPABASE_SQL_SETUP}
            </pre>
          </div>
          <div className="mt-3 flex items-start gap-2 text-[12px] text-amber-700">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
            <p>
              <strong>Quan trọng:</strong> Truy cập vào <strong>SQL Editor</strong> trong bảng điều khiển Supabase của bạn, dán đoạn mã SQL trên rồi nhấn <strong>Run</strong>. Sau khi thành công, hãy nhấn nút <strong>Làm mới kết nối</strong> ở góc trên bên phải.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
