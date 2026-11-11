import React from "react";
import { RetiredNotice } from "@/src/components/RetiredNotice";
import { useLanguage } from "@/src/components/AppNavigation";

// Old public receiver-feedback links are retired: show a notice, no submission.
export default function FeedbackRetired() {
  const { t } = useLanguage();
  return (
    <RetiredNotice
      publicPage
      title={t("Ο σύνδεσμος αποσύρθηκε", "The link has been withdrawn")}
      message={t(
        "Αυτός ο σύνδεσμος αξιολόγησης δεν είναι πλέον ενεργός και δεν δέχεται νέα υποβολή. Οι αξιολογήσεις γίνονται πλέον μέσα από τη νέα εκπαιδευτική διαδικασία της σχολής.",
        "This evaluation link is no longer active and does not accept new submissions. Evaluations are now done through the school's new training process.",
      )}
    />
  );
}
