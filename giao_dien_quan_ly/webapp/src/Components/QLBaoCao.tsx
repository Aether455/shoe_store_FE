import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Typography,
  DatePicker,
  Button,
  Space,
  Form,
  InputNumber,
  Row,
  Col,
  message
} from "antd";
import { FileExcelOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { TablePaginationConfig } from "antd/es/table";

// Service & Types
import { statisticService } from "../api/services/statistic.service";
import { DailyReportResponse, DailyReportCriteria } from "../api/types/statistic.types";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ReportManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<DailyReportResponse[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
  });
  const [filterCriteria, setFilterCriteria] = useState<DailyReportCriteria | null>(null);
  const [form] = Form.useForm();

  // --- Fetch Data ---
  const fetchReports = async (page: number, size: number, criteria: DailyReportCriteria | null) => {
    setLoading(true);
    try {
      let data;
      // Nếu có criteria thì gọi API filter, ngược lại gọi API get all
      if (criteria && Object.values(criteria).some(v => v !== undefined)) {
        data = await statisticService.filterDailyReports(criteria, page - 1, size);
      } else {
        data = await statisticService.getDailyReports(page - 1, size);
      }

      setReports(data.content);
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize: size,
        total: data.totalElements
      }));
    } catch (error) {
      message.error("Lỗi tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1, 10, null);
  }, []);

  // --- Handlers ---
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchReports(newPagination.current || 1, newPagination.pageSize || 10, filterCriteria);
  };

  const handleFilter = (values: any) => {
    const criteria: DailyReportCriteria = {
      totalRevenueStart: values.revenueStart,
      totalRevenueEnd: values.revenueEnd,
      avgOrderValueStart: values.avgStart,
      avgOrderValueEnd: values.avgEnd,
      reportDateStart: values.dateRange ? values.dateRange[0].format("YYYY-MM-DD") : undefined,
      reportDateEnd: values.dateRange ? values.dateRange[1].format("YYYY-MM-DD") : undefined,
    };
    setFilterCriteria(criteria);
    fetchReports(1, pagination.pageSize || 10, criteria);
  };

  const handleReset = () => {
    form.resetFields();
    setFilterCriteria(null);
    fetchReports(1, pagination.pageSize || 10, null);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const columns = [
    {
      title: "Ngày báo cáo",
      dataIndex: "reportDate",
      key: "reportDate",
      render: (text: string) => <b>{dayjs(text).format("DD/MM/YYYY")}</b>
    },
    {
      title: "Tổng đơn",
      dataIndex: "totalOrders",
      key: "totalOrders",
      align: 'center' as const
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      align: 'right' as const,
      render: (val: number) => <b style={{ color: '#1677ff' }}>{formatCurrency(val)}</b>
    },
    {
      title: "Giá trị TB/Đơn",
      dataIndex: "avgOrderValue",
      key: "avgOrderValue",
      align: 'right' as const,
      render: (val: number) => formatCurrency(val)
    },
    {
      title: "Tổng giảm giá",
      dataIndex: "totalDiscountAmount",
      key: "totalDiscountAmount",
      align: 'right' as const,
      render: (val: number) => <span style={{ color: 'red' }}>{formatCurrency(val)}</span>
    },
    {
      title: "SP đã bán",
      dataIndex: "totalItemsSold",
      key: "totalItemsSold",
      align: 'center' as const
    },
    {
      title: "Khách mới",
      dataIndex: "newCustomersCount",
      key: "newCustomersCount",
      align: 'center' as const
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 16 }}>Báo cáo doanh thu chi tiết</Title>

      <Card style={{ marginBottom: 20 }}>
        <Form form={form} layout="vertical" onFinish={handleFilter}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="Khoảng thời gian" name="dateRange">
                <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Doanh thu từ" name="revenueStart">
                <InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Đến" name="revenueEnd">
                <InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Giá trị TB từ" name="avgStart">
                <InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={6} style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 24 }}>
              <Space>
                <Button type="primary" icon={<FilterOutlined />} htmlType="submit">Lọc</Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>Làm mới</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          pagination={pagination}
          onChange={handleTableChange}
          loading={loading}
          bordered
          summary={(pageData) => {
            let totalRev = 0;
            let totalOrd = 0;
            pageData.forEach(({ totalRevenue, totalOrders }) => {
              totalRev += totalRevenue;
              totalOrd += totalOrders;
            });
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}><b>Tổng trang này</b></Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="center"><b>{totalOrd}</b></Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right"><b>{formatCurrency(totalRev)}</b></Table.Summary.Cell>
                <Table.Summary.Cell index={3} colSpan={4} />
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default ReportManagement;