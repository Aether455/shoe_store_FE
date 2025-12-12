import 'dart:async';
import 'package:app_cua_toi/data/models/product_model.dart';
import 'package:dio/dio.dart';
import '../data/network/api_client.dart';
import '../data/models/api_response.dart';

class ProductService {
  static final Dio _dio = ApiClient.instance;

  // --- STREAM CONTROLLER CHO CHI TIẾT SẢN PHẨM ---
  static final StreamController<ProductDetail?> _productDetailController =
      StreamController<ProductDetail?>.broadcast();

  static Stream<ProductDetail?> get productDetailStream =>
      _productDetailController.stream;

  // 1. Lấy chi tiết sản phẩm (Fetch & Push to Stream)
  static Future<void> fetchProductDetail(int id) async {
    try {
      // Gọi API
      final response = await _dio.get('/user/products/$id');

      final apiResponse = ApiResponse<ProductDetail>.fromJson(
        response.data,
        (json) => ProductDetail.fromJson(json),
      );

      if (apiResponse.code == 1000 && apiResponse.result != null) {
        // Đẩy dữ liệu mới vào Stream
        _productDetailController.add(apiResponse.result);
      } else {
        _productDetailController.addError(apiResponse.message);
      }
    } catch (e) {
      _productDetailController.addError(_handleError(e).message);
    }
  }

  // Hàm dọn dẹp data khi thoát màn hình detail
  static void clearDetail() {
    // Đẩy null vào để reset hoặc không làm gì tùy logic,
    // ở đây ta không cần làm gì vì mỗi lần vào trang mới sẽ fetch lại
  }

  // 2. Lấy danh sách sản phẩm (Home/Category) - Giữ nguyên logic cũ
  static Future<ApiResponse<List<SimpleProduct>>> getProducts({
    int page = 0,
    int size = 10,
    String sortBy = 'id',
    int? categoryId,
    int? brandId,
  }) async {
    try {
      String path = '/user/products';
      if (categoryId != null) {
        path = '/user/products/category/$categoryId';
      } else if (brandId != null) {
        path = '/user/products/brand/$brandId';
      }

      final response = await _dio.get(
        path,
        queryParameters: {'page': page, 'size': size, 'sortBy': sortBy},
      );

      return ApiResponse<List<SimpleProduct>>.fromJson(response.data, (json) {
        final content = json['content'] as List;
        return content.map((e) => SimpleProduct.fromJson(e)).toList();
      });
    } catch (e) {
      return _handleError(e);
    }
  }

  // 3. Lọc sản phẩm
  static Future<ApiResponse<List<SimpleProduct>>> filterProducts({
    int? categoryId,
    int? brandId,
    double? minPrice,
    double? maxPrice,
    int page = 0,
    int size = 10,
  }) async {
    try {
      final Map<String, dynamic> params = {'page': page, 'size': size};
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

  // 4. Tìm kiếm sản phẩm
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
