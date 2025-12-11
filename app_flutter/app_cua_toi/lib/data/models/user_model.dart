// DTO: SimpleUserInfoResponse (GET /users/me)
class SimpleUserInfo {
  final String id;
  final String username;
  final String email;

  SimpleUserInfo({
    required this.id,
    required this.username,
    required this.email,
  });

  factory SimpleUserInfo.fromJson(Map<String, dynamic> json) {
    return SimpleUserInfo(
      id: json['id'],
      username: json['username'],
      email: json['email'],
    );
  }
}

// DTO: CustomerResponseForUser (GET /customers/me)
class CustomerInfo {
  final int id; // Backend trả về Long -> Dart là int
  final String fullName;
  final String phoneNumber;
  final List<Address> addresses;
  final String createAt; // Bỏ qua nếu chưa cần hiển thị phức tạp

  CustomerInfo({
    required this.id,
    required this.fullName,
    required this.phoneNumber,
    required this.addresses,
    required this.createAt,
  });

  factory CustomerInfo.fromJson(Map<String, dynamic> json) {
    var list = json['addresses'] as List? ?? [];
    List<Address> addressList = list.map((i) => Address.fromJson(i)).toList();

    return CustomerInfo(
      id: json['id'],
      fullName: json['fullName'],
      phoneNumber: json['phoneNumber'],
      addresses: addressList,
      createAt: json['createAt'],
    );
  }
}

// DTO: AddressResponse
class Address {
  final int id;
  final String address;
  final String province;
  final String district;
  final String ward;

  Address({
    required this.id,
    required this.address,
    required this.province,
    required this.district,
    required this.ward,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['id'],
      address: json['address'] ?? '',
      province: json['province'] ?? '',
      district: json['district'] ?? '',
      ward: json['ward'] ?? '',
    );
  }

  // Dùng để gửi lên BE nếu cần update
  Map<String, dynamic> toJson() => {
    'id': id, // Có thể null nếu tạo mới
    'address': address,
    'province': province,
    'district': district,
    'ward': ward,
  };
}

// DTO: CustomerUpdateRequest
class CustomerUpdateRequest {
  final String fullName;
  final String phoneNumber;
  final List<Address> addresses;

  CustomerUpdateRequest({
    required this.fullName,
    required this.phoneNumber,
    required this.addresses,
  });

  Map<String, dynamic> toJson() => {
    'fullName': fullName,
    'phoneNumber': phoneNumber,
    'addresses': addresses.map((e) => e.toJson()).toList(),
  };
}
