import React from "react";
import { RetiredNotice } from "@/src/components/RetiredNotice";

export default function AiOracleRetired() {
  return (
    <RetiredNotice
      message="Ο βοηθός «Aeon» αποσύρθηκε. Η εφαρμογή επικεντρώνεται αποκλειστικά στη νέα εκπαιδευτική διαδικασία."
      ctaHref="/"
      ctaLabel="→ Αρχική"
    />
  );
}
