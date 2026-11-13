import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../core/network/api_exception.dart';
import '../../domain/repositories/auth_repository.dart';
import '../providers/auth_controller.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final TextEditingController _firstCtrl = TextEditingController();
  final TextEditingController _lastCtrl = TextEditingController();
  final TextEditingController _phoneCtrl = TextEditingController();
  final TextEditingController _emailCtrl = TextEditingController();
  final TextEditingController _passCtrl = TextEditingController();
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _firstCtrl.dispose();
    _lastCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_firstCtrl.text.trim().isEmpty ||
        _emailCtrl.text.trim().isEmpty ||
        _passCtrl.text.length < 6) {
      setState(
        () => _error = 'กรุณากรอกชื่อ อีเมล และรหัสผ่านอย่างน้อย 6 ตัวอักษร',
      );
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      await ref.read(authControllerProvider.notifier).register(
            RegisterCustomerInput(
              email: _emailCtrl.text,
              password: _passCtrl.text,
              firstName: _firstCtrl.text,
              lastName: _lastCtrl.text,
              phone: _phoneCtrl.text,
            ),
          );
      if (mounted) {
        context.canPop() ? context.pop() : context.go('/account');
      }
    } on ApiException catch (err) {
      setState(() => _error = err.message);
    } on Exception catch (err) {
      setState(() => _error = '$err');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color fieldBg =
        isDark ? TamadeeColors.surfaceDark : TamadeeColors.surfaceMuted;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        surfaceTintColor: Colors.transparent,
        title: const Text(
          'สมัครสมาชิก Tamadee',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: <Widget>[
          if (_error != null) ...<Widget>[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: TamadeeColors.error.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Text(
                _error!,
                style: const TextStyle(
                  color: TamadeeColors.error,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(height: 14),
          ],
          _InputBox(controller: _firstCtrl, label: 'ชื่อจริง', bg: fieldBg),
          const SizedBox(height: 12),
          _InputBox(controller: _lastCtrl, label: 'นามสกุล', bg: fieldBg),
          const SizedBox(height: 12),
          _InputBox(
            controller: _phoneCtrl,
            label: 'เบอร์โทรศัพท์',
            bg: fieldBg,
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 12),
          _InputBox(
            controller: _emailCtrl,
            label: 'อีเมล',
            bg: fieldBg,
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 12),
          _InputBox(
            controller: _passCtrl,
            label: 'รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)',
            bg: fieldBg,
            obscure: true,
          ),
          const SizedBox(height: 22),
          SizedBox(
            height: 50,
            child: ElevatedButton(
              onPressed: _submitting ? null : _submit,
              child: Text(_submitting ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'),
            ),
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: () => context.pushReplacement('/auth/login'),
            child: const Text('มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'),
          ),
        ],
      ),
    );
  }
}

class _InputBox extends StatelessWidget {
  const _InputBox({
    required this.controller,
    required this.label,
    required this.bg,
    this.obscure = false,
    this.keyboardType,
  });

  final TextEditingController controller;
  final String label;
  final Color bg;
  final bool obscure;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        keyboardType: keyboardType,
        decoration: InputDecoration(labelText: label, border: InputBorder.none),
      ),
    );
  }
}
