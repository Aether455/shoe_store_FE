import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../data/network/api_client.dart';
import '../data/models/api_response.dart';
import '../data/models/cart_model.dart';

class CartService {
  static final Dio _dio = ApiClient.instance;
  static ValueNotifier<int> cartCountNotifier = ValueNotifier<int>(0);

  // Lấy giỏ hàng
  static Future<ApiResponse<CartResponse>> getMyCart() async {
    try {
      final response = await _dio.get('/carts/me');

      final apiResponse = ApiResponse<CartResponse>.fromJson(
        response.data,
        (json) => CartResponse.fromJson(json),
      );

      if (apiResponse.code == 1000 && apiResponse.result != null) {
        cartCountNotifier.value = apiResponse.result!.cartItems.length;
      }
      return apiResponse;
    } catch (e) {
      return _handleError(e);
    }
  }

  // Thêm vào giỏ
  static Future<ApiResponse<CartItem>> addToCart(
    int productId,
    int variantId,
    int quantity,
  ) async {
    try {
      final response = await _dio.post(
        '/carts',
        data: {
          'productId': productId,
          'productVariantId': variantId,
          'quantity': quantity,
        },
      );

      final apiResponse = ApiResponse<CartItem>.fromJson(
        response.data,
        (json) => CartItem.fromJson(json), // CartItemResponse từ BE
      );

      if (apiResponse.code == 1000) {
        await getMyCart(); // Refresh count
      }
      return apiResponse;
    } catch (e) {
      return _handleError(e);
    }
  }

  // Cập nhật số lượng
  static Future<ApiResponse<CartItem>> updateQuantity(
    int variantId,
    int quantity,
  ) async {
    try {
      final response = await _dio.put(
        '/carts/quantity',
        data: {'productVariantId': variantId, 'quantity': quantity},
      );
      return ApiResponse<CartItem>.fromJson(
        response.data,
        (json) => CartItem.fromJson(json),
      );
    } catch (e) {
      return _handleError(e);
    }
  }

  // Xóa item
  static Future<ApiResponse<String>> deleteCartItem(int cartItemId) async {
    try {
      final response = await _dio.delete('/carts/cartItem/$cartItemId');
      final apiResponse = ApiResponse<String>.fromJson(
        response.data,
        (json) => json.toString(),
      );

      if (apiResponse.code == 1000) {
        await getMyCart();
      }
      return apiResponse;
    } catch (e) {
      return _handleError(e);
    }
  }

  // Xóa toàn bộ giỏ
  static Future<ApiResponse<String>> clearCart() async {
    try {
      final response = await _dio.delete('/carts/clear');
      final apiResponse = ApiResponse<String>.fromJson(
        response.data,
        (json) => json.toString(),
      );

      if (apiResponse.code == 1000) {
        cartCountNotifier.value = 0;
      }
      return apiResponse;
    } catch (e) {
      return _handleError(e);
    }
  }

  static ApiResponse<T> _handleError<T>(dynamic e) {
    String msg = "Lỗi kết nối";
    int code = 9999;
    if (e is DioException) {
      if (e.response != null && e.response!.data is Map) {
        final data = e.response!.data;
        msg = data['message'] ?? msg;
        code = data['code'] ?? code;
      }
    }
    return ApiResponse<T>(code: code, message: msg);
  }
}
