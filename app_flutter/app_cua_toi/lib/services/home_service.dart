import 'package:dio/dio.dart';
import '../data/network/api_client.dart';
import '../data/models/api_response.dart';
import '../data/models/brand_model.dart';
import '../data/models/category_model.dart';

class HomeService {
  static final Dio _dio = ApiClient.instance;

  static Future<ApiResponse<List<Brand>>> getBrands() async {
    try {
      final response = await _dio.get('/user/brands');
      return ApiResponse<List<Brand>>.fromJson(response.data, (json) {
        final list = json as List;
        return list.map((e) => Brand.fromJson(e)).toList();
      });
    } catch (e) {
      return _handleError(e);
    }
  }

  static Future<ApiResponse<List<Category>>> getCategories() async {
    try {
      final response = await _dio.get('/user/categories');
      return ApiResponse<List<Category>>.fromJson(response.data, (json) {
        final list = json as List;
        return list.map((e) => Category.fromJson(e)).toList();
      });
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
