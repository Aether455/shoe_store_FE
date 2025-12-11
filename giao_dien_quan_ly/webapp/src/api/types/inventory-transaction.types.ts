import { SimpleWarehouseResponse } from "./warehouse.types";
import { SimpleUserResponse } from "./user.types";
import { SimpleProductResponseForCustomer, SimpleProductVariantResponse } from "./product.types";

// Enum khớp với Backend
export enum InventoryReferenceType {
  IMPORT_FROM_SUPPLIER = "IMPORT_FROM_SUPPLIER",
  EXPORT_TO_CUSTOMER = "EXPORT_TO_CUSTOMER",
  CANCEL_IMPORT_ORDER = "CANCEL_IMPORT_ORDER",
  CANCEL_ORDER_RETURN = "CANCEL_ORDER_RETURN",
}

// Khớp với InventoryTransactionResponse.java
export interface InventoryTransactionResponse {
  id: number;
  warehouse: SimpleWarehouseResponse;
  product: SimpleProductResponseForCustomer;
  productVariant: SimpleProductVariantResponse;
  type: InventoryReferenceType;
  quantityChange: number;
  referenceId: number;
  note: string;
  createBy: SimpleUserResponse;
  createAt: string; // ISO Date String
}