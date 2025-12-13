import axiosClient from "../axiosClient";
import { ApiResponse, PageResponse } from "../types/api.response";
import {
    ProductResponse,
    SimpleProductResponse,
    ProductCreationForm,
    ProductSearchCriteria,
    VariantCreationOneRequest,
    ProductVariantResponse
} from "../types/product.types";

const BASE_URL = "/products";

export const productService = {
    // GET /products
    getAll: async (page: number, size: number) => {
        const res = await axiosClient.get<any, ApiResponse<PageResponse<SimpleProductResponse>>>(
            `${BASE_URL}?page=${page}&size=${size}`
        );
        return res.result!;
    },

    // GET /products/search (Admin View)
    search: async (criteria: ProductSearchCriteria) => {
        const params = new URLSearchParams();
        if (criteria.productName) params.append('productName', criteria.productName);
        if (criteria.categoryId) params.append('categoryId', criteria.categoryId.toString());
        if (criteria.brandId) params.append('brandId', criteria.brandId.toString());
        if (criteria.sku) params.append('sku', criteria.sku);
        params.append('page', (criteria.page || 0).toString());
        params.append('size', (criteria.size || 10).toString());

        const response = await axiosClient.get<any, ApiResponse<PageResponse<SimpleProductResponse>>>(
            `${BASE_URL}/search?${params.toString()}`
        );
        return response.result!;
    },

    // GET /products/{id} (Detail View)
    getById: async (id: number): Promise<ProductResponse> => {
        const response = await axiosClient.get<any, ApiResponse<ProductResponse>>(`${BASE_URL}/${id}`);
        return response.result!;
    },

    // POST /products (Create Product + Variants)
    create: async (data: ProductCreationForm): Promise<ProductResponse> => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('categoryId', data.categoryId.toString());
        formData.append('brandId', data.brandId.toString());

        if (data.mainImageFile) {
            formData.append('mainImageFile', data.mainImageFile);
        }

        // Map list variants sang FormData (Spring Boot index notation)
        data.variants.forEach((variant, index) => {
            formData.append(`variants[${index}].sku`, variant.sku);
            formData.append(`variants[${index}].price`, variant.price.toString());

            // Option Values là Set/List ID
            variant.optionValueIds.forEach((ovId) => {
                formData.append(`variants[${index}].optionValues`, ovId.toString());
            });

            if (variant.imageFile) {
                formData.append(`variants[${index}].imageFile`, variant.imageFile);
            }
        });

        const response = await axiosClient.post<any, ApiResponse<ProductResponse>>(BASE_URL, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        console.log(response);
        return response.result!;
    },

    // PUT /products/{id} -> Multipart
    update: async (id: number, data: any) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('categoryId', data.categoryId);
        formData.append('brandId', data.brandId);

        if (data.mainImageFile) {
            formData.append('mainImageFile', data.mainImageFile);
        }

        const res = await axiosClient.put<any, ApiResponse<ProductResponse>>(`${BASE_URL}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.result!;
    },

    // DELETE /products/{id}
    delete: async (id: number): Promise<any> => {
        // AxiosClient interceptor sẽ trả về response.data (ApiResponse)
        // Nếu lỗi, nó sẽ throw error, ta sẽ catch ở component
        return await axiosClient.delete<any, ApiResponse<string>>(`${BASE_URL}/${id}`);
    },

    // --- Variant APIs ---

    // POST /products/variants (Add single variant)
    addVariant: async (data: VariantCreationOneRequest): Promise<ProductVariantResponse> => {
        const formData = new FormData();
        formData.append('productId', data.productId.toString());
        formData.append('sku', data.sku);
        formData.append('price', data.price.toString());
        formData.append('quantity', data.quantity.toString());

        data.optionValues.forEach(id => {
            formData.append('optionValues', id.toString());
        });

        if (data.imageFile) {
            formData.append('imageFile', data.imageFile);
        }

        const response = await axiosClient.post<any, ApiResponse<ProductVariantResponse>>(`${BASE_URL}/variants`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.result!;
    },

    // PUT /products/variants/{id}
    updateVariant: async (id: number, data: any) => {
        const formData = new FormData();
        formData.append('sku', data.sku);
        formData.append('price', data.price);
        formData.append('quantity', data.quantity);

        data.optionValues.forEach((oid: number) => {
            formData.append('optionValues', oid.toString());
        });

        if (data.imageFile) {
            formData.append('imageFile', data.imageFile);
        }

        const res = await axiosClient.put<any, any>(`${BASE_URL}/variants/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.result;
    },

    // DELETE /products/variants/{id}
    deleteVariant: async (id: number): Promise<void> => {
        await axiosClient.delete(`${BASE_URL}/variants/${id}`);
    }
};