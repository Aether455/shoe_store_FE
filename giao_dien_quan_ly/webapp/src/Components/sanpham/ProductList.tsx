import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Select,
  InputNumber,
  Popconfirm,
  message,
  Space,
  Card,
  Image,
  Tag,
  Tooltip,
  Upload,
  Row,
  Col,
  Divider,
  Descriptions,
  Form,
  Typography
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  SearchOutlined,
  ReloadOutlined,
  BarcodeOutlined,
  SaveOutlined
} from "@ant-design/icons";
import { BrandResponse } from "../../api/types/brand.type";
import { CategoryResponse } from "../../api/types/category.types";
import { OptionResponse } from "../../api/types/option.types";
import { ProductResponse, ProductVariantResponse, SimpleProductResponse } from "../../api/types/product.types";
import { brandService } from "../../api/services/brand.service";
import { categoryService } from "../../api/services/category.service";
import { optionService } from "../../api/services/option.service";
import { tokenUtils } from "../../utils/tokenUtils";
import { productService } from "../../api/services/product.service";


const { Option } = Select;
const { Title } = Typography;

const ProductManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Master Data
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [options, setOptions] = useState<OptionResponse[]>([]);

  // List View Data
  const [products, setProducts] = useState<SimpleProductResponse[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Search Logic State
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState({ name: "", sku: "", brandId: undefined, categoryId: undefined });

  // Detail / Edit Data
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  // Forms
  const [productForm] = Form.useForm();
  const [variantForm] = Form.useForm();

  // Temp data for creating new product
  const [tempVariants, setTempVariants] = useState<any[]>([]);

  // Editing States
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // --- UTILS ---
  const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  // --- 1. INITIAL FETCH ---
  useEffect(() => {
    const initMasterData = async () => {
      try {
        const [b, c, o] = await Promise.all([
          brandService.getAll(),
          categoryService.getAll(),
          optionService.getAllOptions()
        ]);
        setBrands(b);
        setCategories(c);
        setOptions(o);
        setIsAdmin(tokenUtils.isAdmin());
      } catch (e) { console.error(e); }
    };
    initMasterData();
    handleFetchAll(1, 10);
  }, []);

  // Hàm gọi API Get All (GET /products)
  const handleFetchAll = async (page: number, size: number) => {
    setLoading(true);
    setIsSearching(false);
    try {
      const res = await productService.getAll(page - 1, size);
      // Cập nhật dựa trên cấu trúc mới: result.content và result.page.totalElements
      setProducts(res.content);
      setPagination({
        current: page,
        pageSize: size,
        total: res.page.totalElements // Truy cập vào object page
      });
    } catch (e) { message.error("Lỗi tải danh sách sản phẩm"); }
    finally { setLoading(false); }
  };

  // Hàm gọi API Search (GET /products/search)
  const handleSearch = async (page: number, size: number) => {
    setLoading(true);
    setIsSearching(true);
    try {
      const res = await productService.search({
        productName: searchParams.name,
        sku: searchParams.sku,
        brandId: searchParams.brandId,
        categoryId: searchParams.categoryId,
        page: page - 1,
        size: size
      });
      setProducts(res.content);
      setPagination({
        current: page,
        pageSize: size,
        total: res.page.totalElements // Truy cập vào object page
      });
    } catch (e) { message.error("Lỗi tìm kiếm sản phẩm"); }
    finally { setLoading(false); }
  };

  // Hàm điều hướng Pagination
  const handleTableChange = (newPagination: any) => {
    if (isSearching) {
      handleSearch(newPagination.current, newPagination.pageSize);
    } else {
      handleFetchAll(newPagination.current, newPagination.pageSize);
    }
  };

  // Nút "Làm mới"
  const handleReset = () => {
    setSearchParams({ name: "", sku: "", brandId: undefined, categoryId: undefined });
    handleFetchAll(1, 10);
  };

  // --- 2. VIEW DETAIL ---
  const handleViewDetail = async (id: number) => {
    setLoading(true);
    try {
      const data = await productService.getById(id);
      setSelectedProduct(data);
    } catch (e) { message.error("Lỗi tải chi tiết sản phẩm"); }
    finally { setLoading(false); }
  };

  // --- 3. CREATE PRODUCT ---
  const handleAddTempVariant = (values: any) => {
    const optionValueIds = Object.values(values.optionSelection || {}).map((v: any) => Number(v)).filter(v => !isNaN(v));
    if (optionValueIds.length === 0) return message.error("Chọn ít nhất 1 thuộc tính");

    const newVariant = {
      key: Date.now(),
      sku: values.sku,
      price: values.price,
      optionValueIds,
      imageFile: values.imageFile?.[0]?.originFileObj
    };
    setTempVariants([...tempVariants, newVariant]);
    variantForm.resetFields();
  };

  const handleCreateProduct = async () => {
    try {
      const values = await productForm.validateFields();
      if (tempVariants.length === 0) return message.error("Cần ít nhất 1 biến thể");

      setLoading(true);
      await productService.create({
        ...values,
        mainImageFile: values.mainImage?.[0]?.originFileObj,
        variants: tempVariants
      });
      message.success("Tạo sản phẩm thành công");
      setIsCreateModalOpen(false);
      setTempVariants([]);
      productForm.resetFields();
      handleFetchAll(1, 10);
    } catch (e: any) {
      message.error(e.response?.data?.message || "Lỗi tạo sản phẩm");
    }
    finally { setLoading(false); }
  };

  // --- 4. EDIT PRODUCT ---
  const openEditProductModal = () => {
    if (!selectedProduct) return;
    productForm.setFieldsValue({
      name: selectedProduct.name,
      description: selectedProduct.description,
      brandId: selectedProduct.brand.id,
      categoryId: selectedProduct.category.id,
    });
    setIsEditProductModalOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    try {
      const values = await productForm.validateFields();
      setLoading(true);
      const updatedProduct = await productService.update(selectedProduct.id, {
        ...values,
        mainImageFile: values.mainImage?.[0]?.originFileObj
      });
      message.success("Cập nhật thành công");
      setIsEditProductModalOpen(false);
      setSelectedProduct(updatedProduct);
      handleFetchAll(pagination.current, pagination.pageSize);
    } catch (e: any) { message.error(e.response?.data?.message || "Lỗi cập nhật"); }
    finally { setLoading(false); }
  };

  // --- 5. DELETE PRODUCT (WITH ERROR HANDLING) ---
  const handleDeleteProduct = async (id: number) => {
    setLoading(true);
    try {
      await productService.delete(id);
      message.success("Xóa sản phẩm thành công");
      // Reload lại trang hiện tại
      if (isSearching) {
        handleSearch(pagination.current, pagination.pageSize);
      } else {
        handleFetchAll(pagination.current, pagination.pageSize);
      }
    } catch (error: any) {
      // Lấy message từ backend (ApiResponse)
      const msg = error.response?.data?.message || "Không thể xóa sản phẩm này";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- 6. VARIANT ACTIONS ---
  const openVariantModal = (variant?: ProductVariantResponse) => {
    variantForm.resetFields();
    if (variant) {
      setEditingVariantId(variant.id);
      const selection: any = {};
      variant.optionValues.forEach(ov => {
        const parentOption = options.find(o => o.optionValues.some(v => v.id === ov.id));
        if (parentOption) selection[parentOption.id] = ov.id;
      });

      variantForm.setFieldsValue({
        sku: variant.sku,
        price: variant.price,
        optionSelection: selection
      });
    } else {
      setEditingVariantId(null);
    }
    setIsVariantModalOpen(true);
  };

  const handleSaveVariant = async () => {
    if (!selectedProduct) return;
    try {
      const values = await variantForm.validateFields();
      const optionValueIds = Object.values(values.optionSelection || {}).map((v: any) => Number(v)).filter(v => !isNaN(v));
      const file = values.imageFile?.[0]?.originFileObj;

      setLoading(true);
      if (editingVariantId) {
        await productService.updateVariant(editingVariantId, {
          sku: values.sku,
          price: values.price,
          optionValues: optionValueIds,
          imageFile: file
        });
        message.success("Cập nhật biến thể thành công");
      } else {
        await productService.addVariant({
          productId: selectedProduct.id,
          sku: values.sku,
          price: values.price,
          optionValues: optionValueIds,
          imageFile: file
        });
        message.success("Thêm biến thể thành công");
      }
      setIsVariantModalOpen(false);
      handleViewDetail(selectedProduct.id);
    } catch (e: any) { message.error(e.response?.data?.message || "Lỗi lưu biến thể"); }
    finally { setLoading(false); }
  };

  const handleDeleteVariant = async (id: number) => {
    if (!selectedProduct) return;
    try {
      await productService.deleteVariant(id);
      message.success("Xóa biến thể thành công");
      handleViewDetail(selectedProduct.id);
    } catch (e: any) { message.error(e.response?.data?.message || "Lỗi xóa biến thể"); }
  };

  // --- RENDER HELPER ---
  const renderVariantForm = (onSubmit: any, btnText: string) => (
    <Form form={variantForm} layout="vertical" onFinish={onSubmit}>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="sku" label="Mã SKU" rules={[{ required: true }]}>
            <Input placeholder="SKU..." />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="price" label="Giá bán" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} min={0} />
          </Form.Item>
        </Col>
      </Row>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>Thuộc tính:</div>
      <Row gutter={16}>
        {options.map(opt => (
          <Col span={8} key={opt.id}>
            <Form.Item name={['optionSelection', opt.id]} label={opt.name}>
              <Select placeholder={`Chọn ${opt.name}`} allowClear>
                {opt.optionValues?.map(val => (
                  <Option key={val.id} value={val.id}>{val.value}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        ))}
      </Row>
      <Form.Item name="imageFile" label="Ảnh biến thể" valuePropName="fileList" getValueFromEvent={normFile}>
        <Upload maxCount={1} beforeUpload={() => false} listType="picture">
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
      </Form.Item>
      <Button type="primary" htmlType="submit" block icon={<SaveOutlined />}>{btnText}</Button>
    </Form>
  );

  // --- VIEW 1: PRODUCT DETAIL ---
  if (selectedProduct) {
    return (
      <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedProduct(null)} style={{ marginBottom: 16 }}>
          Danh sách sản phẩm
        </Button>

        <Card
          title={<Title level={3} style={{ margin: 0 }}>{selectedProduct.name}</Title>}
          extra={
            <Space>
              <Tag color="blue">{selectedProduct.category.name}</Tag>
              <Button type="primary" icon={<EditOutlined />} onClick={openEditProductModal}>Sửa thông tin</Button>
            </Space>
          }
        >
          <Row gutter={24}>
            <Col span={6}>
              <Image src={selectedProduct.mainImageUrl} fallback="https://via.placeholder.com/300" />
            </Col>
            <Col span={18}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Thương hiệu">{selectedProduct.brand.name}</Descriptions.Item>
                <Descriptions.Item label="Người tạo">{selectedProduct.createBy?.username || 'admin'}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">{selectedProduct.createAt}</Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>{selectedProduct.description}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>

          <Divider orientation="left"><BarcodeOutlined /> Danh sách Biến thể</Divider>

          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openVariantModal()}>
              Thêm biến thể
            </Button>
          </div>

          <Table
            dataSource={selectedProduct.productVariants}
            rowKey="id"
            pagination={false}
            bordered
            columns={[
              { title: "SKU", dataIndex: "sku", width: 150, render: (t) => <b>{t}</b> },
              { title: "Ảnh", dataIndex: "productVariantImageUrl", render: (url) => url ? <Image src={url} width={40} /> : "-" },
              {
                title: "Thuộc tính",
                render: (_, r) => (
                  <Space wrap>
                    {r.optionValues.map(ov => {
                      const parentOpt = options.find(o => o.optionValues.some(v => v.id === ov.id));
                      return <Tag key={ov.id} color="geekblue">{parentOpt?.name}: {ov.value}</Tag>
                    })}
                  </Space>
                )
              },
              { title: "Giá", dataIndex: "price", render: (p) => p.toLocaleString() + " đ" },
              { title: "Tồn kho", dataIndex: "quantity" },
              {
                title: "Hành động",
                render: (_, r) => (
                  <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => openVariantModal(r)} />
                    {isAdmin && (
                      <Popconfirm title="Xóa?" onConfirm={() => handleDeleteVariant(r.id)}>
                        <Button danger icon={<DeleteOutlined />} size="small" />
                      </Popconfirm>
                    )}
                  </Space>
                )
              }
            ]}
          />
        </Card>

        {/* Modal Variant */}
        <Modal
          title={editingVariantId ? "Cập nhật biến thể" : "Thêm biến thể mới"}
          open={isVariantModalOpen}
          onCancel={() => setIsVariantModalOpen(false)}
          footer={null}
          width={700}
        >
          {renderVariantForm(handleSaveVariant, "Lưu biến thể")}
        </Modal>

        {/* Modal Edit Info */}
        <Modal
          title="Cập nhật thông tin sản phẩm"
          open={isEditProductModalOpen}
          onCancel={() => setIsEditProductModalOpen(false)}
          onOk={handleUpdateProduct}
          confirmLoading={loading}
          width={800}
        >
          <Form form={productForm} layout="vertical">
            <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true }]}>
                  <Select>{brands.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}</Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
                  <Select>{categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}</Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item name="mainImage" label="Ảnh chính (Chọn để thay đổi)" valuePropName="fileList" getValueFromEvent={normFile}>
              <Upload maxCount={1} beforeUpload={() => false} listType="picture"><Button icon={<UploadOutlined />}>Chọn ảnh mới</Button></Upload>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  // --- VIEW 2: PRODUCT LIST ---
  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>Quản lý Sản phẩm</Title>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsCreateModalOpen(true)}>Thêm mới</Button>
        </div>

        <Space style={{ marginBottom: 16 }} wrap>
          <Input placeholder="Tên sản phẩm..." style={{ width: 200 }}
            value={searchParams.name}
            onChange={e => setSearchParams({ ...searchParams, name: e.target.value })}
          />
          <Input placeholder="SKU..." style={{ width: 150 }}
            value={searchParams.sku}
            onChange={e => setSearchParams({ ...searchParams, sku: e.target.value })}
          />
          <Select placeholder="Thương hiệu" style={{ width: 150 }} allowClear onChange={v => setSearchParams({ ...searchParams, brandId: v })}>
            {brands.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
          </Select>
          <Select placeholder="Danh mục" style={{ width: 150 }} allowClear onChange={v => setSearchParams({ ...searchParams, categoryId: v })}>
            {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
          </Select>

          <Button type="primary" icon={<SearchOutlined />} onClick={() => handleSearch(1, pagination.pageSize)}>
            Tìm kiếm
          </Button>

          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Làm mới
          </Button>
        </Space>

        <Table
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          bordered
          columns={[
            { title: "ID", dataIndex: "id", width: 70, align: "center" },
            { title: "Ảnh", dataIndex: "mainImageUrl", width: 80, render: u => <Image src={u} width={50} fallback="error" /> },
            { title: "Tên sản phẩm", dataIndex: "name", render: t => <b style={{ color: '#1890ff' }}>{t}</b> },
            { title: "Danh mục", dataIndex: ["category", "name"] },
            { title: "Thương hiệu", dataIndex: ["brand", "name"] },
            {
              title: "Hành động", width: 120, align: "center",
              render: (_, r) => (
                <Space>
                  <Tooltip title="Chi tiết"><Button type="primary" ghost icon={<EyeOutlined />} onClick={() => handleViewDetail(r.id)} /></Tooltip>

                  {isAdmin && (
                    <Popconfirm
                      title="Xóa sản phẩm này?"
                      description="Hành động này không thể hoàn tác!"
                      onConfirm={() => handleDeleteProduct(r.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  )}
                </Space>
              )
            }
          ]}
        />
      </Card>

      {/* Modal Create Product */}
      <Modal
        title="Thêm Sản phẩm & Biến thể"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={handleCreateProduct}
        width={900}
        okText="Tạo mới"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form form={productForm} layout="vertical">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                <Input placeholder="Tên sản phẩm..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true }]}>
                <Select>{brands.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}</Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
                <Select>{categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}</Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="mainImage" label="Ảnh chính" valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload maxCount={1} beforeUpload={() => false} listType="picture"><Button icon={<UploadOutlined />}>Chọn ảnh</Button></Upload>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
        </Form>

        <Divider orientation="left">Danh sách biến thể</Divider>
        <Card size="small" style={{ background: '#f9f9f9' }}>
          {renderVariantForm((values) => handleAddTempVariant(values), "Thêm vào danh sách tạm")}
        </Card>

        <Table
          dataSource={tempVariants}
          rowKey="key"
          pagination={false}
          size="small"
          style={{ marginTop: 16 }}
          columns={[
            { title: "SKU", dataIndex: "sku" },
            { title: "Giá", dataIndex: "price", render: p => p.toLocaleString() },
            {
              title: "Thuộc tính", render: (_, r) => r.optionValueIds.map((id: number) => {
                const optVal = options.flatMap(o => o.optionValues).find(v => v.id === id);
                return <Tag key={id}>{optVal?.value}</Tag>
              })
            },
            {
              title: "Ảnh",
              dataIndex: "imageFile",
              render: (file: File) => file ? <Tag color="green">Đã chọn ảnh</Tag> : <Tag>Không có</Tag>
            },
            {
              title: "", render: (_, __, idx) => <Button danger type="text" icon={<DeleteOutlined />} onClick={() => {
                const newData = [...tempVariants]; newData.splice(idx, 1); setTempVariants(newData);
              }} />
            }
          ]}
        />
      </Modal>
    </div>
  );
};

export default ProductManagement;