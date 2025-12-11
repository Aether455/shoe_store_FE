import 'package:app_cua_toi/data/models/product_model.dart';
import 'package:dio/dio.dart';
import '../data/network/api_client.dart';
import '../data/models/api_response.dart'; // Đã tạo ở bước trước

class ProductService {
  static final Dio _dio = ApiClient.instance;

  // Lấy danh sách sản phẩm (Home/Category)
  static Future<ApiResponse<List<SimpleProduct>>> filterProducts({
    int? categoryId,
    int? brandId,
    double? minPrice,
    double? maxPrice,
    int page = 0,
    int size = 10,
  }) async {
    try {
      // Tạo map query parameters
      final Map<String, dynamic> params = {'page': page, 'size': size};

      // Chỉ thêm vào params nếu giá trị không null
      if (categoryId != null) params['categoryId'] = categoryId;
      if (brandId != null) params['brandId'] = brandId;
      if (minPrice != null) params['minPrice'] = minPrice;
      if (maxPrice != null) params['maxPrice'] = maxPrice;

      final response = await _dio.get(
        '/user/products/filter',
        queryParameters: params,
      );

      return ApiResponse<List<SimpleProduct>>.fromJson(response.data, (json) {
        final content = json['content'] as List;
        return content.map((e) => SimpleProduct.fromJson(e)).toList();
      });
    } catch (e) {
      return _handleError(e);
    }
  }

  // Lấy chi tiết sản phẩm
  static Future<ApiResponse<ProductDetail>> getProductDetail(int id) async {
    try {
      final response = await _dio.get('/user/products/$id');
      return ApiResponse<ProductDetail>.fromJson(
        response.data,
        (json) => ProductDetail.fromJson(json),
      );
    } catch (e) {
      return _handleError(e);
    }
  }

  // Tìm kiếm sản phẩm
  static Future<ApiResponse<List<SearchProduct>>> searchProducts(
    String keyword,
    int page,
  ) async {
    try {
      final response = await _dio.get(
        '/user/products/search',
        queryParameters: {'keyword': keyword, 'page': page},
      );
      return ApiResponse<List<SearchProduct>>.fromJson(response.data, (json) {
        final content = json['content'] as List;
        return content.map((e) => SearchProduct.fromJson(e)).toList();
      });
    } catch (e) {
      return _handleError(e);
    }
  }

  // Helper xử lý lỗi
  static ApiResponse<T> _handleError<T>(dynamic e) {
    String msg = "Lỗi kết nối hoặc lỗi không xác định";
    int code = 9999;

    if (e is DioException) {
      if (e.response != null && e.response!.data is Map) {
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
