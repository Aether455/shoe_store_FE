import 'package:dio/dio.dart';
import '../data/network/api_client.dart';
import '../data/models/api_response.dart';
import '../data/models/user_model.dart';

class UserService {
  static final Dio _dio = ApiClient.instance;

  static Future<ApiResponse<CustomerInfo>> getCustomerProfile() async {
    try {
      final response = await _dio.get('/customers/me');
      return ApiResponse<CustomerInfo>.fromJson(
        response.data,
        (json) => CustomerInfo.fromJson(json),
      );
    } catch (e) {
      return _handleError(e);
    }
  }

  static Future<ApiResponse<CustomerInfo>> updateCustomerProfile(
    CustomerUpdateRequest request,
  ) async {
    try {
      final response = await _dio.put(
        '/customers/current_user',
        data: request.toJson(),
      );
      return ApiResponse<CustomerInfo>.fromJson(
        response.data,
        (json) => CustomerInfo.fromJson(json),
      );
    } catch (e) {
      return _handleError(e);
    }
  }

  static ApiResponse<T> _handleError<T>(dynamic e) {
    String msg = "Lỗi kết nối";
    int code = 9999;
    if (e is DioException && e.response != null) {
      final data = e.response!.data;
      if (data is Map) {
        msg = data['message'] ?? msg;
        code = data['code'] ?? code;
      }
    }
    return ApiResponse<T>(code: code, message: msg);
  }
}
