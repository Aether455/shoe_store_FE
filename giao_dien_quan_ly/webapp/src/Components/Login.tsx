import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined, } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/services/auth.service";

const { Title } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Gọi API qua Service
      await authService.login({
        username: values.username,
        password: values.password,
      });

      message.success("Đăng nhập thành công!");

      // Chuyển trang. Dùng replace: true để user không back lại được trang login
      navigate("/pages/dashboard", { replace: true });

    } catch (error: any) {
      console.error(error);
      // Axios Interceptor sẽ ném lỗi ra đây nếu status != 200
      const errorMsg = error.response?.data.message || "Sai tài khoản hoặc mật khẩu!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundColor: "#f5f9ff",
        overflow: "hidden",
      }}
    >
      {/* Background Shapes - Giữ nguyên design của bạn */}
      <div
        style={{
          position: "absolute",
          left: "-100px",
          top: "-100px",
          width: "400px",
          height: "400px",
          background: "linear-gradient(135deg, #1e90ff, #007bff)",
          borderRadius: "50%",
          transform: "rotate(45deg)",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          right: "-100px",
          bottom: "-100px",
          width: "400px",
          height: "400px",
          background: "linear-gradient(135deg, #1e90ff, #007bff)",
          borderRadius: "50%",
          transform: "rotate(-45deg)",
        }}
      ></div>

      <div
        style={{
          background: "white",
          padding: "40px 50px",
          borderRadius: "20px",
          boxShadow: "0 5px 25px rgba(0,0,0,0.15)",
          width: "380px",
          zIndex: 1,
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: 10 }}>
          Đăng nhập hệ thống
        </Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading} // Thêm loading state
              style={{
                background: "#007bff",
                border: "none",
                fontWeight: 600,
                height: "40px"
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;