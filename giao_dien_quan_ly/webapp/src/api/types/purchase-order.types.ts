import { SimpleUserResponse } from "./user.types";
import { SimpleSupplierResponse } from "./supplier.types"; // Giả định bạn đã tạo file này từ code cũ
import { SimpleWarehouseResponse } from "./warehouse.types";
import { SimpleProductVariantResponse } from "./product.types"; // Cần update product.types.ts để có type này

// Enum trạng thái
export enum PurchaseOrderStatus {
  DRAFT = "DRAFT",
  APPROVED = "APPROVED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED" // Backend có enum này
}

// Chi tiết 1 dòng trong đơn hàng (Response)
export interface PurchaseOrderItemResponse {
  id: number;
  productVariant: SimpleProductVariantResponse;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

// Response chi tiết đơn hàng (Get By Id)
export interface PurchaseOrderResponse {
  id: number;
  supplier: SimpleSupplierResponse;
  warehouse: SimpleWarehouseResponse;
  purchaseOrderItems: PurchaseOrderItemResponse[];
  status: PurchaseOrderStatus;
  totalAmount: number;
  createBy: SimpleUserResponse;
  updateBy: SimpleUserResponse;
  createAt: string;
  updateAt: string;
}

// Response danh sách đơn hàng (Get All)
export interface SimplePurchaseOrderResponse {
  id: number;
  supplier: SimpleSupplierResponse;
  warehouse: SimpleWarehouseResponse;
  totalAmount: number;
  createBy: SimpleUserResponse;
  createAt: string;
  status?: PurchaseOrderStatus; 
}

// Request tạo mới
export interface PurchaseOrderItemRequest {
  productVariantId: number;
  quantity: number;
  pricePerUnit: number; // BigDecimal mapped to number
  total: number;
}

export interface PurchaseOrderRequest {
  supplierId: number;
  warehouseId: number;
  purchaseOrderItems: PurchaseOrderItemRequest[];
  totalAmount: number;
}