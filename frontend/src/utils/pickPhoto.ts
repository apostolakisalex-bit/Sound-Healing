import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

// Pick a profile photo from the device gallery and return clean base64 (no
// "data:" prefix), matching what the backend avatar endpoint expects.
// Using the system photo picker (no permission prompt needed on modern
// iOS/Android), with a square crop + compression so large iPhone HEIC photos
// are transcoded to a small JPEG the backend accepts (it only allows
// JPEG/PNG/WebP). The old expo-document-picker opened the Files app and passed
// HEIC through, which the backend rejected — so uploads failed on real phones.
export async function pickPhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (asset?.base64) return asset.base64;

  // Fallback: some platforms may not populate base64 — read from the uri.
  if (Platform.OS === "web") {
    const blob = await (await fetch(asset.uri)).blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  const FileSystem = await import("expo-file-system/legacy");
  return FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}
