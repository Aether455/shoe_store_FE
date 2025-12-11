import 'package:app_cua_toi/data/models/product_model.dart';
import 'package:app_cua_toi/data/models/category_model.dart' as model;
import 'package:app_cua_toi/data/models/brand_model.dart';
import 'package:app_cua_toi/services/home_service.dart'; // Để lấy list Cat/Brand
import 'package:flutter/material.dart';
import '../../services/product_service.dart';
import '../widgets/product_card.dart';

class ProductListPage extends StatefulWidget {
  final String title;
  final int? initialCategoryId; // Đổi tên để rõ ý nghĩa là giá trị khởi tạo
  final int? initialBrandId;

  const ProductListPage({
    super.key,
    required this.title,
    this.initialCategoryId,
    this.initialBrandId,
  });

  @override
  State<ProductListPage> createState() => _ProductListPageState();
}

class _ProductListPageState extends State<ProductListPage> {
  final List<SimpleProduct> _products = [];
  bool _isLoading = false;
  bool _hasMore = true;
  int _page = 0;
  final int _size = 10;
  final ScrollController _scrollController = ScrollController();

  // State cho bộ lọc (Filter)
  double? _minPrice;
  double? _maxPrice;
  int? _selectedCategoryId;
  int? _selectedBrandId;

  // Dữ liệu để hiển thị trong Modal Filter
  List<model.Category> _allCategories = [];
  List<Brand> _allBrands = [];

  // Range giá trị cho thanh trượt UI
  RangeValues _currentRangeValues = const RangeValues(0, 50000000);

