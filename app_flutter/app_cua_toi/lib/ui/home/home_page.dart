import 'package:app_cua_toi/data/models/product_model.dart';
import 'package:app_cua_toi/ui/product/product_list_page.dart';
import 'package:app_cua_toi/ui/widgets/product_card.dart';
import 'package:flutter/material.dart';
import 'package:app_cua_toi/services/product_service.dart';
import 'package:app_cua_toi/services/home_service.dart';
import 'package:app_cua_toi/data/models/brand_model.dart';
import 'package:app_cua_toi/data/models/category_model.dart' as model;
import '../product/product_search_delegate.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final Color primaryColor = const Color(0xFFE30019);

  List<SimpleProduct> _featuredProducts = [];
  List<model.Category> _categories = [];
  List<Brand> _brands = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchHomeData();
  }

  Future<void> _fetchHomeData() async {
    final brandRes = await HomeService.getBrands();
    final catRes = await HomeService.getCategories();
    final productRes = await ProductService.filterProducts(page: 0, size: 8);

    if (mounted) {
      setState(() {
        if (brandRes.code == 1000) _brands = brandRes.result!;
        if (catRes.code == 1000) _categories = catRes.result!;
        if (productRes.code == 1000) _featuredProducts = productRes.result!;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFFE30019)),
      );
    }

    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: CustomScrollView(
        slivers: [
          // 2. BODY CONTENT
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeroBanner(),
                const SizedBox(height: 24),

                // --- CATEGORIES (Dạng Chip cuộn ngang) ---
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: _buildSectionTitle(
                    "DANH MỤC",
                    seeMore: true,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              const ProductListPage(title: "Tất cả sản phẩm"),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 12),
                _buildCategoryList(),

                const SizedBox(height: 30),

                // --- BRANDS (Dạng Card Logo) ---
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: _buildSectionTitle("THƯƠNG HIỆU"),
                ),
                const SizedBox(height: 12),
                _buildBrandList(),

                const SizedBox(height: 30),

                // --- SẢN PHẨM MỚI (Grid) ---
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: _buildSectionTitle("SẢN PHẨM MỚI"),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),

          // Grid Sản phẩm
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverGrid(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
                childAspectRatio: 0.65,
                crossAxisSpacing: 12,
                mainAxisSpacing: 16,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) =>
                    ProductCard.fromSimple(_featuredProducts[index]),
                childCount: _featuredProducts.length,
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Center(
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) =>
                            const ProductListPage(title: "Tất cả sản phẩm"),
                      ),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 30,
                      vertical: 12,
                    ),
                    side: const BorderSide(color: Color(0xFFE30019)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                  ),
                  child: const Text(
                    "XEM TẤT CẢ",
                    style: TextStyle(
                      color: Color(0xFFE30019),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 40)),
        ],
      ),
    );
  }

  // --- WIDGETS CON ---

  Widget _buildHeroBanner() {
    return Container(
      height: 200,
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        image: const DecorationImage(
          image: AssetImage("assets/banner.jpg"),
          fit: BoxFit.cover,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.bottomRight,
            colors: [Colors.black.withOpacity(0.6), Colors.transparent],
          ),
        ),
        alignment: Alignment.bottomLeft,
        padding: const EdgeInsets.all(20),
        child: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "NEW COLLECTION",
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
            Text(
              "SUMMER SALE 50%",
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 24,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryList() {
    return SizedBox(
      height: 45, // Chiều cao vừa đủ cho Chip
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: _categories.length + 1,
        separatorBuilder: (ctx, i) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          if (index == 0) {
            // Nút "Tất cả"
            return _buildCategoryChip(
              "Tất cả",
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        const ProductListPage(title: "Tất cả sản phẩm"),
                  ),
                );
              },
              isActive: true,
            );
          }
          final cat = _categories[index - 1];
          return _buildCategoryChip(
            cat.name,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ProductListPage(
                    title: cat.name,
                    initialCategoryId: int.parse(cat.id),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildCategoryChip(
    String label, {
    required VoidCallback onTap,
    bool isActive = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFFE30019) : Colors.white,
          borderRadius: BorderRadius.circular(25),
          border: Border.all(
            color: isActive ? Colors.transparent : Colors.grey.shade300,
          ),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: const Color(0xFFE30019).withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isActive ? Colors.white : Colors.black87,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBrandList() {
    return SizedBox(
      height: 100,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: _brands.length,
        separatorBuilder: (ctx, i) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final brand = _brands[index];
          return GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ProductListPage(
                    title: brand.name,
                    initialBrandId: int.parse(brand.id),
                  ),
                ),
              );
            },
            child: Container(
              width: 100,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo Brand (Placeholder circle)
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      brand.name[0],
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 20,
                        color: Colors.black54,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    brand.name,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionTitle(
    String title, {
    bool seeMore = false,
    VoidCallback? onTap,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: Colors.black87,
          ),
        ),
        if (seeMore)
          GestureDetector(
            onTap: onTap,
            child: const Text(
              "Xem tất cả",
              style: TextStyle(
                fontSize: 13,
                color: Color(0xFFE30019),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
      ],
    );
  }
}
