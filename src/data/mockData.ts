import { Product, Order } from "../types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    maSP: "SP-001",
    tenSP: "Trà Phổ Nhĩ Sống Cổ Thụ 2020",
    giaBan: 1250000,
    tonKho: 12,
    tonKhoToiThieu: 5,
    anhUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=300"
  },
  {
    maSP: "SP-002",
    tenSP: "Bình Tử Sa Tây Thi Nguyên Khoáng",
    giaBan: 3500000,
    tonKho: 3,
    tonKhoToiThieu: 2,
    anhUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=300"
  },
  {
    maSP: "SP-003",
    tenSP: "Trà Thiết Quan Âm Hạng Thượng Hạng",
    giaBan: 450000,
    tonKho: 25,
    tonKhoToiThieu: 8,
    anhUrl: "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&q=80&w=300"
  },
  {
    maSP: "SP-004",
    tenSP: "Chén Khải Sứ Cảnh Đức Trấn Vẽ Tay",
    giaBan: 680000,
    tonKho: 1,
    tonKhoToiThieu: 3, // Trigger warning
    anhUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300"
  },
  {
    maSP: "SP-005",
    tenSP: "Hồng Trà Cổ Thụ Hà Giang",
    giaBan: 380000,
    tonKho: 40,
    tonKhoToiThieu: 10,
    anhUrl: "https://images.unsplash.com/photo-1596303513738-685c7e634576?auto=format&fit=crop&q=80&w=300"
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    maDon: "DH-1001",
    cuaHang: "Bán tại cửa hàng",
    ghiChu: "Khách quen tặng trà hữu",
    ngay: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2).toISOString(), // 2 days ago
    items: [
      {
        maSP: "SP-001",
        tenSP: "Trà Phổ Nhĩ Sống Cổ Thụ 2020",
        giaBan: 1250000,
        soLuong: 1,
        thanhTien: 1250000
      },
      {
        maSP: "SP-003",
        tenSP: "Trà Thiết Quan Âm Hạng Thượng Hạng",
        giaBan: 450000,
        soLuong: 2,
        thanhTien: 900000
      }
    ],
    tongTien: 2150000
  },
  {
    maDon: "DH-1002",
    cuaHang: "Bán online",
    ghiChu: "Giao hỏa tốc trước 17h",
    ngay: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    items: [
      {
        maSP: "SP-002",
        tenSP: "Bình Tử Sa Tây Thi Nguyên Khoáng",
        giaBan: 3500000,
        soLuong: 1,
        thanhTien: 3500000
      }
    ],
    tongTien: 3500000
  }
];
