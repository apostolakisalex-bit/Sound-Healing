import React from "react";
import { RetiredNotice } from "@/src/components/RetiredNotice";

// Old public receiver-feedback links are retired: show a Greek notice, no submission.
export default function FeedbackRetired() {
  return (
    <RetiredNotice
      publicPage
      title="Ο σύνδεσμος αποσύρθηκε"
      message="Αυτός ο σύνδεσμος αξιολόγησης δεν είναι πλέον ενεργός και δεν δέχεται νέα υποβολή. Οι αξιολογήσεις γίνονται πλέον μέσα από τη νέα εκπαιδευτική διαδικασία της σχολής."
    />
  );
}
