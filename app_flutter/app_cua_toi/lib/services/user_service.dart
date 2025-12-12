import 'dart:async';
import 'package:dio/dio.dart';
import '../data/network/api_client.dart';
import '../data/models/api_response.dart';
import '../data/models/user_model.dart';

class UserService {
  static final Dio _dio = ApiClient.instance;

  // Stream cho Customer Profile
  static final StreamController<CustomerInfo?> _customerController =
      StreamController<CustomerInfo?>.broadcast();
  static Stream<CustomerInfo?> get customerStream => _customerController.stream;

  static CustomerInfo? _currentInfo;
  static CustomerInfo? get currentInfo => _currentInfo;

  // Lấy thông tin và đẩy vào Stream
  static Future<void> fetchCustomerProfile() async {
    try {
      final response = await _dio.get('/customers/me');
      if (response.data['code'] == 1000) {
        _currentInfo = CustomerInfo.fromJson(response.data['result']);
        _customerController.add(_currentInfo);
      } else {
        // _customerController.add(null);
      }
    } catch (e) {
      print('Get Profile Error: $e');
    }
  }

  // Trả về ApiResponse để UI xử lý loading/error, đồng thời update stream
  static Future<ApiResponse<CustomerInfo>> getCustomerProfileData() async {
    try {
      final response = await _dio.get('/customers/me');
      final apiResponse = ApiResponse<CustomerInfo>.fromJson(
        response.data,
        (json) => CustomerInfo.fromJson(json),
      );
      if (apiResponse.code == 1000 && apiResponse.result != null) {
        _currentInfo = apiResponse.result;
        _customerController.add(_currentInfo);
      }
      return apiResponse;
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

      final apiResponse = ApiResponse<CustomerInfo>.fromJson(
        response.data,
        (json) => CustomerInfo.fromJson(json),
      );

      if (apiResponse.code == 1000) {
        // Cập nhật thành công -> Refresh lại stream
        _currentInfo = apiResponse.result;
        _customerController.add(_currentInfo);
      }
      return apiResponse;
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

  static void dispose() {
    _currentInfo = null;
    _customerController.add(null);
  }
}
