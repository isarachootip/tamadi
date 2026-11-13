import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../../domain/models/category.dart';
import '../../../domain/repositories/catalog_repository.dart';

class ProductFilterSheet extends StatefulWidget {
  const ProductFilterSheet({
    super.key,
    required this.initialFilter,
    required this.categories,
    required this.onApply,
  });

  final ProductQueryFilter initialFilter;
  final List<ProductCategory> categories;
  final ValueChanged<ProductQueryFilter> onApply;

  @override
  State<ProductFilterSheet> createState() => _ProductFilterSheetState();
}

class _ProductFilterSheetState extends State<ProductFilterSheet> {
  late String? _categoryId = widget.initialFilter.categoryId;
  late ProductSortOption _sort = widget.initialFilter.sort;
  late int? _maxPrice = widget.initialFilter.maxPrice;

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                const Text(
                  'ตัวกรองและการจัดเรียง',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                ),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _categoryId = null;
                      _sort = ProductSortOption.recommended;
                      _maxPrice = null;
                    });
                  },
                  child: const Text('ล้างค่า'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Text(
              'จัดเรียงตาม',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: <Widget>[
                for (final ProductSortOption option in ProductSortOption.values)
                  ChoiceChip(
                    label: Text(option.label),
                    selected: _sort == option,
                    selectedColor: TamadeeColors.lime,
                    labelStyle: TextStyle(
                      color: _sort == option
                          ? TamadeeColors.ink
                          : (isDark ? TamadeeColors.white : TamadeeColors.ink),
                      fontWeight: FontWeight.w600,
                    ),
                    onSelected: (_) => setState(() => _sort = option),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'งบประมาณสูงสุด',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: <Widget>[
                for (final (String label, int? cap) in <(String, int?)>[
                  ('ทุกช่วงราคา', null),
                  ('ไม่เกิน ฿600', 600),
                  ('ไม่เกิน ฿1,200', 1200),
                  ('ไม่เกิน ฿2,000', 2000),
                ])
                  ChoiceChip(
                    label: Text(label),
                    selected: _maxPrice == cap,
                    selectedColor: TamadeeColors.lime,
                    labelStyle: TextStyle(
                      color: _maxPrice == cap
                          ? TamadeeColors.ink
                          : (isDark ? TamadeeColors.white : TamadeeColors.ink),
                      fontWeight: FontWeight.w600,
                    ),
                    onSelected: (_) => setState(() => _maxPrice = cap),
                  ),
              ],
            ),
            if (widget.categories.isNotEmpty) ...<Widget>[
              const SizedBox(height: 16),
              const Text(
                'หมวดหมู่',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: <Widget>[
                  ChoiceChip(
                    label: const Text('ทั้งหมด'),
                    selected: _categoryId == null,
                    selectedColor: TamadeeColors.lime,
                    onSelected: (_) => setState(() => _categoryId = null),
                  ),
                  for (final ProductCategory c in widget.categories)
                    ChoiceChip(
                      label: Text(c.name),
                      selected: _categoryId == c.id,
                      selectedColor: TamadeeColors.lime,
                      onSelected: (_) => setState(() => _categoryId = c.id),
                    ),
                ],
              ),
            ],
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  widget.onApply(
                    ProductQueryFilter(
                      query: widget.initialFilter.query,
                      categoryId: _categoryId,
                      maxPrice: _maxPrice,
                      sort: _sort,
                    ),
                  );
                  Navigator.of(context).pop();
                },
                child: const Text('ดูผลลัพธ์'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
