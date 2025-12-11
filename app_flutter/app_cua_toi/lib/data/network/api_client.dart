import 'package:dio/dio.dart';
import 'package:flutter/material.dart'; // Cần import material để dùng GlobalKey
import '../../config/app_config.dart';
import '../storage/token_storage.dart';

// XÓA DÒNG NÀY: import '../../main.dart';

class ApiClient {
  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.BASE_URL,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      contentType: Headers.jsonContentType,
    ),
  );

  static bool _isRefreshing = false;
  static List<Function> _failedRequests = [];

  // 1. Thêm biến để lưu navigatorKey bên trong class này
  static GlobalKey<NavigatorState>? _navigatorKey;

  // 2. Sửa hàm init để nhận navigatorKey từ bên ngoài truyền vào
  static void init({GlobalKey<NavigatorState>? navigatorKey}) {
    _navigatorKey = navigatorKey; // Lưu lại key

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await TokenStorage.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.response?.statusCode == 401) {
            final token = await TokenStorage.getToken();
            if (token != null) {
              if (_isRefreshing) {
                return _failedRequests.add(() {
                  final opts = e.requestOptions;
                  TokenStorage.getToken().then((newToken) {
                    opts.headers['Authorization'] = 'Bearer $newToken';
                    _dio
                        .fetch(opts)
                        .then(
                          (r) => handler.resolve(r),
                          onError: (e) => handler.next(e),
                        );
                  });
                });
              }

              _isRefreshing = true;

              try {
                final refreshDio = Dio(
                  BaseOptions(baseUrl: AppConfig.BASE_URL),
                );
                final newResponse = await refreshDio.post(
                  '/auth/refresh',
                  data: {'token': token},
                );

                final newToken = newResponse.data['result']['token'];
                await TokenStorage.saveToken(newToken);

                _processFailedRequests(newToken, handler);
                _isRefreshing = false;

                final opts = e.requestOptions;
                opts.headers['Authorization'] = 'Bearer $newToken';
                final clonedRequest = await _dio.fetch(opts);
                return handler.resolve(clonedRequest);
              } catch (refreshError) {
                _isRefreshing = false;
                _failedRequests.clear();
                await _forceLogout();
                return handler.reject(e);
              }
            }
          }
          return handler.next(e);
        },
      ),
    );
  }

  static void _processFailedRequests(
    String newToken,
    ErrorInterceptorHandler handler,
  ) {
    for (var callback in _failedRequests) {
      callback();
    }
    _failedRequests.clear();
  }

  // 3. Sử dụng _navigatorKey đã được lưu
  static Future<void> _forceLogout() async {
    await TokenStorage.deleteToken();
    // Kiểm tra null trước khi dùng
    _navigatorKey?.currentState?.pushNamedAndRemoveUntil(
      '/login',
      (route) => false,
    );
  }

  static Dio get instance => _dio;
}
