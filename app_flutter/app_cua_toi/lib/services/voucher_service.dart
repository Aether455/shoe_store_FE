import 'package:app_cua_toi/data/models/voucher_model.dart';
import 'package:dio/dio.dart';
import '../data/network/api_client.dart';

class VoucherService {
  static final Dio _dio = ApiClient.instance;

  static Future<Voucher?> getVoucherByCode(String code) async {
    try {
      final response = await _dio.get('/user/vouchers/$code');
      if (response.data['code'] == 1000) {
        return Voucher.fromJson(response.data['result']);
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
