import { wellness } from "@/src/theme";
import { ManagedImage } from "./ManagedImage";
import React, { useState, useEffect } from "react";
import { Image, Text, View } from "react-native";
import { Link } from "expo-router";
import { ui } from "./Wellness";

export function EditorialIntro({
  title,
  summary,
  body,
  imageUrl,
  imageAlt,
  actionLabel,
  actionUrl,
  preview = false,
}: {
  title: string;
  summary: string;
  body: string;
  imageUrl?: string;
  imageAlt?: string;
  actionLabel?: string;
  actionUrl?: string;
  preview?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [imageUrl]);
  const image = (imageUrl?.startsWith("https://") || imageUrl?.startsWith("/api/media/")) && !failed;
  const action = actionLabel && actionUrl?.startsWith("https://");
  return (
    <View style={[ui.card, { padding: 0, overflow: "hidden" }]}>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "stretch",
        }}
      >
        {image && (
          <View style={{ flexBasis: 320, flexGrow: 1, minHeight: 260 }}>
            <ManagedImage
              source={{ uri: imageUrl }}
              accessibilityLabel={imageAlt || title}
              onError={() => setFailed(true)}
              resizeMode="cover"
              style={{ width: "100%", height: 260 }}
            />
          </View>
        )}
        <View
          style={{
            flexBasis: 320,
            flexGrow: 1,
            padding: 22,
            gap: 14,
            justifyContent: "center",
          }}
        >
          <Text accessibilityRole="header" style={ui.title}>
            {title}
          </Text>
          {!!summary && <Text style={ui.body}>{summary}</Text>}
          {!!body && <Text style={ui.body}>{body}</Text>}
          {action &&
            (preview ? (
              <Text style={ui.label}>{actionLabel} ↗</Text>
            ) : (
              <Link
                href={actionUrl as any}
                style={[
                  ui.body,
                  {
                    color: wellness.slate,
                    textDecorationLine: "underline",
                    paddingVertical: 12,
                  },
                ]}
              >
                {actionLabel} ↗
              </Link>
            ))}
          {preview && failed && (
            <Text style={ui.body}>
              Η εικόνα δεν φορτώθηκε. Έλεγξε τον σύνδεσμο.
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
