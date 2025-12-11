import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Card,
  Row,
  Col,
  Popconfirm,
  Descriptions,
  Drawer,
  Tooltip,
  DatePicker,
  InputNumber,
  Tag
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
  DollarOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { TablePaginationConfig } from "antd/es/table";

// Services
import { staffService } from "../api/services/staff.service";
import { userService } from "../api/services/user.service"; // Gọi API tạo staff từ đây

// Types
import { 
  StaffResponse, 
  StaffUpdateRequest 
} from "../api/types/staff.types";
import { UserCreationRequestForStaff } from "../api/types/user.types";

const { Option } = Select;

const StaffManagement: React.FC = () => {
  // --- State ---
  const [loading, setLoading] = useState(false);
  const [staffs, setStaffs] = useState<StaffResponse[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
  });
  const [keyword, setKeyword] = useState("");

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState<StaffResponse | null>(null);

  // Forms
  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();

  // --- Fetch Data ---
  const fetchStaffs = async (page: number, size: number, searchKey?: string) => {
    setLoading(true);
    try {
      const key = searchKey !== undefined ? searchKey : keyword;
      let data;
      if (key) {
        data = await staffService.search(key, page - 1, size);
      } else {
        data = await staffService.getAll(page - 1, size);
      }

      console.log(data)
      setStaffs(data.content);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: size,
        total: data.page.totalElements,
      }));
    } catch (error) {
      message.error("Lỗi tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs(1, 10);
  }, []);

  // --- Handlers ---
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchStaffs(
      newPagination.current || 1,
      newPagination.pageSize || 10,
      keyword
    );
  };

  const handleSearch = () => {
    fetchStaffs(1, pagination.pageSize || 10, keyword);
  };

  const handleReset = () => {
    setKeyword("");
    fetchStaffs(1, pagination.pageSize || 10, "");
  };

  // 1. Create Staff (Call UserService)
  const handleCreateStaff = async (values: any) => {
    try {
      // Format date before sending
      const payload: UserCreationRequestForStaff = {
        ...values,
        hireDate: values.hireDate.toISOString(), // Convert Dayjs to ISO String
      };

      await userService.createUserForStaff(payload);
      message.success("Tạo nhân viên thành công!");
      setIsCreateModalOpen(false);
      formCreate.resetFields();
      fetchStaffs(1, pagination.pageSize || 10);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Tạo thất bại");
    }
  };

  // 2. Update Staff
  const openUpdateModal = async (staffId: number) => {
    try {
      const detail = await staffService.getById(staffId);
      setSelectedStaff(detail);
      formUpdate.setFieldsValue({
        fullName: detail.fullName,
        phoneNumber: detail.phoneNumber,
        gender: detail.gender,
        position: detail.position,
        salary: detail.salary,
      });
      setIsUpdateModalOpen(true);
    } catch (error) {
      message.error("Lỗi tải thông tin nhân viên");
    }
  };

  const handleUpdateStaff = async (values: StaffUpdateRequest) => {
    if (!selectedStaff) return;
    try {
      await staffService.update(selectedStaff.id, values);
      message.success("Cập nhật thành công!");
      setIsUpdateModalOpen(false);
      fetchStaffs(pagination.current || 1, pagination.pageSize || 10, keyword);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Cập nhật thất bại");
    }
  };

  // 3. Delete Staff
  const handleDeleteStaff = async (id: number) => {
    try {
      await staffService.delete(id);
      message.success("Đã xóa nhân viên");
      fetchStaffs(pagination.current || 1, pagination.pageSize || 10, keyword);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Xóa thất bại");
    }
  };

  // 4. View Detail
  const openDetailDrawer = async (id: number) => {
    try {
      const detail = await staffService.getById(id);
      setSelectedStaff(detail);
      setIsDetailDrawerOpen(true);
    } catch (error) {
      message.error("Lỗi tải chi tiết");
    }
  };

  // --- Helpers ---
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
      render: (id: number) => <Tag>#{id}</Tag>,
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Tài khoản",
      render: (_: any, r: StaffResponse) => (
        <div style={{ fontSize: 12 }}>
          <div><UserOutlined /> {r.user?.username}</div>
          <div style={{ color: "#888" }}><MailOutlined /> {r.user?.email}</div>
        </div>
      ),
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      render: (pos: string) => <Tag color="blue">{pos}</Tag>,
    },
    {
      title: "SĐT",
      dataIndex: "phoneNumber",
    },
    {
      title: "Lương",
      dataIndex: "salary",
      align: 'right' as const,
      render: (val: number) => formatCurrency(val),
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right" as const,
      width: 150,
      render: (_: any, record: StaffResponse) => (
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
              onClick={() => openUpdateModal(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa nhân viên này?"
            description="Hành động không thể hoàn tác"
            onConfirm={() => handleDeleteStaff(record.id)}
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
      <Card title="Quản lý Nhân sự">
        {/* Filter */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
            <Input
              placeholder="Tìm theo tên, SĐT, email..."
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
              Thêm nhân viên
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={staffs}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* --- MODAL: Create Staff (Full info + Account) --- */}
      <Modal
        title="Thêm mới Nhân viên & Tài khoản"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={800}
      >
        <Form form={formCreate} layout="vertical" onFinish={handleCreateStaff}>
          <Descriptions title="Thông tin tài khoản" size="small" bordered={false} />
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, min: 3, message: "Tối thiểu 3 ký tự" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="VD: nv_nguyena" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}
              >
                <Input prefix={<MailOutlined />} placeholder="email@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, min: 8, message: "Tối thiểu 8 ký tự" }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Descriptions title="Thông tin cá nhân" size="small" bordered={false} style={{ marginTop: 10 }} />
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[{ required: true, pattern: /^(0|\+84)(\d{9})$/, message: "SĐT không hợp lệ" }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="090..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="position" label="Chức vụ" rules={[{ required: true }]}>
                <Input placeholder="VD: Quản lý kho" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="salary" label="Lương cơ bản" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: "100%" }}
                  prefix={<DollarOutlined />}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                <Select>
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hireDate" label="Ngày vào làm" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: "right", marginTop: 16 }}>
            <Button onClick={() => setIsCreateModalOpen(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Tạo nhân viên
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* --- MODAL: Update Staff (Only Info) --- */}
      <Modal
        title={`Cập nhật nhân viên: ${selectedStaff?.fullName}`}
        open={isUpdateModalOpen}
        onCancel={() => setIsUpdateModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={formUpdate} layout="vertical" onFinish={handleUpdateStaff}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[{ required: true, pattern: /^(0|\+84)(\d{9})$/ }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="position" label="Chức vụ" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="salary" label="Lương cơ bản" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                <Select>
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

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

      {/* --- DRAWER: View Detail --- */}
      <Drawer
        title="Hồ sơ nhân viên"
        placement="right"
        onClose={() => setIsDetailDrawerOpen(false)}
        open={isDetailDrawerOpen}
        width={500}
      >
        {selectedStaff && (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Card title="Thông tin tài khoản" size="small">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Username">{selectedStaff.user?.username}</Descriptions.Item>
                <Descriptions.Item label="Email">{selectedStaff.user?.email}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Thông tin cá nhân" size="small">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Họ tên">{selectedStaff.fullName}</Descriptions.Item>
                <Descriptions.Item label="Giới tính">{selectedStaff.gender}</Descriptions.Item>
                <Descriptions.Item label="SĐT">{selectedStaff.phoneNumber}</Descriptions.Item>
                <Descriptions.Item label="Ngày vào làm">
                  {dayjs(selectedStaff.hireDate).format("DD/MM/YYYY")}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Công việc" size="small">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Chức vụ">
                  <Tag color="cyan">{selectedStaff.position}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Lương cơ bản">
                  <b style={{ color: "green" }}>{formatCurrency(selectedStaff.salary)}</b>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <div style={{ fontSize: 12, color: "#888", marginTop: 20 }}>
              <p>Ngày tạo: {dayjs(selectedStaff.createAt).format("DD/MM/YYYY HH:mm")}</p>
              <p>Người tạo: {selectedStaff.createBy?.username || "System"}</p>
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default StaffManagement;