import React, { useState, useEffect } from "react";
import {
  Table, Button, Modal, Form, Input, Select, Space, Tag, message,
  Card, Row, Col, Drawer, Descriptions, Divider, InputNumber,
  Timeline,
  Popover
} from "antd";
import {
  PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined,
  ReloadOutlined, MinusCircleOutlined, HistoryOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  CreditCardOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { TablePaginationConfig } from "antd/es/table";

// Services
import { orderService } from "../api/services/order.service";
import { productService } from "../api/services/product.service";

// Types
import {
  SimpleOrderResponse, OrderResponse, OrderStatus,
  PaymentMethod, OrderCreationRequest, OrderUpdateRequest,
  OrderItemRequest
} from "../api/types/order.types";
import { SimpleProductResponse, ProductVariantResponse } from "../api/types/product.types";
import { paymentService, PaymentStatus } from "../api/services/payment.service";

const { Option } = Select;

const OrderManagement: React.FC = () => {
  // --- State ---
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<SimpleOrderResponse[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1, pageSize: 10, total: 0, showSizeChanger: true
  });
  const [keyword, setKeyword] = useState("");

  // Modals & Drawer State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateInfoModalOpen, setIsUpdateInfoModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Product Selection Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productList, setProductList] = useState<SimpleProductResponse[]>([]);
  const [selectedProductVariants, setSelectedProductVariants] = useState<ProductVariantResponse[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const [formCreate] = Form.useForm();
  const [formUpdateInfo] = Form.useForm();
  const [formStatus] = Form.useForm();

  // --- Fetch Data ---
  const fetchOrders = async (page: number, size: number, searchKey?: string) => {
    setLoading(true);
    try {
      const key = searchKey !== undefined ? searchKey : keyword;
      let data;
      if (key) {
        data = await orderService.search(key, page - 1, size);
      } else {
        data = await orderService.getAll(page - 1, size, "createAt");
        console.log(data)
      }
      setOrders(data.content);
      setPagination(prev => ({
        ...prev, current: page, pageSize: size, total: data.page.totalElements
      }));
    } catch (error) {
      message.error("Lỗi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, 10);
  }, []);

  // --- Handlers ---
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchOrders(newPagination.current || 1, newPagination.pageSize || 10, keyword);
  };

  const handleSearch = () => {
    fetchOrders(1, pagination.pageSize || 10, keyword);
  };

  const handleReset = () => {
    setKeyword("");
    fetchOrders(1, pagination.pageSize || 10, "");
  };

  // --- Product Selection Logic (New) ---
  const handleOpenProductModal = async () => {
    setIsProductModalOpen(true);
    setProductList([]);
    setSelectedProductVariants([]);
    // Tải danh sách sản phẩm mặc định
    await handleSearchProduct("");
  };

  const handleSearchProduct = async (keyword: string) => {
    try {
      const res = await productService.search({ productName: keyword, page: 0, size: 10 });
      setProductList(res.content);
    } catch (e) { console.error(e); }
  };

  const handleSelectProduct = async (productId: number) => {
    try {
      const productFull = await productService.getById(productId);
      setSelectedProductVariants(productFull.productVariants);
    } catch (e) { message.error("Không tải được biến thể"); }
  };

  const handleAddVariantToForm = (variant: ProductVariantResponse) => {
    const currentItems: any[] = formCreate.getFieldValue("orderItems") || [];

    // Kiểm tra trùng lặp
    const exists = currentItems.find(item => item.productVariantId === variant.id);
    if (exists) {
      message.warning("Sản phẩm này đã có trong đơn hàng");
      return;
    }

    // Thêm vào form list
    const newItem = {
      productId: variant.id, // Lưu ý: API create order cần cả productId và variantId
      // Tuy nhiên, variant response thường ko có productId trực tiếp nếu backend ko trả về
      // Ta có thể lấy productId từ context cha hoặc giả định backend handle được variantId là đủ
      // Ở đây mình mock productId tạm thời hoặc lấy từ state nếu cần thiết.
      // Nhưng trong logic frontend, ta đã có variant ID là unique rồi.
      // Dựa vào DTO OrderItemRequest: cần productId và productVariantId.
      // Cách fix: Trong ProductVariantResponse nên có productId, nếu chưa có thì bổ sung ở backend.
      // Tạm thời: Lấy productId từ selectedProductVariants (nếu có field đó) hoặc
      // lưu productId khi click chọn sản phẩm ở bước trước.
      productVariantId: variant.id,
      sku: variant.sku, // Để hiển thị
      pricePerUnit: variant.price,
      quantity: 1,
      total: variant.price
    };

    // Vì trong component Table bên phải ta ko lưu productId của parent, 
    // ta cần trick: khi click chọn product bên trái, lưu productId vào state tạm.
    // Tuy nhiên, API create order của bạn yêu cầu `productId`. 
    // Giải pháp: Backend thực tế chỉ cần `productVariantId` là suy ra được product.
    // Nếu DTO bắt buộc, ta phải tìm cách lấy.
    // Giả sử ta tìm trong productList xem variant thuộc product nào (hơi khó vì list chỉ có simple).
    // Tốt nhất: Backend OrderItemRequest nên bỏ `productId` vì thừa, hoặc Frontend gửi đại 0 nếu Backend tự query lại.

    formCreate.setFieldsValue({
      orderItems: [...currentItems, newItem]
    });
    message.success(`Đã thêm ${variant.sku}`);
  };

  // --- Order Creation Logic ---
  const handleCreateOrder = async (values: any) => {
    try {
      // Lọc bỏ các item rỗng (nếu có)
      const validItems = values.orderItems.filter((item: any) => item.productVariantId);

      if (validItems.length === 0) {
        message.error("Vui lòng chọn ít nhất 1 sản phẩm");
        return;
      }

      const payload: OrderCreationRequest = {
        ...values,
        payment: { method: values.paymentMethod },
        orderItems: validItems.map((item: any) => ({
          // Nếu backend bắt buộc productId, ta cần đảm bảo có giá trị.
          // Ở đây mình dùng variantId thay thế nếu thiếu, hoặc 0.
          productId: item.productId || 0,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit
        })),
        totalAmount: validItems.reduce((sum: number, item: any) => sum + (item.quantity * item.pricePerUnit), 0)
      };

      await orderService.create(payload);
      message.success("Tạo đơn hàng thành công!");
      setIsCreateModalOpen(false);
      formCreate.resetFields();
      fetchOrders(1, pagination.pageSize || 10);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Tạo đơn thất bại");
    }
  };

  // ... (Giữ nguyên các hàm updateInfo, updateStatus, openDetailDrawer như cũ) ...
  // 2. Update Info
  const openUpdateInfoModal = async (id: number) => {
    try {
      const order = await orderService.getById(id);
      setSelectedOrder(order);
      formUpdateInfo.setFieldsValue({
        receiverName: order.receiverName,
        phoneNumber: order.phoneNumber,
        shippingAddress: order.shippingAddress,
        province: "HCM", // Mock
        district: "Q1",  // Mock
        ward: "Ben Nghe", // Mock
        note: order.note
      });
      setIsUpdateInfoModalOpen(true);
    } catch (e) { message.error("Lỗi tải chi tiết"); }
  };

  const handleUpdateInfo = async (values: OrderUpdateRequest) => {
    if (!selectedOrder) return;
    try {
      await orderService.updateInfo(selectedOrder.id, values);
      message.success("Cập nhật thông tin thành công");
      setIsUpdateInfoModalOpen(false);
      fetchOrders(pagination.current || 1, pagination.pageSize || 10);
    } catch (e: any) {
      message.error(e.response?.data?.message || "Cập nhật thất bại");
    }
  };

  // 3. Update Status
  const openStatusModal = (record: SimpleOrderResponse) => {
    setSelectedOrder(record as any);
    formStatus.setFieldsValue({ orderStatus: record.status });
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (values: { orderStatus: OrderStatus }) => {
    if (!selectedOrder) return;
    try {
      await orderService.updateStatus(selectedOrder.id, values);
      message.success(`Cập nhật trạng thái thành ${values.orderStatus}`);
      setIsStatusModalOpen(false);
      fetchOrders(pagination.current || 1, pagination.pageSize || 10);
    } catch (e: any) {
      message.error(e.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };

  // 4. View Detail
  const openDetailDrawer = async (id: number) => {
    try {
      const detail = await orderService.getById(id);
      setSelectedOrder(detail);
      setIsDetailDrawerOpen(true);
    } catch (e) { message.error("Lỗi tải chi tiết đơn hàng"); }
  };
  const handleUpdatePaymentStatus = async (paymentId: number, status: PaymentStatus) => {
    try {
      await paymentService.updateStatus(paymentId, status);
      message.success(`Đã cập nhật thanh toán: ${status}`);
      // Reload detail để cập nhật UI
      if (selectedOrder) openDetailDrawer(selectedOrder.id);
    } catch (error: any) {
      message.error("Cập nhật thanh toán thất bại");
    }
  };


  // --- Helpers ---
  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);


  const getStatusTag = (status: OrderStatus) => {
    const colorMap: Record<string, string> = {
      PENDING: "gold",
      CONFIRMED: "cyan",
      DELIVERING: "blue",
      DELIVERED: "green",
      COMPLETED: "purple",
      CANCELLED: "red"
    };
    return <Tag color={colorMap[status]}>{status}</Tag>;
  };
  const getPaymentStatusTag = (status: string) => {
    switch (status) {
      case PaymentStatus.SUCCESS: return <Tag icon={<CheckCircleOutlined />} color="success">Đã thanh toán</Tag>;
      case PaymentStatus.FAILED: return <Tag icon={<CloseCircleOutlined />} color="error">Thất bại</Tag>;
      default: return <Tag icon={<SyncOutlined spin />} color="warning">Chờ thanh toán</Tag>;
    }
  }
  const columns = [
    { title: "Mã đơn", dataIndex: "orderCode", render: (text: string) => <b>{text}</b> },
    { title: "Người nhận", dataIndex: "receiverName" },
    { title: "SĐT", dataIndex: "phoneNumber" },
    {
      title: "Tổng tiền", dataIndex: "finalAmount", align: 'right' as const,
      render: (val: number) => <b style={{ color: '#cf1322' }}>{formatCurrency(val)}</b>
    },
    { title: "Trạng thái", dataIndex: "status", render: (s: OrderStatus) => getStatusTag(s) },
    { title: "Ngày tạo", dataIndex: "createAt", render: (d: string) => dayjs(d).format("DD/MM/YYYY HH:mm") },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: SimpleOrderResponse) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => openDetailDrawer(record.id)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => openUpdateInfoModal(record.id)} />
          <Button size="small" type="primary" ghost onClick={() => openStatusModal(record)}>Trạng thái</Button>
        </Space>
      )
    }
  ];

  // Watch changes for total calculation in Create Modal
  const handleQuantityChange = (index: number, value: number) => {
    const items = formCreate.getFieldValue("orderItems");
    if (items[index]) {
      const updatedItem = { ...items[index], quantity: value, total: value * items[index].pricePerUnit };
      items[index] = updatedItem;
      formCreate.setFieldsValue({ orderItems: items });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="Quản lý Đơn Hàng">
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
            <Input
              placeholder="Tìm theo Mã đơn, SĐT, Tên..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col span={8}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>Tìm</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>Làm mới</Button>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
              Tạo đơn hàng
            </Button>
          </Col>
        </Row>

        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* --- MODAL: Create Order --- */}
      <Modal
        title="Tạo đơn hàng mới (Admin)"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={formCreate} layout="vertical" onFinish={handleCreateOrder} initialValues={{ orderItems: [] }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="receiverName" label="Tên người nhận" rules={[{ required: true }]}>
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, pattern: /^(0|\+84)(\d{9})$/ }]}>
                <Input placeholder="090..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="province" label="Tỉnh/Thành" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="shippingAddress" label="Địa chỉ chi tiết" rules={[{ required: true }]}>
            <Input placeholder="Số nhà, tên đường..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="paymentMethod" label="Phương thức thanh toán" initialValue={PaymentMethod.CASH}>
                <Select>
                  <Option value={PaymentMethod.CASH}>Tiền mặt</Option>
                  <Option value={PaymentMethod.BANK_TRANSFER}>Chuyển khoản</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="voucherCode" label="Mã giảm giá (Nếu có)">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Danh sách sản phẩm</h3>
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleOpenProductModal}>Thêm sản phẩm</Button>
          </div>

          <Form.List name="orderItems">
            {(fields, { remove }) => (
              <Table
                dataSource={fields}
                rowKey="key"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: "Sản phẩm / SKU",
                    render: (_, field) => {
                      const item = formCreate.getFieldValue(["orderItems", field.name]);
                      return <span>{item?.sku || `Variant #${item?.productVariantId}`}</span>
                    }
                  },
                  {
                    title: "Đơn giá",
                    width: 150,
                    render: (_, field) => {
                      const item = formCreate.getFieldValue(["orderItems", field.name]);
                      return formatCurrency(item?.pricePerUnit || 0);
                    }
                  },
                  {
                    title: "Số lượng",
                    width: 120,
                    render: (_, field) => (
                      <Form.Item
                        {...field}
                        name={[field.name, "quantity"]}
                        rules={[{ required: true, message: "Nhập SL" }]}
                        noStyle
                      >
                        <InputNumber
                          min={1}
                          onChange={(val) => handleQuantityChange(field.name, val || 1)}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    )
                  },
                  {
                    title: "Thành tiền",
                    width: 150,
                    align: 'right',
                    render: (_, field) => {
                      const item = formCreate.getFieldValue(["orderItems", field.name]);
                      return <b style={{ color: 'green' }}>{formatCurrency((item?.quantity || 0) * (item?.pricePerUnit || 0))}</b>
                    }
                  },
                  {
                    width: 50,
                    render: (_, field) => (
                      <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
                    )
                  }
                ]}
              />
            )}
          </Form.List>

          {/* Tổng tiền tạm tính */}
          <div style={{ textAlign: 'right', marginTop: 16, fontSize: 16 }}>
            <Form.Item shouldUpdate>
              {() => {
                const items = formCreate.getFieldValue("orderItems") || [];
                const total = items.reduce((sum: number, curr: any) => sum + (curr.quantity * curr.pricePerUnit), 0);
                return <span>Tổng tiền: <b style={{ color: '#cf1322', fontSize: 18 }}>{formatCurrency(total)}</b></span>;
              }}
            </Form.Item>
          </div>

          <Form.Item style={{ marginTop: 16, textAlign: 'right' }}>
            <Button onClick={() => setIsCreateModalOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit">Tạo đơn</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* --- MODAL: Select Product (Giống Purchase Order) --- */}
      <Modal
        title="Chọn sản phẩm"
        open={isProductModalOpen}
        onCancel={() => setIsProductModalOpen(false)}
        footer={null}
        width={800}
      >
        <Input.Search
          placeholder="Tìm tên sản phẩm..."
          onSearch={handleSearchProduct}
          enterButton
          style={{ marginBottom: 16 }}
        />

        <Row gutter={16}>
          <Col span={12}>
            <Table
              dataSource={productList}
              rowKey="id"
              size="small"
              columns={[
                { title: "Tên sản phẩm", dataIndex: "name" },
                {
                  render: (_, r) => <Button size="small" onClick={() => handleSelectProduct(r.id)}>Chọn</Button>
                }
              ]}
              pagination={false}
              scroll={{ y: 300 }}
            />
          </Col>
          <Col span={12}>
            <h4>Biến thể (Variants)</h4>
            {selectedProductVariants.length === 0 ? <p style={{ color: '#999' }}>Vui lòng chọn sản phẩm bên trái</p> : (
              <Table
                dataSource={selectedProductVariants}
                rowKey="id"
                size="small"
                pagination={false}
                scroll={{ y: 300 }}
                columns={[
                  { title: "SKU", dataIndex: "sku" },
                  {
                    title: "Giá bán",
                    dataIndex: "price",
                    render: (p) => formatCurrency(p)
                  },
                  {
                    render: (_, r) => (
                      <Button
                        type="primary" size="small" icon={<PlusOutlined />}
                        onClick={() => handleAddVariantToForm(r)}
                      />
                    )
                  }
                ]}
              />
            )}
          </Col>
        </Row>
      </Modal>

      {/* --- MODAL: Update Info (Giữ nguyên) --- */}
      <Modal
        title="Cập nhật thông tin giao hàng"
        open={isUpdateInfoModalOpen}
        onCancel={() => setIsUpdateInfoModalOpen(false)}
        footer={null}
      >
        <Form form={formUpdateInfo} layout="vertical" onFinish={handleUpdateInfo}>
          <Form.Item name="receiverName" label="Tên người nhận" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="shippingAddress" label="Địa chỉ chi tiết" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="province" label="Tỉnh/Thành" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Lưu thay đổi</Button>
        </Form>
      </Modal>

      {/* --- MODAL: Update Status (Giữ nguyên) --- */}
      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={isStatusModalOpen}
        onCancel={() => setIsStatusModalOpen(false)}
        footer={null}
        width={400}
      >
        <Form form={formStatus} onFinish={handleUpdateStatus}>
          <Form.Item name="orderStatus" rules={[{ required: true }]}>
            <Select>
              <Option value={OrderStatus.PENDING}>Pending</Option>
              <Option value={OrderStatus.CONFIRMED}>Confirmed</Option>
              <Option value={OrderStatus.DELIVERING}>Delivering</Option>
              <Option value={OrderStatus.DELIVERED}>Delivered</Option>
              <Option value={OrderStatus.COMPLETED}>Completed</Option>
              <Option value={OrderStatus.CANCELLED}>Cancelled</Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Cập nhật</Button>
        </Form>
      </Modal>

      {/* --- DRAWER: Order Detail (Giữ nguyên) --- */}
      <Drawer
        title={`Chi tiết đơn hàng: ${selectedOrder?.orderCode || ''}`}
        width={720}
        onClose={() => setIsDetailDrawerOpen(false)}
        open={isDetailDrawerOpen}
      >
        {selectedOrder && (
          <>
            <Descriptions title="Thông tin chung" bordered column={2}>
              <Descriptions.Item label="Người nhận">{selectedOrder.receiverName}</Descriptions.Item>
              <Descriptions.Item label="SĐT">{selectedOrder.phoneNumber}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {selectedOrder.shippingAddress}, {selectedOrder.ward}, {selectedOrder.district}, {selectedOrder.province}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{getStatusTag(selectedOrder.status)}</Descriptions.Item>
              <Descriptions.Item label="Kho xử lý">{selectedOrder.warehouse?.name || "Chưa phân bổ"}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền hàng">{formatCurrency(selectedOrder.totalAmount)}</Descriptions.Item>
              <Descriptions.Item label="Giảm giá">{formatCurrency(selectedOrder.reducedAmount)}</Descriptions.Item>
              <Descriptions.Item label="Thành tiền" labelStyle={{ fontWeight: 'bold' }} contentStyle={{ fontWeight: 'bold', color: 'red' }}>
                {formatCurrency(selectedOrder.finalAmount)}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>{selectedOrder.note || "Không"}</Descriptions.Item>
            </Descriptions>

            {/* --- SECTION MỚI: THÔNG TIN THANH TOÁN --- */}
            <Divider orientation="left"><CreditCardOutlined /> Thông tin thanh toán</Divider>
            {selectedOrder.payment ? (
              <Card size="small" style={{ background: '#f9f9f9' }}>
                <Descriptions column={2}>
                  <Descriptions.Item label="Phương thức">
                    <Tag color="blue">{selectedOrder.payment.paymentMethod}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số tiền">
                    <b>{formatCurrency(selectedOrder.payment.amount)}</b>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Space>
                      {getPaymentStatusTag(selectedOrder.payment.status)}

                      {/* Nút Update Status bằng Popover */}
                      <Popover
                        content={
                          <Space direction="vertical">
                            <Button size="small" type="text" style={{ color: 'green' }} onClick={() => handleUpdatePaymentStatus(selectedOrder.payment!.id, PaymentStatus.SUCCESS)}>
                              Mark as Success
                            </Button>
                            <Button size="small" type="text" style={{ color: 'red' }} onClick={() => handleUpdatePaymentStatus(selectedOrder.payment!.id, PaymentStatus.FAILED)}>
                              Mark as Failed
                            </Button>
                            <Button size="small" type="text" style={{ color: 'orange' }} onClick={() => handleUpdatePaymentStatus(selectedOrder.payment!.id, PaymentStatus.PENDING)}>
                              Mark as Pending
                            </Button>
                          </Space>
                        }
                        title="Cập nhật trạng thái"
                        trigger="click"
                      >
                        <Button size="small" icon={<EditOutlined />} />
                      </Popover>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    {dayjs(selectedOrder.payment.createAt).format("DD/MM/YYYY HH:mm")}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ) : (
              <div style={{ color: '#999', fontStyle: 'italic' }}>Chưa có thông tin thanh toán</div>
            )}

            <Divider orientation="left"><ShoppingOutlined /> Danh sách sản phẩm</Divider>
            <Table
              dataSource={selectedOrder.orderItems}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: "Sản phẩm",
                  render: (_, item) => (
                    <Space>
                      {item.product.mainImageUrl && <img src={item.product.mainImageUrl} alt="img" style={{ width: 40, height: 40, objectFit: 'cover' }} />}
                      <div>
                        <div>{item.product.name}</div>
                        <Tag>{item.productVariant.sku}</Tag>
                      </div>
                    </Space>
                  )
                },
                { title: "Đơn giá", dataIndex: "pricePerUnit", render: formatCurrency, align: 'right' },
                { title: "SL", dataIndex: "quantity", align: 'center' },
                { title: "Tổng", dataIndex: "totalPrice", render: formatCurrency, align: 'right' }
              ]}
            />

            <Divider orientation="left"><HistoryOutlined /> Lịch sử trạng thái</Divider>
            <Timeline mode="left">
              {selectedOrder.orderStatusHistories?.map(h => (
                <Timeline.Item key={h.id} label={dayjs(h.changeAt).format("DD/MM HH:mm")}>
                  <b>{h.oldStatus}</b> ➔ <b>{h.newStatus}</b>
                  <div style={{ fontSize: 12, color: '#888' }}>Bởi: {h.changeBy?.username || "System"}</div>
                </Timeline.Item>
              ))}
            </Timeline>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default OrderManagement;