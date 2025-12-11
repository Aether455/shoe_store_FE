import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Popconfirm,
  message,
  Space,
  Card,
  Typography,
  Form,
  Row,
  Col,
  Tag,
  Tooltip
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import { SupplierRequest, SupplierResponse } from "../../api/types/supplier.types";
import { supplierService } from "../../api/services/supplier.service";
import { tokenUtils } from "../../utils/tokenUtils";


const { Title, Text } = Typography;

// --- Hàm Helper: Map lỗi Backend sang tiếng Việt ---
const mapBackendErrorToMessage = (errorCode: string): string => {
  const errorMap: Record<string, string> = {
    "PHONE_NUMBER_EXISTED": "Số điện thoại này đã được sử dụng bởi nhà cung cấp khác!",
    "SUPPLIER_NOT_EXISTED": "Nhà cung cấp không tồn tại hoặc đã bị xóa.",
    "SUPPLIER_NAME_REQUIRED": "Tên nhà cung cấp là bắt buộc.",
    "INVALID_PHONE_NUMBER": "Số điện thoại không đúng định dạng (+84... hoặc 0...).",
    "INVALID_EMAIL": "Địa chỉ email không hợp lệ.",
    "ADDRESS_REQUIRED": "Địa chỉ không được để trống.",
    "EMAIL_REQUIRED": "Email không được để trống.",
    "UNAUTHORIZED": "Bạn không có quyền thực hiện thao tác này.",
    "UNCATEGORIZED_EXCEPTION": "Lỗi hệ thống, vui lòng thử lại sau."
  };
  return errorMap[errorCode] || `Lỗi: ${errorCode}`;
};
const NhaCungCap: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false); // [Mới] State check quyền
  // --- State ---
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const [keyword, setKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  // --- 1. Fetch Data Logic ---
  const fetchData = async (page: number, size: number) => {
    setLoading(true);
    try {
      let data;
      // Backend page starts from 0, Antd starts from 1 -> (page - 1)
      if (isSearching && keyword.trim()) {
        data = await supplierService.search(keyword, page - 1);
      } else {
        data = await supplierService.getAll(page - 1, size);
      }

      if (data) {
        setSuppliers(data.content);
        setPagination({
          current: page,
          pageSize: size,
          total: data.totalElements
        });
      }
    } catch (error: any) {
      // Log lỗi console nhưng không hiện message để tránh spam khi mới load trang
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, 10);
    setIsAdmin(tokenUtils.isAdmin()); // [Mới] Kiểm tra quyền khi load trang
  }, []);

  // --- 2. Handlers ---
  const handleSearch = () => {
    setIsSearching(!!keyword.trim());
    fetchData(1, pagination.pageSize);
  };

  const handleRefresh = () => {
    setKeyword("");
    setIsSearching(false);
    // Cần set state keyword rỗng ngay lập tức hoặc gọi trực tiếp getAll
    setLoading(true);
    supplierService.getAll(0, 10).then((data) => {
      setSuppliers(data.content);
      setPagination({ current: 1, pageSize: 10, total: data.totalElements });
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleTableChange = (newPagination: any) => {
    fetchData(newPagination.current, newPagination.pageSize);
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: SupplierResponse) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      address: record.address,
      phoneNumber: record.phoneNumber,
      email: record.email
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await supplierService.delete(id);
      message.success("Xóa nhà cung cấp thành công!");
      fetchData(pagination.current, pagination.pageSize);
    } catch (error: any) {
      const code = error.response?.data?.message || "UNKNOWN_ERROR";
      message.error(mapBackendErrorToMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const requestData: SupplierRequest = { ...values };
      setLoading(true);

      if (editingId) {
        await supplierService.update(editingId, requestData);
        message.success("Cập nhật thành công!");
      } else {
        await supplierService.create(requestData);
        message.success("Thêm mới thành công!");
      }

      setIsModalOpen(false);
      form.resetFields();

      // Nếu thêm mới về trang 1, sửa thì giữ trang hiện tại
      if (!editingId) fetchData(1, pagination.pageSize);
      else fetchData(pagination.current, pagination.pageSize);

    } catch (error: any) {
      // Xử lý lỗi từ Backend
      if (error.response?.data) {
        const errorCode = error.response.data.message;
        message.error(mapBackendErrorToMessage(errorCode));
      } else if (!error.errorFields) {
        // Lỗi mạng hoặc lỗi khác không phải validation form
        message.error("Có lỗi xảy ra, vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Columns Definition ---
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
      align: "center" as const,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "name",
      width: 220,
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: "#1890ff" }}>{text}</span>
      ),
    },
    {
      title: "Liên hệ",
      width: 250,
      render: (record: SupplierResponse) => (
        <Space direction="vertical" size={2}>
          <Tag icon={<PhoneOutlined />} color="green">
            {record.phoneNumber}
          </Tag>
          <Tag icon={<MailOutlined />} color="geekblue">
            {record.email}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      render: (text: string) => (
        <span><EnvironmentOutlined style={{ marginRight: 5 }} />{text}</span>
      )
    },
    {
      title: "Người tạo",
      dataIndex: ["createBy", "username"],
      width: 120,
      render: (text: string) => <Tag>{text || "System"}</Tag>
    },
    {
      title: "Người sửa",
      dataIndex: ["updateBy", "username"],
      width: 120,
      render: (text: string) => <Tag>{text || "System"}</Tag>
    },
    {
      title: "Hành động",
      width: 110,
      align: "center" as const,
      fixed: "right" as const,
      render: (_: any, record: SupplierResponse) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
              ghost
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {isAdmin && (<Popconfirm
            title="Xóa nhà cung cấp?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Tooltip>
          </Popconfirm>)}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>Nhà Cung Cấp</Title>
            <Text type="secondary">Quản lý thông tin đối tác nguồn hàng</Text>
          </div>

          <Space wrap>
            <Input
              placeholder="Tìm tên, SĐT, email..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 250 }}
              allowClear
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            />
            <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>Làm mới</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
            >
              Thêm mới
            </Button>
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={suppliers}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhà cung cấp`
          }}
          onChange={handleTableChange}
          bordered
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <GlobalOutlined style={{ color: "#1890ff" }} />
            <span>{editingId ? "Cập nhật Nhà cung cấp" : "Thêm Nhà cung cấp mới"}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        confirmLoading={loading}
        width={600}
        okText="Lưu dữ liệu"
        cancelText="Hủy bỏ"
        centered
        forceRender
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="name"
            label="Tên nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng nhập tên nhà cung cấp!" }]}
          >
            <Input placeholder="Ví dụ: Công ty TNHH ABC" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  { pattern: /^(0|\+84)(\d{9})$/, message: "SĐT không hợp lệ (VD: 0912345678)" }
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="09xx..." size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không đúng định dạng!" }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="contact@company.com" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Địa chỉ trụ sở"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập địa chỉ chi tiết..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NhaCungCap;