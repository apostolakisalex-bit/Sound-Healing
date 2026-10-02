import { wellness } from "@/src/theme";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import Head from "expo-router/head";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";
import { Shell, ui } from "./Wellness";

// Editorial summaries of soundhealing.gr/el/ekpaideftika-seminaria/.
// Practice targets and certification rules remain managed by the school.
const levels = [
  {
    title: "Τα θεμέλια",
    subtitle: "Himalayan singing bowls",
    audience: "Για αρχάριους, χωρίς προηγούμενη εμπειρία.",
    body: "Γνωριμία με τα μπολ, τις παραδόσεις και τις τεχνικές παιξίματος. Εξερευνάς τη χρήση ενός έως τριών μπολ, τον προσωπικό διαλογισμό και τη δομή μιας ατομικής συνεδρίας.",
    practice:
      "Η ατομική πρακτική συνοδεύεται από καταγραφή και αξιολόγηση της εμπειρίας.",
  },
  {
    title: "Εμβάθυνση",
    subtitle: "Singing bowls · Tingsha · Chimes",
    audience: "Συνέχεια της εκπαίδευσης του Level 1.",
    body: "Προχωρημένοι συνδυασμοί έως επτά μπολ, φωνή, κρυστάλλινα μπολ και συμπληρωματικά όργανα. Εμβαθύνεις στη χαλάρωση και στη σύνθεση της ατομικής συνεδρίας.",
    practice:
      "Παρακολουθείς διαδοχικές συνεδρίες με τον ίδιο δέκτη, την πρόθεσή του και την ανατροφοδότηση μετά από κάθε πρακτική.",
  },
  {
    title: "Ομαδικά Sound Baths",
    subtitle: "Singing bowls · Gong · Ομάδα",
    audience: "Για όσους συνεχίζουν μετά τα δύο βασικά επίπεδα.",
    body: "Συντονισμός ομάδων με γκονγκ, κρυστάλλινα μπολ, τύμπανα και πρόσθετα όργανα. Δημιουργία ηχητικών διαδρομών με έμφαση στη ροή και στον ασφαλή χώρο.",
    practice:
      "Καταγράφεις τις ομαδικές πρακτικές και συγκεντρώνεις αξιολογήσεις της εμπειρίας των συμμετεχόντων.",
  },
  {
    title: "Επαγγελματική ανάπτυξη",
    subtitle: "Εμβάθυνση & προσωπική προσέγγιση",
    audience: "Το τέταρτο στάδιο της εκπαιδευτικής διαδρομής.",
    body: "Εμβάθυνση στην πρακτική, προσέγγιση με επίγνωση του τραύματος, εισαγωγή στα διαπασών και ανάπτυξη επαγγελματικών συνεργασιών.",
    practice:
      "Οι αναλυτικές οδηγίες πρακτικής και ολοκλήρωσης παρέχονται από τη σχολή.",
  },
];

export function LevelSymbol({
  level,
  size = 52,
}: {
  level: number;
  size?: number;
}) {
  const bowl = (
    <G>
      <Ellipse cx="24" cy="35" rx="17" ry="4" fill={wellness.blueMist} />
      <Path d="M7 35 Q9 52 24 52 Q39 52 41 35 M17 55 H31 M31 25 L42 13" />
      <Path d="M12 27 Q24 21 36 27" opacity={0.45} />
    </G>
  );
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 80 64"
      accessibilityLabel={
        [
          "Singing bowl",
          "Singing bowl, tingsha και chimes",
          "Singing bowl, γκονγκ και ομάδα",
          "Λωτός",
        ][level - 1]
      }
    >
      <G
        stroke={wellness.slate}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {level === 1 && <G transform="translate(15 0)">{bowl}</G>}
        {level === 2 && (
          <>
            {bowl}
            <Path d="M50 10 H74 M53 10 V28 M59 10 V34 M65 10 V25 M71 10 V31 M47 45 Q57 31 68 45" />
            <Ellipse cx="47" cy="47" rx="7" ry="3" fill={wellness.blueMist} />
            <Ellipse cx="69" cy="47" rx="7" ry="3" fill={wellness.blueMist} />
          </>
        )}
        {level === 3 && (
          <>
            <Path d="M39 35 V7 H72 V35" />
            <Circle cx="55" cy="22" r="12" fill={wellness.blueMist} />
            <Circle cx="55" cy="22" r="3" />
            <G transform="translate(0 4) scale(.8)">{bowl}</G>
            {[45, 57, 69].map((x) => (
              <G key={x}>
                <Circle cx={x} cy="45" r="3" />
                <Path d={`M${x - 4} 57 V54 Q${x} 47 ${x + 4} 54 V57`} />
              </G>
            ))}
          </>
        )}
        {level === 4 && (
          <>
            <Path
              d="M40 52 C18 39 29 18 40 8 C51 18 62 39 40 52Z"
              fill={wellness.blueMist}
            />
            <Path d="M40 52 C14 54 9 35 10 23 C28 23 40 34 40 52 M40 52 C66 54 71 35 70 23 C52 23 40 34 40 52 M40 52 Q17 62 5 41 Q19 37 29 44 M40 52 Q63 62 75 41 Q61 37 51 44" />
          </>
        )}
      </G>
    </Svg>
  );
}

