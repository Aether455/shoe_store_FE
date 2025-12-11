import React, { useEffect, useState } from "react";
import { Layout, Button, notification } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";

const { Header, Content } = Layout;

const ShoeMenu: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    notification.success({
      message: "Đăng xuất thành công",
      description: "Bạn đã đăng xuất khỏi hệ thống quản lý giày.",
    });
    setIsLoggedIn(false);
    navigate("/"); // trở về trang đăng nhập
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      <Header
        style={{
          background: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ddd",
          padding: "0 24px",
        }}
      >
        <h2 style={{ color: "#7B61FF", fontWeight: "bold", margin: 0 }}>Adidas</h2>

        {isLoggedIn && (
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Đăng Xuất
          </Button>
        )}
      </Header>

      <Content style={{ padding: "24px" }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default ShoeMenu;
