import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../data/models/auth_model.dart';
import '../data/network/api_client.dart';
import '../data/storage/token_storage.dart';
import '../data/models/api_response.dart';
import '../data/models/user_model.dart';

class AuthService {
  static final Dio _dio = ApiClient.instance;
  static SimpleUserInfo? currentUser;

  // ⭐ BIẾN QUAN TRỌNG: Để UI lắng nghe thay đổi trạng thái đăng nhập
  static final ValueNotifier<bool> isLoggedInNotifier = ValueNotifier(false);

  static bool get isLoggedIn => currentUser != null;
  static String? get userEmail => currentUser?.email;

  // Khởi tạo: Kiểm tra token khi mở app
  static Future<void> checkLoginStatus() async {
    final token = await TokenStorage.getToken();
    if (token != null) {
      await fetchMyInfo();
    } else {
      isLoggedInNotifier.value = false;
    }
  }

  static Future<ApiResponse<AuthResponse>> login(
    String username,
    String password,
  ) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: LoginRequest(username: username, password: password).toJson(),
      );

      final apiResponse = ApiResponse<AuthResponse>.fromJson(
        response.data,
        (json) => AuthResponse.fromJson(json),
      );

      if (apiResponse.code == 1000 && apiResponse.result != null) {
        await TokenStorage.saveToken(apiResponse.result!.token);
        await fetchMyInfo(); // Lấy info xong mới set true
      }
      return apiResponse;
    } catch (e) {
      return _handleError(e);
    }
  }

  static Future<void> logout() async {
    try {
      final token = await TokenStorage.getToken();
      if (token != null) {
        await _dio.post('/auth/logout', data: {'token': token});
      }
    } catch (_) {
    } finally {
      await TokenStorage.deleteToken();
      currentUser = null;
      isLoggedInNotifier.value = false; // ⭐ Cập nhật UI
    }
  }

  static Future<void> fetchMyInfo() async {
    try {
      final response = await _dio.get('/users/me');
      if (response.data['code'] == 1000) {
        currentUser = SimpleUserInfo.fromJson(response.data['result']);
        isLoggedInNotifier.value = true; // ⭐ Cập nhật UI
      } else {
        currentUser = null;
        isLoggedInNotifier.value = false;
      }
    } catch (_) {
      currentUser = null;
      isLoggedInNotifier.value = false;
    }
  }

  static Future<ApiResponse<void>> register(RegisterRequest request) async {
    try {
      final response = await _dio.post(
        '/users/customers',
        data: request.toJson(),
      );
      return ApiResponse<void>.fromJson(response.data, null);
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
