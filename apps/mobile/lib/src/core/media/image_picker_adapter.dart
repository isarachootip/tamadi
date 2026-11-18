import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';

@immutable
class PickedSearchImage {
  const PickedSearchImage({
    required this.base64Data,
    required this.mimeType,
    required this.fileName,
  });

  final String base64Data;
  final String mimeType;
  final String fileName;
}

abstract interface class ImagePickerAdapter {
  Future<PickedSearchImage?> pickCompressedImage();
}

class DeviceImagePickerAdapter implements ImagePickerAdapter {
  const DeviceImagePickerAdapter();

  static String _inferMimeType(String name, String? reportedMime) {
    final String lower = (reportedMime ?? name).toLowerCase();
    if (lower.contains('png')) return 'image/png';
    if (lower.contains('webp')) return 'image/webp';
    return 'image/jpeg';
  }

  @override
  Future<PickedSearchImage?> pickCompressedImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? picked = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 800,
      maxHeight: 800,
      imageQuality: 82,
    );
    if (picked == null) {
      return null;
    }
    final Uint8List bytes = await picked.readAsBytes();
    if (bytes.isEmpty) {
      return null;
    }
    return PickedSearchImage(
      base64Data: base64Encode(bytes),
      mimeType: _inferMimeType(picked.name, picked.mimeType),
      fileName: picked.name,
    );
  }
}
