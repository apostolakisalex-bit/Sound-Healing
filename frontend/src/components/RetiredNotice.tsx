import React from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import { Shell, useUi } from "./Wellness";
import { useLanguage } from "./AppNavigation";

// Shared "feature withdrawn" notice for retired legacy routes.
// Keeps a single, unified experience — the old environment never renders.
export function RetiredNotice({
  title,
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
  const ui = useUi();
  const { t } = useLanguage();
  return (
    <Shell
      publicPage={publicPage}
      eyebrow={t("ΕΝΗΜΕΡΩΣΗ", "UPDATE")}
      title={title ?? t("Η λειτουργία αποσύρθηκε", "This feature has been withdrawn")}
    >
      <View style={ui.card}>
        <Text style={ui.body}>{message}</Text>
        {!!ctaHref && (
          <Link href={ctaHref as any} style={[ui.body, { marginTop: 12 }]}>
            {ctaLabel || t("Συνέχεια", "Continue")}
          </Link>
        )}
      </View>
    </Shell>
  );
}
