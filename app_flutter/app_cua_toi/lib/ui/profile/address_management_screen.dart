import 'package:flutter/material.dart';
import '../../services/address_service.dart';
import '../../data/models/user_model.dart';

class AddressManagementScreen extends StatefulWidget {
  final int customerId;
  const AddressManagementScreen({super.key, required this.customerId});

  @override
  State<AddressManagementScreen> createState() =>
      _AddressManagementScreenState();
}

class _AddressManagementScreenState extends State<AddressManagementScreen> {
  @override
  void initState() {
    super.initState();
    // Gọi fetch để đổ dữ liệu vào stream
    AddressService.fetchAddresses(widget.customerId);
  }

  void _deleteAddress(int id) async {
    bool confirm =
        await showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text("Xác nhận"),
            content: const Text("Bạn có chắc chắn muốn xóa địa chỉ này?"),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text("Hủy"),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                child: const Text("Xóa", style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ) ??
        false;

    if (confirm) {
      final response = await AddressService.deleteAddress(
        id,
        widget.customerId,
      );
      if (response.code != 1000 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.message),
            backgroundColor: Colors.red,
          ),
        );
      } else if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text("Đã xóa địa chỉ")));
      }
    }
  }

  void _showAddDialog() {
    showDialog(
      context: context,
      builder: (context) => _AddAddressDialog(customerId: widget.customerId),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text("Sổ địa chỉ", style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: const BackButton(color: Colors.black),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Color(0xFFE30019)),
            onPressed: _showAddDialog,
          ),
        ],
      ),
      body: StreamBuilder<List<Address>>(
        stream: AddressService.addressStream,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting &&
              !snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          final addresses = snapshot.data ?? [];

          if (addresses.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.map_outlined, size: 80, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  const Text(
                    "Chưa có địa chỉ nào",
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _showAddDialog,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE30019),
                    ),
                    child: const Text(
                      "Thêm địa chỉ mới",
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: addresses.length,
            separatorBuilder: (c, i) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              return _buildAddressCard(addresses[index]);
            },
          );
        },
      ),
    );
  }

  Widget _buildAddressCard(Address item) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 5),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.location_on, color: Colors.orange, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.address,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  "${item.ward}, ${item.district}",
                  style: TextStyle(color: Colors.grey[700]),
                ),
                Text(item.province, style: TextStyle(color: Colors.grey[700])),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: Colors.red),
            onPressed: () => _deleteAddress(item.id),
          ),
        ],
      ),
    );
  }
}

class _AddAddressDialog extends StatefulWidget {
  final int customerId;
  const _AddAddressDialog({required this.customerId});

  @override
  State<_AddAddressDialog> createState() => _AddAddressDialogState();
}

class _AddAddressDialogState extends State<_AddAddressDialog> {
  final _formKey = GlobalKey<FormState>();
  final _addressCtrl = TextEditingController();
  final _wardCtrl = TextEditingController();
  final _districtCtrl = TextEditingController();
  final _provinceCtrl = TextEditingController();
  bool _submitting = false;

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _submitting = true);
      final response = await AddressService.createAddress(
        customerId: widget.customerId,
        address: _addressCtrl.text,
        ward: _wardCtrl.text,
        district: _districtCtrl.text,
        province: _provinceCtrl.text,
      );
      setState(() => _submitting = false);

      if (response.code == 1000 && mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Thêm thành công"),
            backgroundColor: Colors.green,
          ),
        );
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.message),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text("Thêm địa chỉ"),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _input(_addressCtrl, "Số nhà / Đường"),
              const SizedBox(height: 10),
              _input(_wardCtrl, "Phường / Xã"),
              const SizedBox(height: 10),
              _input(_districtCtrl, "Quận / Huyện"),
              const SizedBox(height: 10),
              _input(_provinceCtrl, "Tỉnh / Thành phố"),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text("Hủy"),
        ),
        ElevatedButton(
          onPressed: _submitting ? null : _submit,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFE30019),
          ),
          child: _submitting
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(color: Colors.white),
                )
              : const Text("Lưu", style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }

  Widget _input(TextEditingController ctrl, String label) {
    return TextFormField(
      controller: ctrl,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
        isDense: true,
      ),
      validator: (v) => v!.isEmpty ? "Nhập thông tin" : null,
    );
  }
}
