import { createClient } from "@supabase/supabase-js";
import { Product, Order, InventoryHistory } from "./types";

// Read environment variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

console.log("URL:", (import.meta as any).env.VITE_SUPABASE_URL);
console.log("KEY:", (import.meta as any).env.VITE_SUPABASE_ANON_KEY);

// Check configuration status
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Initialize Supabase Client (lazy loaded if configured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export type SupabaseConnectionStatus =
  | "not_configured" // VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing
  | "connected"       // Connected and tables exist
  | "tables_missing"  // Connected but tables do not exist yet
  | "error";          // Other connection/authentication error

export interface ConnectionCheckResult {
  status: SupabaseConnectionStatus;
  message: string;
}

/**
 * Checks connection and schema existence in Supabase.
 */
export async function checkSupabaseConnection(): Promise<ConnectionCheckResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      status: "not_configured",
      message: "Chưa cấu hình thông tin kết nối Supabase (Vui lòng thiết lập VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong Secrets panel).",
    };
  }

  try {
    // Try to query products table to check if it exists and we can access it
    const { error: productsError } = await supabase
      .from("products")
      .select("maSP")
      .limit(1);

    if (productsError) {
      // Check if table does not exist
      if (productsError.code === "42P01" || productsError.message?.includes("does not exist")) {
        return {
          status: "tables_missing",
          message: "Đã kết nối với Supabase, nhưng các bảng dữ liệu (products, orders, inventory_history) chưa được khởi tạo.",
        };
      }
      throw productsError;
    }

    // Try to query orders table
    const { error: ordersError } = await supabase
      .from("orders")
      .select("maDon")
      .limit(1);

    if (ordersError) {
      if (ordersError.code === "42P01" || ordersError.message?.includes("does not exist")) {
        return {
          status: "tables_missing",
          message: "Đã kết nối với Supabase, nhưng bảng 'orders' chưa được khởi tạo.",
        };
      }
      throw ordersError;
    }

    // Try to query inventory_history table
    const { error: historyError } = await supabase
      .from("inventory_history")
      .select("id")
      .limit(1);

    if (historyError) {
      if (historyError.code === "42P01" || historyError.message?.includes("does not exist")) {
        return {
          status: "tables_missing",
          message: "Đã kết nối với Supabase, nhưng bảng 'inventory_history' chưa được khởi tạo.",
        };
      }
      throw historyError;
    }

    return {
      status: "connected",
      message: "Kết nối thành công với Supabase! Dữ liệu đang được đồng bộ thời gian thực.",
    };
  } catch (err: any) {
    console.error("Supabase connection check error:", err);
    return {
      status: "error",
      message: err?.message || "Lỗi kết nối với Supabase. Vui lòng kiểm tra lại URL hoặc Anon Key.",
    };
  }
}

// SQL Script for creating database tables and storage bucket
export const SUPABASE_SQL_SETUP = `-- Copy và chạy đoạn mã SQL này trong Supabase SQL Editor:

-- 1. Tạo bảng products (Sản phẩm)
CREATE TABLE IF NOT EXISTS products (
  "maSP" TEXT PRIMARY KEY,
  "tenSP" TEXT NOT NULL,
  "giaBan" NUMERIC NOT NULL,
  "tonKho" INTEGER NOT NULL DEFAULT 0,
  "tonKhoToiThieu" INTEGER NOT NULL DEFAULT 0,
  "anhUrl" TEXT
);

-- 2. Tạo bảng orders (Đơn hàng)
CREATE TABLE IF NOT EXISTS orders (
  "maDon" TEXT PRIMARY KEY,
  "cuaHang" TEXT NOT NULL,
  "ghiChu" TEXT,
  "ngay" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "items" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "tongTien" NUMERIC NOT NULL
);

-- 3. Tạo bảng inventory_history (Lịch sử kho hàng)
CREATE TABLE IF NOT EXISTS inventory_history (
  "id" TEXT PRIMARY KEY,
  "maSP" TEXT NOT NULL,
  "tenSP" TEXT NOT NULL,
  "soLuong" INTEGER NOT NULL,
  "ghiChu" TEXT,
  "ngay" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Khởi tạo Storage Bucket tên là "products" cho hình ảnh sản phẩm
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Cho phép mọi người đọc ảnh công khai từ bucket "products"
CREATE POLICY "Cho phép đọc ảnh công khai" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

-- Cho phép upload ảnh ẩn danh vào bucket "products" để thử nghiệm nhanh
CREATE POLICY "Cho phép tải lên ảnh tự do" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products');

-- Kích hoạt Row Level Security (RLS) cho tất cả các bảng hoặc tắt RLS để thử nghiệm nhanh:
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE inventory_history DISABLE ROW LEVEL SECURITY;
`;

