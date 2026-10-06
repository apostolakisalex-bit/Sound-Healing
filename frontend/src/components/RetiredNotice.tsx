import React from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import { Shell, ui } from "./Wellness";

// Shared Greek "feature withdrawn" notice for retired legacy routes.
// Keeps a single, unified experience — the old environment never renders.
export function RetiredNotice({
  title = "Η λειτουργία αποσύρθηκε",
  message,
  ctaHref,
  ctaLabel,
  publicPage = false,
}: {
  title?: string;
  message: string;
  ctaHref?: string;
  ctaLabel?: string;
  publicPage?: boolean;
}) {
  return (
    <Shell publicPage={publicPage} eyebrow="ΕΝΗΜΕΡΩΣΗ" title={title}>
      <View style={ui.card}>
        <Text style={ui.body}>{message}</Text>
        {!!ctaHref && (
          <Link href={ctaHref as any} style={[ui.body, { marginTop: 12 }]}>
            {ctaLabel || "Συνέχεια"}
          </Link>
        )}
      </View>
    </Shell>
  );
}
