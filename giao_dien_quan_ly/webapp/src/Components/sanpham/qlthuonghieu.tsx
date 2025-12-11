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
  Descriptions,
  Tooltip,
  Tag,
  Typography
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  GlobalOutlined
} from "@ant-design/icons";
import { BrandResponse } from "../../api/types/brand.type";
import { brandService } from "../../api/services/brand.service";
import { tokenUtils } from "../../utils/tokenUtils";


const { Title, Text } = Typography;

const BrandManagement: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false); // [Mới]


  // --- State quản lý dữ liệu và loading ---
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // --- State quản lý Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BrandResponse | null>(null);
  const [viewDetailItem, setViewDetailItem] = useState<BrandResponse | null>(null);

  // --- State quản lý Form ---
  const [formData, setFormData] = useState({ name: "", description: "" });

  // 1. Hàm lấy danh sách thương hiệu từ API
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await brandService.getAll();
      setBrands(data);
    } catch (error: any) {
      message.error("Không thể tải danh sách thương hiệu!");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component được mount
  useEffect(() => {
    fetchBrands();
    setIsAdmin(tokenUtils.isAdmin()); // [Mới]
  }, []);
  // 2. Xử lý mở/đóng Modal
  const openModal = (item?: BrandResponse) => {
    setEditingItem(item || null);
    if (item) {
      setFormData({ name: item.name, description: item.description });
    } else {
      setFormData({ name: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ name: "", description: "" });
  };

  // 3. Xử lý Lưu (Thêm mới / Cập nhật)
  const saveItem = async () => {
    // Validate cơ bản phía client
    if (!formData.name.trim()) return message.error("Vui lòng nhập tên thương hiệu!");
    if (!formData.description.trim()) return message.error("Vui lòng nhập mô tả!");

    setLoading(true);
    try {
      if (editingItem) {
        // Update API
        await brandService.update(editingItem.id, formData);
        message.success("Cập nhật thương hiệu thành công!");
      } else {
        // Create API
        await brandService.create(formData);
        message.success("Thêm thương hiệu thành công!");
      }
      closeModal();
      fetchBrands(); // Load lại dữ liệu mới nhất
    } catch (error: any) {
      // Hiển thị lỗi từ Backend (ví dụ: BRAND_NAME_REQUIRED)
      const msg = error.response?.data?.message || "Có lỗi xảy ra!";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 4. Xử lý Xóa
  const deleteItem = async (id: number) => {
    setLoading(true);
    try {
      await brandService.delete(id);
      message.success("Xóa thương hiệu thành công!");
      fetchBrands();
    } catch (error: any) {
      // Backend check quyền admin mới cho xóa -> có thể trả về 403
      const msg = error.response?.data?.message || "Không thể xóa thương hiệu này (Có thể do không đủ quyền)!";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      align: 'center' as const,
      sorter: (a: BrandResponse, b: BrandResponse) => a.id - b.id
    },
    {
      title: "Tên thương hiệu",
      dataIndex: "name",
      width: 200,
      sorter: (a: BrandResponse, b: BrandResponse) => a.name.localeCompare(b.name),
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: '#1677ff', display: 'flex', alignItems: 'center', gap: 8 }}>
          <GlobalOutlined /> {text}
        </span>
      )
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true
    },
    {
      title: "Người tạo",
      dataIndex: ["createBy", "username"], // Truy cập vào object createBy lấy username
      width: 150,
      render: (text: string) => <Tag color="cyan">{text || "System"}</Tag>
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updateAt", // Backend trả về camelCase
      width: 140,
      align: 'center' as const,
      render: (date: string) => date ? new Date(date).toLocaleDateString("vi-VN") : "-",
      sorter: (a: BrandResponse, b: BrandResponse) => new Date(a.updateAt).getTime() - new Date(b.updateAt).getTime(),
    },
    {
      title: "Hành động",
      width: 150,
      fixed: 'right' as const,
      align: 'center' as const,
      render: (_: any, record: BrandResponse) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => setViewDetailItem(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              type="primary" ghost
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          {isAdmin && (<Popconfirm
            title="Xóa thương hiệu?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => deleteItem(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button size="small" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>)}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center" }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>Quản lý Thương hiệu</Title>
            <Text type="secondary">Quản lý các đối tác và nhãn hàng</Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchBrands} loading={loading}>
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
              style={{ background: '#1677ff' }}
            >
              Thêm thương hiệu
            </Button>
          </Space>
        </div>

        <Table
          dataSource={brands}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} thương hiệu`,
            position: ['bottomRight']
          }}
          bordered
          size="middle"
        />

        {/* Modal Thêm/Sửa */}
        <Modal
          title={editingItem ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}
          open={isModalOpen}
          onCancel={closeModal}
          onOk={saveItem}
          confirmLoading={loading}
          width={500}
          okText="Lưu dữ liệu"
          cancelText="Hủy bỏ"
          centered
        >
          <div style={{ padding: "20px 0" }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                Tên thương hiệu <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                placeholder="VD: Nike, Adidas, Puma..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                size="large"
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                Mô tả <span style={{ color: "red" }}>*</span>
              </label>
              <Input.TextArea
                rows={4}
                placeholder="Mô tả về thương hiệu..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                size="large"
              />
            </div>
          </div>
        </Modal>

        {/* Modal Chi tiết */}
        <Modal
          title="Chi tiết thương hiệu"
          open={!!viewDetailItem}
          onCancel={() => setViewDetailItem(null)}
          footer={[
            <Button key="close" type="primary" onClick={() => setViewDetailItem(null)}>
              Đóng
            </Button>,
          ]}
          width={600}
          centered
        >
          {viewDetailItem && (
            <Descriptions bordered column={1} size="middle" labelStyle={{ width: 150, fontWeight: 500, background: '#fafafa' }}>
              <Descriptions.Item label="ID Thương hiệu">{viewDetailItem.id}</Descriptions.Item>
              <Descriptions.Item label="Tên thương hiệu">
                <span style={{ color: '#1677ff', fontWeight: 'bold' }}>{viewDetailItem.name}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {viewDetailItem.description}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {viewDetailItem.createAt ? new Date(viewDetailItem.createAt).toLocaleDateString("vi-VN") : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">
                {viewDetailItem.createBy?.username || "N/A"} ({viewDetailItem.createBy?.email || ""})
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {viewDetailItem.updateAt ? new Date(viewDetailItem.updateAt).toLocaleDateString("vi-VN") : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Người cập nhật">
                {viewDetailItem.updateBy?.username || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default BrandManagement;