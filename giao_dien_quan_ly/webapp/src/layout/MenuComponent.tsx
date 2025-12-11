import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Input,
  Card,
  Space,
  notification,
  Popover,
  theme,
  Modal,
  Form,
  Tag,
  Divider,
  MenuProps // Import thêm MenuProps để định nghĩa type cho chuẩn
} from "antd";
import {
  HomeFilled,
  ShoppingOutlined, // Lưu ý: icon gốc là ShoppingCartOutlined, check lại import của bạn
  ShoppingCartOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  ShopOutlined,
  TruckOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BarChartOutlined,
  LockOutlined,
  SolutionOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  GiftOutlined,
  HistoryOutlined,
  HomeOutlined,
  TagsOutlined
} from "@ant-design/icons";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

// Services & Types
import { authService } from "../api/services/auth.service";
import { userService } from "../api/services/user.service";
import { SimpleUserInfoResponse, UserChangePasswordRequest } from "../api/types/user.types";
import { tokenUtils } from "../utils/tokenUtils";

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAdmin, setIsAdmin] = useState(false);

  // State UI
  const [collapsed, setCollapsed] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // State Data
  const [userInfo, setUserInfo] = useState<SimpleUserInfoResponse | null>(null);

  // Form
  const [formPass] = Form.useForm();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // --- 1. Fetch User Info from API ---
  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const data = await userService.getMyInfo();
        setUserInfo(data);
      } catch (error) {
        console.error("Không lấy được thông tin user", error);
        const savedUsername = localStorage.getItem("username");
        if (savedUsername) {
          setUserInfo({ username: savedUsername, email: "", roles: [], id: "" });
        }
      }
    };

    fetchMyInfo();
    // Kiểm tra quyền Admin ngay khi load trang
    setIsAdmin(tokenUtils.isAdmin());
  }, []);

  // --- 2. Logout ---
  const handleLogout = async () => {
    try {
      await authService.logout();
      notification.success({
        message: "Đăng xuất thành công",
      });
      navigate("/login");
    } catch (error) {
      localStorage.clear();
      navigate("/login");
    }
  };

  // --- 3. Change Password Logic ---
  const handleChangePassword = async (values: any) => {
    setLoadingPass(true);
    try {
      const payload: UserChangePasswordRequest = {
        password: values.password,
        newPassword: values.newPassword,
        confirmationPassword: values.confirmationPassword
      };

      await userService.changePassword(payload);

      notification.success({ message: "Đổi mật khẩu thành công!" });
      setIsChangePassOpen(false);
      formPass.resetFields();
      setPopoverOpen(false);
    } catch (error: any) {
      notification.error({
        message: "Đổi mật khẩu thất bại",
        description: error.response?.data?.message || "Vui lòng kiểm tra lại thông tin"
      });
    } finally {
      setLoadingPass(false);
    }
  };

  // --- 4. Define Menu Items (Cấu hình Menu) ---
  // Sử dụng spread operator (...) để thêm mục menu có điều kiện
  const menuItems: MenuProps['items'] = [
    {
      key: "/pages/dashboard",
      icon: <HomeOutlined />,
      label: <Link to="/pages/dashboard">Tổng quan</Link>,
    },

    // --- NHÓM 1: QUẢN LÝ BÁN HÀNG ---
    {
      type: 'group',
      label: 'BÁN HÀNG',
      children: [
        {
          key: "/pages/orders",
          icon: <ShoppingCartOutlined />,
          label: <Link to="/pages/orders">Đơn hàng bán</Link>,
        },
        {
          key: "/pages/customers",
          icon: <UserOutlined />,
          label: <Link to="/pages/customers">Khách hàng</Link>,
        },
        {
          key: "/pages/khuyenmai",
          icon: <GiftOutlined />,
          label: <Link to="/pages/khuyenmai">Khuyến mãi</Link>,
        },
      ]
    },

    // --- NHÓM 2: SẢN PHẨM & KHO ---
    {
      type: 'group',
      label: 'SẢN PHẨM & KHO',
      children: [
        {
          key: "sub_product",
          icon: <ShopOutlined />,
          label: "Sản phẩm",
          children: [
            { key: "/pages/products", label: <Link to="/pages/products">Danh sách SP</Link> },
            { key: "/pages/danhmuc", icon: <AppstoreOutlined />, label: <Link to="/pages/danhmuc">Danh mục</Link> },
            { key: "/pages/thuonghieu", icon: <TagsOutlined />, label: <Link to="/pages/thuonghieu">Thương hiệu</Link> },
            { key: "/pages/option", icon: <ApartmentOutlined />, label: <Link to="/pages/option">Thuộc tính (Options)</Link> },
          ]
        },
        {
          key: "sub_inventory",
          icon: <DatabaseOutlined />,
          label: "Kho hàng",
          children: [
            { key: "/pages/warehouse", label: <Link to="/pages/warehouse">Danh sách Kho</Link> },
            { key: "/pages/inventory", label: <Link to="/pages/inventory">Tồn kho hiện tại</Link> },
            { key: "/pages/inventory-transaction", icon: <HistoryOutlined />, label: <Link to="/pages/inventory-transaction">Lịch sử giao dịch</Link> },
            { key: "/pages/purchase-orders", icon: <FileTextOutlined />, label: <Link to="/pages/purchase-orders">Đơn nhập hàng</Link> },
          ]
        }
      ]
    },

    // --- NHÓM 3: HỆ THỐNG & BÁO CÁO ---
    {
      type: 'group',
      label: 'QUẢN TRỊ',
      children: [
        {
          key: "/pages/suppliers",
          icon: <SolutionOutlined />,
          label: <Link to="/pages/suppliers">Nhà cung cấp</Link>,
        },
        // Chỉ hiện với Admin
        ...(isAdmin ? [
          {
            key: "sub_system",
            icon: <TeamOutlined />,
            label: "Nhân sự",
            children: [
              { key: "/pages/employees", label: <Link to="/pages/employees">Nhân viên</Link> },
              { key: "/pages/user", label: <Link to="/pages/user">Tài khoản User</Link> },
            ]
          }
        ] : []),
        {
          key: "/pages/reports",
          icon: <BarChartOutlined />,
          label: <Link to="/pages/reports">Báo cáo thống kê</Link>,
        },
      ]
    }
  ];
  // --- 5. User Popover Content ---
  const userPopover = (
    <Card
      style={{ width: 300, boxShadow: "none", border: "none" }}
      bodyStyle={{ padding: "10px 0" }}
      bordered={false}
    >
      <div style={{ textAlign: "center", marginBottom: 15, padding: "0 15px" }}>
        <Avatar
          size={64}
          icon={<UserOutlined />}
          style={{ backgroundColor: "#1677ff", marginBottom: 10 }}
        />
        <h3 style={{ margin: 0, fontSize: 18 }}>
          {userInfo?.username || localStorage.getItem("username") || "User"}
        </h3>
        <p style={{ fontSize: 13, color: "#888", margin: "5px 0" }}>
          {userInfo?.email}
        </p>
        <div>
          {userInfo?.roles?.map((r: any) => (
            <Tag key={r.name} color="blue">{r.name}</Tag>
          ))}
        </div>
      </div>

      <Divider style={{ margin: "10px 0" }} />

      <div style={{ padding: "0 15px" }}>
        <Button
          type="text"
          block
          icon={<LockOutlined />}
          style={{ textAlign: 'left', marginBottom: 5 }}
          onClick={() => {
            setIsChangePassOpen(true);
            setPopoverOpen(false);
          }}
        >
          Đổi mật khẩu
        </Button>

        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          block
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>
      </div>
    </Card>
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {/* SIDEBAR */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={250}
        style={{
          background: "#ffffff",
          borderRight: "1px solid #e6f4ff",
          position: "fixed",
          height: "100vh",
          left: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: "1px solid #f0f0f0",
            color: "#1677ff",
            fontWeight: 'bold',
            fontSize: collapsed ? 18 : 22,
          }}
        >
          {collapsed ? "MS" : "ShoeAdmin"}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          // defaultOpenKeys có thể bỏ hoặc set các key group cha muốn mở sẵn
          defaultOpenKeys={['sub_product', 'sub_inventory', 'sub_system']}
          style={{
            borderRight: 0,
            height: "calc(100vh - 114px)",
            overflowY: "auto",
            paddingBottom: 20 // Thêm padding dưới để scroll đẹp hơn
          }}
          items={menuItems}
        />

        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            borderTop: "1px solid #f0f0f0",
            padding: 10,
            textAlign: 'center'
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            block
          />
        </div>
      </Sider>

      {/* MAIN LAYOUT */}
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: "all 0.2s" }}>
        <Header
          style={{
            background: colorBgContainer,
            padding: "0 24px",
            display: "flex",
            justifyContent: "right",
            alignItems: "center",
            boxShadow: "0 1px 4px rgba(0,21,41,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 99,
          }}
        >

          <Space>
            <Popover
              placement="bottomRight"
              content={userPopover}
              trigger="click"
              open={popoverOpen}
              onOpenChange={setPopoverOpen}
              overlayStyle={{ padding: 0 }}
            >
              <Space style={{ cursor: "pointer" }}>
                <Avatar
                  style={{ backgroundColor: "#1677ff" }}
                  icon={<UserOutlined />}
                />
                <span style={{ fontWeight: 500 }}>
                  {userInfo?.username || localStorage.getItem("username") || "Loading..."}
                </span>
              </Space>
            </Popover>
          </Space>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 8,
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      {/* --- MODAL CHANGE PASSWORD --- */}
      <Modal
        title="Đổi mật khẩu"
        open={isChangePassOpen}
        onCancel={() => setIsChangePassOpen(false)}
        footer={null}
      >
        <Form form={formPass} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            name="password"
            label="Mật khẩu hiện tại"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 8, message: "Mật khẩu tối thiểu 8 ký tự" }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="confirmationPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginTop: 20 }}>
            <Button onClick={() => setIsChangePassOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loadingPass}>Đổi mật khẩu</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default MainLayout;