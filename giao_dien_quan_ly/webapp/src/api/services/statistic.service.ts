import axiosClient from "../axiosClient";
import { ApiResponse, PageResponse } from "../types/api.response";
import {
  DailyReportResponse,
  DailyReportCriteria,
  RevenueReportResponse,
  SellingProductResponse,
  CategoryRevenueResponse,
  BrandRevenueResponse,
  ProductRevenueResponse
} from "../types/statistic.types";
import { SimpleOrderResponse } from "../types/order.types";

const BASE_URL = "/statistics";

export const statisticService = {
  // 1. BÁO CÁO NGÀY
  // GET /statistics/daily-reports
  getDailyReports: async (page: number, size: number, sortBy: string = "reportDate") => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<DailyReportResponse>>>(
      `${BASE_URL}/daily-reports`,
      { params: { page, size, sortBy } }
    );
    return response.result!;
  },

  // GET /statistics/daily-reports/filter
  filterDailyReports: async (criteria: DailyReportCriteria, page: number, size: number, sortBy: string = "reportDate") => {
    // Loại bỏ các key undefined để URL sạch
    const params = { ...criteria, page, size, sortBy };
    const response = await axiosClient.get<any, ApiResponse<PageResponse<DailyReportResponse>>>(
      `${BASE_URL}/daily-reports/filter`,
      { params }
    );
    return response.result!;
  },

  // 2. DASHBOARD & BIỂU ĐỒ
  // GET /statistics/total-revenue
  getTotalRevenue: async () => {
    const response = await axiosClient.get<any, ApiResponse<number>>(
      `${BASE_URL}/total-revenue`
    );
    return response.result!;
  },

  // GET /statistics/new-orders
  getNewOrders: async (page: number, size: number) => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<SimpleOrderResponse>>>(
      `${BASE_URL}/new-orders`,
      { params: { page, size } }
    );
    return response.result!;
  },

  // GET /statistics/revenue-by-month
  getRevenueByMonth: async () => {
    const response = await axiosClient.get<any, ApiResponse<RevenueReportResponse[]>>(
      `${BASE_URL}/revenue-by-month`
    );
    return response.result!;
  },

  // GET /statistics/revenue-by-category
  getRevenueByCategory: async () => {
    const response = await axiosClient.get<any, ApiResponse<CategoryRevenueResponse[]>>(
      `${BASE_URL}/revenue-by-category`
    );
    return response.result!;
  },

  // GET /statistics/revenue-by-brand
  getRevenueByBrand: async () => {
    const response = await axiosClient.get<any, ApiResponse<BrandRevenueResponse[]>>(
      `${BASE_URL}/revenue-by-brand`
    );
    return response.result!;
  },

  // GET /statistics/top-selling-products
  getTopSellingProducts: async () => {
    const response = await axiosClient.get<any, ApiResponse<SellingProductResponse[]>>(
      `${BASE_URL}/top-selling-products`
    );
    return response.result!;
  },

  // GET /statistics/top-revenue-products
  getTopRevenueProducts: async (page: number, size: number) => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<ProductRevenueResponse>>>(
      `${BASE_URL}/top-revenue-products`,
      { params: { page, size } }
    );
    return response.result!;
  }
};