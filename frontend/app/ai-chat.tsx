import React from "react";
import { RetiredNotice } from "@/src/components/RetiredNotice";
import { useLanguage } from "@/src/components/AppNavigation";

export default function AiOracleRetired() {
  const { t } = useLanguage();
  return (
    <RetiredNotice
      message={t(
        "Ο βοηθός «Aeon» αποσύρθηκε. Η εφαρμογή επικεντρώνεται αποκλειστικά στη νέα εκπαιδευτική διαδικασία.",
        "The \u00abAeon\u00bb assistant has been withdrawn. The app now focuses exclusively on the new training process.",
      )}
      ctaHref="/"
      ctaLabel={t("→ Αρχική", "→ Home")}
    />
  );
}
