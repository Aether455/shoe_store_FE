import { SimpleBrandResponse } from "./brand.type";
import { SimpleCategoryResponse } from "./category.types";
import { SimpleUserResponse } from "./user.types";
import { SimpleOptionValueResponse } from "./option.types";






// --- Product Variants ---
export interface ProductVariantResponse {
  id: number;
  sku: string;
  productVariantImageUrl?: string;
  optionValues: SimpleOptionValueResponse[];
  price: number;
  quantity: number;
  createBy: SimpleUserResponse;
  updateBy: SimpleUserResponse;
  createAt: string;
  updateAt: string;
}

export interface SimpleProductVariantResponse {
  id: number;
  sku: string;
  productVariantImageUrl?: string;
  optionValues: SimpleOptionValueResponse[];
  price: number;
  quantity: number;
}

// --- Product Responses ---
export interface SimpleProductResponse {
  id: number;
  name: string;
  mainImageUrl?: string;
  category: SimpleCategoryResponse;
  brand: SimpleBrandResponse;
  createBy: SimpleUserResponse;
  updateBy: SimpleUserResponse;
  createAt: string;
  updateAt: string;
}

export interface SimpleProductResponseForUsing  { 
      id: number;
      name: string;
      mainImageUrl?: string;
      category?: SimpleCategoryResponse;
      brand?: SimpleBrandResponse;
  }

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  mainImageUrl?: string;
  productVariants: ProductVariantResponse[];
  category: SimpleCategoryResponse;
  brand: SimpleBrandResponse;
  createBy: SimpleUserResponse;
  updateBy: SimpleUserResponse;
  createAt: string;
  updateAt: string;
}

// --- Requests ---
export interface ProductSearchCriteria {
  productName?: string;
  categoryId?: number;
  brandId?: number;
  sku?: string;
  page?: number;
  size?: number;
}

// Dùng cho form tạo mới (Product + List Variants)
export interface VariantCreationForm {
  sku: string;
  price: number;
  quantity: number;
  optionValueIds: number[]; // Set<Long>
  imageFile?: File; // Frontend only
}

export interface ProductCreationForm {
  name: string;
  description: string;
  mainImageFile?: File;
  categoryId: number;
  brandId: number;
  variants: VariantCreationForm[];
}

// Dùng cho form thêm lẻ 1 Variant vào Product đã có
export interface VariantCreationOneRequest {
  productId: number;
  sku: string;
  price: number;
  quantity: number;
  optionValues: number[]; // Set<Long>
  imageFile?: File;
}