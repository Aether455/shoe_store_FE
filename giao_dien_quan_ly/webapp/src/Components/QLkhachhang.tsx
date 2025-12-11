import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Tooltip,
  Spin
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  MinusCircleOutlined,
  HomeOutlined,
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { TablePaginationConfig } from "antd/es/table";

// Services & Types
import { customerService } from "../api/services/customer.service";
import { addressService } from "../api/services/address.service"; // Import Service mới
import { CustomerResponse, CustomerRequest, AddressResponse, AddressRequest } from "../api/types/customer.types";
import { tokenUtils } from "../utils/tokenUtils";

const CustomerPage: React.FC = () => {
  // --- State ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
  });

  const [keyword, setKeyword] = useState("");

  // Create/Update Customer Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerResponse | null>(null);
  const [form] = Form.useForm();

  // Detail Drawer State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<CustomerResponse | null>(null);

  // --- ADDRESS MANAGEMENT STATE (Trong Drawer) ---
  const [addressList, setAddressList] = useState<AddressResponse[]>([]); // List địa chỉ riêng
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false); // Modal thêm địa chỉ
  const [formAddress] = Form.useForm();

  // --- Fetch Data Main Table ---
  const fetchCustomers = async (page: number, size: number, searchKey?: string) => {
    setLoading(true);
    try {
      let data;
      const key = searchKey !== undefined ? searchKey : keyword;
      if (key) {
        data = await customerService.search(key, page - 1);
      } else {
        data = await customerService.getAll(page - 1, size);
      }
      setCustomers(data.content);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: size,
        total: data.page.totalElements,
      }));
    } catch (error) {
      message.error("Lỗi tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1, 10);
    setIsAdmin(tokenUtils.isAdmin());
  }, []);

  // --- ADDRESS HANDLERS (Logic mới) ---

  // 1. Hàm lấy danh sách địa chỉ của 1 khách hàng
  const fetchCustomerAddresses = async (customerId: number) => {
    setLoadingAddress(true);
    try {
      const data = await addressService.getByCustomerId(customerId);
      setAddressList(data);
    } catch (error) {
      message.error("Lỗi tải danh sách địa chỉ");
    } finally {
      setLoadingAddress(false);
    }
  };

  // 2. Hàm mở Drawer chi tiết -> Gọi API lấy địa chỉ
  const openDetailDrawer = async (id: number) => {
    try {
      const detail = await customerService.getById(id);
      setViewCustomer(detail);
      setIsDetailOpen(true);
      // Gọi API lấy địa chỉ realtime
      fetchCustomerAddresses(id);
    } catch (error) {
      message.error("Không lấy được chi tiết khách hàng");
    }
  };

  // 3. Hàm thêm địa chỉ mới (Gọi API AddressController)
  const handleAddAddress = async (values: AddressRequest) => {
    if (!viewCustomer) return;
    setLoadingAddress(true);
    try {
      await addressService.create({
        ...values,
        customerId: viewCustomer.id // Gắn ID khách hàng đang xem
      });
      message.success("Thêm địa chỉ thành công");
      setIsAddressModalOpen(false);
      formAddress.resetFields();
      // Reload lại danh sách địa chỉ
      fetchCustomerAddresses(viewCustomer.id);
      // Reload lại bảng chính để cập nhật địa chỉ mặc định (nếu cần)
      fetchCustomers(pagination.current || 1, pagination.pageSize || 10, keyword);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi thêm địa chỉ");
    } finally {
      setLoadingAddress(false);
    }
  };

  // 4. Hàm xóa địa chỉ (Gọi API AddressController)
  const handleDeleteAddress = async (addressId: number) => {
    if (!viewCustomer) return;
    try {
      await addressService.delete(addressId);
      message.success("Xóa địa chỉ thành công");
      fetchCustomerAddresses(viewCustomer.id);
      // Reload lại bảng chính
      fetchCustomers(pagination.current || 1, pagination.pageSize || 10, keyword);
    } catch (error) {
      message.error("Lỗi xóa địa chỉ");
    }
  }

  // --- MAIN HANDLERS ---
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchCustomers(
      newPagination.current || 1,
      newPagination.pageSize || 10,
      keyword
    );
  };

  const handleSearch = () => {
    fetchCustomers(1, pagination.pageSize || 10, keyword);
  };

  const handleReset = () => {
    setKeyword("");
    fetchCustomers(1, pagination.pageSize || 10, "");
  };

  const handleDelete = async (id: number) => {
    try {
      await customerService.delete(id);
      message.success("Xóa khách hàng thành công!");
      fetchCustomers(pagination.current || 1, pagination.pageSize || 10, keyword);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi xóa");
    }
  };

  const handleSaveCustomer = async (values: CustomerRequest) => {
    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer.id, values);
        message.success("Cập nhật thành công!");
      } else {
        await customerService.create(values);
        message.success("Thêm mới thành công!");
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingCustomer(null);
      fetchCustomers(pagination.current || 1, pagination.pageSize || 10, keyword);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi lưu dữ liệu");
    }
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    form.resetFields();
    form.setFieldsValue({ addresses: [{}] }); // Form tạo mới vẫn giữ logic cũ để tạo nhanh
    setIsModalOpen(true);
  };

  const openEditModal = async (record: CustomerResponse) => {
    try {
      const detail = await customerService.getById(record.id);
      setEditingCustomer(detail);
      form.setFieldsValue(detail);
      setIsModalOpen(true);
    } catch (error) {
      message.error("Không lấy được chi tiết khách hàng");
    }
  };

  // --- Columns ---
  const columns = [
    { title: "ID", dataIndex: "id", width: 70, render: (id: number) => <Tag>#{id}</Tag> },
    { title: "Họ tên", dataIndex: "fullName", render: (name: string) => <b>{name}</b> },
    { title: "Số điện thoại", dataIndex: "phoneNumber", render: (phone: string) => <Tag color="blue">{phone}</Tag> },
    {
      title: "Địa chỉ mặc định",
      dataIndex: "addresses",
      render: (addresses: any[]) => {
        if (!addresses || addresses.length === 0)
          return <span style={{ color: "#999" }}>Chưa có</span>;
        const first = addresses[0];
        const text = `${first.address}, ${first.ward}, ${first.district}, ${first.province}`;
        return (
          <Space direction="vertical" size={0}>
            <span>{text}</span>
            {addresses.length > 1 && (
              <Tag style={{ fontSize: 10 }}>+{addresses.length - 1} địa chỉ khác</Tag>
            )}
          </Space>
        );
      },
    },
    { title: "Ngày tạo", dataIndex: "createAt", width: 150, render: (d: string) => dayjs(d).format("DD/MM/YYYY HH:mm") },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_: any, record: CustomerResponse) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => openDetailDrawer(record.id)}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              style={{ color: "orange" }}
            />
          </Tooltip>
          {isAdmin && (
            <Popconfirm
              title="Xóa khách hàng?"
              description="Hành động này không thể hoàn tác!"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Tooltip title="Xóa">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Quản lý Khách hàng" bordered={false}>
        {/* Filter Bar */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
            <Input
              placeholder="Tìm theo tên hoặc SĐT..."
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
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Thêm khách hàng
            </Button>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* --- DRAWER CHI TIẾT KHÁCH HÀNG --- */}
      <Drawer
        title="Chi tiết Khách hàng"
        placement="right"
        onClose={() => setIsDetailOpen(false)}
        open={isDetailOpen}
        width={600}
      >
        {viewCustomer && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              <Descriptions title="Thông tin cá nhân" column={1}>
                <Descriptions.Item label={<Space><UserOutlined /> Họ tên</Space>}>
                  <b>{viewCustomer.fullName}</b>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><PhoneOutlined /> Số điện thoại</Space>}>
                  <a href={`tel:${viewCustomer.phoneNumber}`}>{viewCustomer.phoneNumber}</a>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><CalendarOutlined /> Ngày đăng ký</Space>}>
                  {dayjs(viewCustomer.createAt).format("DD/MM/YYYY HH:mm:ss")}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* SECTION ĐỊA CHỈ ĐƯỢC QUẢN LÝ BẰNG API AddressController */}
            <Card
              title={<Space><HomeOutlined /> Danh sách địa chỉ</Space>}
              size="small"
              extra={
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setIsAddressModalOpen(true)}>
                  Thêm địa chỉ
                </Button>
              }
            >
              {loadingAddress ? <Spin /> : (
                <>
                  {addressList && addressList.length > 0 ? (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {addressList.map((addr, index) => (
                        <Card key={addr.id} type="inner" size="small" title={`Địa chỉ #${index + 1}`}
                          extra={
                            <Popconfirm title="Xóa địa chỉ này?" onConfirm={() => handleDeleteAddress(addr.id)}>
                              <Button danger type="text" icon={<DeleteOutlined />} size="small" />
                            </Popconfirm>
                          }
                        >
                          <div><b>{addr.address}</b></div>
                          <div style={{ color: '#666', fontSize: 12 }}>
                            {addr.ward}, {addr.district}, {addr.province}
                          </div>
                        </Card>
                      ))}
                    </Space>
                  ) : (
                    <div style={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>Chưa có địa chỉ</div>
                  )}
                </>
              )}
            </Card>

            <Card size="small" style={{ background: '#f5f5f5' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Người tạo">
                  {viewCustomer.createBy?.username || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Người cập nhật cuối">
                  {viewCustomer.updateBy?.username || "N/A"} ({dayjs(viewCustomer.updateAt).format()})
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        )}
      </Drawer>

      {/* --- MODAL THÊM ĐỊA CHỈ MỚI --- */}
      <Modal
        title="Thêm địa chỉ mới"
        open={isAddressModalOpen}
        onCancel={() => setIsAddressModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={formAddress} layout="vertical" onFinish={handleAddAddress}>
          <Form.Item
            name="address"
            label="Số nhà / Tên đường"
            rules={[{ required: true, message: "Nhập địa chỉ cụ thể" }]}
          >
            <Input placeholder="VD: 123 Nguyễn Huệ" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="province"
                label="Tỉnh / Thành"
                rules={[{ required: true, message: "Nhập Tỉnh/TP" }]}
              >
                <Input placeholder="TP.HCM" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="district"
                label="Quận / Huyện"
                rules={[{ required: true, message: "Nhập Quận/Huyện" }]}
              >
                <Input placeholder="Quận 1" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="ward"
                label="Phường / Xã"
                rules={[{ required: true, message: "Nhập Phường/Xã" }]}
              >
                <Input placeholder="Bến Nghé" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setIsAddressModalOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loadingAddress}>Thêm</Button>
          </div>
        </Form>
      </Modal>

      {/* Create/Update Customer Modal (Dùng cho tạo mới khách hàng + địa chỉ ban đầu) */}
      <Modal
        title={editingCustomer ? `Cập nhật khách hàng #${editingCustomer.id}` : "Thêm khách hàng mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
        maskClosable={false}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveCustomer}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                rules={[
                  { required: true, message: "Vui lòng nhập SĐT!" },
                  { pattern: /^(0|\+84)(\d{9})$/, message: "SĐT không hợp lệ!" },
                ]}
              >
                <Input placeholder="0987654321" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: "10px 0 20px" }}>
            <HomeOutlined /> Danh sách địa chỉ (Tạo mới)
          </Divider>

          <Form.List name="addresses">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card
                    key={key}
                    size="small"
                    title={`Địa chỉ ${index + 1}`}
                    extra={
                      fields.length > 0 ? (
                        <Button
                          danger
                          type="text"
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                        />
                      ) : null
                    }
                    style={{ marginBottom: 16, background: "#fafafa" }}
                  >
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          {...restField}
                          name={[name, "address"]}
                          label="Số nhà / Tên đường"
                          rules={[{ required: true, message: "Nhập địa chỉ cụ thể" }]}
                        >
                          <Input placeholder="VD: 123 Nguyễn Huệ" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "province"]}
                          label="Tỉnh / Thành phố"
                          rules={[{ required: true, message: "Nhập Tỉnh/TP" }]}
                        >
                          <Input placeholder="TP.HCM" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "district"]}
                          label="Quận / Huyện"
                          rules={[{ required: true, message: "Nhập Quận/Huyện" }]}
                        >
                          <Input placeholder="Quận 1" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "ward"]}
                          label="Phường / Xã"
                          rules={[{ required: true, message: "Nhập Phường/Xã" }]}
                        >
                          <Input placeholder="Bến Nghé" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm địa chỉ khác
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item style={{ marginTop: 16, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCustomer ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerPage;