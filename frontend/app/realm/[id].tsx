import React from "react";
import { RetiredNotice } from "@/src/components/RetiredNotice";
import { useLanguage } from "@/src/components/AppNavigation";

export default function RealmRetired() {
  const { t } = useLanguage();
  return (
    <RetiredNotice
      message={t(
        "Αυτή η ενότητα αποσύρθηκε. Η εμπειρία είναι πλέον ενιαία, μέσα από τη νέα εκπαιδευτική διαδικασία.",
        "This section has been withdrawn. The experience is now unified, through the new training process.",
      )}
      ctaHref="/"
      ctaLabel={t("→ Αρχική", "→ Home")}
    />
  );
}
