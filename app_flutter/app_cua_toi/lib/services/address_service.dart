import 'package:dio/dio.dart';
import '../data/network/api_client.dart';
import '../data/models/api_response.dart';
import '../data/models/user_model.dart';

class AddressService {
  static final Dio _dio = ApiClient.instance;

  static Future<ApiResponse<List<Address>>> getAddressesByCustomerId(
    int customerId,
  ) async {
    try {
      final response = await _dio.get('/addresses/$customerId');
      return ApiResponse<List<Address>>.fromJson(response.data, (json) {
        final list = json as List;
        return list.map((e) => Address.fromJson(e)).toList();
      });
    } catch (e) {
      return _handleError(e);
    }
  }

  static Future<ApiResponse<Address>> createAddress({
    required int customerId,
    required String address,
    required String province,
    required String district,
    required String ward,
  }) async {
    try {
      final response = await _dio.post(
        '/addresses',
        data: {
          'customerId': customerId,
          'address': address,
          'province': province,
          'district': district,
          'ward': ward,
        },
      );
      return ApiResponse<Address>.fromJson(
        response.data,
        (json) => Address.fromJson(json),
      );
    } catch (e) {
      return _handleError(e);
    }
  }

  static Future<ApiResponse<String>> deleteAddress(int addressId) async {
    try {
      final response = await _dio.delete('/addresses/$addressId');
      return ApiResponse<String>.fromJson(
        response.data,
        (json) => json.toString(),
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
