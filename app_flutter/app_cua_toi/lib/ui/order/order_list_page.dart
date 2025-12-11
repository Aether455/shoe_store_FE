import 'package:flutter/material.dart';
import '../../services/order_service.dart';
import '../../data/models/order_models.dart';
import '../home/custom_app_bar.dart';
import 'order_detail_page.dart';

class OrderListPage extends StatefulWidget {
  const OrderListPage({super.key});

  @override
  State<OrderListPage> createState() => _OrderListPageState();
}

class _OrderListPageState extends State<OrderListPage> {
  // Cập nhật kiểu dữ liệu List
  List<SimpleOrderResponse> _orders = [];
  bool _isLoading = true;
  final ScrollController _scrollController = ScrollController();
  int _page = 0;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _fetchOrders();
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
              _scrollController.position.maxScrollExtent - 200 &&
          !_isLoading &&
          _hasMore) {
        _fetchOrders();
      }
    });
  }

  Future<void> _fetchOrders() async {
    if (_isLoading && _page > 0) return;

    setState(() => _isLoading = true);

    // Gọi API
    final response = await OrderService.getMyOrders(page: _page);

    if (mounted) {
      setState(() {
        _isLoading = false;

        // Kiểm tra thành công
        if (response.code == 1000 && response.result != null) {
          final newOrders = response.result!;
          _orders.addAll(newOrders);

          if (newOrders.length < 10) {
            _hasMore = false;
          } else {
            _page++;
          }
        } else {
          print(response.message);
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: const CustomAppBar(showBackButton: true),
      body: Column(
        children: [
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "Đơn hàng của tôi",
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          Expanded(
            child: _orders.isEmpty && !_isLoading
                ? const Center(child: Text("Bạn chưa có đơn hàng nào"))
                : ListView.separated(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: _orders.length + (_hasMore ? 1 : 0),
                    separatorBuilder: (c, i) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      if (index == _orders.length) {
                        return const Center(child: CircularProgressIndicator());
                      }
                      return _buildOrderItem(_orders[index]);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderItem(SimpleOrderResponse order) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => OrderDetailPage(orderId: order.id),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "Mã: #${order.orderCode}",
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  Text(
                    order.status,
                    style: TextStyle(
                      color: getStatusColor(order.status),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const Divider(height: 20),
              Text(
                "Người nhận: ${order.receiverName}",
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 4),
              Text(
                "Ngày đặt: ${_formatDate(order.createAt)}",
                style: TextStyle(color: Colors.grey[600], fontSize: 13),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  const Text("Thành tiền: ", style: TextStyle(fontSize: 14)),
                  Text(
                    _formatCurrency(order.finalAmount),
                    style: const TextStyle(
                      color: Color(0xFFE30019),
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatCurrency(double price) {
    return "${price.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ";
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return "${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute}";
    } catch (_) {
      return dateStr;
    }
  }
}
