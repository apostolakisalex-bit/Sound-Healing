// Shared upload + resource list for Sound Healing Greece.
// Used in: Level detail, Realm detail, and Admin resources screen.
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, StyleSheet, Pressable, Alert, ActivityIndicator, Platform, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Body, Overline, GlowCard, AuraButton } from '@/src/components/UI';
import { useAuth } from '@/src/auth/AuthContext';
import { api } from '@/src/api/client';
import { colors, spacing, radii } from '@/src/theme';

export type ParentType = 'academy_level' | 'academy_lesson' | 'realm';

const ICON_FOR_TYPE = (ct: string): keyof typeof Ionicons.glyphMap => {
  if (ct.startsWith('image/')) return 'image-outline';
  if (ct.includes('pdf')) return 'document-text-outline';
  if (ct.includes('word') || ct.includes('document')) return 'document-outline';
  return 'attach-outline';
};

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/*',
];

const fmtSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

type Resource = {
  id: string; name: string; description: string;
  content_type: string; file_size: number;
  required_level?: string; required_xp: number;
  uploaded_by: string; created_at: string;
  is_unlocked?: boolean;
};

export function ResourcesSection({
  parentType, parentId, levelId, title = 'Resources',
}: { parentType: ParentType; parentId: string; levelId?: string; title?: string }) {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const isAdmin = user?.role === 'admin';

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/resources', {
        params: { parent_type: parentType, parent_id: parentId },
      });
      setResources(data);
    } catch { /* silent */ }
  }, [parentType, parentId]);

  useEffect(() => { load(); }, [load]);

  const pickAndUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ACCEPTED_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      if (!file) return;
      if (file.size && file.size > 12 * 1024 * 1024) {
        Alert.alert('File too large', 'Max 12 MB per file.');
        return;
      }
      setUploading(true);
      // Read as base64
      let base64: string;
      if (Platform.OS === 'web') {
        // On web, fetch the blob URI and convert
        const blob = await (await fetch(file.uri)).blob();
        base64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result).split(',')[1] || '');
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
      } else {
        base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
      }
      await api.post('/admin/resources', {
        name: file.name,
        description: '',
        parent_type: parentType,
        parent_id: parentId,
        level_id: levelId,
        file_data: base64,
        content_type: file.mimeType || 'application/octet-stream',
        file_size: file.size || base64.length,
      });
      await load();
      Alert.alert('Uploaded', `${file.name} added to ${title}.`);
    } catch (e: any) {
      Alert.alert('Upload failed', e?.response?.data?.detail || e?.message || 'Try again');
    } finally {
      setUploading(false);
    }
  };

  const downloadOrOpen = async (r: Resource) => {
    if (!r.is_unlocked) {
      Alert.alert('Resource locked', `Earn ${r.required_xp} Sound XP to unlock this resource.`);
      return;
    }
    setDownloading(r.id);
    try {
      const { data } = await api.get(`/resources/${r.id}/download`);
      const dataUri = `data:${data.content_type};base64,${data.file_data}`;
      if (Platform.OS === 'web') {
        // Open in a new tab / download
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = data.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Write to temp file and share/open
        const ext = data.name.includes('.') ? data.name.split('.').pop() : 'bin';
        const tmpPath = `${FileSystem.cacheDirectory}${data.id}.${ext}`;
        await FileSystem.writeAsStringAsync(tmpPath, data.file_data, { encoding: FileSystem.EncodingType.Base64 });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(tmpPath, { mimeType: data.content_type, dialogTitle: data.name });
        } else {
          await Linking.openURL(tmpPath);
        }
      }
    } catch (e: any) {
      Alert.alert('Open failed', e?.response?.data?.detail || e?.message || 'Try again');
    } finally {
      setDownloading(null);
    }
  };

  const removeResource = async (r: Resource) => {
    Alert.alert('Remove resource?', `Delete "${r.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try { await api.delete(`/admin/resources/${r.id}`); await load(); }
          catch (e: any) { Alert.alert('Delete failed', e?.response?.data?.detail || 'Try again'); }
        },
      },
    ]);
  };

  return (
    <View style={{ marginTop: spacing.lg }} testID={`resources-${parentType}-${parentId}`}>
      <View style={styles.headRow}>
        <View>
          <Overline color={colors.accent.gold}>{title}</Overline>
          <Body size="small" color={colors.text.muted} style={{ marginTop: 4 }}>
            {resources.length > 0 ? `${resources.length} document${resources.length === 1 ? '' : 's'}` : 'No documents yet'}
          </Body>
        </View>
        {isAdmin ? (
          <Pressable
            testID="upload-resource-btn"
            onPress={pickAndUpload}
            disabled={uploading}
            style={({ pressed }) => [styles.uploadBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            {uploading ? (
              <ActivityIndicator color={colors.accent.gold} size="small" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={16} color={colors.accent.gold} />
                <Body size="caption" weight="semi" color={colors.accent.gold} style={{ letterSpacing: 1, textTransform: 'uppercase' }}>
                  Upload
                </Body>
              </>
            )}
          </Pressable>
        ) : null}
      </View>

      {resources.length === 0 && !isAdmin ? (
        <GlowCard style={{ marginTop: spacing.sm }}>
          <Body size="small" color={colors.text.muted}>The temple keepers haven't placed any documents here yet.</Body>
        </GlowCard>
      ) : null}

      {resources.map((r, i) => (
        <Animated.View key={r.id} entering={FadeInDown.delay(i * 60).duration(400)}>
          <Pressable
            onPress={() => downloadOrOpen(r)}
            disabled={downloading === r.id}
            testID={`resource-${r.id}`}
            style={({ pressed }) => [styles.resCard, { opacity: pressed ? 0.85 : 1 }, !r.is_unlocked && styles.resLocked]}
          >
            <View style={styles.resIconBox}>
              {downloading === r.id ? (
                <ActivityIndicator color={colors.accent.gold} size="small" />
              ) : (
                <Ionicons
                  name={r.is_unlocked ? ICON_FOR_TYPE(r.content_type) : 'lock-closed'}
                  size={22}
                  color={r.is_unlocked ? colors.accent.gold : colors.text.muted}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Body weight="semi" color={colors.text.primary} numberOfLines={1}>{r.name}</Body>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 2, flexWrap: 'wrap' }}>
                <Body size="caption" color={colors.text.muted}>{fmtSize(r.file_size)}</Body>
                {r.required_xp > 0 ? (
                  <Body size="caption" color={r.is_unlocked ? colors.status.success : colors.status.warning}>
                    · {r.required_level} · {r.required_xp} XP
                  </Body>
                ) : null}
                <Body size="caption" color={colors.text.muted}>· by {r.uploaded_by}</Body>
              </View>
            </View>
            {isAdmin ? (
              <Pressable
                onPress={() => removeResource(r)}
                testID={`delete-resource-${r.id}`}
                style={({ pressed }) => [styles.delBtn, { opacity: pressed ? 0.6 : 1 }]}
                hitSlop={10}
              >
                <Ionicons name="trash-outline" size={16} color={colors.status.danger} />
              </Pressable>
            ) : (
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            )}
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: spacing.sm,
    borderRadius: radii.full, borderWidth: 1, borderColor: colors.accent.gold,
    backgroundColor: 'transparent',
  },
  resCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, marginTop: spacing.sm,
    borderRadius: radii.md, backgroundColor: colors.bg.secondary,
    borderWidth: 1, borderColor: colors.border.subtle,
  },
  resLocked: { opacity: 0.6 },
  resIconBox: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1, borderColor: colors.accent.gold,
  },
  delBtn: { padding: 6 },
});
