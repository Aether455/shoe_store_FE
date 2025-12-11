import 'package:app_cua_toi/data/models/api_response.dart';
import 'package:app_cua_toi/data/models/product_model.dart';
import 'package:flutter/material.dart';
import '../../services/product_service.dart';
import '../widgets/product_card.dart';

class ProductSearchDelegate extends SearchDelegate {
  @override
  List<Widget>? buildActions(BuildContext context) {
    return [
      if (query.isNotEmpty)
        IconButton(icon: const Icon(Icons.clear), onPressed: () => query = ''),
    ];
  }

  @override
  Widget? buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () => close(context, null),
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    return _buildSearchResult(context);
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    // Nếu muốn gợi ý lịch sử, làm ở đây. Tạm thời trả về rỗng.
    return Container();
  }

  Widget _buildSearchResult(BuildContext context) {
    if (query.isEmpty) {
      return const Center(child: Text("Nhập từ khóa để tìm kiếm"));
    }

    return FutureBuilder<ApiResponse<List<SearchProduct>>>(
      future: ProductService.searchProducts(query, 0), // Default page 0
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        final response = snapshot.data;

        if (response == null ||
            response.code != 1000 ||
            response.result == null ||
            response.result!.isEmpty) {
          // Nếu có lỗi từ BE thì hiển thị message, còn không thì báo không tìm thấy
          String msg = response != null && response.code != 1000
              ? response.message
              : "Không tìm thấy sản phẩm nào";
          return Center(child: Text(msg));
        }

        final products = response.result!;

        // Responsive Grid
        final double width = MediaQuery.of(context).size.width;
        int crossAxisCount = width > 900 ? 4 : (width > 600 ? 3 : 2);

        return GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            childAspectRatio: 0.7,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
          ),
          itemCount: products.length,
          itemBuilder: (context, index) {
            return ProductCard.fromSearch(products[index]);
          },
        );
      },
    );
  }
}
