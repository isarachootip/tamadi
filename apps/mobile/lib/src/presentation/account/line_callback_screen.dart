import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../../core/network/api_exception.dart';
import '../providers/auth_controller.dart';

class LineCallbackScreen extends ConsumerStatefulWidget {
  const LineCallbackScreen({
    super.key,
    required this.exchangeCode,
  });

  final String exchangeCode;

  @override
  ConsumerState<LineCallbackScreen> createState() => _LineCallbackScreenState();
}

class _LineCallbackScreenState extends ConsumerState<LineCallbackScreen> {
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _completeExchange());
  }

  Future<void> _completeExchange() async {
    if (widget.exchangeCode.trim().isEmpty) {
      setState(() => _error = 'ไม่พบรหัสยืนยันตัวตนจาก LINE');
      return;
    }
    try {
      await ref
          .read(authControllerProvider.notifier)
          .loginWithLineCode(widget.exchangeCode);
      if (mounted) {
        context.go('/account');
      }
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) {
        setState(() => _error = 'ไม่สามารถเข้าสู่ระบบด้วย LINE ได้ในขณะนี้');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: _error == null
              ? const Column(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text(
                      'กำลังเชื่อมต่อบัญชี LINE กับ Tamadee...',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ],
                )
              : Column(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Text(
                      _error!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => context.go('/auth/login'),
                      child: const Text('กลับหน้าเข้าสู่ระบบ'),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
