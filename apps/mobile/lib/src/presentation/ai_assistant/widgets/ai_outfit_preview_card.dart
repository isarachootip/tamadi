import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

class AiOutfitPreviewCard extends StatelessWidget {
  const AiOutfitPreviewCard({
    super.key,
    required this.onBrowseSet,
  });

  final VoidCallback onBrowseSet;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1C1C1A),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: TamadeeColors.borderDark),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Text(
            'จัดให้เลย! คัดลุคลินินรับลมทะเลจากร้านคราฟต์ไทย งบรวม ฿2,480',
            style: TextStyle(
              color: TamadeeColors.white,
              fontSize: 14,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          const Row(
            children: <Widget>[
              Expanded(
                child: _DarkItemTile(
                  title: 'เสื้อเชิ้ตลินิน',
                  subtitle: 'ขาวครีม · ไซซ์ M',
                  price: '฿890',
                  icon: Icons.checkroom_rounded,
                ),
              ),
              SizedBox(width: 10),
              Expanded(
                child: _DarkItemTile(
                  title: 'กระเป๋าผ้าแคนวาส',
                  subtitle: 'ทรงกว้าง · ดำ',
                  price: '฿1,590',
                  icon: Icons.shopping_bag_outlined,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton(
              onPressed: onBrowseSet,
              style: ElevatedButton.styleFrom(
                backgroundColor: TamadeeColors.white,
                foregroundColor: TamadeeColors.ink,
              ),
              child: const Text(
                'ใส่ตะกร้าทั้งชุด ฿2,480',
                style: TextStyle(fontWeight: FontWeight.w800),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DarkItemTile extends StatelessWidget {
  const _DarkItemTile({
    required this.title,
    required this.subtitle,
    required this.price,
    required this.icon,
  });

  final String title;
  final String subtitle;
  final String price;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF262623),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            height: 76,
            width: double.infinity,
            decoration: BoxDecoration(
              color: const Color(0xFF32322E),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: TamadeeColors.lime, size: 30),
          ),
          const SizedBox(height: 8),
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: TamadeeColors.white,
              fontSize: 13.5,
              fontWeight: FontWeight.w700,
            ),
          ),
          Text(
            subtitle,
            style: const TextStyle(
              color: TamadeeColors.textMutedDark,
              fontSize: 11.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            price,
            style: const TextStyle(
              fontFamily: 'Space Grotesk',
              color: TamadeeColors.lime,
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
