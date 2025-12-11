import React, { useState, useEffect } from "react";
import {
  Table, Button, Modal, InputNumber, Select, Popconfirm, message,
  Space, Card, Tag, Tooltip, Descriptions, Row, Col, Input, Drawer
} from "antd";
import {
  PlusOutlined, DeleteOutlined, EyeOutlined,
  CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";

// Services
import { purchaseOrderService } from "../api/services/purchase-order.service";
import { supplierService } from "../api/services/supplier.service";
import { warehouseService } from "../api/services/warehouse.service";
import { productService } from "../api/services/product.service";
import { tokenUtils } from "../utils/tokenUtils";

// Types
import { PurchaseOrderResponse, SimplePurchaseOrderResponse, PurchaseOrderItemRequest, PurchaseOrderStatus } from "../api/types/purchase-order.types";
import { SupplierResponse } from "../api/types/supplier.types";
import { WarehouseResponse } from "../api/types/warehouse.types";
import { SimpleProductResponse, ProductVariantResponse } from "../api/types/product.types";

const { Option } = Select;

const PurchaseOrderManagement: React.FC = () => {
  // --- State ---
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<SimplePurchaseOrderResponse[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Search State
  const [keyword, setKeyword] = useState("");

  // Detail & Modal State
  const [viewDetailItem, setViewDetailItem] = useState<PurchaseOrderResponse | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Data Source State
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);

  // Create Form State
  const [formData, setFormData] = useState<{
    supplierId: number | null;
    warehouseId: number | null;
    items: (PurchaseOrderItemRequest & {
      tempId: number;
      productName?: string;
      sku?: string;
      variantImage?: string;
    })[];
  }>({
    supplierId: null,
    warehouseId: null,
    items: [],
  });

  // Product Selection State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productList, setProductList] = useState<SimpleProductResponse[]>([]);
  const [selectedProductVariants, setSelectedProductVariants] = useState<ProductVariantResponse[]>([]);

  // Role Check
  const [isAdmin, setIsAdmin] = useState(false);

  // --- Effects ---
  useEffect(() => {
    fetchInitialData();
    fetchOrders(1, 10);
    setIsAdmin(tokenUtils.isAdmin())
  }, []);



  const fetchInitialData = async () => {
    try {
      const suppRes = await supplierService.getAll(0, 100);
      const wareRes = await warehouseService.getAll(0, 100);
      if (suppRes) setSuppliers(suppRes.content);
      if (wareRes) setWarehouses(wareRes.content);
    } catch (error) {
      message.error("Lỗi tải dữ liệu ban đầu");
    }
  };

  // Fetch Orders Logic
  const fetchOrders = async (page: number, size: number, searchKey?: string) => {
    setLoading(true);
    try {
      const key = searchKey !== undefined ? searchKey : keyword;
      let data;
      if (key) {
        data = await purchaseOrderService.search(key, page - 1);
      } else {
        data = await purchaseOrderService.getAll(page - 1, size);
      }

      setOrders(data.content);
      setPagination({ current: page, pageSize: size, total: data.page.totalElements });
    } catch (error) {
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
    fetchOrders(1, pagination.pageSize, value);
  };

  // --- Logic: Create Order ---
  const handleOpenCreateModal = () => {
    setFormData({ supplierId: null, warehouseId: null, items: [] });
    setIsCreateModalOpen(true);
  };

  const handleRemoveItem = (tempId: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.tempId !== tempId)
    }));
  };

  const handleUpdateItem = (tempId: number, field: keyof PurchaseOrderItemRequest, value: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.tempId === tempId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'pricePerUnit') {
            updatedItem.total = updatedItem.quantity * updatedItem.pricePerUnit;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const handleSubmitCreate = async () => {
    if (!formData.supplierId || !formData.warehouseId) {
      message.error("Vui lòng chọn Nhà cung cấp và Kho");
      return;
    }
    if (formData.items.length === 0) {
      message.error("Vui lòng thêm ít nhất 1 sản phẩm");
      return;
    }

    const totalAmount = formData.items.reduce((sum, item) => sum + item.total, 0);

    const payload = {
      supplierId: formData.supplierId,
      warehouseId: formData.warehouseId,
      totalAmount: totalAmount,
      purchaseOrderItems: formData.items.map(i => ({
        productVariantId: i.productVariantId,
        quantity: i.quantity,
        pricePerUnit: i.pricePerUnit,
        total: i.total
      }))
    };

    try {
      await purchaseOrderService.create(payload);
      message.success("Tạo đơn hàng thành công");
      setIsCreateModalOpen(false);
      setKeyword("");
      fetchOrders(1, pagination.pageSize, "");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Tạo đơn hàng thất bại");
    }
  };

  // --- Logic: Product Selection Modal ---
  const handleOpenProductModal = async () => {
    setIsProductModalOpen(true);
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
    const exists = formData.items.find(i => i.productVariantId === variant.id);
    if (exists) {
      message.warning("Sản phẩm này đã có trong đơn hàng");
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        tempId: Date.now(),
        productVariantId: variant.id,
        quantity: 1,
        pricePerUnit: 0,
        total: variant.price * 1,
        productName: variant.sku,
        sku: variant.sku,
        variantImage: variant.productVariantImageUrl
      }]
    }));
    message.success(`Đã thêm ${variant.sku}`);
  };

  // --- Logic: Actions ---
  const handleApprove = async (id: number) => {
    try {
      await purchaseOrderService.approve(id);
      message.success("Đã duyệt đơn hàng");
      fetchOrders(pagination.current, pagination.pageSize);
      if (viewDetailItem?.id === id) setViewDetailItem(null);
    } catch (e: any) { message.error(e.response?.data?.message); }
  };

  const handleCancel = async (id: number) => {
    try {
      await purchaseOrderService.cancel(id);
      message.success("Đã hủy đơn hàng");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (e: any) { message.error(e.response?.data?.message || "Hủy thất bại"); }
  };

  const handleDelete = async (id: number) => {
    try {
      await purchaseOrderService.delete(id);
      message.success("Đã xóa đơn hàng");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (e: any) { message.error(e.response?.data?.message || "Xóa thất bại"); }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await purchaseOrderService.getById(id);
      setViewDetailItem(detail);
    } catch (e) { message.error("Lỗi tải chi tiết"); }
  };

  const getStatusTag = (status?: PurchaseOrderStatus) => {
    if (!status) return <Tag>N/A</Tag>;
    const map = {
      [PurchaseOrderStatus.DRAFT]: { color: "default", text: "Bản nháp" },
      [PurchaseOrderStatus.APPROVED]: { color: "green", text: "Đã duyệt" },
      [PurchaseOrderStatus.CANCELLED]: { color: "red", text: "Đã hủy" },
      [PurchaseOrderStatus.COMPLETED]: { color: "blue", text: "Hoàn thành" },
    };
    const s = map[status];
    return <Tag color={s?.color}>{s?.text}</Tag>;
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const columns = [
    { title: "ID", dataIndex: "id", width: 60, render: (v: number) => <b>#{v}</b> },
    { title: "Nhà cung cấp", dataIndex: "supplier", render: (s: SupplierResponse) => s ? s.name : "-" },
    { title: "Kho", dataIndex: "warehouse", render: (w: WarehouseResponse) => w ? w.name : "-" },
    { title: "Tổng tiền", dataIndex: "totalAmount", align: 'right' as const, render: (v: number) => <b style={{ color: 'green' }}>{formatCurrency(v)}</b> },
    { title: "Trạng thái", dataIndex: "status", render: (s: PurchaseOrderStatus) => getStatusTag(s) },
    { title: "Ngày tạo", dataIndex: "createAt", render: (d: string) => dayjs(d).format("DD/MM/YYYY HH:mm") },
    {
      title: "Hành động", key: "action", fixed: 'right' as const, width: 150,
      render: (_: any, record: SimplePurchaseOrderResponse) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)} />
          </Tooltip>

          {/* Chỉ hiện nút xóa nếu:
              1. Là Admin (isAdmin == true)
              2. Trạng thái là DRAFT (hoặc CANCELLED tùy logic)
          */}
          {isAdmin && (record.status === PurchaseOrderStatus.DRAFT) && (
            <Popconfirm title="Xóa đơn này?" onConfirm={() => handleDelete(record.id)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Quản lý Nhập Kho"
        extra={
          <Space>
            <Input.Search
              placeholder="Tìm theo mã, NCC..."
              allowClear
              enterButton
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
              Tạo đơn nhập hàng
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (p, s) => fetchOrders(p, s)
          }}
        />
      </Card>

      {/* --- Detail Drawer --- */}
      <Drawer
        title={`Chi tiết đơn hàng #${viewDetailItem?.id}`}
        width={800}
        open={!!viewDetailItem}
        onClose={() => setViewDetailItem(null)}
        extra={
          <Space>
            {isAdmin && viewDetailItem?.status === PurchaseOrderStatus.DRAFT && (
              <>
                <Popconfirm title="Xác nhận duyệt?" onConfirm={() => handleApprove(viewDetailItem.id)}>
                  <Button type="primary" icon={<CheckCircleOutlined />}>Duyệt đơn</Button>
                </Popconfirm>
                <Popconfirm title="Xác nhận hủy?" onConfirm={() => handleCancel(viewDetailItem.id)}>
                  <Button danger icon={<CloseCircleOutlined />}>Hủy đơn</Button>
                </Popconfirm>
              </>
            )}

            {/* Nút xóa trong Detail Drawer cho Admin */}
            {isAdmin && (viewDetailItem?.status === PurchaseOrderStatus.DRAFT || viewDetailItem?.status === PurchaseOrderStatus.CANCELLED) && (
              <Popconfirm title="Xóa đơn này?" onConfirm={() => handleDelete(viewDetailItem.id)}>
                <Button danger icon={<DeleteOutlined />}>Xóa</Button>
              </Popconfirm>
            )}
          </Space>
        }
      >
        {viewDetailItem && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Nhà cung cấp">{viewDetailItem.supplier?.name}</Descriptions.Item>
              <Descriptions.Item label="Kho nhập">{viewDetailItem.warehouse?.name}</Descriptions.Item>
              <Descriptions.Item label="Người tạo">{viewDetailItem.createBy?.username}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{dayjs(viewDetailItem.createAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{getStatusTag(viewDetailItem.status)}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">{formatCurrency(viewDetailItem.totalAmount)}</Descriptions.Item>
            </Descriptions>

            <Table
              style={{ marginTop: 20 }}
              dataSource={viewDetailItem.purchaseOrderItems}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: "Sản phẩm", render: (_, r) => (
                    <Space>
                      {r.productVariant.productVariantImageUrl && <img src={r.productVariant.productVariantImageUrl} alt="img" style={{ width: 30 }} />}
                      {r.productVariant.sku}
                      {r.productVariant.optionValues?.map(ov => <Tag key={ov.id}>{ov.value}</Tag>)}
                    </Space>
                  )
                },
                { title: "Đơn giá", dataIndex: "pricePerUnit", render: formatCurrency, align: "right" },
                { title: "Số lượng", dataIndex: "quantity", align: "center" },
                { title: "Thành tiền", dataIndex: "total", render: formatCurrency, align: "right" },
              ]}
            />
          </>
        )}
      </Drawer>

      {/* --- Create Modal --- */}
      <Modal
        title="Tạo Đơn Nhập Hàng Mới"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={handleSubmitCreate}
        width={1000}
        okText="Tạo đơn"
      >
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label>Nhà cung cấp <span style={{ color: 'red' }}>*</span></label>
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn nhà cung cấp"
              value={formData.supplierId}
              onChange={v => setFormData({ ...formData, supplierId: v })}
            >
              {suppliers.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
            </Select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Kho nhập <span style={{ color: 'red' }}>*</span></label>
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn kho"
              value={formData.warehouseId}
              onChange={v => setFormData({ ...formData, warehouseId: v })}
            >
              {warehouses.map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)}
            </Select>
          </div>
        </div>

        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Danh sách sản phẩm</h3>
          <Button type="dashed" icon={<PlusOutlined />} onClick={handleOpenProductModal}>Thêm sản phẩm</Button>
        </div>

        <Table
          dataSource={formData.items}
          rowKey="tempId"
          pagination={false}
          size="small"
          scroll={{ y: 300 }}
          columns={[
            { title: "SKU/Variant", dataIndex: "sku" },
            {
              title: "Đơn giá nhập", dataIndex: "pricePerUnit", width: 150,
              render: (v, r) => (
                <InputNumber
                  min={0} style={{ width: '100%' }}
                  value={v}
                  onChange={val => handleUpdateItem(r.tempId, 'pricePerUnit', val || 0)}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              )
            },
            {
              title: "Số lượng", dataIndex: "quantity", width: 100,
              render: (v, r) => (
                <InputNumber
                  min={1} style={{ width: '100%' }}
                  value={v}
                  onChange={val => handleUpdateItem(r.tempId, 'quantity', val || 1)}
                />
              )
            },
            {
              title: "Thành tiền", dataIndex: "total", width: 150, align: 'right',
              render: v => formatCurrency(v)
            },
            {
              width: 50,
              render: (_, r) => <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => handleRemoveItem(r.tempId)} />
            }
          ]}
        />
        <div style={{ textAlign: 'right', marginTop: 16, fontSize: 18 }}>
          Tổng cộng: <b style={{ color: 'green' }}>{formatCurrency(formData.items.reduce((sum, i) => sum + i.total, 0))}</b>
        </div>
      </Modal>

      {/* --- Product Selection Modal --- */}
      <Modal
        title="Chọn sản phẩm nhập kho"
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
                    title: "Thuộc tính",
                    render: (_, r) => r.optionValues?.map(o => o.value).join(" - ")
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
    </div>
  );
};

export default PurchaseOrderManagement;