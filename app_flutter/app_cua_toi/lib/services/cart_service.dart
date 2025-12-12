import 'dart:async';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../data/network/api_client.dart';
import '../data/models/api_response.dart';
import '../data/models/cart_model.dart';

class CartService {
  static final Dio _dio = ApiClient.instance;

  // StreamController để quản lý trạng thái giỏ hàng
  static final StreamController<CartResponse?> _cartController =
      StreamController<CartResponse?>.broadcast();

  // Stream để UI lắng nghe
  static Stream<CartResponse?> get cartStream => _cartController.stream;

  // Giá trị hiện tại (để lấy nhanh không cần await stream)
  static CartResponse? _currentCart;
  static CartResponse? get currentCart => _currentCart;

  // ValueNotifier cho số lượng badge trên AppBar
  static ValueNotifier<int> cartCountNotifier = ValueNotifier<int>(0);

  // --- HÀM GỌI API & CẬP NHẬT STREAM ---

  // Lấy giỏ hàng và đẩy vào Stream
  static Future<void> fetchCart() async {
    try {
      final response = await _dio.get('/carts/me');
      final apiResponse = ApiResponse<CartResponse>.fromJson(
        response.data,
        (json) => CartResponse.fromJson(json),
      );

      if (apiResponse.code == 1000 && apiResponse.result != null) {
        _currentCart = apiResponse.result;
        _cartController.add(_currentCart); // Bắn data mới vào stream
        cartCountNotifier.value = _currentCart!.cartItems.length;
      } else {
        // Nếu lỗi hoặc rỗng, có thể bắn null hoặc giữ nguyên
        _cartController.add(null);
      }
    } catch (e) {
      print('Fetch Cart Error: $e');
      _cartController.addError(e); // Có thể bắn lỗi nếu muốn UI handle
    }
  }

  // --- CÁC HÀM TÁC ĐỘNG DỮ LIỆU ---
  // Sau khi gọi API thành công, tự động gọi fetchCart() để update Stream

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
        (json) => CartItem.fromJson(json),
      );

      if (apiResponse.code == 1000) {
        await fetchCart(); // [QUAN TRỌNG] Refresh data toàn app
      }
      return apiResponse;
    } catch (e) {
      return _handleError(e);
    }
  }

  static Future<ApiResponse<CartItem>> updateQuantity(
    int variantId,
    int quantity,
  ) async {
    try {
      final response = await _dio.put(
        '/carts/quantity',
        data: {'productVariantId': variantId, 'quantity': quantity},
      );
      final apiResponse = ApiResponse<CartItem>.fromJson(
        response.data,
        (json) => CartItem.fromJson(json),
      );

      if (apiResponse.code == 1000) {
        await fetchCart(); // Refresh data
      }
      return apiResponse;
    } catch (e) {
      return _handleError(e);
    }
  }

  static Future<ApiResponse<String>> deleteCartItem(int cartItemId) async {
    try {
      final response = await _dio.delete('/carts/cartItem/$cartItemId');
      final apiResponse = ApiResponse<String>.fromJson(
        response.data,
        (json) => json.toString(),
      );

      if (apiResponse.code == 1000) {
        await fetchCart(); // Refresh data
      }
      return apiResponse;
    } catch (e) {
      return _handleError(e);
    }
  }

  static Future<ApiResponse<String>> clearCart() async {
    try {
      final response = await _dio.delete('/carts/clear');
      final apiResponse = ApiResponse<String>.fromJson(
        response.data,
        (json) => json.toString(),
      );

      if (apiResponse.code == 1000) {
        _currentCart = null;
        cartCountNotifier.value = 0;
        _cartController.add(null); // Bắn null hoặc cart rỗng
        await fetchCart(); // Hoặc fetch lại để đồng bộ chuẩn xác
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

  // Hàm dọn dẹp khi logout
  static void dispose() {
    _currentCart = null;
    cartCountNotifier.value = 0;
    // Không đóng stream controller vì nó là static dùng cho toàn app session
    // Nhưng có thể clear data
  }
}
