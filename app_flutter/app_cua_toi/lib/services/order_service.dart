import 'package:dio/dio.dart';
import '../data/network/api_client.dart';
import '../data/models/order_models.dart';
import '../data/models/api_response.dart'; // Import ApiResponse

class OrderService {
  static final Dio _dio = ApiClient.instance;

  // 1. Tạo đơn hàng
  static Future<ApiResponse<OrderResponse>> createOrder(
    OrderCreationRequest request,
  ) async {
    try {
      final response = await _dio.post('/user/orders', data: request.toJson());

      // Parse Success (Code 1000)
      return ApiResponse<OrderResponse>.fromJson(
        response.data,
        (json) => OrderResponse.fromJson(json),
      );
    } catch (e) {
      return _handleError(e);
    }
  }

  // 2. Lấy danh sách đơn hàng
  static Future<ApiResponse<List<SimpleOrderResponse>>> getMyOrders({
    int page = 0,
    int size = 10,
  }) async {
    try {
      final response = await _dio.get(
        '/user/orders/me',
        queryParameters: {'page': page, 'size': size, 'sortBy': 'createAt'},
      );

      return ApiResponse<List<SimpleOrderResponse>>.fromJson(response.data, (
        json,
      ) {
        final list = json['content'] as List;
        return list.map((e) => SimpleOrderResponse.fromJson(e)).toList();
      });
    } catch (e) {
      return _handleError(e);
    }
  }

  // 3. Lấy chi tiết đơn hàng
  static Future<ApiResponse<OrderResponseForCustomer>> getOrderById(
    int id,
  ) async {
    try {
      final response = await _dio.get('/user/orders/$id');

      return ApiResponse<OrderResponseForCustomer>.fromJson(
        response.data,
        (json) => OrderResponseForCustomer.fromJson(json),
      );
    } catch (e) {
      return _handleError(e);
    }
  }

  // 4. Xác nhận đơn hàng
  static Future<ApiResponse<OrderResponse>> confirmOrder(int id) async {
    try {
      final response = await _dio.patch('/user/orders/$id/confirm');

      return ApiResponse<OrderResponse>.fromJson(
        response.data,
        (json) => OrderResponse.fromJson(json),
      );
    } catch (e) {
      return _handleError(e);
    }
  }

  // 5. Hủy đơn hàng
  static Future<ApiResponse<OrderResponse>> cancelOrder(int id) async {
    try {
      final response = await _dio.patch('/user/orders/$id/cancel');

      return ApiResponse<OrderResponse>.fromJson(
        response.data,
        (json) => OrderResponse.fromJson(json),
      );
    } catch (e) {
      return _handleError(e);
    }
  }

  // --- Helper xử lý lỗi từ Backend ---
  static ApiResponse<T> _handleError<T>(dynamic e) {
    String msg = "Lỗi kết nối hoặc lỗi không xác định";
    int code = 9999;

    if (e is DioException) {
      if (e.response != null && e.response!.data is Map) {
        // Lấy message từ JSON lỗi của BE: { "code": 100x, "message": "Lỗi gì đó" }
        final data = e.response!.data;
        msg = data['message'] ?? msg;
        code = data['code'] ?? code;
      } else {
        msg = e.message ?? msg;
      }
    }

    return ApiResponse<T>(code: code, message: msg);
  }
}

// Model phụ để hứng kết quả tạo đơn/confirm/cancel (chứa ID để load lại)
class OrderResponse {
  final int id;
  final String orderCode;
  OrderResponse({required this.id, required this.orderCode});
  factory OrderResponse.fromJson(Map<String, dynamic> json) =>
      OrderResponse(id: json['id'], orderCode: json['orderCode']);
}