// --- DATA ACCESS METHODS ---

// 1. PRODUCTS
export async function getSupabaseProducts(): Promise<Product[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("maSP", { ascending: true });

  if (error) {
    console.error("Error fetching products from Supabase:", error);
    throw error;
  }
  return data as Product[];
}

export async function upsertSupabaseProduct(product: Product): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("products")
    .upsert(product, { onConflict: "maSP" });

  if (error) {
    console.error("Error saving product to Supabase:", error);
    throw error;
  }
}

export async function deleteSupabaseProduct(maSP: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("maSP", maSP);

  if (error) {
    console.error("Error deleting product from Supabase:", error);
    throw error;
  }
}

// 2. ORDERS
export async function getSupabaseOrders(): Promise<Order[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("ngay", { ascending: false });

  if (error) {
    console.error("Error fetching orders from Supabase:", error);
    throw error;
  }
  return data as Order[];
}

export async function insertSupabaseOrder(order: Order): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("orders")
    .insert(order);

  if (error) {
    console.error("Error inserting order into Supabase:", error);
    throw error;
  }
}

// 3. INVENTORY HISTORY
export async function getSupabaseInventoryHistory(): Promise<InventoryHistory[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("inventory_history")
    .select("*")
    .order("ngay", { ascending: false });

  if (error) {
    console.error("Error fetching inventory history from Supabase:", error);
    throw error;
  }
  return data as InventoryHistory[];
}

export async function insertSupabaseInventoryHistory(log: InventoryHistory): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("inventory_history")
    .insert(log);

  if (error) {
    console.error("Error inserting inventory history log into Supabase:", error);
    throw error;
  }
}

// 4. BULK IMPORT / SYNC FROM LOCAL STORAGE TO SUPABASE
export async function syncLocalDataToSupabase(
  products: Product[],
  orders: Order[],
  history: InventoryHistory[]
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured.");

  // Sync products
  if (products.length > 0) {
    const { error: pErr } = await supabase.from("products").upsert(products, { onConflict: "maSP" });
    if (pErr) throw pErr;
  }

  // Sync orders (using upsert in case some orders already exist)
  if (orders.length > 0) {
    const { error: oErr } = await supabase.from("orders").upsert(orders, { onConflict: "maDon" });
    if (oErr) throw oErr;
  }

  // Sync history
  if (history.length > 0) {
    const { error: hErr } = await supabase.from("inventory_history").upsert(history, { onConflict: "id" });
    if (hErr) throw hErr;
  }
}

/**
 * Uploads a file to Supabase Storage in the 'products' bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadProductImageToSupabase(file: File): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase is chưa được cấu hình. Không thể tải ảnh lên Storage.");
  }

  // Create clean filename with unique prefix
  const fileExt = file.name.split(".").pop();
  const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `product-images/${cleanFileName}`;

  // Upload file to 'products' bucket
  const { data, error } = await supabase.storage
    .from("products")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading to Supabase Storage:", error);
    throw new Error(`Lỗi tải ảnh lên Storage: ${error.message}. Hãy đảm bảo bạn đã chạy SQL tạo Bucket 'products' và thiết lập quyền truy cập công khai.`);
  }

  // Retrieve public URL
  const { data: { publicUrl } } = supabase.storage
    .from("products")
    .getPublicUrl(filePath);

  return publicUrl;
}

