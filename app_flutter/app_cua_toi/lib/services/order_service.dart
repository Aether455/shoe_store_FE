import 'dart:async';
import 'package:dio/dio.dart';
import '../data/network/api_client.dart';
import '../data/models/order_models.dart';
import '../data/models/api_response.dart';

class OrderService {
  static final Dio _dio = ApiClient.instance;

  // --- STREAM CONTROLLER ---
  // Stream danh sách đơn hàng
  static final StreamController<List<SimpleOrderResponse>> _ordersController =
      StreamController<List<SimpleOrderResponse>>.broadcast();
  static Stream<List<SimpleOrderResponse>> get ordersStream =>
      _ordersController.stream;

  // Cache data
  static List<SimpleOrderResponse> _currentOrders = [];

  // Hàm gọi ngầm để update Stream (thường gọi sau khi tạo/hủy đơn)
  static Future<void> fetchMyOrders({int page = 0, int size = 10}) async {
    try {
      final response = await _dio.get(
        '/user/orders/me',
        queryParameters: {'page': page, 'size': size, 'sortBy': 'createAt'},
      );

      final apiResponse = ApiResponse<List<SimpleOrderResponse>>.fromJson(
        response.data,
        (json) {
          final content = json['content'] as List;
          return content.map((e) => SimpleOrderResponse.fromJson(e)).toList();
        },
      );

      if (apiResponse.code == 1000 && apiResponse.result != null) {
        // Nếu là trang 0 thì reset list, nếu trang > 0 thì append (tùy logic phân trang)
        // Ở đây để đơn giản cho Stream, ta giả sử fetch trang 0 refresh toàn bộ list
        if (page == 0) {
          _currentOrders = apiResponse.result!;
          _ordersController.add(_currentOrders);
        }
      }
    } catch (e) {
      print("Fetch Orders Error: $e");
    }
  }

  // 1. Tạo đơn hàng
  static Future<ApiResponse<OrderResponse>> createOrder(
    OrderCreationRequest request,
  ) async {
    try {
      final response = await _dio.post('/user/orders', data: request.toJson());

      final apiResponse = ApiResponse<OrderResponse>.fromJson(
        response.data,
        (json) => OrderResponse.fromJson(json),
      );

      if (apiResponse.code == 1000) {
        fetchMyOrders(); // Refresh list đơn hàng
      }
      return apiResponse;
    } catch (e) {
      return _handleError(e);
    }
  }

  // 2. Lấy danh sách đơn hàng (Trả về ApiResponse cho UI loading lần đầu)
  static Future<ApiResponse<List<SimpleOrderResponse>>> getMyOrdersData({
    int page = 0,
    int size = 10,
  }) async {
    try {
      final response = await _dio.get(
        '/user/orders/me',
        queryParameters: {'page': page, 'size': size, 'sortBy': 'createAt'},
      );

      final apiResponse = ApiResponse<List<SimpleOrderResponse>>.fromJson(
        response.data,
        (json) {
          final content = json['content'] as List;
          return content.map((e) => SimpleOrderResponse.fromJson(e)).toList();
        },
      );

      if (apiResponse.code == 1000 && apiResponse.result != null && page == 0) {
        _currentOrders = apiResponse.result!;
        _ordersController.add(_currentOrders);
      }
      return apiResponse;
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
      final apiResponse = ApiResponse<OrderResponse>.fromJson(
        response.data,
        (json) => OrderResponse.fromJson(json),
      );

      if (apiResponse.code == 1000) {
        fetchMyOrders(); // Refresh list để cập nhật trạng thái mới
      }
      return apiResponse;
    } catch (e) {
      return _handleError(e);
    }
  }

  // 5. Hủy đơn hàng
  static Future<ApiResponse<OrderResponse>> cancelOrder(int id) async {
    try {
      final response = await _dio.patch('/user/orders/$id/cancel');
      final apiResponse = ApiResponse<OrderResponse>.fromJson(
        response.data,
        (json) => OrderResponse.fromJson(json),
      );

      if (apiResponse.code == 1000) {
        fetchMyOrders(); // Refresh list để cập nhật trạng thái mới
      }
      return apiResponse;
    } catch (e) {
      return _handleError(e);
    }
  }

  static Future<ApiResponse<OrderResponse>> completeOrder(int id) async {
    try {
      final response = await _dio.patch('/user/orders/$id/complete');
      final apiResponse = ApiResponse<OrderResponse>.fromJson(
        response.data,
        (json) => OrderResponse.fromJson(json),
      );

      if (apiResponse.code == 1000) {
        fetchMyOrders(); // Refresh list để cập nhật trạng thái mới
      }
      return apiResponse;
    } catch (e) {
      return _handleError(e);
    }
  }

  static ApiResponse<T> _handleError<T>(dynamic e) {
    String msg = "Lỗi kết nối hoặc lỗi không xác định";
    int code = 9999;
    if (e is DioException && e.response != null && e.response!.data is Map) {
      final data = e.response!.data;
      msg = data['message'] ?? msg;
      code = data['code'] ?? code;
    }
    return ApiResponse<T>(code: code, message: msg);
  }

  static void dispose() {
    _currentOrders = [];
    _ordersController.add([]);
  }
}
