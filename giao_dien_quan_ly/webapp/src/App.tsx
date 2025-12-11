import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./Components/Login";
import MainLayout from "./layout/MenuComponent";
import Dashboard from "./Components/Dashboard";
import ProductPage from "./Components/sanpham/ProductList";
import CustomerPage from "./Components/QLkhachhang";
import EmployeePage from "./Components/Qlnhanvien";
import OrderManagement from "./Components/QLDonHang";
import NhaCungCap from "./Components/qlnhacungcap/NhaCungCap";
import KhuyenMai from "./Components/QLkhuyenmai";
import QLnhap_xuatkho from "./Components/InventoryTransactionManagement";
import ThongTinNguoiDung from "./Components/ThongTinNguoiDung";
import QlThuongHieu from "./Components/sanpham/qlthuonghieu";
import QlDanhMuc from "./Components/sanpham/qldanhmuc";
import InventoryManagement from "./Components/InventoryManagement";
import { tokenUtils } from "./utils/tokenUtils";
import OptionManagement from "./Components/sanpham/OptionManagement";
import WarehouseManagement from "./Components/WarehouseManagement";
import PurchaseOrderManagement from "./Components/PurchaseOrderManagement";
import InventoryTransactionManagement from "./Components/InventoryTransactionManagement";
import UserManagement from "./Components/UserManagement";
import ReportManagement from "./Components/QLBaoCao";

// Component bảo vệ route
const ProtectedRoute = () => {
  const token = tokenUtils.getToken();
  // Nếu không có token, đá về login. 
  // replace giúp user không back lại được trang protected sau khi bị đá ra
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

// Component kiểm tra nếu đã login thì không cho vào trang login nữa
const PublicRoute = () => {
  const token = tokenUtils.getToken();
  return !token ? <Outlet /> : <Navigate to="/pages/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* --- Routes dành cho người chưa đăng nhập (Login, Register) --- */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* --- Routes cần bảo vệ (Phải login mới vào được) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/pages" element={<MainLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="option" element={<OptionManagement />} />
            <Route path="products" element={<ProductPage />} />
            <Route path="customers" element={<CustomerPage />} />
            <Route path="employees" element={<EmployeePage />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="purchase-orders" element={<PurchaseOrderManagement />} />
            <Route path="warehouse" element={<WarehouseManagement />} />
            <Route path="suppliers" element={<NhaCungCap />} />
            <Route path="khuyenmai" element={<KhuyenMai />} />
            <Route path="reports" element={<ReportManagement />} />
            <Route path="nhapxuatkho" element={<QLnhap_xuatkho />} />
            <Route path="thongtinnguoidung" element={<ThongTinNguoiDung />} />
            <Route path="danhmuc" element={<QlDanhMuc />} />
            <Route path="thuonghieu" element={<QlThuongHieu />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="inventory-transaction" element={<InventoryTransactionManagement />} />

            <Route path="user" element={<UserManagement />} />

          </Route>
        </Route>

        {/* Fallback route: Nếu gõ linh tinh thì về dashboard (nếu login rồi) hoặc login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;