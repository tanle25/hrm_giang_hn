export interface Product {
  maSP: string;
  tenSP: string;
  giaBan: number;
  tonKho: number;
  tonKhoToiThieu: number;
  anhUrl: string;
}

export interface CartItem {
  maSP: string;
  tenSP: string;
  giaBan: number;
  anhUrl: string;
  soLuong: number;
}

export interface OrderItem {
  maSP: string;
  tenSP: string;
  giaBan: number;
  soLuong: number;
  thanhTien: number;
}

export interface Order {
  maDon: string;
  cuaHang: string; // 'Bán tại cửa hàng' or 'Bán online'
  ghiChu: string;
  ngay: string; // ISO date string
  items: OrderItem[];
  tongTien: number;
}

export interface InventoryHistory {
  id: string;
  maSP: string;
  tenSP: string;
  soLuong: number; // positive for stock in, negative for stock out / adjustment
  ghiChu: string;
  ngay: string;
}
