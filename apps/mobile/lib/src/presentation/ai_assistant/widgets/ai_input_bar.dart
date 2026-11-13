import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

class AiChatBubble extends StatelessWidget {
  const AiChatBubble({
    super.key,
    required this.isUser,
    required this.text,
  });

  final bool isUser;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 300),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isUser ? TamadeeColors.lime : const Color(0xFF1E1E1B),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          text,
          style: TextStyle(
            color: isUser ? TamadeeColors.ink : TamadeeColors.white,
            fontWeight: isUser ? FontWeight.w700 : FontWeight.w500,
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}

class AiBottomInputBar extends StatelessWidget {
  const AiBottomInputBar({
    super.key,
    required this.controller,
    required this.onSend,
  });

  final TextEditingController controller;
  final ValueChanged<String> onSend;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 8, 14, 12),
        child: Container(
          padding: const EdgeInsets.only(left: 8, right: 6),
          decoration: BoxDecoration(
            color: const Color(0xFF1E1E1B),
            borderRadius: TamadeeLayout.pillBorderRadius,
            border: Border.all(color: TamadeeColors.borderDark),
          ),
          child: Row(
            children: <Widget>[
              IconButton(
                tooltip: 'ค้นหาด้วยรูปภาพ',
                onPressed: () => onSend('ค้นหาจากรูปถ่ายสินค้า'),
                icon: const Icon(
                  Icons.camera_alt_outlined,
                  color: TamadeeColors.textMutedDark,
                ),
              ),
              Expanded(
                child: TextField(
                  controller: controller,
                  style: const TextStyle(color: TamadeeColors.white),
                  onSubmitted: onSend,
                  decoration: const InputDecoration(
                    hintText: 'พิมพ์ หรือกดพูด',
                    hintStyle: TextStyle(color: TamadeeColors.textMutedDark),
                    border: InputBorder.none,
                  ),
                ),
              ),
              InkWell(
                onTap: () => onSend(
                  controller.text.isEmpty
                      ? 'แนะนำสินค้าขายดีประจำสัปดาห์'
                      : controller.text,
                ),
                customBorder: const CircleBorder(),
                child: Container(
                  width: 42,
                  height: 42,
                  decoration: const BoxDecoration(
                    color: TamadeeColors.lime,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.mic_none_rounded,
                    color: TamadeeColors.ink,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
