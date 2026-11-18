import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../core/network/api_exception.dart';
import '../../domain/models/ai_chat.dart';
import '../providers/core_providers.dart';
import 'widgets/ai_input_bar.dart';
import 'widgets/ai_outfit_preview_card.dart';
import 'widgets/ai_product_card_tile.dart';

class _ConversationTurn {
  const _ConversationTurn({
    required this.isUser,
    required this.text,
    this.products = const <AiRecommendedProduct>[],
  });

  final bool isUser;
  final String text;
  final List<AiRecommendedProduct> products;
}

class AiAssistantScreen extends ConsumerStatefulWidget {
  const AiAssistantScreen({super.key});

  @override
  ConsumerState<AiAssistantScreen> createState() => _AiAssistantScreenState();
}

class _AiAssistantScreenState extends ConsumerState<AiAssistantScreen> {
  final TextEditingController _inputCtrl = TextEditingController();
  final List<_ConversationTurn> _turns = <_ConversationTurn>[];
  bool _sending = false;

  static const List<String> _suggestions = <String>[
    'ขอโทนสีเข้มกว่านี้',
    'ของขวัญขึ้นบ้านใหม่ งบไม่เกิน 1,000',
    'เพิ่มกระเป๋า',
  ];

  @override
  void dispose() {
    _inputCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendPrompt(String raw) async {
    final String text = raw.trim();
    if (text.isEmpty || _sending) return;
    _inputCtrl.clear();

    final List<AiHistoryTurn> history = <AiHistoryTurn>[
      for (final _ConversationTurn t in _turns.skip(
        _turns.length > 6 ? _turns.length - 6 : 0,
      ))
        AiHistoryTurn(role: t.isUser ? 'user' : 'assistant', content: t.text),
    ];

    setState(() {
      _sending = true;
      _turns.add(_ConversationTurn(isUser: true, text: text));
    });

    try {
      final AiChatResult res = await ref
          .read(aiRepositoryProvider)
          .askAssistant(message: text, history: history);
      if (!mounted) return;
      setState(() {
        _turns.add(
          _ConversationTurn(
            isUser: false,
            text: res.reply,
            products: res.products,
          ),
        );
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _turns.add(_ConversationTurn(isUser: false, text: e.message));
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _turns.add(
          const _ConversationTurn(
            isUser: false,
            text: 'ไม่สามารถเชื่อมต่อผู้ช่วย AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้งครับ',
          ),
        );
      });
    } finally {
      if (mounted) {
        setState(() => _sending = false);
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
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                children: <Widget>[
                  const AiChatBubble(
                    isUser: true,
                    text: 'หาชุดไปทะเลให้หน่อย งบไม่เกิน 2,500',
                  ),
                  AiOutfitPreviewCard(
                    onBrowseSet: () => context.push('/products'),
                  ),
                  for (final _ConversationTurn turn in _turns) ...<Widget>[
                    Padding(
                      padding: const EdgeInsets.only(top: 10),
                      child: AiChatBubble(isUser: turn.isUser, text: turn.text),
                    ),
                    for (final AiRecommendedProduct item in turn.products)
                      AiProductCardTile(product: item),
                  ],
                  if (_sending)
                    const Padding(
                      padding: EdgeInsets.only(top: 10),
                      child: AiChatBubble(
                        isUser: false,
                        text: 'น้องทำมะดิกำลังค้นสินค้าจริงให้สักครู่...',
                      ),
                    ),
                  const SizedBox(height: 14),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: <Widget>[
                      for (final String chip in _suggestions)
                        ActionChip(
                          backgroundColor: const Color(0xFF1C1C1A),
                          side: const BorderSide(
                            color: TamadeeColors.borderDark,
                          ),
                          label: Text(
                            chip,
                            style: const TextStyle(color: TamadeeColors.white),
                          ),
                          onPressed: _sending ? null : () => _sendPrompt(chip),
                        ),
                    ],
                  ),
                ],
              ),
            ),
            AiBottomInputBar(controller: _inputCtrl, onSend: _sendPrompt),
          ],
        ),
      ),
    );
  }
}
