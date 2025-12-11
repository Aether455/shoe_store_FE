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
  Tag
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { CategoryResponse } from "../../api/types/category.types";
import { categoryService } from "../../api/services/category.service";
import { tokenUtils } from "../../utils/tokenUtils";


const CategoryManagement: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false); // [Mới]


  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryResponse | null>(null);
  const [viewDetailItem, setViewDetailItem] = useState<CategoryResponse | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: "", description: "" });

  // --- 1. Fetch Data ---
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error: any) {
      message.error("Không thể tải danh sách danh mục!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    setIsAdmin(tokenUtils.isAdmin()); // [Mới]
  }, []);

  // --- 2. Handle Modal ---
  const openModal = (item?: CategoryResponse) => {
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

  // --- 3. Create / Update ---
  const saveItem = async () => {
    if (!formData.name.trim()) return message.error("Vui lòng nhập tên danh mục!");
    if (!formData.description.trim()) return message.error("Vui lòng nhập mô tả!");

    setLoading(true);
    try {
      if (editingItem) {
        // Gọi API Update
        await categoryService.update(editingItem.id, formData);
        message.success("Cập nhật thành công!");
      } else {
        // Gọi API Create
        await categoryService.create(formData);
        message.success("Thêm mới thành công!");
      }
      closeModal();
      fetchCategories(); // Refresh lại bảng
    } catch (error: any) {
      // Check lỗi validate từ backend trả về
      const msg = error.response?.data?.message || "Có lỗi xảy ra!";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. Delete ---
  const deleteItem = async (id: number) => {
    setLoading(true);
    try {
      await categoryService.delete(id);
      message.success("Xóa danh mục thành công!");
      fetchCategories();
    } catch (error: any) {
      // Lỗi authorization hoặc lỗi khác
      const msg = error.response?.data?.message || "Không thể xóa danh mục này!";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- Columns Definition ---
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      sorter: (a: CategoryResponse, b: CategoryResponse) => a.id - b.id
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      width: 200,
      sorter: (a: CategoryResponse, b: CategoryResponse) => a.name.localeCompare(b.name),
      render: (text: string) => <span style={{ fontWeight: 600, color: '#1890ff' }}>{text}</span>
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
      render: (text: string) => <Tag color="blue">{text || "System"}</Tag>
    },
    {
      title: "Ngày tạo",
      dataIndex: "createAt",
      width: 120,
      render: (date: string) => date ? new Date(date).toLocaleDateString("vi-VN") : "-",
      sorter: (a: CategoryResponse, b: CategoryResponse) => new Date(a.createAt).getTime() - new Date(b.createAt).getTime(),
    },
    {
      title: "Hành động",
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: CategoryResponse) => (
        <Space>
          <Tooltip title="Chi tiết">
            <Button
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => setViewDetailItem(record)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              size="small"
              type="primary" ghost
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          {isAdmin && (<Popconfirm
            title="Xóa danh mục?"
            description="Hành động này không thể hoàn tác!"
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
      <Card bordered={false} style={{ borderRadius: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Quản lý Danh mục</h2>
            <span style={{ color: '#888', fontSize: 13 }}>Quản lý các nhóm sản phẩm hệ thống</span>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchCategories} loading={loading}>
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              Thêm mới
            </Button>
          </Space>
        </div>

        <Table
          dataSource={categories}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} danh mục`
          }}
          bordered
          size="middle"
        />
      </Card>

      {/* Modal Thêm/Sửa */}
      <Modal
        title={editingItem ? "Cập nhật danh mục" : "Thêm danh mục mới"}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={saveItem}
        confirmLoading={loading}
        okText="Lưu dữ liệu"
        cancelText="Hủy bỏ"
      >
        <div style={{ paddingTop: 10 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 5 }}>Tên danh mục <span style={{ color: 'red' }}>*</span></label>
            <Input
              placeholder="Ví dụ: iPhone, Macbook..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 5 }}>Mô tả chi tiết <span style={{ color: 'red' }}>*</span></label>
            <Input.TextArea
              rows={4}
              placeholder="Mô tả về nhóm sản phẩm này..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Modal Chi tiết */}
      <Modal
        title="Thông tin chi tiết"
        open={!!viewDetailItem}
        onCancel={() => setViewDetailItem(null)}
        footer={[
          <Button key="close" onClick={() => setViewDetailItem(null)}>Đóng</Button>
        ]}
      >
        {viewDetailItem && (
          <Descriptions bordered column={1} size="small" labelStyle={{ width: 140, fontWeight: 500 }}>
            <Descriptions.Item label="ID">{viewDetailItem.id}</Descriptions.Item>
            <Descriptions.Item label="Tên danh mục">{viewDetailItem.name}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{viewDetailItem.description}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {viewDetailItem.createAt ? new Date(viewDetailItem.createAt).toLocaleDateString("vi-VN") : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {viewDetailItem.createBy?.username || "N/A"}
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
    </div>
  );
};

export default CategoryManagement;