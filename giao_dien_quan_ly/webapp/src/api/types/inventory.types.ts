import { SimpleProductVariantResponse } from "./product.types";
import { SimpleWarehouseResponse } from "./warehouse.types";
import { SimpleUserResponse } from "./user.types";

// Khớp với InventoryResponse.java
export interface InventoryResponse {
  id: number;
  warehouse: SimpleWarehouseResponse;
  productVariant: SimpleProductVariantResponse;
  quantity: number;
  createBy: SimpleUserResponse;
  updateBy: SimpleUserResponse;
  createAt: string;
  updateAt: string;
}

// Khớp với InventoryCriteria.java
export interface InventoryCriteria {
  keyword?: string;
  warehouseId?: number;
  createAtStart?: string;
  createAtEnd?: string;
  page?: number;
  size?: number;
}