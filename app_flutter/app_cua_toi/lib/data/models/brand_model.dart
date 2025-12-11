class Brand {
  final String id;
  final String name;
  final String description;

  Brand({required this.id, required this.name, required this.description});

  factory Brand.fromJson(Map<String, dynamic> json) {
    return Brand(
      id: json['id'],
      name: json['name'],
      description: json['description'] ?? '',
    );
  }
}
