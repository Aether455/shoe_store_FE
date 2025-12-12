import { SimpleUserResponse } from "./user.types";
import { SimpleProductResponseForUsing, SimpleProductVariantResponse } from "./product.types"; // Giả định đã có
import { SimpleCustomerResponse } from "./customer.types"; // Giả định đã có
import { VoucherResponse } from "./voucher.types"; // Giả định đã có
import { SimpleWarehouseResponse } from "./warehouse.types"; // Giả định đã có
import { PaymentStatus } from "../services/payment.service";

// Enums
export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  DELIVERING = "DELIVERING",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER"
}

// --- Requests ---

export interface PaymentRequest {
  method: PaymentMethod;
}

export interface OrderItemRequest {
  productId: number;
  productVariantId: number;
  quantity: number;
  pricePerUnit: number;
}

export interface OrderCreationRequest {
  phoneNumber: string;
  note?: string;
  receiverName: string;
  shippingAddress: string;
  province: string;
  district: string;
  ward: string;
  voucherCode?: string;
  payment: PaymentRequest;
  orderItems: OrderItemRequest[];
  totalAmount: number;
}

export interface OrderUpdateRequest {
  note?: string;
  receiverName: string;
  shippingAddress: string;
  province: string;
  district: string;
  ward: string;
}

export interface OrderUpdateStatusRequest {
  orderStatus: OrderStatus;
}

// --- Responses ---

export interface OrderItemResponse {
  id: number;
  product: SimpleProductResponseForUsing;
  productVariant: SimpleProductVariantResponse;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface OrderStatusHistoryResponse {
  id: number;
  oldStatus: string;
  newStatus: string;
  changeBy: SimpleUserResponse; // Hoặc UserResponse tùy backend
  changeAt: string;
}

export interface PaymentResponse {
    id: number;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    amount: number;
    paymentDate: string;
    createAt: string;
}

// Dùng cho danh sách (Get All / Search)
export interface SimpleOrderResponse {
  id: number;
  orderCode: string;
  phoneNumber: string;
  shippingAddress: string;
  status: OrderStatus;
  note: string;
  receiverName: string;
  reducedAmount: number;
  totalAmount: number;
  finalAmount: number;
  createAt: string;
  createBy: SimpleUserResponse;
}

// Dùng cho chi tiết (Get By ID)
export interface OrderResponse {
  id: number;
  orderCode: string;
  receiverName: string;
  shippingAddress: string;
  phoneNumber: string;
  status: OrderStatus;
  note: string;
  reducedAmount: number;
  totalAmount: number;
  finalAmount: number;
    province: string;
  district: string;
  ward: string;
  voucher?: VoucherResponse;
  customer?: SimpleCustomerResponse;
  orderItems: OrderItemResponse[];
  payment?: PaymentResponse;
  orderStatusHistories: OrderStatusHistoryResponse[];
  warehouse?: SimpleWarehouseResponse;
  
  createAt: string;
  updateAt: string;
  createBy: SimpleUserResponse;
  updateBy: SimpleUserResponse;
}
export interface OrderCriteria {
  keyword?: string;
  status?: OrderStatus;
  minFinalAmount?: number;
  maxFinalAmount?: number;
  createAtBegin?: string; // LocalDateTime string format
  createAtEnd?: string;   // LocalDateTime string format
}