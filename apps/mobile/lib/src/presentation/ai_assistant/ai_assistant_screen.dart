import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import 'widgets/ai_input_bar.dart';
import 'widgets/ai_outfit_preview_card.dart';

class AiAssistantScreen extends StatefulWidget {
  const AiAssistantScreen({super.key});

  @override
  State<AiAssistantScreen> createState() => _AiAssistantScreenState();
}

class _AiAssistantScreenState extends State<AiAssistantScreen> {
  final TextEditingController _inputCtrl = TextEditingController();
  final List<(bool isUser, String text)> _extraTurns = <(bool, String)>[];

  static const List<String> _suggestions = <String>[
    'ขอโทนสีเข้มกว่านี้',
    'ถูกกว่านี้',
    'เพิ่มกระเป๋า',
  ];

  @override
  void dispose() {
    _inputCtrl.dispose();
    super.dispose();
  }

  void _sendPrompt(String raw) {
    final String text = raw.trim();
    if (text.isEmpty) return;
    _inputCtrl.clear();
    setState(() {
      _extraTurns.add((true, text));
      _extraTurns.add((
        false,
        'รับข้อความ "$text" แล้วครับ! ตอนนี้หน้าจอผู้ช่วย AI น้องทำมะดิเป็น UI ตัวอย่างสำหรับระยะที่ 2 และจะเชื่อมต่อสมอง AI ค้นหาสินค้าจริงในระยะที่ 5 ครับ',
      ));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: TamadeeTheme.dark(),
      child: Scaffold(
        backgroundColor: TamadeeColors.ink,
        appBar: AppBar(
          backgroundColor: TamadeeColors.ink,
          surfaceTintColor: Colors.transparent,
          leading: IconButton(
            icon: const Icon(
              Icons.arrow_back_ios_new_rounded,
              size: 18,
              color: TamadeeColors.white,
            ),
            onPressed: () =>
                context.canPop() ? context.pop() : context.go('/'),
          ),
          titleSpacing: 0,
          title: const Row(
            children: <Widget>[
              NongTammadiMascotWidget(size: 34, brightness: Brightness.dark),
              SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'น้องทำมะดิ',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: TamadeeColors.white,
                      ),
                    ),
                    Text(
                      'ผู้ช่วยช้อปของ Tamadee ถามเป็นภาษาพูดได้เลย',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: TamadeeColors.textMutedDark,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
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
                    onBrowseSet: () => context.push('/search'),
                  ),
                  for (final (bool isUser, String text) in _extraTurns)
                    Padding(
                      padding: const EdgeInsets.only(top: 10),
                      child: AiChatBubble(isUser: isUser, text: text),
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
                          onPressed: () => _sendPrompt(chip),
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
