import React from "react";
import { RetiredNotice } from "@/src/components/RetiredNotice";
import { useLanguage } from "@/src/components/AppNavigation";

export default function LegacyPracticesRetired() {
  const { t } = useLanguage();
  return (
    <RetiredNotice
      message={t(
        "Το ιστορικό παλαιότερων καταγραφών δεν είναι πλέον διαθέσιμο στην εφαρμογή. Η εμπειρία είναι ενιαία, μέσα από τη νέα εκπαιδευτική διαδικασία.",
        "The history of older records is no longer available in the app. The experience is now unified, through the new training process.",
      )}
      ctaHref="/(tabs)/practice"
      ctaLabel={t("→ Εκπαιδευτική πρακτική", "→ Training practice")}
    />
  );
}
