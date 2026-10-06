import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { wellness } from "@/src/theme";
import { ui } from "./Wellness";

const TONES = [
  { bg: wellness.lavender, ink: wellness.lavenderInk },
  { bg: wellness.sage, ink: wellness.sageInk },
  { bg: wellness.champagne, ink: wellness.champagneInk },
  { bg: wellness.blueMist, ink: wellness.slate },
];

const STATS = [
  { value: "60%", label: "νερό στο σώμα", caption: "Άριστος αγωγός του ήχου — φτάνει σε κυτταρικό επίπεδο." },
  { value: "4–8Hz", label: "κύματα Θήτα", caption: "Ο ήχος οδηγεί τον εγκέφαλο σε βαθιά χαλάρωση & διαίσθηση." },
  { value: "2.400+", label: "χρόνια ιστορίας", caption: "Οι ηχογαβάθες συνοδεύουν τον άνθρωπο από την εποχή του Βούδα." },
  { value: "7", label: "μέταλλα", caption: "Κάθε παραδοσιακό μπολ: μια νότα, ένας πλανήτης, ένα τσάκρα." },
];

const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "leaf-outline", label: "Βαθιά χαλάρωση" },
  { icon: "pulse-outline", label: "Λιγότερο άγχος & ένταση" },
  { icon: "heart-outline", label: "Χαμηλότερη πίεση" },
  { icon: "moon-outline", label: "Καλύτερος ύπνος" },
  { icon: "sparkles-outline", label: "Πνευματική διαύγεια" },
  { icon: "color-palette-outline", label: "Περισσότερη δημιουργικότητα" },
  { icon: "sync-outline", label: "Ισορροπία στα τσάκρα" },
  { icon: "flower-outline", label: "Εσωτερική αρμονία & γείωση" },
];

const INSTRUMENTS = [
  "Θιβετιανά μπολ",
  "Κρυστάλλινα μπολ",
  "Gong",
  "Μονόχορδο",
  "Τύμπανο",
  "Chimes",
  "Διαπασών",
  "Φωνή",
];

type Therapy = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  type: string;
  duration: string;
  text: string;
  benefits: string[];
};

const THERAPIES: Therapy[] = [
  {
    icon: "body-outline",
    title: "Ηχητικό Μασάζ",
    type: "Ατομική",
    duration: "1 ώρα",
    text: "Θιβετιανά μπολ τοποθετούνται πάνω και γύρω από το σώμα, στέλνοντας δονήσεις που χαλαρώνουν τους μύες και απελευθερώνουν ένταση.",
    benefits: ["Βαθιά χαλάρωση", "Απελευθέρωση έντασης", "Ισορροπία στα τσάκρα"],
  },
  {
    icon: "water-outline",
    title: "Sound Bath",
    type: "Ομαδική / ατομική",
    duration: "1:30 – 2 ώρες",
    text: "«Λούζεσαι» σε θεραπευτικά ηχητικά κύματα από μπολ, gong, μονόχορδο και φωνή — ιδανικό για αρχάριους στον διαλογισμό.",
    benefits: ["Βαθιά διαλογιστική εμπειρία", "Ηρεμία & διαύγεια", "Χωρίς καμία εμπειρία"],
  },
  {
    icon: "compass-outline",
    title: "Hero's Journey",
    type: "Ατομική σειρά",
    duration: "2 ώρες · 4–12 συνεδρίες",
    text: "Ολιστική διαδρομή εμπνευσμένη από το «Ταξίδι του Ήρωα»: αφήνεις παλιά μοτίβα και δημιουργείς μια νέα ιστορία για τον εαυτό σου.",
    benefits: ["Απελευθέρωση παλιών μοτίβων", "Αυτογνωσία", "Μεταμόρφωση & ανανέωση"],
  },
  {
    icon: "musical-note-outline",
    title: "Tuning Fork Therapy",
    type: "Ατομική",
    duration: "1 ώρα",
    text: "Διαπασών πάνω και γύρω από το σώμα συντονίζονται με τις φυσικές του συχνότητες και αποφορτίζουν το νευρικό σύστημα.",
    benefits: ["Ευθυγράμμιση τσάκρα", "Διαύγεια σκέψης", "Βαθιά χαλάρωση"],
  },
  {
    icon: "bed-outline",
    title: "Vibroacoustic Therapy",
    type: "Ατομική",
    duration: "~30 λεπτά",
    text: "Ειδικό στρώμα μεταδίδει δονήσεις χαμηλών συχνοτήτων στο σώμα, ενώ απολαμβάνεις θεραπευτικούς ήχους — μια πολυαισθητηριακή εμπειρία.",
    benefits: ["Ρύθμιση νευρικού συστήματος", "Καλύτερος ύπνος", "Αίσθηση γείωσης"],
  },
];

