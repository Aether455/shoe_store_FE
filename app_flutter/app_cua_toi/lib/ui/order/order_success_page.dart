import 'package:app_cua_toi/ui/home/home_page.dart';
import 'package:app_cua_toi/ui/order/order_detail_page.dart';
import 'package:flutter/material.dart';

class OrderSuccessPage extends StatelessWidget {
  final int orderId;
  final String orderCode;

  const OrderSuccessPage({
    super.key,
    required this.orderId,
    required this.orderCode,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(30),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle, color: Colors.green, size: 80),
              const SizedBox(height: 20),
              const Text(
                "Đặt hàng thành công!",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              Text(
                "Mã đơn hàng: $orderCode",
                style: const TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 40),

              ElevatedButton(
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => OrderDetailPage(orderId: orderId),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF5DADE2),
                  minimumSize: const Size(double.infinity, 50),
                ),
                child: const Text(
                  "XEM CHI TIẾT ĐƠN HÀNG",
                  style: TextStyle(color: Colors.white),
                ),
              ),
              const SizedBox(height: 15),
              OutlinedButton(
                onPressed: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const HomePage()),
                    (route) => false,
                  );
                },
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 50),
                ),
                child: const Text("VỀ TRANG CHỦ"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