export function TrainingLevelCards() {
  const router = useRouter();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
      {levels.map((level, index) => (
        <Pressable
          key={index}
          accessibilityRole="link"
          accessibilityLabel={`Level ${index + 1}: ${level.title}. Αναλυτική παρουσίαση`}
          onPress={() =>
            router.push(`/explore/levels?level=${index + 1}` as any)
          }
          style={({ pressed }) => ({
            flexBasis: "46%",
            flexGrow: 1,
            padding: 16,
            borderRadius: 18,
            backgroundColor: pressed ? wellness.blueSelected : wellness.ice,
            borderWidth: 1,
            borderColor: wellness.line,
            shadowColor: "#635335",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.07,
            shadowRadius: 7,
            elevation: 2,
            gap: 6,
          })}
        >
          <LevelSymbol level={index + 1} />
          <Text style={[ui.label, { fontSize: 11 }]}>LEVEL {index + 1}</Text>
          <Text style={[ui.body, { fontSize: 15, fontWeight: "600" }]}>
            {level.title}
          </Text>
          <Text style={[ui.body, { fontSize: 12, lineHeight: 18 }]}>
            {level.subtitle}
          </Text>
          <Text style={[ui.body, { fontSize: 12, color: wellness.slate }]}>
            Γνώρισε το επίπεδο →
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function TrainingLevelsPage() {
  const { level } = useLocalSearchParams<{ level?: string }>();
  const selected = Number(level);
  const [open, setOpen] = useState<number[]>(
    [1, 2, 3, 4].includes(selected) ? [selected] : [1],
  );
  return (
    <Shell publicPage title="Η εκπαιδευτική διαδρομή" eyebrow="ΤΕΣΣΕΡΑ ΕΠΙΠΕΔΑ">
      <Head>
        <title>Τα 4 Levels · Sound Healing Greece</title>
      </Head>
      <Link href="/explore/training" style={[ui.body, { color: wellness.slate }]}>
        ← Εκπαιδευτικά
      </Link>
      <Text style={ui.body}>
        Από την πρώτη επαφή με τα singing bowls μέχρι την εμβάθυνση στην
        επαγγελματική πρακτική. Γνώρισε το περιεχόμενο κάθε επιπέδου.
      </Text>
      {levels.map((item, index) => {
        const number = index + 1,
          expanded = open.includes(number);
        return (
          <View
            key={number}
            style={[ui.card, { borderRadius: 18, padding: 18 }]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              accessibilityLabel={`Level ${number}: ${item.title}`}
              onPress={() =>
                setOpen((previous) =>
                  expanded
                    ? previous.filter((value) => value !== number)
                    : [...previous, number],
                )
              }
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <LevelSymbol level={number} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={ui.label}>LEVEL {number}</Text>
                <Text style={[ui.body, { fontSize: 16, fontWeight: "600" }]}>
                  {item.title}
                </Text>
              </View>
              <Text style={ui.body}>{expanded ? "−" : "+"}</Text>
            </Pressable>
            {expanded && (
              <View style={{ gap: 12, paddingTop: 16 }}>
                <Text style={[ui.body, { fontWeight: "600" }]}>
                  {item.audience}
                </Text>
                <Text style={ui.body}>{item.body}</Text>
                <Text style={ui.label}>Η ΠΡΑΚΤΙΚΗ ΣΟΥ</Text>
                <Text style={ui.body}>{item.practice}</Text>
              </View>
            )}
          </View>
        );
      })}
      <Link href="/explore/training" style={[ui.body, { color: wellness.slate }]}>
        Δες τα εκπαιδευτικά σεμινάρια →
      </Link>
      <Link
        href="https://www.soundhealing.gr/el/ekpaideftika-seminaria/"
        style={[ui.body, { color: wellness.slate }]}
      >
        Αναλυτικό πρόγραμμα της σχολής ↗
      </Link>
    </Shell>
  );
}
