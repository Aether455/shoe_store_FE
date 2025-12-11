import 'package:app_cua_toi/data/models/order_models.dart';
import 'package:app_cua_toi/data/models/voucher_model.dart';
import 'package:app_cua_toi/ui/cart/cart_page.dart';
import 'package:app_cua_toi/ui/order/order_success_page.dart';
import 'package:flutter/material.dart';
import '../../../../services/order_service.dart';
import '../../../../services/voucher_service.dart';
import '../../../../services/user_service.dart';
import '../../../../data/models/cart_model.dart';
import '../../../../data/models/user_model.dart'; // Address, CustomerInfo

class CheckoutPage extends StatefulWidget {
  final List<CartItem> cartList;
  final VoidCallback refresh;

  const CheckoutPage({
    super.key,
    required this.cartList,
    required this.refresh,
  });

  @override
  State<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  // Controller
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _noteController = TextEditingController();
  final _voucherController = TextEditingController();

  // State
  CustomerInfo? _customerInfo;
  Address? _selectedAddress;
  Voucher? _appliedVoucher;
  String _paymentMethod = 'CASH'; // CASH or BANK_TRANSFER
  bool _isLoading = false;
  String _voucherError = "";

  double get _totalAmount =>
      widget.cartList.fold(0, (sum, item) => sum + item.totalPrice);

  double get _discountAmount {
    if (_appliedVoucher == null) return 0;

    // Logic tính giảm giá (giống BE)
    // BE có logic check minApplicablePrice, maxDiscountAmount
    if (_totalAmount < _appliedVoucher!.minApplicablePrice) return 0;

    double discount = 0;
    if (_appliedVoucher!.type == 'PERCENTAGE') {
      discount = _totalAmount * _appliedVoucher!.discountValue / 100;
    } else {
      discount = _appliedVoucher!.discountValue;
    }

    if (_appliedVoucher!.maxDiscountAmount > 0) {
      discount = discount > _appliedVoucher!.maxDiscountAmount
          ? _appliedVoucher!.maxDiscountAmount
          : discount;
    }

    return discount > _totalAmount ? _totalAmount : discount;
  }

  double get _finalAmount => _totalAmount - _discountAmount + 40000; // + Ship

  @override
  void initState() {
    super.initState();
    _fetchCustomerInfo();
  }

  void _fetchCustomerInfo() async {
    final response = await UserService.getCustomerProfile();
    if (mounted && response.result != null) {
      final info = response.result!;
      setState(() {
        _customerInfo = info;
        _nameController.text = info.fullName;
        _phoneController.text = info.phoneNumber;
        if (info.addresses.isNotEmpty) {
          _selectedAddress = info.addresses[0]; // Mặc định chọn địa chỉ đầu
        }
      });
    }
  }

  void _applyVoucher() async {
    setState(() {
      _voucherError = "";
      _appliedVoucher = null;
    });
    if (_voucherController.text.isEmpty) return;

    final voucher = await VoucherService.getVoucherByCode(
      _voucherController.text,
    );
    if (voucher != null) {
      // Check điều kiện cơ bản
      if (voucher.status != 'ACTIVE') {
        setState(() => _voucherError = "Voucher không khả dụng");
        return;
      }
      if (_totalAmount < voucher.minApplicablePrice) {
        setState(() => _voucherError = "Đơn hàng chưa đạt giá trị tối thiểu");
        return;
      }
      setState(() => _appliedVoucher = voucher);
    } else {
      setState(() => _voucherError = "Mã voucher không tồn tại");
    }
  }

  void _submitOrder() async {
    if (_selectedAddress == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Vui lòng chọn địa chỉ giao hàng")),
      );
      return;
    }

    setState(() => _isLoading = true);

    final request = OrderCreationRequest(
      phoneNumber: _phoneController.text,
      receiverName: _nameController.text,
      shippingAddress: _selectedAddress!.address,
      province: _selectedAddress!.province,
      district: _selectedAddress!.district,
      ward: _selectedAddress!.ward,
      note: _noteController.text,
      voucherCode: _appliedVoucher?.voucherCode,
      paymentMethod: _paymentMethod,
      orderItems: widget.cartList
          .map(
            (item) => OrderItemRequest(
              productId: item.productId,
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              pricePerUnit: item.price,
            ),
          )
          .toList(),
      totalAmount: _totalAmount,
    );

    // Gọi API (trả về ApiResponse)
    final response = await OrderService.createOrder(request);

    setState(() => _isLoading = false);

