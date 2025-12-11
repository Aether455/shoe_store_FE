import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  message,
  Card,
  Row,
  Col,
  Popconfirm,
  Descriptions,
  Drawer,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { TablePaginationConfig } from "antd/es/table";

// Services & Types
import { userService } from "../api/services/user.service";
import { 
  UserResponse, 
  Role, 
  UserCreationRequest, 
  UserUpdateRequest 
} from "../api/types/user.types";

const { Option } = Select;

const UserManagement: React.FC = () => {
  // --- State ---
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
  });
  const [keyword, setKeyword] = useState("");

  // Modal & Drawer State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  
  // Forms
  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();

  // --- Fetch Data ---
  const fetchUsers = async (page: number, size: number, searchKey?: string) => {
    setLoading(true);
    try {
      const key = searchKey !== undefined ? searchKey : keyword;
      let data;
      
      if (key) {
        // API: searchUsers
        data = await userService.searchUsers(key, page - 1);
      } else {
        // API: getUsers
        data = await userService.getUsers(page - 1, size, "id");
      }
      console.log(data)

      setUsers(data.content);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: size,
        total: data.page.totalElements,
      }));
    } catch (error) {
      message.error("Lỗi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, 10);
  }, []);

  // --- Handlers ---
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchUsers(
      newPagination.current || 1,
      newPagination.pageSize || 10,
      keyword
    );
  };

  const handleSearch = () => {
    fetchUsers(1, pagination.pageSize || 10, keyword);
  };

  const handleReset = () => {
    setKeyword("");
    fetchUsers(1, pagination.pageSize || 10, "");
  };

  // 1. Create User (Regular)
  const handleCreateUser = async (values: UserCreationRequest) => {
    try {
      await userService.createUser(values);
      message.success("Tạo người dùng thành công!");
      setIsCreateModalOpen(false);
      formCreate.resetFields();
      fetchUsers(1, pagination.pageSize || 10);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Tạo thất bại");
    }
  };

  // 2. Update User (Email & Roles)
  const openUpdateModal = async (user: UserResponse) => {
    try {
        // Gọi API detail để lấy dữ liệu mới nhất trước khi edit
        const detail = await userService.getUserById(user.id);
        setSelectedUser(detail);
        
        // Map Role objects to Role names (string[]) cho Select component
        const roleNames = detail.roles.map(r => r.name);
        
        formUpdate.setFieldsValue({
            email: detail.email,
            roles: roleNames
        });
        setIsUpdateModalOpen(true);
    } catch (error) {
        message.error("Lỗi tải thông tin người dùng");
    }
  };

  const handleUpdateUser = async (values: UserUpdateRequest) => {
    if (!selectedUser) return;
    try {
      await userService.updateUser(selectedUser.id, values);
      message.success("Cập nhật thành công!");
      setIsUpdateModalOpen(false);
      fetchUsers(pagination.current || 1, pagination.pageSize || 10, keyword);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Cập nhật thất bại");
    }
  };

  // 3. Delete User
  const handleDeleteUser = async (id: string) => {
    try {
      await userService.deleteUser(id);
      message.success("Đã xóa người dùng");
      fetchUsers(pagination.current || 1, pagination.pageSize || 10, keyword);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Xóa thất bại");
    }
  };

  // 4. View Detail
  const openDetailDrawer = async (id: string) => {
      try {
          const detail = await userService.getUserById(id);
          setSelectedUser(detail);
          setIsDetailDrawerOpen(true);
      } catch (error) {
          message.error("Lỗi tải chi tiết");
      }
  }

  // --- Helpers ---
  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case Role.ADMIN: return "red";
      case Role.USER: return "blue";
      case Role.CUSTOMER: return "green";
      default: return "default";
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 250,
      render: (id: string) => <Tooltip title={id}><span style={{fontFamily: 'monospace'}}>{id.substring(0, 8)}...</span></Tooltip>
    },
    {
      title: "Username",
      dataIndex: "username",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Quyền hạn",
      dataIndex: "roles",
      render: (roles: any[]) => (
        <Space wrap>
          {roles.map((role) => (
            <Tag color={getRoleColor(role.name)} key={role.name}>
              {role.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createAt",
      width: 150,
      render: (d: string) => dayjs(d).format("DD/MM/YYYY"),
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right" as const,
      width: 150,
      render: (_: any, record: UserResponse) => (
        <Space>
          <Tooltip title="Chi tiết">
            <Button 
                size="small" 
                icon={<EyeOutlined />} 
                onClick={() => openDetailDrawer(record.id)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
                size="small"
                icon={<EditOutlined />}
                style={{ color: "orange" }}
                onClick={() => openUpdateModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa người dùng này?"
            description="Hành động không thể hoàn tác"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
                <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Quản lý Người dùng">
        {/* Filter */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
            <Input
              placeholder="Tìm theo username, email..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col span={8}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                Tìm kiếm
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Làm mới
              </Button>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Tạo mới
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* --- MODAL: Create User --- */}
      <Modal
        title="Tạo tài khoản người dùng"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
      >
        <Form form={formCreate} layout="vertical" onFinish={handleCreateUser}>
          <Form.Item
            name="username"
            label="Username"
            rules={[
                { required: true, message: "Vui lòng nhập username" },
                { min: 3, message: "Username ít nhất 3 ký tự" }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập username" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="example@gmail.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 8, message: "Mật khẩu ít nhất 8 ký tự" }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginTop: 16 }}>
            <Button onClick={() => setIsCreateModalOpen(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Tạo
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* --- MODAL: Update User --- */}
      <Modal
        title={`Cập nhật người dùng: ${selectedUser?.username}`}
        open={isUpdateModalOpen}
        onCancel={() => setIsUpdateModalOpen(false)}
        footer={null}
      >
        <Form form={formUpdate} layout="vertical" onFinish={handleUpdateUser}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" }
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item
            name="roles"
            label="Phân quyền"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 quyền" }]}
          >
            <Select mode="multiple" placeholder="Chọn quyền">
                <Option value={Role.ADMIN}>ADMIN</Option>
                <Option value={Role.USER}>USER</Option>
                <Option value={Role.CUSTOMER}>CUSTOMER</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginTop: 16 }}>
            <Button onClick={() => setIsUpdateModalOpen(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* --- DRAWER: User Detail --- */}
      <Drawer
        title="Thông tin chi tiết người dùng"
        placement="right"
        onClose={() => setIsDetailDrawerOpen(false)}
        open={isDetailDrawerOpen}
        width={500}
      >
        {selectedUser && (
            <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="ID">{selectedUser.id}</Descriptions.Item>
                <Descriptions.Item label="Username">
                    <b>{selectedUser.username}</b>
                </Descriptions.Item>
                <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
                <Descriptions.Item label="Quyền hạn">
                    <Space wrap>
                        {selectedUser.roles.map((role) => (
                            <Tag color={getRoleColor(role.name)} key={role.name}>
                                {role.name}
                            </Tag>
                        ))}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                    {dayjs(selectedUser.createAt).format("DD/MM/YYYY HH:mm:ss")}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối">
                    {dayjs(selectedUser.updateAt).format("DD/MM/YYYY HH:mm:ss")}
                </Descriptions.Item>
                
                {/* Có thể hiển thị thêm description của Role nếu cần */}
                <Descriptions.Item label="Mô tả quyền">
                    <ul style={{paddingLeft: 20, margin: 0}}>
                        {selectedUser.roles.map(r => (
                            <li key={r.name}>{r.name}: {r.description}</li>
                        ))}
                    </ul>
                </Descriptions.Item>
            </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default UserManagement;