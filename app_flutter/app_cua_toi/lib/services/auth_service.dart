import 'dart:async';
import 'package:app_cua_toi/services/address_service.dart';
import 'package:app_cua_toi/services/user_service.dart';
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../data/models/auth_model.dart';
import '../data/network/api_client.dart';
import '../data/storage/token_storage.dart';
import '../data/models/api_response.dart';
import '../data/models/user_model.dart';

class AuthService {
  static final Dio _dio = ApiClient.instance;

  // --- STREAM CONTROLLER ---
  // Stream trạng thái đăng nhập (true/false)
  static final StreamController<bool> _authController =
      StreamController<bool>.broadcast();
  static Stream<bool> get authStream => _authController.stream;

  // Stream thông tin user cơ bản (SimpleUserInfo)
  static final StreamController<SimpleUserInfo?> _userController =
      StreamController<SimpleUserInfo?>.broadcast();
  static Stream<SimpleUserInfo?> get userStream => _userController.stream;

  // Cache data
  static SimpleUserInfo? _currentUser;
  static SimpleUserInfo? get currentUser => _currentUser;
  static bool get isLoggedIn => _currentUser != null;

  // Giữ lại ValueNotifier cho các Widget đơn giản (như CustomAppBar icon) nếu muốn,
  // hoặc dùng StreamBuilder luôn. Ở đây tôi giữ lại để tương thích code cũ.
  static final ValueNotifier<bool> isLoggedInNotifier = ValueNotifier(false);

  // Khởi tạo
  static Future<void> checkLoginStatus() async {
    final token = await TokenStorage.getToken();
    if (token != null) {
      await fetchMyInfo();
    } else {
      _updateAuthState(null);
    }
  }

  // Cập nhật trạng thái chung
  static void _updateAuthState(SimpleUserInfo? user) {
    _currentUser = user;
    isLoggedInNotifier.value = user != null;
    _authController.add(user != null);
    _userController.add(user);
  }

  static Future<ApiResponse<AuthResponse>> login(
    String username,
    String password,
  ) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {'username': username, 'password': password},
      );

      final apiResponse = ApiResponse<AuthResponse>.fromJson(
        response.data,
        (json) => AuthResponse.fromJson(json),
      );

      if (apiResponse.code == 1000 && apiResponse.result != null) {
        await TokenStorage.saveToken(apiResponse.result!.token);
        await fetchMyInfo();
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
      _updateAuthState(null);
      // Xóa data của các service khác khi logout
      UserService.dispose();
      AddressService.dispose();
      // CartService đã có dispose riêng
    }
  }

  static Future<void> fetchMyInfo() async {
    try {
      final response = await _dio.get('/users/me');
      if (response.data['code'] == 1000) {
        final user = SimpleUserInfo.fromJson(response.data['result']);
        _updateAuthState(user);
      } else {
        _updateAuthState(null);
      }
    } catch (_) {
      _updateAuthState(null);
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
