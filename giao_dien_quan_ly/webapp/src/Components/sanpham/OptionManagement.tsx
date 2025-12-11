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
  Breadcrumb,
  Typography,
  Tag
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  RightOutlined,
  ArrowLeftOutlined,
  TagsOutlined,
  AppstoreOutlined
} from "@ant-design/icons";
import { OptionResponse, OptionValueResponse } from "../../api/types/option.types"
import { optionService } from "../../api/services/option.service";
import { tokenUtils } from "../../utils/tokenUtils";

const { Title, Text } = Typography;

const OptionManagement: React.FC = () => {
  // --- State Chung ---
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // State cho Option (List View)
  const [options, setOptions] = useState<OptionResponse[]>([]);
  const [selectedOption, setSelectedOption] = useState<OptionResponse | null>(null); // Nếu có dữ liệu => Đang ở trang chi tiết

  // State cho Option Value (Detail View)
  const [optionValues, setOptionValues] = useState<OptionValueResponse[]>([]);

  // State cho Modal (Dùng chung cho cả tạo Option và Value)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState(""); // Tên option hoặc Tên giá trị

  // ==========================================
  // 1. LOGIC CHO OPTION (View Danh sách)
  // ==========================================

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const data = await optionService.getAllOptions();
      setOptions(data);
    } catch (error) {
      message.error("Lỗi tải danh sách thuộc tính!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Chỉ fetch options khi đang ở màn hình chính
    if (!selectedOption) {
      fetchOptions();
    }
    setIsAdmin(tokenUtils.isAdmin());
  }, [selectedOption]);

  const handleCreateOption = async () => {
    if (!inputValue.trim()) return message.error("Tên thuộc tính không được để trống!");
    setLoading(true);
    try {
      await optionService.createOption({ name: inputValue });
      message.success("Tạo thuộc tính thành công!");
      setInputValue("");
      setIsModalOpen(false);
      fetchOptions();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tạo thuộc tính");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOption = async (id: number) => {
    try {
      await optionService.deleteOption(id);
      message.success("Xóa thành công!");
      fetchOptions();
    } catch (error: any) {
      message.error("Không thể xóa (có thể đang có dữ liệu ràng buộc)!");
    }
  };

  // Chuyển sang trang chi tiết
  const handleViewDetail = (option: OptionResponse) => {
    setSelectedOption(option);
    // Fetch luôn dữ liệu value của option này
    fetchOptionValues(option.id);
  };

  // ==========================================
  // 2. LOGIC CHO OPTION VALUE (View Chi tiết)
  // ==========================================

  const fetchOptionValues = async (optionId: number) => {
    setLoading(true);
    try {
      const data = await optionService.getValuesByOptionId(optionId);
      setOptionValues(data);
    } catch (error) {
      message.error("Lỗi tải giá trị thuộc tính!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOptionValue = async () => {
    if (!selectedOption) return;
    if (!inputValue.trim()) return message.error("Giá trị không được để trống!");

    setLoading(true);
    try {
      await optionService.createOptionValue({
        optionId: selectedOption.id,
        value: inputValue
      });
      message.success("Thêm giá trị thành công!");
      setInputValue("");
      setIsModalOpen(false);
      fetchOptionValues(selectedOption.id); // Reload lại bảng value
    } catch (error: any) {
      // Check lỗi OPTION_VALUE_EXISTED từ backend
      message.error(error.response?.data?.message || "Lỗi khi thêm giá trị");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOptionValue = async (id: number) => {
    if (!selectedOption) return;
    try {
      await optionService.deleteOptionValue(id);
      message.success("Xóa giá trị thành công!");
      fetchOptionValues(selectedOption.id);
    } catch (error) {
      message.error("Lỗi xóa giá trị!");
    }
  };

  // ==========================================
  // 3. RENDER GIAO DIỆN
  // ==========================================

  // --- View 1: Danh sách Option ---
  const renderOptionList = () => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Quản lý Thuộc tính</Title>
          <Text type="secondary">Kích thước, Màu sắc, Chất liệu...</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setInputValue(""); setIsModalOpen(true); }}
          size="large"
        >
          Thêm thuộc tính mới
        </Button>
      </div>

      <Table
        dataSource={options}
        rowKey="id"
        loading={loading}
        columns={[
          { title: "ID", dataIndex: "id", width: 80, align: 'center' },
          {
            title: "Tên thuộc tính",
            dataIndex: "name",
            render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>
          },
          {
            title: "Số lượng giá trị",
            render: (_, record) => (
              <Tag color="blue">{record.optionValues?.length || 0} giá trị</Tag>
            )
          },
          {
            title: "Ngày tạo",
            dataIndex: "createAt",
            render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "-"
          },
          {
            title: "Hành động",
            width: 150,
            align: 'right',
            render: (_, record) => (
              <Space>
                <Button
                  type="primary" ghost
                  icon={<RightOutlined />}
                  onClick={() => handleViewDetail(record)}
                >
                  Chi tiết
                </Button>
                {(isAdmin && <Popconfirm
                  title="Xóa thuộc tính?"
                  description="Hành động này sẽ xóa cả các giá trị con!"
                  onConfirm={() => handleDeleteOption(record.id)}
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>)}
              </Space>
            )
          }
        ]}
      />
    </>
  );

  // --- View 2: Chi tiết Value của Option ---
  const renderOptionDetail = () => (
    <>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <a onClick={() => setSelectedOption(null)}><AppstoreOutlined /> Danh sách thuộc tính</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{selectedOption?.name}</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => setSelectedOption(null)}
            shape="circle"
          />
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {selectedOption?.name}
            </Title>
            <Text type="secondary">Quản lý các giá trị cho thuộc tính này</Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setInputValue(""); setIsModalOpen(true); }}
        >
          Thêm giá trị (Value)
        </Button>
      </div>

      <Table
        dataSource={optionValues}
        rowKey="id"
        loading={loading}
        columns={[
          { title: "ID", dataIndex: "id", width: 80, align: 'center' },
          {
            title: "Giá trị",
            dataIndex: "value",
            render: (text) => <Tag color="geekblue" style={{ fontSize: 14, padding: '4px 10px' }}>{text}</Tag>
          },
          {
            title: "Người tạo",
            dataIndex: ["createBy", "username"],
            render: (text) => text || "System"
          },
          {
            title: "Ngày tạo",
            dataIndex: "createAt",
            render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "-"
          },
          {
            title: "Hành động",
            width: 100,
            align: 'right',
            render: (_, record) => isAdmin ? (
              <Popconfirm
                title="Xóa giá trị này?"
                onConfirm={() => handleDeleteOptionValue(record.id)}
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DeleteOutlined />} size="small" />
              </Popconfirm>
            ) : null
          }
        ]}
      />
    </>
  );

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <Card bordered={false} style={{ borderRadius: 8, minHeight: 500 }}>
        {/* Điều hướng view */}
        {!selectedOption ? renderOptionList() : renderOptionDetail()}
      </Card>

      {/* Modal dùng chung */}
      <Modal
        title={!selectedOption ? "Thêm thuộc tính mới" : `Thêm giá trị cho ${selectedOption.name}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={!selectedOption ? handleCreateOption : handleCreateOptionValue}
        confirmLoading={loading}
        okText="Lưu lại"
        cancelText="Hủy"
      >
        <div style={{ padding: '10px 0' }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: 8 }}>
            {!selectedOption ? "Tên thuộc tính (Ví dụ: Size, Color)" : "Giá trị (Ví dụ: XL, Đỏ, 39)"} <span style={{ color: 'red' }}>*</span>
          </label>
          <Input
            placeholder={!selectedOption ? "Nhập tên thuộc tính..." : "Nhập giá trị..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={!selectedOption ? handleCreateOption : handleCreateOptionValue}
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
};

export default OptionManagement;