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
  InputNumber,
  Tag,
  Tooltip,
  Drawer,
  Descriptions,
  Divider
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { TablePaginationConfig } from "antd/es/table"; // Import type chuẩn

// Services & Types
import { warehouseService } from "../api/services/warehouse.service";
import { WarehouseRequest, WarehouseResponse } from "../api/types/warehouse.types";
import { tokenUtils } from "../utils/tokenUtils";

const { Title, Text } = Typography;

const WarehouseManagement: React.FC = () => {
  // --- State ---
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);

  // [CHỈNH SỬA] Cấu hình Pagination đầy đủ
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true, // Cho phép chọn số lượng phần tử
    pageSizeOptions: ['10', '20', '50', '100'], // Các mốc số lượng
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} kho`,
  });

  // Search State
  const [keyword, setKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Modal Create/Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Drawer View Detail State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewDetailItem, setViewDetailItem] = useState<WarehouseResponse | null>(null);

  const [form] = Form.useForm();

  const [isAdmin, setIsAdmin] = useState(false); // [Mới]

  // --- 1. Fetch Logic ---

  // Load danh sách (Mặc định)
  const fetchWarehouses = async (page: number, size: number) => {
    setLoading(true);
    try {
      // Backend page starts from 0, Antd starts from 1
      const data = await warehouseService.getAll(page - 1, size, "id");
      setWarehouses(data.content);

      // [CHỈNH SỬA] Cập nhật state pagination đúng với dữ liệu trả về và size hiện tại
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: size,
        total: data.page.totalElements
      }));
      setIsSearching(false);
    } catch (error) {
      message.error("Lỗi tải danh sách kho!");
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm
  const handleSearch = async (page: number, size: number) => {
    if (!keyword.trim()) {
      fetchWarehouses(1, size);
      return;
    }
    setLoading(true);
    try {
      // Lưu ý: Đảm bảo service search của bạn có nhận tham số size. 
      // Nếu service chưa hỗ trợ size, bạn cần update service. 
      // Ở đây tôi giả định service đã nhận tham số này theo code bạn gửi.
      const data = await warehouseService.search(keyword, page - 1, size);

      // Nếu cấu trúc trả về của search khác getAll (ví dụ data.page.content), hãy sửa lại dòng dưới
      // Dựa trên code cũ bạn gửi: setWarehouses(data.content);
      setWarehouses(data.content);

      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: size, // [CHỈNH SỬA] Không hardcode 20 nữa, dùng size thực tế
        total: data.page.totalElements // [CHỈNH SỬA] map đúng field total
      }));
      setIsSearching(true);
    } catch (error) {
      message.error("Lỗi tìm kiếm kho!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses(1, 10);
    setIsAdmin(tokenUtils.isAdmin()); // [Mới]

  }, []);

  // [CHỈNH SỬA] Xử lý thay đổi bảng (Trang & Size)
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    const page = newPagination.current || 1;
    const size = newPagination.pageSize || 10;

    if (isSearching) {
      handleSearch(page, size);
    } else {
      fetchWarehouses(page, size);
    }
  };

  // --- 2. CRUD Actions ---
  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: WarehouseResponse) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      address: record.address,
      province: record.province,
      district: record.district,
      ward: record.ward,
      description: record.description
    });
    setIsModalOpen(true);
  };

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await warehouseService.getById(id);
      setViewDetailItem(detail);
      setIsDetailOpen(true);
    } catch (error) {
      message.error("Không thể tải thông tin chi tiết kho");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await warehouseService.delete(id);
      message.success("Xóa kho thành công!");

      // [CHỈNH SỬA] Reload giữ nguyên page size hiện tại
      const currentSize = pagination.pageSize || 10;
      if (isSearching) handleSearch(pagination.current || 1, currentSize);
      else fetchWarehouses(pagination.current || 1, currentSize);
    } catch (error: any) {
      message.error(error.message || "Không thể xóa kho này.");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const requestData: WarehouseRequest = { ...values };

      setLoading(true);
      if (editingId) {
        await warehouseService.update(editingId, requestData);
        message.success("Cập nhật kho thành công!");
      } else {
        await warehouseService.create(requestData);
        message.success("Thêm kho mới thành công!");
      }

      setIsModalOpen(false);
      form.resetFields();

      // [CHỈNH SỬA] Reload về trang 1 với size hiện tại
      const currentSize = pagination.pageSize || 10;
      fetchWarehouses(1, currentSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi lưu thông tin kho.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Table Columns ---
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
      align: 'center' as const
    },
    {
      title: "Tên kho",
      dataIndex: "name",
      render: (text: string) => <b style={{ color: '#1890ff' }}>{text}</b>
    },
    {
      title: "Địa chỉ chi tiết",
      render: (record: WarehouseResponse) => (
        <div>
          <div>{record.address}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.ward}, {record.district}, {record.province}
          </Text>
        </div>
      )
    },

    {
      title: "Người tạo",
      dataIndex: ["createBy", "username"],
      width: 120,
      render: (text: string) => <Tag>{text || "System"}</Tag>
    },
    {
      title: "Hành động",
      width: 150,
      align: 'center' as const,
      render: (_: any, record: WarehouseResponse) => (
        <Space>
          <Tooltip title="Chi tiết">
            <Button
              icon={<InfoCircleOutlined />}
              size="small"
              onClick={() => handleViewDetail(record.id)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
              ghost
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {isAdmin ?? (<Popconfirm
            title="Xóa kho này?"
            onConfirm={() => handleDelete(record.id)}
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>)}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <Card bordered={false} style={{ borderRadius: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>Quản lý Kho hàng</Title>
            <Text type="secondary">Quản lý địa điểm và thông tin kho bãi</Text>
          </div>
          <Space>
            <Input
              placeholder="Tìm kiếm kho..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              // [CHỈNH SỬA] Truyền size hiện tại vào handleSearch
              onPressEnter={() => handleSearch(1, pagination.pageSize || 10)}
              style={{ width: 250 }}
              suffix={<SearchOutlined onClick={() => handleSearch(1, pagination.pageSize || 10)} style={{ cursor: 'pointer' }} />}
            />
            <Button
              icon={<ReloadOutlined />}
              // [CHỈNH SỬA] Reset và giữ nguyên size
              onClick={() => { setKeyword(""); fetchWarehouses(1, pagination.pageSize || 10); }}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
            >
              Thêm kho
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={warehouses}
          rowKey="id"
          loading={loading}
          pagination={pagination} // Sử dụng state pagination đã cấu hình
          onChange={handleTableChange} // Gắn sự kiện change
          bordered
        />
      </Card>

      {/* --- DRAWER: VIEW DETAIL --- */}
      <Drawer
        title="Chi tiết Kho hàng"
        placement="right"
        onClose={() => setIsDetailOpen(false)}
        open={isDetailOpen}
        width={600}
      >
        {viewDetailItem && (
          <div style={{ padding: '0 10px' }}>
            <div style={{ marginBottom: 20, textAlign: 'center' }}>
              <HomeOutlined style={{ fontSize: 40, color: '#1890ff', marginBottom: 10 }} />
              <Title level={3} style={{ margin: 0 }}>{viewDetailItem.name}</Title>
              <Tag color="blue" style={{ marginTop: 5 }}>ID: {viewDetailItem.id}</Tag>
            </div>

            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label={<Space><EnvironmentOutlined /> Địa chỉ</Space>}>
                {viewDetailItem.address}
              </Descriptions.Item>
              <Descriptions.Item label="Phường / Xã">
                {viewDetailItem.ward}
              </Descriptions.Item>
              <Descriptions.Item label="Quận / Huyện">
                {viewDetailItem.district}
              </Descriptions.Item>
              <Descriptions.Item label="Tỉnh / Thành">
                {viewDetailItem.province}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {viewDetailItem.description || <i style={{ color: '#999' }}>Không có mô tả</i>}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" style={{ fontSize: 14 }}>Thông tin quản trị</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title={<Space><UserOutlined /> Người tạo</Space>}>
                  <p><b>{viewDetailItem.createBy?.username || "System"}</b></p>
                  <p style={{ fontSize: 12, color: '#888' }}>
                    <CalendarOutlined /> {dayjs(viewDetailItem.createAt).format("DD/MM/YYYY HH:mm")}
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title={<Space><EditOutlined /> Cập nhật lần cuối</Space>}>
                  <p><b>{viewDetailItem.updateBy?.username || "System"}</b></p>
                  <p style={{ fontSize: 12, color: '#888' }}>
                    <CalendarOutlined /> {dayjs(viewDetailItem.updateAt).format("DD/MM/YYYY HH:mm")}
                  </p>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Drawer>

      {/* Modal Form Create/Edit */}
      <Modal
        title={editingId ? "Cập nhật Kho hàng" : "Thêm Kho hàng mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        confirmLoading={loading}
        width={700}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Tên kho"
                rules={[{ required: true, message: "Vui lòng nhập tên kho" }]}
              >
                <Input prefix={<HomeOutlined />} placeholder="Ví dụ: Kho tổng HCM" />
              </Form.Item>
            </Col>

          </Row>

          <Form.Item
            name="address"
            label="Địa chỉ cụ thể"
            rules={[{ required: true, message: "Vui lòng nhập số nhà, tên đường" }]}
          >
            <Input placeholder="Ví dụ: 123 Đường ABC" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="province"
                label="Tỉnh / Thành phố"
                rules={[{ required: true, message: "Nhập tỉnh/thành" }]}
              >
                <Input placeholder="TP. Hồ Chí Minh" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="district"
                label="Quận / Huyện"
                rules={[{ required: true, message: "Nhập quận/huyện" }]}
              >
                <Input placeholder="Quận 1" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="ward"
                label="Phường / Xã"
                rules={[{ required: true, message: "Nhập phường/xã" }]}
              >
                <Input placeholder="Phường Bến Nghé" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết về kho..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WarehouseManagement;