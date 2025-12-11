import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Tag, Popconfirm, message } from "antd";
import { EditOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

const ThongTinNguoiDung: React.FC = () => {
  const [users, setUsers] = useState([
    {
      key: "1",
      tenNguoiDung: "Nguyễn Văn A",
      email: "vana@example.com",
      sdt: "0987654321",
      diaChi: "123 Lê Lợi, TP.HCM",
      vaiTro: "Quản trị viên",
      trangThai: "Hoạt động",
    },
    {
      key: "2",
      tenNguoiDung: "Trần Thị B",
      email: "thib@example.com",
      sdt: "0901234567",
      diaChi: "45 Nguyễn Huệ, TP.HCM",
      vaiTro: "Nhân viên",
      trangThai: "Tạm khóa",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();

  const showModal = (user?: any) => {
    setEditingUser(user || null);
    form.setFieldsValue(user || {});
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingUser) {
        setUsers(
          users.map((u) => (u.key === editingUser.key ? { ...editingUser, ...values } : u))
        );
        message.success("Cập nhật người dùng thành công!");
      } else {
        const newUser = { key: Date.now().toString(), ...values };
        setUsers([...users, newUser]);
        message.success("Thêm người dùng mới thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleDelete = (key: string) => {
    setUsers(users.filter((u) => u.key !== key));
    message.success("Đã xóa người dùng!");
  };

  const columns = [
    { title: "Tên người dùng", dataIndex: "tenNguoiDung", key: "tenNguoiDung" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "sdt", key: "sdt" },
    { title: "Địa chỉ", dataIndex: "diaChi", key: "diaChi" },
    {
      title: "Vai trò",
      dataIndex: "vaiTro",
      key: "vaiTro",
      render: (vaiTro: string) => (
        <Tag color={vaiTro === "Quản trị viên" ? "geekblue" : "green"}>{vaiTro}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (trangThai: string) => (
        <Tag color={trangThai === "Hoạt động" ? "green" : "volcano"}>{trangThai}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="Xóa người dùng này?"
            onConfirm={() => handleDelete(record.key)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </>
      ),
    },
  ];

  // CSS tích hợp trong file
  const css = `
    .user-container {
      background-color: #f8fdf8;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

  `;

  return (
    <>
      <style>{css}</style>
      <div className="user-container">
        <div className="user-header">
          <h2>Thông tin người dùng</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            Thêm người dùng
          </Button>
        </div>

        <Table columns={columns} dataSource={users} pagination={{ pageSize: 5 }} />

        <Modal
          title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={() => setIsModalVisible(false)}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="tenNguoiDung"
              label="Tên người dùng"
              rules={[{ required: true, message: "Nhập tên người dùng!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: "Nhập email!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="sdt" label="Số điện thoại">
              <Input />
            </Form.Item>
            <Form.Item name="diaChi" label="Địa chỉ">
              <Input />
            </Form.Item>
            <Form.Item name="vaiTro" label="Vai trò">
              <Select>
                <Option value="Quản trị viên">Quản trị viên</Option>
                <Option value="Nhân viên">Nhân viên</Option>
                <Option value="Khách hàng">Khách hàng</Option>
              </Select>
            </Form.Item>
            <Form.Item name="trangThai" label="Trạng thái">
              <Select>
                <Option value="Hoạt động">Hoạt động</Option>
                <Option value="Tạm khóa">Tạm khóa</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default ThongTinNguoiDung;
