import 'package:flutter/material.dart';
import '../../services/order_service.dart';
import '../../data/models/order_models.dart';
import '../home/custom_app_bar.dart';

class OrderDetailPage extends StatefulWidget {
  final int orderId;
  const OrderDetailPage({super.key, required this.orderId});

  @override
  State<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends State<OrderDetailPage> {
  // Cập nhật kiểu dữ liệu Model
  OrderResponseForCustomer? _order;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchDetail();
  }

  void _fetchDetail() async {
    final response = await OrderService.getOrderById(widget.orderId);
    if (mounted) {
      setState(() {
        if (response.code == 1000) {
          _order = response.result;
        } else {
          // Có thể show lỗi hoặc pop về trang trước
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message),
              backgroundColor: Colors.red,
            ),
          );
        }
        _isLoading = false;
      });
    }
  }

  void _handleAction(bool isConfirm) async {
    setState(() => _isLoading = true);

    // Gọi API, nhận về ApiResponse
    final response = isConfirm
        ? await OrderService.confirmOrder(widget.orderId)
        : await OrderService.cancelOrder(widget.orderId);

    if (mounted) {
      if (response.code == 1000) {
        // Thành công
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              isConfirm ? "Đã xác nhận đơn hàng" : "Đã hủy đơn hàng",
            ),
            backgroundColor: Colors.green,
          ),
        );
        _fetchDetail(); // Reload lại để cập nhật trạng thái mới
        OrderService.fetchMyOrders();
      } else {
        // Thất bại -> Show message từ BE (VD: Không thể hủy đơn đang giao)
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("${response.message}. Vui lòng hủy đơn và đặt lại!"),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_order == null) {
      return const Scaffold(
        body: Center(child: Text("Không tìm thấy đơn hàng")),
      );
    }

    bool showActions = _order!.status == 'PENDING';

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: const CustomAppBar(showBackButton: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // 1. Header Trạng thái
            _buildSection(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Mã đơn: #${_order!.orderCode}",
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: getStatusColor(
                            _order!.status,
                          ).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(
                            color: getStatusColor(_order!.status),
                          ),
                        ),
                        child: Text(
                          _order!.status,
                          style: TextStyle(
                            color: getStatusColor(_order!.status),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Ngày đặt: ${_formatDate(_order!.createAt)}",
                    style: TextStyle(color: Colors.grey[600], fontSize: 13),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // 2. Thông tin nhận hàng
            _buildSection(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildTitle("Thông tin nhận hàng", Icons.location_on),
                  const SizedBox(height: 10),
                  Text(
                    _order!.receiverName,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _order!.phoneNumber,
                    style: TextStyle(color: Colors.grey[700]),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _order!.fullAddress,
                    style: TextStyle(color: Colors.grey[700]),
                  ), // Dùng getter fullAddress
                  if (_order!.note != null && _order!.note!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(8),
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        "Ghi chú: ${_order!.note}",
                        style: const TextStyle(
                          fontStyle: FontStyle.italic,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 12),

            // 3. Danh sách sản phẩm (Nested Objects)
            _buildSection(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildTitle("Sản phẩm", Icons.shopping_bag),
                  const SizedBox(height: 10),
                  ..._order!.orderItems.map(
                    (item) => Column(
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Ảnh sản phẩm từ nested object 'productVariant' hoặc 'product'
                            Container(
                              width: 60,
                              height: 60,
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey[200]!),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Image.network(
                                item.productVariant.productVariantImageUrl,
                                fit: BoxFit.contain,
                                errorBuilder: (c, e, s) => const Icon(
                                  Icons.image_not_supported,
                                  color: Colors.grey,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Tên sản phẩm
                                  Text(
                                    item.product.name,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  // Phân loại (Variant)
                                  Text(
                                    "Phân loại: ${item.productVariant.variantString}",
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        _formatCurrency(item.pricePerUnit),
                                        style: const TextStyle(fontSize: 13),
                                      ),
                                      Text(
                                        "x${item.quantity}",
                                        style: const TextStyle(fontSize: 13),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              _formatCurrency(item.totalPrice),
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 20),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // 4. Thanh toán
            _buildSection(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildTitle("Thanh toán", Icons.payment),
                  const SizedBox(height: 10),
                  _rowInfo(
                    "Phương thức",
                    _order!.payment?.method == "BANK_TRANSFER"
                        ? "Chuyển khoản"
                        : "Tiền mặt (COD)",
                  ),
                  _rowInfo(
                    "Tổng tiền hàng",
                    _formatCurrency(_order!.totalAmount),
                  ),
                  if (_order!.reducedAmount > 0)
                    _rowInfo(
                      "Voucher giảm giá",
                      "-${_formatCurrency(_order!.reducedAmount)}",
                      color: Colors.green,
                    ),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "THÀNH TIỀN",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Text(
                        _formatCurrency(_order!.finalAmount),
                        style: const TextStyle(
                          color: Color(0xFFE30019),
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            if (showActions) ...[
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _handleAction(false),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: const BorderSide(color: Colors.red),
                      ),
                      child: const Text(
                        "HỦY ĐƠN HÀNG",
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => _handleAction(true),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        backgroundColor: Colors.blue,
                      ),
                      child: const Text(
                        "XÁC NHẬN ĐƠN",
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSection({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 5),
        ],
      ),
      child: child,
    );
  }

  Widget _buildTitle(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Colors.grey[700]),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _rowInfo(String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.black54)),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w500,
              color: color ?? Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  String _formatCurrency(double price) =>
      "${price.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ";

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return "${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute}";
    } catch (_) {
      return dateStr;
    }
  }
}