const EXPECT = [
  "Καλωσόρισμα & οι στόχοι της συνεδρίας",
  "Σύντομος καθοδηγούμενος διαλογισμός",
  "Η εμπειρία του ήχου σε όλο το σώμα",
  "Απαλή επιστροφή στο «εδώ & τώρα»",
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Text style={[ui.label, { color: wellness.lavenderInk, letterSpacing: 1.6 }]}>
      {children}
    </Text>
  );
}

function TherapyCard({ t, tone }: { t: Therapy; tone: { bg: string; ink: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => setOpen((o) => !o)}
      style={[ui.card, { gap: 10 }]}
    >
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: tone.bg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={t.icon} size={22} color={tone.ink} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[ui.heading, { fontSize: 17 }]}>{t.title}</Text>
          <Text style={{ fontSize: 12, color: wellness.muted }}>
            {t.type} · {t.duration}
          </Text>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={wellness.slate}
        />
      </View>
      <Text style={[ui.body, { color: wellness.ink }]}>{t.text}</Text>
      {open && (
        <View style={{ gap: 8, paddingTop: 2 }}>
          {t.benefits.map((b) => (
            <View key={b} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <Ionicons name="checkmark-circle" size={16} color={tone.ink} />
              <Text style={[ui.body, { color: wellness.ink }]}>{b}</Text>
            </View>
          ))}
        </View>
      )}
      {!open && (
        <Text style={{ fontSize: 12, color: wellness.lavenderInk, fontWeight: "700" }}>
          Δες τα οφέλη →
        </Text>
      )}
    </Pressable>
  );
}

