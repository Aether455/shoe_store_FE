import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Space,
  Card,
  Tag,
  Tooltip,
  Descriptions,
  Input,
  Row,
  Col,
  message,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  HistoryOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import type { TablePaginationConfig } from "antd/es/table";
import dayjs from "dayjs";

// Services
import { inventoryTransactionService } from "../api/services/inventory-transaction.service";

// Types
import {
  InventoryTransactionResponse,
  InventoryReferenceType,
} from "../api/types/inventory-transaction.types";

const InventoryTransactionManagement: React.FC = () => {
  // --- State ---
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<InventoryTransactionResponse[]>([]);

  // Pagination
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => `Tổng ${total} giao dịch`,
  });

  // Filter
  const [keyword, setKeyword] = useState("");

  // Detail Modal
  const [viewDetailItem, setViewDetailItem] = useState<InventoryTransactionResponse | null>(null);

  // --- Effects ---
  useEffect(() => {
    fetchTransactions(1, 10, "");
  }, []);

  // --- Fetch Data ---
  const fetchTransactions = async (
    page: number,
    size: number,
    searchKey: string
  ) => {
    setLoading(true);
    try {
      let data;
      if (searchKey) {
        // API Search
        data = await inventoryTransactionService.search(searchKey, page - 1);
      } else {
        // API GetAll
        data = await inventoryTransactionService.getAll(page - 1, size, "id");
      }

      setTransactions(data.content || []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: size,
        total: data.page.totalElements || 0,
      }));
    } catch (error: any) {
      console.error(error.response?.data?.message);
      message.error("Lỗi tải lịch sử giao dịch kho");
      message.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Event Handlers ---
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchTransactions(
      newPagination.current || 1,
      newPagination.pageSize || 10,
      keyword
    );
  };

  const handleSearch = () => {
    fetchTransactions(1, pagination.pageSize || 10, keyword);
  };

  const handleReset = () => {
    setKeyword("");
    fetchTransactions(1, pagination.pageSize || 10, "");
  };

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await inventoryTransactionService.getById(id);
      setViewDetailItem(detail);
    } catch (error) {
      message.error("Lỗi tải chi tiết giao dịch");
    }
  };

  // --- Helpers UI ---
  const getTypeTag = (type: InventoryReferenceType) => {
    switch (type) {
      case InventoryReferenceType.IMPORT_FROM_SUPPLIER:
        return <Tag color="green" icon={<ArrowUpOutlined />}>Nhập hàng NCC</Tag>;
      case InventoryReferenceType.EXPORT_TO_CUSTOMER:
        return <Tag color="blue" icon={<ArrowDownOutlined />}>Xuất bán hàng</Tag>;
      case InventoryReferenceType.CANCEL_IMPORT_ORDER:
        return <Tag color="volcano" icon={<RollbackOutlined />}>Hủy đơn nhập</Tag>;
      case InventoryReferenceType.CANCEL_ORDER_RETURN:
        return <Tag color="orange" icon={<RollbackOutlined />}>Khách hoàn trả</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  const formatQuantity = (qty: number, type: InventoryReferenceType) => {
    const color =
      type === InventoryReferenceType.IMPORT_FROM_SUPPLIER ||
      type === InventoryReferenceType.CANCEL_ORDER_RETURN
        ? "green"
        : "red";
    const prefix =
      (type === InventoryReferenceType.IMPORT_FROM_SUPPLIER ||
        type === InventoryReferenceType.CANCEL_ORDER_RETURN) &&
      qty > 0
        ? "+"
        : "";

    return <b style={{ color }}>{prefix}{qty}</b>;
  };

  // --- Columns ---
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
      render: (id: number) => <Tag>#{id}</Tag>,
    },
    {
      title: "Loại giao dịch",
      dataIndex: "type",
      width: 180,
      render: (type: InventoryReferenceType) => getTypeTag(type),
    },
    {
      title: "Sản phẩm / SKU",
      width: 250,
      render: (_: any, r: InventoryTransactionResponse) => (
        <Space>
          {/* Thêm ?. để tránh lỗi nếu productVariant null */}
          {r.productVariant?.productVariantImageUrl && (
            <img
              src={r.productVariant.productVariantImageUrl}
              alt="img"
              style={{ width: 30, height: 30, objectFit: "cover", borderRadius: 4 }}
            />
          )}
          <div>
            {/* Thêm ?. cho product và name */}
            <div style={{ fontWeight: 500 }}>{r.product?.name || "Sản phẩm không xác định"}</div>
            <Tag color="purple" style={{ marginTop: 4, fontSize: 11 }}>
              {r.productVariant?.sku || "N/A"}
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: "Kho",
      width: 150,
      // Thêm ?. cho warehouse
      render: (_: any, r: InventoryTransactionResponse) => r.warehouse?.name || "Kho không xác định",
    },
    {
      title: "SL Thay đổi",
      dataIndex: "quantityChange",
      width: 120,
      align: "right" as const,
      render: (qty: number, r: InventoryTransactionResponse) => formatQuantity(qty, r.type),
    },
    {
      title: "Người thực hiện",
      width: 150,
      render: (_: any, r: InventoryTransactionResponse) => r.createBy?.username || "-",
    },
    {
      title: "Thời gian",
      dataIndex: "createAt",
      width: 160,
      render: (d: string) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Hành động",
      fixed: "right" as const,
      width: 80,
      render: (_: any, r: InventoryTransactionResponse) => (
        <Tooltip title="Xem chi tiết">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(r.id)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={<><HistoryOutlined /> Lịch sử Giao dịch Kho</>}
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
      >
        {/* --- Filter --- */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
            <Input
              placeholder="Tìm theo Mã SKU, Tên SP, Ghi chú..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col span={16}>
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

        {/* --- Table --- */}
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* --- Modal Detail --- */}
      <Modal
        title="Chi tiết Giao dịch kho"
        open={!!viewDetailItem}
        onCancel={() => setViewDetailItem(null)}
        footer={[
          <Button key="close" onClick={() => setViewDetailItem(null)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {viewDetailItem && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 20,
                padding: 15,
                background: "#f5f5f5",
                borderRadius: 8,
              }}
            >
              {viewDetailItem.productVariant?.productVariantImageUrl && (
                <img
                  src={viewDetailItem.productVariant.productVariantImageUrl}
                  alt="Product"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginRight: 15,
                  }}
                />
              )}
              <div>
                <h3 style={{ margin: 0 }}>{viewDetailItem.product?.name || "Sản phẩm bị xóa"}</h3>
                <div style={{ marginTop: 5 }}>
                  <Tag color="purple">{viewDetailItem.productVariant?.sku || "SKU N/A"}</Tag>
                  {/* Safe map for option values */}
                  {viewDetailItem.productVariant?.optionValues?.map((ov: any) => (
                    <Tag key={ov.id}>{ov.value}</Tag>
                  ))}
                </div>
              </div>
            </div>

            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label="Mã Giao dịch">#{viewDetailItem.id}</Descriptions.Item>
              <Descriptions.Item label="Loại giao dịch">
                {getTypeTag(viewDetailItem.type)}
              </Descriptions.Item>

              <Descriptions.Item label="Kho">
                {viewDetailItem.warehouse?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng thay đổi">
                <span style={{ fontSize: 16 }}>
                  {formatQuantity(viewDetailItem.quantityChange, viewDetailItem.type)}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Liên kết (Ref ID)">
                {viewDetailItem.referenceId ? (
                  <Tag color="cyan">#{viewDetailItem.referenceId}</Tag>
                ) : (
                  "N/A"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">
                {viewDetailItem.createBy?.username || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Thời gian" span={2}>
                {dayjs(viewDetailItem.createAt).format("DD/MM/YYYY HH:mm:ss")}
              </Descriptions.Item>

              <Descriptions.Item label="Ghi chú" span={2}>
                {viewDetailItem.note || <i style={{ color: "#999" }}>Không có ghi chú</i>}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InventoryTransactionManagement;