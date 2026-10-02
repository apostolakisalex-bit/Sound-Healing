import React, { useState } from "react";
import { Platform, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { api } from "@/src/api/client";
import { Button, Field, Status, ui, useLoad } from "./Wellness";
import { ManagedImage } from "./ManagedImage";

type Photo = {
  id: string;
  title: string;
  alt: string;
  url: string;
  width: number;
  height: number;
  size: number;
  revision: number;
};
export function MediaLibrary({
  onSelect,
}: {
  onSelect?: (photo: Photo) => void;
}) {
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const state = useLoad<{ items: Photo[]; total: number }>(
    `/admin/media?offset=${offset}&q=${encodeURIComponent(query)}`,
    { items: [], total: 0 },
  );
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [edit, setEdit] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setMessage("");
    try {
      await action();
      await state.reload();
      setMessage(success);
    } catch (e: any) {
      setMessage(
        typeof e?.response?.data?.detail === "string"
          ? e.response.data.detail
          : "Η ενέργεια δεν ολοκληρώθηκε. Έλεγξε τα στοιχεία και δοκίμασε ξανά.",
      );
    } finally {
      setBusy(false);
    }
  };
  const upload = async () => {
    await run(async () => {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/jpeg", "image/png", "image/webp"],
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      if (file.size && file.size > 8 * 1024 * 1024) throw new Error("size");
      let data: string;
      if (Platform.OS === "web") {
        const blob = await (await fetch(file.uri)).blob();
        data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else
        data = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      await api.post("/admin/media", { title, alt, data });
      setTitle("");
      setAlt("");
    }, "Η βιβλιοθήκη ενημερώθηκε.");
  };
  return (
    <View style={{ gap: 16 }}>
      <Text style={ui.heading}>Βιβλιοθήκη φωτογραφιών</Text>
      <Text style={ui.body}>
        JPG, PNG ή WebP έως 8 MB. Οι εικόνες βελτιστοποιούνται και αφαιρούνται
        τα μεταδεδομένα τους. Εμφανίζονται στο κοινό μόνο όταν δημοσιεύσεις
        περιεχόμενο που τις χρησιμοποιεί.
      </Text>
      <View style={ui.card}>
        <Field label="Τίτλος φωτογραφίας" value={title} onChange={setTitle} />
        <Field
          label="Περιγραφή εικόνας για προσβασιμότητα"
          value={alt}
          onChange={setAlt}
        />
        {edit ? (
          <View style={ui.row}>
            <Button
              label="Αποθήκευση στοιχείων εικόνας"
              disabled={
                busy || title.trim().length < 2 || alt.trim().length < 2
              }
              onPress={() =>
                void run(async () => {
                  await api.put(`/admin/media/${edit.id}`, {
                    title,
                    alt,
                    revision: edit.revision,
                  });
                  setEdit(null);
                  setTitle("");
                  setAlt("");
                }, "Τα στοιχεία ενημερώθηκαν. Οι περιγραφές σε ήδη αποθηκευμένο περιεχόμενο παραμένουν ανεξάρτητες.")
              }
            />
            <Button
              secondary
              label="Ακύρωση επεξεργασίας εικόνας"
              onPress={() => {
                setEdit(null);
                setTitle("");
                setAlt("");
              }}
            />
          </View>
        ) : (
          <Button
            label={
              busy ? "Μεταφόρτωση…" : "Επιλογή και μεταφόρτωση φωτογραφίας"
            }
            disabled={busy || title.trim().length < 2 || alt.trim().length < 2}
            onPress={() => void upload()}
          />
        )}
      </View>
      {!!message && (
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          {message}
        </Text>
      )}
      <Field
        label="Αναζήτηση φωτογραφιών"
        value={query}
        onChange={(v) => {
          setQuery(v);
          setOffset(0);
        }}
      />
      <Status state={state} />
      <View style={ui.row}>
        {state.data.items.map((photo) => (
          <View key={photo.id} style={[ui.card, { width: 260 }]}>
            <ManagedImage
              source={{ uri: photo.url }}
              accessibilityLabel={photo.alt}
              resizeMode="contain"
              style={{ width: "100%", height: 150 }}
            />
            <Text style={ui.heading}>{photo.title}</Text>
            <Text style={ui.body}>
              {photo.width} × {photo.height} · {Math.round(photo.size / 1024)}{" "}
              KB
            </Text>
            {onSelect && (
              <Button
                label="Χρήση εικόνας"
                disabled={busy}
                onPress={() => onSelect(photo)}
              />
            )}
            <Button
              secondary
              label="Επεξεργασία στοιχείων"
              disabled={busy}
              onPress={() => {
                setEdit(photo);
                setTitle(photo.title);
                setAlt(photo.alt);
              }}
            />
            <Button
              secondary
              label={
                confirm === photo.id
                  ? "Επιβεβαίωση αρχειοθέτησης"
                  : "Αρχειοθέτηση εικόνας"
              }
              disabled={busy}
              onPress={() =>
                confirm !== photo.id
                  ? setConfirm(photo.id)
                  : void run(async () => {
                      await api.post(`/admin/media/${photo.id}/archive`, {
                        revision: photo.revision,
                      });
                      setConfirm(null);
                    }, "Η εικόνα αφαιρέθηκε από τις διαθέσιμες επιλογές. Οι υπάρχουσες δημοσιεύσεις διατηρούν την εικόνα τους.")
              }
            />
          </View>
        ))}
      </View>
      {!state.loading && !state.error && !state.data.items.length && (
        <Text style={ui.body}>Δεν βρέθηκαν φωτογραφίες.</Text>
      )}
      <View style={ui.row}>
        <Button
          secondary
          label="Προηγούμενες φωτογραφίες"
          disabled={offset === 0 || state.loading}
          onPress={() => setOffset(Math.max(0, offset - 20))}
        />
        <Button
          secondary
          label="Επόμενες φωτογραφίες"
          disabled={offset + 20 >= state.data.total || state.loading}
          onPress={() => setOffset(offset + 20)}
        />
      </View>
    </View>
  );
}
