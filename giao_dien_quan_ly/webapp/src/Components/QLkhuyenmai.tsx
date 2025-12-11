import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Popconfirm,
  message,
  Space,
  Card,
  Tag,
  Tooltip,
  Descriptions,
  Form,
  Typography,
  Row,
  Col
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  BarcodeOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { voucherService } from "../api/services/voucher.service";
import { VoucherRequest, VoucherResponse, VoucherStatus, VoucherType } from "../api/types/voucher.types";
import { tokenUtils } from "../utils/tokenUtils";

const { Option } = Select;
const { Title, Text } = Typography;



const VoucherManagement: React.FC = () => {
  // State
  const [isAdmin, setIsAdmin] = useState(false); // [Mới]

  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const [isSearching, setIsSearching] = useState(false);
  const [keyword, setKeyword] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewDetailItem, setViewDetailItem] = useState<VoucherResponse | null>(null);

  const [form] = Form.useForm();

  // --- 1. Fetch Data ---
  const fetchVouchers = async (page: number, size: number, forceSearch?: boolean) => {
    setLoading(true);
    try {
      // Xác định xem có đang tìm kiếm không. 
      // Nếu forceSearch được truyền vào, dùng nó. Nếu không, dùng state isSearching hiện tại.
      const searching = forceSearch !== undefined ? forceSearch : isSearching;

      let data: any;

      // Logic: Nếu đang trong chế độ search VÀ có từ khóa -> Gọi API Search
      if (searching && keyword.trim()) {
        data = await voucherService.search(keyword, page - 1);
      } else {
        data = await voucherService.getAll(page - 1, size);
      }

      // --- XỬ LÝ DỮ LIỆU (Hỗ trợ cả Array và Page Object) ---
      if (Array.isArray(data)) {
        // Trường hợp trả về List [{}, {}]
        setVouchers(data);
        setPagination({
          current: page,
          pageSize: size,
          total: data.length
        });
      } else if (data && data.content) {
        // Trường hợp trả về Page { content: [], totalElements: ... }
        setVouchers(data.content);
        setPagination({
          current: page,
          pageSize: size,
          total: data.page.totalElements
        });
      } else {
        setVouchers([]);
      }
    } catch (error) {
      message.error("Lỗi tải danh sách voucher");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers(1, 10);
    setIsAdmin(tokenUtils.isAdmin());

  }, []);
  // --- Sửa lỗi nút Tìm kiếm (Click 1 lần là ăn ngay) ---
  const handleSearch = () => {
    const shouldSearch = !!keyword.trim(); // Tính toán trạng thái ngay lập tức
    setIsSearching(shouldSearch); // Cập nhật state (cho UI)

    // Truyền trực tiếp shouldSearch vào hàm fetch để không bị delay
    fetchVouchers(1, pagination.pageSize, shouldSearch);
  };

  // --- Sửa lỗi nút Làm mới (Hiển thị đúng dữ liệu) ---
  const handleRefresh = () => {
    setKeyword(""); // Xóa từ khóa
    setIsSearching(false); // Tắt chế độ tìm kiếm

    // Gọi fetchVouchers với forceSearch = false để lấy lại toàn bộ danh sách
    // Logic check Array/Page đã nằm trong fetchVouchers nên sẽ không bị lỗi nữa
    fetchVouchers(1, 10, false);
  };

  // --- 2. CRUD Actions ---
  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    // Set default values
    form.setFieldsValue({
      type: VoucherType.PERCENTAGE,
      status: VoucherStatus.ACTIVE,
      minApplicablePrice: 0,
      maxDiscountAmount: 0
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: VoucherResponse) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      voucherCode: record.voucherCode,
      type: record.type, // Lưu ý: Check kỹ field này bên backend trả về là discountType hay type
      status: record.status,
      discountValue: record.discountValue,
      minApplicablePrice: record.minApplicablePrice,
      maxDiscountAmount: record.maxDiscountAmount,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await voucherService.delete(id);
      message.success("Xóa voucher thành công");
      fetchVouchers(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const [start, end] = values.dateRange;

      const requestData: VoucherRequest = {
        name: values.name,
        voucherCode: values.voucherCode,
        type: values.type,
        status: values.status,
        discountValue: values.discountValue,
        minApplicablePrice: values.minApplicablePrice,
        maxDiscountAmount: values.maxDiscountAmount,
        startDate: start.toISOString(),
        endDate: end.toISOString()
      };

      setLoading(true);
      if (editingId) {
        await voucherService.update(editingId, requestData);
        message.success("Cập nhật voucher thành công");
      } else {
        await voucherService.create(requestData);
        message.success("Tạo voucher mới thành công");
      }
      setIsModalOpen(false);
      fetchVouchers(pagination.current, pagination.pageSize);
    } catch (error: any) {
      if (error.response?.data) {
        message.error(error.response?.data?.message);
      } else {
        // message.error("Có lỗi xảy ra"); // Form validate error
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Render Helpers ---
  const getStatusTag = (status: VoucherStatus) => {
    switch (status) {
      case VoucherStatus.ACTIVE: return <Tag color="green">Hoạt động</Tag>;
      case VoucherStatus.INACTIVE: return <Tag color="orange">Tạm dừng</Tag>;
      case VoucherStatus.EXPIRED: return <Tag color="red">Hết hạn</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 60, align: 'center' as const },
    {
      title: "Mã Voucher", dataIndex: "voucherCode",
      render: (t: string) => <Tag color="purple" style={{ fontSize: 14, fontWeight: 'bold' }}>{t}</Tag>
    },
    { title: "Tên chương trình", dataIndex: "name", width: 200 },
    {
      title: "Loại giảm", dataIndex: "type",
      render: (t: string) => t === VoucherType.PERCENTAGE ? <Tag color="blue">% Phần trăm</Tag> : <Tag color="cyan">$ Số tiền</Tag>
    },
    {
      title: "Giá trị", dataIndex: "discountValue",
      render: (val: number, r: VoucherResponse) =>
        r.type === VoucherType.PERCENTAGE ? <b style={{ color: 'red' }}>{val}%</b> : <b style={{ color: 'green' }}>{val.toLocaleString()}đ</b>
    },
    {
      title: "Trạng thái", dataIndex: "status",
      render: (s: VoucherStatus) => getStatusTag(s)
    },
    {
      title: "Thời gian",
      render: (_: any, r: VoucherResponse) => (
        <div style={{ fontSize: 12 }}>
          <div>BĐ: {dayjs(r.startDate).format("DD/MM/YYYY")}</div>
          <div>KT: {dayjs(r.endDate).format("DD/MM/YYYY")}</div>
        </div>
      )
    },
    {
      title: "Hành động",
      fixed: 'right' as const,
      render: (_: any, record: VoucherResponse) => (
        <Space>
          <Tooltip title="Chi tiết">
            <Button size="small" icon={<InfoCircleOutlined />} onClick={() => setViewDetailItem(record)} />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          {isAdmin && (<Popconfirm title="Xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
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
            <Title level={3} style={{ margin: 0 }}>Quản lý Voucher</Title>
            <Text type="secondary">Thiết lập mã giảm giá và chương trình khuyến mãi</Text>
          </div>
          <Space>
            <Input
              placeholder="Tìm tên, mã voucher..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
            />
            <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>Làm mới</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: '#52c41a', borderColor: '#52c41a' }}>Thêm Voucher</Button>
          </Space>
        </div>

        <Table
          dataSource={vouchers}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (p, s) => fetchVouchers(p, s)
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingId ? "Cập nhật Voucher" : "Tạo Voucher mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        confirmLoading={loading}
        width={800}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="Tên chương trình" rules={[{ required: true, message: "Nhập tên chương trình" }]}>
                <Input placeholder="Ví dụ: Siêu sale 11/11" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="voucherCode" label="Mã Voucher" rules={[{ required: true, message: "Nhập mã" }]}>
                <Input placeholder="SALE1111" style={{ textTransform: 'uppercase' }} prefix={<BarcodeOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="type" label="Loại giảm giá" rules={[{ required: true }]}>
                <Select>
                  <Option value={VoucherType.PERCENTAGE}>Phần trăm (%)</Option>
                  <Option value={VoucherType.FIXED_AMOUNT}>Số tiền cố định</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.type !== curr.type}
              >
                {({ getFieldValue }) => (
                  <Form.Item
                    name="discountValue"
                    label={getFieldValue("type") === VoucherType.PERCENTAGE ? "Giá trị (%)" : "Giá trị (VNĐ)"}
                    rules={[{ required: true, message: "Nhập giá trị" }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={getFieldValue("type") === VoucherType.PERCENTAGE ? 100 : undefined}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                <Select>
                  <Option value={VoucherStatus.ACTIVE}>Hoạt động</Option>
                  <Option value={VoucherStatus.INACTIVE}>Tạm dừng</Option>
                  <Option value={VoucherStatus.EXPIRED}>Đã hết hạn</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dateRange" label="Thời gian áp dụng" rules={[{ required: true, message: "Chọn khoảng thời gian" }]}>
                <DatePicker.RangePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="minApplicablePrice" label="Đơn tối thiểu">
                <InputNumber style={{ width: '100%' }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="maxDiscountAmount" label="Giảm tối đa">
                <InputNumber style={{ width: '100%' }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết Voucher"
        open={!!viewDetailItem}
        onCancel={() => setViewDetailItem(null)}
        footer={[<Button key="close" onClick={() => setViewDetailItem(null)}>Đóng</Button>]}
        width={700}
      >
        {viewDetailItem && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID">{viewDetailItem.id}</Descriptions.Item>
            <Descriptions.Item label="Mã">{viewDetailItem.voucherCode}</Descriptions.Item>
            <Descriptions.Item label="Tên" span={2}>{viewDetailItem.name}</Descriptions.Item>
            <Descriptions.Item label="Loại giảm">{viewDetailItem.type === VoucherType.PERCENTAGE ? "Phần trăm" : "Tiền mặt"}</Descriptions.Item>
            <Descriptions.Item label="Giá trị">{viewDetailItem.discountValue.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Đơn tối thiểu">{viewDetailItem.minApplicablePrice.toLocaleString()} đ</Descriptions.Item>
            <Descriptions.Item label="Giảm tối đa">{viewDetailItem.maxDiscountAmount.toLocaleString()} đ</Descriptions.Item>
            <Descriptions.Item label="Bắt đầu">{dayjs(viewDetailItem.startDate).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
            <Descriptions.Item label="Kết thúc">{dayjs(viewDetailItem.endDate).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
            <Descriptions.Item label="Người tạo">{viewDetailItem.createBy?.username}</Descriptions.Item>
            <Descriptions.Item label="Người sửa">{viewDetailItem.updateBy?.username}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{dayjs(viewDetailItem.createAt).format("DD/MM/YYYY")}</Descriptions.Item>

            <Descriptions.Item label="Ngày sửa">{dayjs(viewDetailItem.updateAt).format("DD/MM/YYYY")}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default VoucherManagement;