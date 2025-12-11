import React, { useState, useEffect } from "react";
import { Card, Row, Col, Table, Tag, Statistic, List, Avatar, Space } from "antd";
import {
  ShoppingOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  TrophyOutlined
} from "@ant-design/icons";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";
import dayjs from "dayjs";

// Services & Types
import { statisticService } from "../api/services/statistic.service";
import { SimpleOrderResponse } from "../api/types/order.types";
import { 
    RevenueReportResponse, 
    CategoryRevenueResponse, 
    SellingProductResponse 
} from "../api/types/statistic.types";

const Dashboard: React.FC = () => {
  // --- State ---
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [newOrders, setNewOrders] = useState<SimpleOrderResponse[]>([]);
  const [revenueByMonth, setRevenueByMonth] = useState<RevenueReportResponse[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<CategoryRevenueResponse[]>([]);
  const [topSelling, setTopSelling] = useState<SellingProductResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [total, orders, monthRev, catRev, top] = await Promise.all([
                statisticService.getTotalRevenue(),
                statisticService.getNewOrders(0, 5), // Lấy 5 đơn mới nhất
                statisticService.getRevenueByMonth(),
                statisticService.getRevenueByCategory(),
                statisticService.getTopSellingProducts()
            ]);

            setTotalRevenue(total);
            setNewOrders(orders.content);
            setRevenueByMonth(monthRev);
            setRevenueByCategory(catRev);
            setTopSelling(top.slice(0, 5)); // Lấy top 5
        } catch (error) {
            console.error("Lỗi tải dashboard", error);
        } finally {
            setLoading(false);
        }
    };
    fetchDashboardData();
  }, []);

  // --- Helper ---
  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  
  // Colors for Pie Chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Order Table Columns
  const orderColumns = [
    { title: "Mã ĐH", dataIndex: "orderCode", key: "orderCode", render: (t: string) => <b>{t}</b> },
    { title: "Khách hàng", dataIndex: "receiverName", key: "receiverName" },
    { title: "Tổng tiền", dataIndex: "finalAmount", key: "finalAmount", render: formatCurrency },
    { 
        title: "Trạng thái", dataIndex: "status", key: "status",
        render: (status: string) => {
            const color = status === 'COMPLETED' ? 'green' : status === 'PENDING' ? 'gold' : 'red';
            return <Tag color={color}>{status}</Tag>;
        }
    },
    { title: "Ngày tạo", dataIndex: "createAt", key: "createAt", render: (d: string) => dayjs(d).format("DD/MM") }
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* ====== TOP CARDS ====== */}
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card bordered={false} style={{ background: "#e6f4ff", borderRadius: 16 }}>
             <Statistic 
                title="Tổng Doanh Thu (Tích lũy)"
                value={totalRevenue}
                precision={0}
                formatter={(val) => formatCurrency(Number(val))}
                prefix={<DollarOutlined style={{color: '#1677ff'}}/>}
                valueStyle={{color: '#1677ff', fontWeight: 'bold'}}
             />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: "#f6ffed", borderRadius: 16 }}>
             <Statistic 
                title="Sản phẩm bán chạy nhất"
                value={topSelling[0]?.totalQuantity || 0}
                suffix="đã bán"
                prefix={<TrophyOutlined style={{color: '#52c41a'}}/>}
                valueStyle={{color: '#52c41a', fontWeight: 'bold'}}
             />
             <div style={{fontSize: 12, color: '#52c41a', marginTop: 5}}>
                 {topSelling[0]?.productName || "Chưa có dữ liệu"}
             </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: "#f9f0ff", borderRadius: 16 }}>
             <Statistic 
                title="Đơn hàng mới"
                value={newOrders.length}
                suffix="đơn gần đây"
                prefix={<ShoppingOutlined style={{color: '#722ed1'}}/>}
                valueStyle={{color: '#722ed1', fontWeight: 'bold'}}
             />
          </Card>
        </Col>
      </Row>

      {/* ====== CHARTS ====== */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Bar Chart: Revenue by Month */}
        <Col span={16}>
          <Card title={<><RiseOutlined /> Biểu Đồ Doanh Thu Theo Tháng</>} bordered={false} style={{ borderRadius: 16 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(val) => `${val/1000000}M`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar name="Doanh thu" dataKey="totalRevenue" fill="#1677ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Pie Chart: Revenue by Category */}
        <Col span={8}>
          <Card title="Doanh Thu Theo Danh Mục" bordered={false} style={{ borderRadius: 16 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  dataKey="totalRevenue"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ====== BOTTOM TABLES ====== */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Table: New Orders */}
        <Col span={14}>
          <Card title="Đơn Hàng Mới Nhất" bordered={false} style={{ borderRadius: 16 }}>
            <Table
              columns={orderColumns}
              dataSource={newOrders}
              pagination={false}
              size="small"
              rowKey="id"
              loading={loading}
            />
          </Card>
        </Col>

        {/* List: Top Selling Products */}
        <Col span={10}>
          <Card title="Top 5 Sản Phẩm Bán Chạy" bordered={false} style={{ borderRadius: 16 }}>
            <List
                itemLayout="horizontal"
                dataSource={topSelling}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={
                                <div style={{position: 'relative'}}>
                                    <Avatar src={item.mainImageUrl} shape="square" size="large" icon={<ShoppingCartOutlined />} />
                                    <Tag color="volcano" style={{position: 'absolute', top: -5, left: -5, fontSize: 10, padding: '0 2px'}}>#{index + 1}</Tag>
                                </div>
                            }
                            title={<span style={{fontWeight: 500}}>{item.productName}</span>}
                            description={
                                <Space>
                                    <Tag color="blue">Bán: {item.totalQuantity}</Tag>
                                    {/* Note: API SellingProductResponse của bạn không có field totalRevenue, nếu có thì hiển thị thêm */}
                                </Space>
                            }
                        />
                    </List.Item>
                )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;