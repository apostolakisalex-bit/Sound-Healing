import { Alert, Linking, Platform, Share } from "react-native";

export type SeminarCalEvent = {
  title: string;
  location?: string;
  start?: string; // ISO yyyy-mm-dd
  end?: string; // ISO yyyy-mm-dd
  notes?: string;
};

/** Add a seminar to the user's calendar.
 *  Web → Google Calendar event template. Native → device calendar via expo-calendar. */
export async function addToDeviceCalendar(ev: SeminarCalEvent) {
  const start = ev.start || ev.end;
  const end = ev.end || ev.start;
  if (!start || !end) {
    Alert.alert("Ημερομηνία μη διαθέσιμη");
    return;
  }
  const title = ev.title;
  const location = ev.location || "";
  const notes = ev.notes || "";

  if (Platform.OS === "web") {
    const ymd = (iso: string) => iso.replace(/-/g, "");
    const e = new Date(`${end}T00:00:00`);
    e.setDate(e.getDate() + 1);
    const endExcl = `${e.getFullYear()}${String(e.getMonth() + 1).padStart(2, "0")}${String(
      e.getDate(),
    ).padStart(2, "0")}`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title,
    )}&dates=${ymd(start)}/${endExcl}&details=${encodeURIComponent(
      notes,
    )}&location=${encodeURIComponent(location)}`;
    void Linking.openURL(url);
    return;
  }

  try {
    const Calendar = await import("expo-calendar");
    let perm = await Calendar.getCalendarPermissionsAsync();
    if (perm.status !== "granted") {
      perm = await Calendar.requestCalendarPermissionsAsync();
    }
    if (perm.status !== "granted") {
      Alert.alert(
        "Άδεια ημερολογίου",
        perm.canAskAgain
          ? "Χρειαζόμαστε πρόσβαση στο ημερολόγιο για να προσθέσουμε το σεμινάριο."
          : "Δώσε πρόσβαση στο ημερολόγιο από τις Ρυθμίσεις.",
        perm.canAskAgain
          ? [{ text: "Εντάξει" }]
          : [
              { text: "Άκυρο", style: "cancel" },
              { text: "Ρυθμίσεις", onPress: () => void Linking.openSettings() },
            ],
      );
      return;
    }
    let calId = "";
    try {
      const def = await Calendar.getDefaultCalendarAsync();
      calId = def?.id || "";
    } catch {
      calId = "";
    }
    if (!calId) {
      const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const writable = cals.find((c) => c.allowsModifications) || cals[0];
      calId = writable?.id || "";
    }
    if (!calId) {
      Alert.alert("Δεν βρέθηκε ημερολόγιο στη συσκευή.");
      return;
    }
    await Calendar.createEventAsync(calId, {
      title,
      location,
      notes,
      startDate: new Date(`${start}T09:00:00`),
      endDate: new Date(`${end}T18:00:00`),
      timeZone: "Europe/Athens",
      alarms: [{ relativeOffset: -60 * 24 }],
    });
    Alert.alert("Έτοιμο ✓", "Το σεμινάριο προστέθηκε στο ημερολόγιό σου.");
  } catch {
    Alert.alert("Ωχ!", "Δεν μπορέσαμε να προσθέσουμε το σεμινάριο. Δοκίμασε ξανά.");
  }
}

/** Share a seminar with friends (native share sheet / Web Share API / clipboard). */
export async function shareSeminar(title: string, url: string) {
  const message = url ? `${title}\n${url}` : title;
  if (Platform.OS === "web") {
    const nav: any = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav?.share) {
      try {
        await nav.share({ title, text: title, url });
      } catch {
        /* user cancelled */
      }
      return;
    }
    if (nav?.clipboard?.writeText && url) {
      try {
        await nav.clipboard.writeText(url);
        Alert.alert("Αντιγράφηκε", "Ο σύνδεσμος αντιγράφηκε στο πρόχειρο.");
        return;
      } catch {
        /* ignore */
      }
    }
    if (url) void Linking.openURL(url);
    return;
  }
  try {
    await Share.share({ title, message, url });
  } catch {
    /* user cancelled */
  }
}
