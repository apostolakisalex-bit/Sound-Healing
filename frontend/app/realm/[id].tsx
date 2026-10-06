import React from "react";
import { RetiredNotice } from "@/src/components/RetiredNotice";

export default function RealmRetired() {
  return (
    <RetiredNotice
      message="Αυτή η ενότητα αποσύρθηκε. Η εμπειρία είναι πλέον ενιαία, μέσα από τη νέα εκπαιδευτική διαδικασία."
      ctaHref="/"
      ctaLabel="→ Αρχική"
    />
  );
}