    // Kiểm tra Code chuẩn từ BE
    if (response.code == 1000 && response.result != null) {
      // Thành công -> Chuyển trang
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => OrderSuccessPage(
            orderId: response.result!.id,
            orderCode: response.result!.orderCode,
          ),
        ),
      );
    } else {
      // Thất bại -> Hiển thị message lỗi từ BE trả về
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response.message), // VD: "Sản phẩm A hết hàng"
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 900;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        title: const Text(
          "Thanh toán",
          style: TextStyle(
            color: Color(0xFFE30019),
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          // CHỈ CẦN POP LÀ VỀ CART
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: isDesktop
            ? Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: 2, child: _buildLeftColumn()),
                  const SizedBox(width: 30),
                  Expanded(flex: 1, child: _buildRightColumn()),
                ],
              )
            : Column(
                children: [
                  _buildLeftColumn(),
                  const SizedBox(height: 30),
                  _buildRightColumn(),
                ],
              ),
      ),
    );
  }

  Widget _buildLeftColumn() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader("Thông tin nhận hàng"),
        const SizedBox(height: 15),
        TextField(
          controller: _nameController,
          decoration: const InputDecoration(
            labelText: "Họ và tên",
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 15),
        TextField(
          controller: _phoneController,
          decoration: const InputDecoration(
            labelText: "Số điện thoại",
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 15),

        // Chọn địa chỉ
        const Text(
          "Địa chỉ giao hàng:",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 10),
        if (_customerInfo != null && _customerInfo!.addresses.isNotEmpty)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey),
              borderRadius: BorderRadius.circular(4),
            ),
            child: DropdownButton<Address>(
              isExpanded: true,
              value: _selectedAddress,
              underline: const SizedBox(),
              items: _customerInfo!.addresses.map((addr) {
                return DropdownMenuItem(
                  value: addr,
                  child: Text(
                    "${addr.address}, ${addr.ward}, ${addr.district}, ${addr.province}",
                    overflow: TextOverflow.ellipsis,
                  ),
                );
              }).toList(),
              onChanged: (val) => setState(() => _selectedAddress = val),
            ),
          )
        else
          const Text(
            "Bạn chưa có địa chỉ. Vui lòng thêm trong Profile.",
            style: TextStyle(color: Colors.red),
          ),

        const SizedBox(height: 15),
        TextField(
          controller: _noteController,
          decoration: const InputDecoration(
            labelText: "Ghi chú (Tùy chọn)",
            border: OutlineInputBorder(),
          ),
          maxLines: 2,
        ),

        const SizedBox(height: 30),
        _buildSectionHeader("Phương thức thanh toán"),
        const SizedBox(height: 10),
        RadioListTile(
          value: 'CASH',
          groupValue: _paymentMethod,
          onChanged: (val) => setState(() => _paymentMethod = val.toString()),
          title: const Text("Thanh toán khi nhận hàng (COD)"),
          activeColor: const Color(0xFFE30019),
        ),
        RadioListTile(
          value: 'BANK_TRANSFER',
          groupValue: _paymentMethod,
          onChanged: (val) => setState(() => _paymentMethod = val.toString()),
          title: const Text("Chuyển khoản ngân hàng"),
          activeColor: const Color(0xFFE30019),
        ),
      ],
    );
  }

  Widget _buildRightColumn() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Đơn hàng (${widget.cartList.length} sản phẩm)",
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 15),
          ...widget.cartList.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: [
                  Image.network(
                    item.productImageUrl,
                    width: 50,
                    height: 50,
                    fit: BoxFit.cover,
                    errorBuilder: (c, e, s) => const Icon(Icons.image),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.productName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          "${item.quantity} x ${_formatCurrency(item.price)}",
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    _formatCurrency(item.totalPrice),
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
          const Divider(),

          // Voucher
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _voucherController,
                  decoration: InputDecoration(
                    hintText: "Nhập mã giảm giá",
                    errorText: _voucherError.isNotEmpty ? _voucherError : null,
                    isDense: true,
                    border: const OutlineInputBorder(),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              ElevatedButton(
                onPressed: _applyVoucher,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF5DADE2),
                ),
                child: const Text(
                  "Áp dụng",
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
          if (_appliedVoucher != null)
            Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: Text(
                "Đã áp dụng: ${_appliedVoucher!.name}",
                style: const TextStyle(
                  color: Colors.green,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),

          const SizedBox(height: 20),
          _summaryRow("Tạm tính", _formatCurrency(_totalAmount)),
          if (_discountAmount > 0)
            _summaryRow(
              "Giảm giá",
              "-${_formatCurrency(_discountAmount)}",
              color: Colors.green,
            ),
          _summaryRow("Phí vận chuyển", "40.000đ"),
          const Divider(),
          _summaryRow(
            "Tổng cộng",
            _formatCurrency(_finalAmount),
            isBold: true,
            color: const Color(0xFFE30019),
            fontSize: 20,
          ),

          const SizedBox(height: 30),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _submitOrder,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE30019),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text(
                      "ĐẶT HÀNG",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
    );
  }

  Widget _summaryRow(
    String label,
    String value, {
    bool isBold = false,
    Color? color,
    double fontSize = 14,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 14)),
          Text(
            value,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: color,
              fontSize: fontSize,
            ),
          ),
        ],
      ),
    );
  }

  String _formatCurrency(double price) {
    return "${price.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ";
  }
}