  @override
  void initState() {
    super.initState();
    // Khởi tạo giá trị lọc ban đầu từ tham số truyền vào
    _selectedCategoryId = widget.initialCategoryId;
    _selectedBrandId = widget.initialBrandId;

    _fetchFilterData(); // Lấy danh sách danh mục/thương hiệu để fill vào modal
    _fetchProducts();

    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
              _scrollController.position.maxScrollExtent - 200 &&
          !_isLoading &&
          _hasMore) {
        _fetchProducts();
      }
    });
  }

  // Lấy dữ liệu cho bộ lọc (Category, Brand)
  Future<void> _fetchFilterData() async {
    final cats = await HomeService.getCategories();
    final brands = await HomeService.getBrands();
    if (mounted) {
      setState(() {
        if (cats.code == 1000) _allCategories = cats.result ?? [];
        if (brands.code == 1000) _allBrands = brands.result ?? [];
      });
    }
  }

  Future<void> _fetchProducts() async {
    if (_isLoading) return;
    setState(() => _isLoading = true);

    final response = await ProductService.filterProducts(
      page: _page,
      size: _size,
      categoryId:
          _selectedCategoryId, // Dùng biến state thay vì widget.categoryId
      brandId: _selectedBrandId, // Dùng biến state thay vì widget.brandId
      minPrice: _minPrice,
      maxPrice: _maxPrice,
    );

    if (mounted) {
      setState(() {
        _isLoading = false;
        if (response.code == 1000 && response.result != null) {
          final newProducts = response.result!;
          _products.addAll(newProducts);
          if (newProducts.length < _size) {
            _hasMore = false;
          } else {
            _page++;
          }
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message),
              backgroundColor: Colors.red,
            ),
          );
        }
      });
    }
  }

  void _applyFilter() {
    setState(() {
      _products.clear();
      _page = 0;
      _hasMore = true;

      _minPrice = _currentRangeValues.start;
      _maxPrice = _currentRangeValues.end;

      if (_maxPrice == 50000000) _maxPrice = null;
      if (_minPrice == 0) _minPrice = null;
    });
    Navigator.pop(context);
    _fetchProducts();
  }

  void _resetFilter() {
    setState(() {
      _currentRangeValues = const RangeValues(0, 50000000);
      _minPrice = null;
      _maxPrice = null;
      _selectedCategoryId =
          null; // Reset về null (hoặc về widget.initial nếu muốn)
      _selectedBrandId = null;

      _products.clear();
      _page = 0;
      _hasMore = true;
    });
    _fetchProducts();
  }

  // --- MODAL LỌC NÂNG CẤP ---
  void _showFilterModal() {
    // Biến tạm để lưu trạng thái trong Modal trước khi bấm Áp dụng
    int? tempCatId = _selectedCategoryId;
    int? tempBrandId = _selectedBrandId;
    RangeValues tempRange = _currentRangeValues;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true, // Cho phép full height nếu cần
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return DraggableScrollableSheet(
              initialChildSize: 0.7,
              minChildSize: 0.5,
              maxChildSize: 0.9,
              expand: false,
              builder: (_, scrollController) {
                return SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 40,
                          height: 4,
                          margin: const EdgeInsets.only(bottom: 20),
                          decoration: BoxDecoration(
                            color: Colors.grey[300],
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      const Text(
                        "BỘ LỌC TÌM KIẾM",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // --- 1. KHOẢNG GIÁ ---
                      const Text(
                        "Khoảng giá",
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(_formatCurrency(tempRange.start)),
                          Text(_formatCurrency(tempRange.end)),
                        ],
                      ),
                      RangeSlider(
                        values: tempRange,
                        min: 0,
                        max: 50000000,
                        divisions: 50,
                        activeColor: const Color(0xFFE30019),
                        onChanged: (RangeValues values) {
                          setModalState(() => tempRange = values);
                        },
                      ),
                      const Divider(height: 30),

                      // --- 2. DANH MỤC ---
                      const Text(
                        "Danh mục",
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _allCategories.map((cat) {
                          bool isSelected = tempCatId == int.parse(cat.id);
                          return ChoiceChip(
                            label: Text(cat.name),
                            selected: isSelected,
                            selectedColor: const Color(
                              0xFFE30019,
                            ).withOpacity(0.1),
                            labelStyle: TextStyle(
                              color: isSelected
                                  ? const Color(0xFFE30019)
                                  : Colors.black,
                            ),
                            backgroundColor: Colors.grey[100],
                            side: BorderSide(
                              color: isSelected
                                  ? const Color(0xFFE30019)
                                  : Colors.transparent,
                            ),
                            onSelected: (bool selected) {
                              setModalState(() {
                                tempCatId = selected ? int.parse(cat.id) : null;
                              });
                            },
                          );
                        }).toList(),
                      ),
                      const Divider(height: 30),

                      // --- 3. THƯƠNG HIỆU ---
                      const Text(
                        "Thương hiệu",
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _allBrands.map((brand) {
                          bool isSelected = tempBrandId == int.parse(brand.id);
                          return ChoiceChip(
                            label: Text(brand.name),
                            selected: isSelected,
                            selectedColor: const Color(
                              0xFFE30019,
                            ).withOpacity(0.1),
                            labelStyle: TextStyle(
                              color: isSelected
                                  ? const Color(0xFFE30019)
                                  : Colors.black,
                            ),
                            backgroundColor: Colors.grey[100],
                            side: BorderSide(
                              color: isSelected
                                  ? const Color(0xFFE30019)
                                  : Colors.transparent,
                            ),
                            onSelected: (bool selected) {
                              setModalState(() {
                                tempBrandId = selected
                                    ? int.parse(brand.id)
                                    : null;
                              });
                            },
                          );
                        }).toList(),
                      ),

                      const SizedBox(height: 30),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: () {
                            // Cập nhật State của màn hình cha
                            setState(() {
                              _selectedCategoryId = tempCatId;
                              _selectedBrandId = tempBrandId;
                              _currentRangeValues = tempRange;
                            });
                            _applyFilter();
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFE30019),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: const Text(
                            "ÁP DỤNG",
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  String _formatCurrency(double price) {
    return "${price.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ";
  }

  bool get _isFiltering =>
      _minPrice != null ||
      _maxPrice != null ||
      _selectedCategoryId != null ||
      _selectedBrandId != null;

  @override
  Widget build(BuildContext context) {
    final double width = MediaQuery.of(context).size.width;
    int crossAxisCount = 2;
    if (width > 600) crossAxisCount = 3;
    if (width > 900) crossAxisCount = 4;
    if (width > 1200) crossAxisCount = 5;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- HEADER ---
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.arrow_back_ios_new,
                      color: Colors.black87,
                    ),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.title.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: Colors.black87,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (_isFiltering)
                          Text(
                            "Đang áp dụng bộ lọc",
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                      ],
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: IconButton(
                      icon: Icon(
                        Icons.filter_list,
                        color: _isFiltering
                            ? const Color(0xFFE30019)
                            : Colors.black87,
                      ),
                      onPressed: _showFilterModal,
                    ),
                  ),
                ],
              ),
            ),

            // --- BODY ---
            Expanded(
              child: _products.isEmpty && _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: Color(0xFFE30019),
                      ),
                    )
                  : _products.isEmpty
                  ? _buildEmptyState()
                  : RefreshIndicator(
                      color: const Color(0xFFE30019),
                      onRefresh: () async {
                        setState(() {
                          _products.clear();
                          _page = 0;
                          _hasMore = true;
                        });
                        await _fetchProducts();
                      },
                      child: GridView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: crossAxisCount,
                          childAspectRatio: 0.65,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 16,
                        ),
                        itemCount: _products.length + (_hasMore ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (index == _products.length) {
                            return const Center(
                              child: Padding(
                                padding: EdgeInsets.all(8.0),
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              ),
                            );
                          }
                          return ProductCard.fromSimple(_products[index]);
                        },
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            "Không tìm thấy sản phẩm nào",
            style: TextStyle(color: Colors.grey[600], fontSize: 16),
          ),
          if (_isFiltering)
            TextButton(
              onPressed: _resetFilter,
              child: const Text(
                "Xóa bộ lọc",
                style: TextStyle(color: Color(0xFFE30019)),
              ),
            ),
        ],
      ),
    );
  }
}
