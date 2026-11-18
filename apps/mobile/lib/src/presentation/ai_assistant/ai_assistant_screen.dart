import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../core/media/image_picker_adapter.dart';
import '../../core/network/api_exception.dart';
import '../../domain/models/ai_chat.dart';
import '../providers/core_providers.dart';
import 'widgets/ai_conversation_list.dart';
import 'widgets/ai_input_bar.dart';

class AiAssistantScreen extends ConsumerStatefulWidget {
  const AiAssistantScreen({super.key});

  @override
  ConsumerState<AiAssistantScreen> createState() => _AiAssistantScreenState();
}

class _AiAssistantScreenState extends ConsumerState<AiAssistantScreen> {
  final TextEditingController _inputCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();
  final List<AiConversationTurn> _turns = <AiConversationTurn>[];
  bool _sending = false;

  static const List<String> _suggestions = <String>[
    'ขอโทนสีเข้มกว่านี้',
    'ของขวัญขึ้นบ้านใหม่ งบไม่เกิน 1,000',
    'เพิ่มกระเป๋า',
  ];

  @override
  void dispose() {
    _inputCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.jumpTo(_scrollCtrl.position.maxScrollExtent);
      }
    });
  }

  Future<void> _sendPrompt(String raw) async {
    final String text = raw.trim();
    if (text.isEmpty || _sending) return;
    _inputCtrl.clear();

    final List<AiHistoryTurn> history = <AiHistoryTurn>[
      for (final AiConversationTurn t in _turns.skip(
        _turns.length > 6 ? _turns.length - 6 : 0,
      ))
        AiHistoryTurn(role: t.isUser ? 'user' : 'assistant', content: t.text),
    ];

    setState(() {
      _sending = true;
      _turns.add(AiConversationTurn(isUser: true, text: text));
    });

    try {
      final AiChatResult res = await ref
          .read(aiRepositoryProvider)
          .askAssistant(message: text, history: history);
      if (!mounted) return;
      setState(() {
        _turns.add(
          AiConversationTurn(
            isUser: false,
            text: res.reply,
            products: res.products,
          ),
        );
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(
        () => _turns.add(AiConversationTurn(isUser: false, text: e.message)),
      );
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _turns.add(
          const AiConversationTurn(
            isUser: false,
            text: 'ไม่สามารถเชื่อมต่อผู้ช่วย AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้งครับ',
          ),
        );
      });
    } finally {
      if (mounted) {
        setState(() => _sending = false);
        _scrollToBottom();
      }
    }
  }

  Future<void> _pickAndSearchImage() async {
    if (_sending) return;
    final PickedSearchImage? picked = await ref
        .read(imagePickerAdapterProvider)
        .pickCompressedImage();
    if (picked == null || !mounted) return;

    final String hint = _inputCtrl.text.trim();
    _inputCtrl.clear();
    setState(() {
      _sending = true;
      _turns.add(
        AiConversationTurn(
          isUser: true,
          text: '📷 ค้นหาสินค้าคล้ายรูป: ${picked.fileName}',
        ),
      );
    });

    try {
      final VisualSearchResult res = await ref
          .read(aiRepositoryProvider)
          .searchByImage(
            imageBase64: picked.base64Data,
            mimeType: picked.mimeType,
            hint: hint.isNotEmpty ? hint : null,
          );
      if (!mounted) return;
      setState(() {
        _turns.add(
          AiConversationTurn(
            isUser: false,
            text: res.detectedSummary,
            products: res.products,
          ),
        );
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(
        () => _turns.add(AiConversationTurn(isUser: false, text: e.message)),
      );
    } finally {
      if (mounted) {
        setState(() => _sending = false);
        _scrollToBottom();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: TamadeeTheme.dark(),
      child: Scaffold(
        backgroundColor: TamadeeColors.ink,
        appBar: const AiAssistantAppBar(),
        body: Column(
          children: <Widget>[
            Expanded(
              child: AiConversationList(
                scrollController: _scrollCtrl,
                turns: _turns,
                sending: _sending,
                suggestions: _suggestions,
                onSelectSuggestion: _sendPrompt,
              ),
            ),
            AiBottomInputBar(
              controller: _inputCtrl,
              onSend: _sendPrompt,
              onPickImage: _pickAndSearchImage,
            ),
          ],
        ),
      ),
    );
  }
}
