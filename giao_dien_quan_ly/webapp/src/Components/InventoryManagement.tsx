import React, { useState, useEffect } from "react";
import {
  Table, Button, Modal, Select, Space, Card, Tag, Tooltip, Descriptions,
  Row, Col, Input, message
} from "antd";
import {
  EyeOutlined, SearchOutlined, ReloadOutlined,
  InfoCircleOutlined, WarningOutlined, CheckCircleOutlined
} from "@ant-design/icons";
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from "dayjs";

// Services
import { inventoryService } from "../api/services/inventory.service";
import { warehouseService } from "../api/services/warehouse.service";

// Types
import { InventoryResponse } from "../api/types/inventory.types";
import { WarehouseResponse } from "../api/types/warehouse.types";

const { Option } = Select;

const InventoryManagement: React.FC = () => {
  // --- State ---
  const [loading, setLoading] = useState(false);
  const [inventories, setInventories] = useState<InventoryResponse[]>([]);

  // Filter State
  const [keyword, setKeyword] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);

  // Pagination State
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0, // Khởi tạo bằng 0
    showSizeChanger: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
  });

  // Detail Modal State
  const [viewDetailItem, setViewDetailItem] = useState<InventoryResponse | null>(null);

  // --- Effects ---
  useEffect(() => {
    fetchWarehouses();
    fetchInventories(1, 10, "", undefined);
  }, []);

  // --- Fetch Data ---
  const fetchWarehouses = async () => {
    try {
      const res = await warehouseService.getAll(0, 100);
      setWarehouses(res.content);
    } catch (error) {
      console.error("Lỗi tải danh sách kho");
    }
  };
  const fetchInventories = async (
    page: number,
    size: number,
    currentKeyword: string,
    currentWarehouseId: number | undefined
  ) => {
    setLoading(true);
    try {
      let data: any; // Để any tạm thời để tránh lỗi type khi debug

      if (currentKeyword || currentWarehouseId) {
        data = await inventoryService.search({
          keyword: currentKeyword,
          warehouseId: currentWarehouseId,
          page: page - 1,
          size: size
        });
      } else {
        data = await inventoryService.getAll(page - 1, size);
      }

      // --- DEBUG LOG ---
      console.log("API Response Data:", data);
      // Bạn hãy F12 xem log này. Kiểm tra xem field tổng số bản ghi tên là gì?
      // Thường là: totalElements, total_elements, count, hoặc total.
      // -----------------

      // Cập nhật danh sách
      setInventories(data.content || []);

      // Cập nhật Pagination
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize: size,
        // QUAN TRỌNG: Thêm fallback || 0 để tránh undefined
        // Nếu API trả về tên khác, hãy sửa 'totalElements' thành tên đó
        total: data.page.totalElements || data.total || 0
      }));

    } catch (error) {
      console.error(error);
      message.error("Không thể tải dữ liệu tồn kho");
    } finally {
      setLoading(false);
    }
  };
  // --- Event Handlers ---
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchInventories(
      newPagination.current || 1,
      newPagination.pageSize || 10,
      keyword,
      selectedWarehouseId
    );
  };

  const handleSearch = () => {
    fetchInventories(1, pagination.pageSize || 10, keyword, selectedWarehouseId);
  };

  const handleReset = () => {
    setKeyword("");
    setSelectedWarehouseId(undefined);
    fetchInventories(1, pagination.pageSize || 10, "", undefined);
  };

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await inventoryService.getById(id);
      setViewDetailItem(detail);
    } catch (error) {
      message.error("Lỗi tải chi tiết tồn kho");
    }
  };

  // --- Helpers & Columns (Giữ nguyên như code cũ của bạn) ---
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: "Hết hàng", color: "red", icon: <WarningOutlined /> };
    if (quantity < 10) return { text: "Sắp hết", color: "orange", icon: <WarningOutlined /> };
    if (quantity < 50) return { text: "Còn ít", color: "gold", icon: <InfoCircleOutlined /> };
    return { text: "Đủ hàng", color: "green", icon: <CheckCircleOutlined /> };
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
      render: (id: number) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: "Mã SKU",
      width: 150,
      render: (_: any, record: InventoryResponse) => (
        <Tag color="purple" style={{ fontFamily: "monospace" }}>
          {record.productVariant.sku}
        </Tag>
      ),
    },
    {
      title: "Hình ảnh",
      width: 80,
      render: (_: any, record: InventoryResponse) => (
        record.productVariant.productVariantImageUrl ? (
          <img
            src={record.productVariant.productVariantImageUrl}
            alt="variant"
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : <span>-</span>
      )
    },
    {
      title: "Kho",
      width: 150,
      render: (_: any, record: InventoryResponse) => (
        <Tag color="cyan">{record.warehouse?.name}</Tag>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      width: 120,
      align: 'center' as const,
      render: (quantity: number) => <strong style={{ fontSize: 16 }}>{quantity}</strong>,
    },
    {
      title: "Trạng thái",
      width: 130,
      render: (_: any, record: InventoryResponse) => {
        const status = getStockStatus(record.quantity);
        return (
          <Tag color={status.color} icon={status.icon}>
            {status.text}
          </Tag>
        );
      },
    },
    {
      title: "Cập nhật cuối",
      dataIndex: "updateAt",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hành động",
      width: 80,
      fixed: "right" as const,
      render: (_: any, record: InventoryResponse) => (
        <Tooltip title="Xem chi tiết">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record.id)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Quản lý Tồn Kho">
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
            <Input
              placeholder="Tìm theo SKU hoặc Tên sản phẩm..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Lọc theo Kho"
              allowClear
              value={selectedWarehouseId}
              onChange={setSelectedWarehouseId}
            >
              {warehouses.map(w => (
                <Option key={w.id} value={w.id}>{w.name}</Option>
              ))}
            </Select>
          </Col>
          <Col span={10}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                Tìm kiếm
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          dataSource={inventories}
          columns={columns}
          rowKey="id"
          loading={loading}
          // Đảm bảo truyền đúng prop pagination và onChange
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />

        <Modal
          title={<Space><InfoCircleOutlined /> Chi tiết tồn kho</Space>}
          open={!!viewDetailItem}
          onCancel={() => setViewDetailItem(null)}
          footer={[<Button key="close" type="primary" onClick={() => setViewDetailItem(null)}>Đóng</Button>]}
          width={800}
        >
          {/* Nội dung modal giữ nguyên */}
          {viewDetailItem && (
            <>
              <div style={{
                background: "#f0f5ff",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
                display: 'flex',
                alignItems: 'center',
                gap: 20
              }}>
                {viewDetailItem.productVariant.productVariantImageUrl && (
                  <img
                    src={viewDetailItem.productVariant.productVariantImageUrl}
                    alt="img"
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                  />
                )}
                <div>
                  <div style={{ fontSize: 18, fontWeight: "bold" }}>
                    {viewDetailItem.productVariant.sku}
                  </div>
                  <div style={{ fontSize: 30, fontWeight: "bold", color: "#1890ff" }}>
                    {viewDetailItem.quantity} <span style={{ fontSize: 14, color: '#666', fontWeight: 'normal' }}>sản phẩm</span>
                  </div>
                </div>
              </div>

              <Descriptions bordered column={2}>
                <Descriptions.Item label="Mã SKU">
                  <Tag color="purple">{viewDetailItem.productVariant.sku}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Giá bán">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(viewDetailItem.productVariant.price)}
                </Descriptions.Item>

                <Descriptions.Item label="Kho lưu trữ">
                  <Tag color="cyan">{viewDetailItem.warehouse.name}</Tag>
                  <div style={{ fontSize: 11, color: '#888' }}>{viewDetailItem.warehouse.address}</div>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStockStatus(viewDetailItem.quantity).color}>
                    {getStockStatus(viewDetailItem.quantity).text}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Ngày tạo">
                  {dayjs(viewDetailItem.createAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Người tạo">
                  {viewDetailItem.createBy?.username || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Cập nhật cuối">
                  {dayjs(viewDetailItem.updateAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Người cập nhật">
                  {viewDetailItem.updateBy?.username || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default InventoryManagement;