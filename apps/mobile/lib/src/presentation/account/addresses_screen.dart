import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../domain/models/customer.dart';
import '../../domain/repositories/auth_repository.dart';
import '../providers/auth_controller.dart';

class AddressesScreen extends ConsumerWidget {
  const AddressesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AsyncValue<CustomerProfile?> authAsync = ref.watch(
      authControllerProvider,
    );
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color cardBg =
        isDark ? TamadeeColors.surfaceDark : TamadeeColors.surfaceMuted;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        surfaceTintColor: Colors.transparent,
        title: const Text(
          'ที่อยู่จัดส่ง',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: TamadeeColors.lime,
        foregroundColor: TamadeeColors.ink,
        onPressed: () => _showAddDialog(context, ref),
        icon: const Icon(Icons.add_location_alt_outlined),
        label: const Text(
          'เพิ่มที่อยู่',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      body: authAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (Object err, StackTrace _) => Center(child: Text('$err')),
        data: (CustomerProfile? customer) {
          final List<CustomerAddress> list =
              customer?.addresses ?? const <CustomerAddress>[];
          if (list.isEmpty) {
            return const Center(
              child: Text('ยังไม่มีที่อยู่จัดส่งที่บันทึกไว้'),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: list.length,
            separatorBuilder: (BuildContext _, int _) =>
                const SizedBox(height: 10),
            itemBuilder: (BuildContext context, int index) {
              final CustomerAddress addr = list[index];
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      '${addr.fullName} · ${addr.phone}',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${addr.address1}, ${addr.city}, ${addr.province} ${addr.postalCode}',
                      style: const TextStyle(fontSize: 13.5),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }

  Future<void> _showAddDialog(BuildContext context, WidgetRef ref) async {
    final TextEditingController first = TextEditingController();
    final TextEditingController last = TextEditingController();
    final TextEditingController line1 = TextEditingController();
    final TextEditingController city = TextEditingController();
    final TextEditingController province = TextEditingController();
    final TextEditingController zip = TextEditingController();
    final TextEditingController phone = TextEditingController();

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (BuildContext ctx) => Padding(
        padding: EdgeInsets.fromLTRB(
          20,
          18,
          20,
          MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              const Text(
                'เพิ่มที่อยู่จัดส่งใหม่',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
              ),
              TextField(
                controller: first,
                decoration: const InputDecoration(labelText: 'ชื่อผู้รับ'),
              ),
              TextField(
                controller: last,
                decoration: const InputDecoration(labelText: 'นามสกุล'),
              ),
              TextField(
                controller: phone,
                decoration: const InputDecoration(labelText: 'เบอร์โทรศัพท์'),
              ),
              TextField(
                controller: line1,
                decoration: const InputDecoration(
                  labelText: 'บ้านเลขที่ / ถนน / ซอย',
                ),
              ),
              TextField(
                controller: city,
                decoration: const InputDecoration(labelText: 'เขต / อำเภอ'),
              ),
              TextField(
                controller: province,
                decoration: const InputDecoration(labelText: 'จังหวัด'),
              ),
              TextField(
                controller: zip,
                decoration: const InputDecoration(labelText: 'รหัสไปรษณีย์'),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    await ref.read(authControllerProvider.notifier).addAddress(
                          CreateAddressInput(
                            firstName: first.text,
                            lastName: last.text,
                            address1: line1.text,
                            city: city.text,
                            province: province.text,
                            postalCode: zip.text,
                            phone: phone.text,
                          ),
                        );
                    if (ctx.mounted) Navigator.of(ctx).pop();
                  },
                  child: const Text('บันทึกที่อยู่'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
