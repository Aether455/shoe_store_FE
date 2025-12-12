import 'dart:async';
import 'package:dio/dio.dart';
import '../data/network/api_client.dart';
import '../data/models/api_response.dart';
import '../data/models/user_model.dart';

class AddressService {
  static final Dio _dio = ApiClient.instance;

  static final StreamController<List<Address>> _addressController =
      StreamController<List<Address>>.broadcast();
  static Stream<List<Address>> get addressStream => _addressController.stream;

  static List<Address> _currentAddresses = [];

  static Future<void> fetchAddresses(int customerId) async {
    try {
      final response = await _dio.get('/addresses/$customerId');
      if (response.data['code'] == 1000) {
        final list = response.data['result'] as List;
        _currentAddresses = list.map((e) => Address.fromJson(e)).toList();
        _addressController.add(_currentAddresses);
      }
    } catch (e) {
      print('Fetch Address Error: $e');
    }
  }

  static Future<ApiResponse<List<Address>>> getAddressesByCustomerId(
    int customerId,
  ) async {
    try {
      final response = await _dio.get('/addresses/$customerId');
      final apiResponse = ApiResponse<List<Address>>.fromJson(response.data, (
        json,
      ) {
        final list = json as List;
        return list.map((e) => Address.fromJson(e)).toList();
      });

      if (apiResponse.code == 1000) {
        _currentAddresses = apiResponse.result ?? [];
        _addressController.add(_currentAddresses);
      }
      return apiResponse;
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

      final apiResponse = ApiResponse<Address>.fromJson(
        response.data,
        (json) => Address.fromJson(json),
      );

      if (apiResponse.code == 1000) {
        await fetchAddresses(customerId); // Refresh list
      }
      return apiResponse;
    } catch (e) {
      return _handleError(e);
    }
  }

  static Future<ApiResponse<String>> deleteAddress(
    int addressId,
    int customerId,
  ) async {
    try {
      final response = await _dio.delete('/addresses/$addressId');
      final apiResponse = ApiResponse<String>.fromJson(
        response.data,
        (json) => json.toString(),
      );

      if (apiResponse.code == 1000) {
        await fetchAddresses(customerId); // Refresh list
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
    _currentAddresses = [];
    _addressController.add([]);
  }
}
