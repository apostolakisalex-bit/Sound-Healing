import React from "react";
import { RetiredNotice } from "@/src/components/RetiredNotice";

export default function LegacyPracticesRetired() {
  return (
    <RetiredNotice
      message="Το ιστορικό παλαιότερων καταγραφών δεν είναι πλέον διαθέσιμο στην εφαρμογή. Η εμπειρία είναι ενιαία, μέσα από τη νέα εκπαιδευτική διαδικασία."
      ctaHref="/(tabs)/practice"
      ctaLabel="→ Εκπαιδευτική πρακτική"
    />
  );
}