export function SoundHealingGuide() {
  const router = useRouter();
  return (
    <View style={{ gap: 32, paddingTop: 8 }}>
      {/* What is it */}
      <View style={{ gap: 10 }}>
        <Eyebrow>ΤΙ ΕΙΝΑΙ</Eyebrow>
        <Text style={ui.heading}>Ο ήχος ως θεραπεία</Text>
        <Text style={[ui.body, { fontSize: 15, lineHeight: 24, color: wellness.ink }]}>
          Από την αρχαία Ελλάδα ως το Θιβέτ, πολιτισμοί χρησιμοποίησαν τον ήχο για
          θεραπεία και διαλογισμό. Μπολ, gong και κύμβαλα δονούνται σε συχνότητες που
          ταξιδεύουν μέσα στο σώμα και φέρνουν αρμονία σε νου, σώμα και πνεύμα.
        </Text>
      </View>

      {/* Stats infographic */}
      <View style={{ gap: 12 }}>
        <Eyebrow>ΜΕ ΜΙΑ ΜΑΤΙΑ</Eyebrow>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {STATS.map((s, i) => {
            const tone = TONES[i % TONES.length];
            return (
              <View
                key={s.label}
                style={{
                  flexGrow: 1,
                  flexBasis: "47%",
                  backgroundColor: tone.bg,
                  borderRadius: 18,
                  padding: 16,
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 30, fontWeight: "800", color: tone.ink }}>
                  {s.value}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: wellness.ink, letterSpacing: 0.4 }}>
                  {s.label}
                </Text>
                <Text style={{ fontSize: 12, lineHeight: 18, color: wellness.muted }}>
                  {s.caption}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* How it works */}
      <View style={[ui.card, { backgroundColor: wellness.ice, gap: 10 }]}>
        <Eyebrow>ΠΩΣ ΔΟΥΛΕΥΕΙ</Eyebrow>
        <Text style={[ui.body, { fontSize: 15, lineHeight: 24, color: wellness.ink }]}>
          Τα πάντα δονούνται. Το άγχος «ξεκουρδίζει» το σώμα, όπως ένα όργανο εκτός
          τόνου. Οι ηχογαβάθες λειτουργούν σαν διαπασών: αποκαθιστούν την υγιή δόνηση
          και ενεργοποιούν τις αυτοθεραπευτικές δυνάμεις του οργανισμού.
        </Text>
      </View>

      {/* Benefits */}
      <View style={{ gap: 12 }}>
        <Eyebrow>ΤΑ ΟΦΕΛΗ</Eyebrow>
        <Text style={ui.heading}>Τι κερδίζεις</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {BENEFITS.map((b, i) => {
            const tone = TONES[i % TONES.length];
            return (
              <View
                key={b.label}
                style={{
                  flexGrow: 1,
                  flexBasis: "47%",
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                  backgroundColor: wellness.white,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: wellness.line,
                  padding: 12,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: tone.bg,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={b.icon} size={17} color={tone.ink} />
                </View>
                <Text style={{ flex: 1, fontSize: 13, color: wellness.ink, fontWeight: "600" }}>
                  {b.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Instruments */}
      <View style={{ gap: 12 }}>
        <Eyebrow>ΤΑ ΟΡΓΑΝΑ</Eyebrow>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {INSTRUMENTS.map((ins) => (
            <View
              key={ins}
              style={{
                flexDirection: "row",
                gap: 6,
                alignItems: "center",
                backgroundColor: wellness.lavender,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
              }}
            >
              <Ionicons name="musical-notes-outline" size={14} color={wellness.lavenderInk} />
              <Text style={{ fontSize: 12, color: wellness.lavenderInk, fontWeight: "700" }}>
                {ins}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Therapies */}
      <View style={{ gap: 12 }}>
        <Eyebrow>ΟΙ ΘΕΡΑΠΕΙΕΣ</Eyebrow>
        <Text style={ui.heading}>Βρες αυτή που σου ταιριάζει</Text>
        {THERAPIES.map((t, i) => (
          <TherapyCard key={t.title} t={t} tone={TONES[i % TONES.length]} />
        ))}
      </View>

      {/* What to expect */}
      <View style={{ gap: 12 }}>
        <Eyebrow>ΤΙ ΝΑ ΠΕΡΙΜΕΝΕΙΣ</Eyebrow>
        <View style={{ gap: 10 }}>
          {EXPECT.map((step, i) => (
            <View key={step} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: wellness.lavenderInk,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 14 }}>
                  {i + 1}
                </Text>
              </View>
              <Text style={[ui.body, { flex: 1, color: wellness.ink }]}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA — stays in app */}
      <View
        style={[
          ui.card,
          { backgroundColor: wellness.lavender, borderColor: wellness.lavenderInk, gap: 12 },
        ]}
      >
        <Text style={[ui.heading, { color: wellness.ink }]}>Έτοιμος να το βιώσεις;</Text>
        <Text style={[ui.body, { color: wellness.ink }]}>
          Στείλε μήνυμα και βρες μαζί με τον Μανώλη τη συνεδρία που σου ταιριάζει.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/explore/contact")}
          style={({ pressed }) => ({
            flexDirection: "row",
            gap: 8,
            alignItems: "center",
            alignSelf: "flex-start",
            backgroundColor: wellness.lavenderInk,
            paddingVertical: 13,
            paddingHorizontal: 20,
            borderRadius: 24,
            minHeight: 48,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>
            Μίλα μαζί μας
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
