import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

class GuestWelcomeCard extends StatelessWidget {
  const GuestWelcomeCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: TamadeeColors.ink,
        borderRadius: TamadeeLayout.cardBorderRadius,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Text(
            'ยินดีต้อนรับสู่ Tamadee',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: TamadeeColors.white,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'เข้าสู่ระบบเพื่อบันทึกที่อยู่จัดส่ง ติดตามคำสั่งซื้อ และรับคำแนะนำไซซ์จาก AI',
            style: TextStyle(fontSize: 13, color: Color(0xFFC8C8C0)),
          ),
          const SizedBox(height: 16),
          Row(
            children: <Widget>[
              Expanded(
                child: ElevatedButton(
                  onPressed: () => context.push('/auth/login'),
                  child: const Text('เข้าสู่ระบบ'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => context.push('/auth/register'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: TamadeeColors.white,
                    side: const BorderSide(color: TamadeeColors.white),
                  ),
                  child: const Text('สมัครสมาชิก'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
