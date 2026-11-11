import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";
import { useUi } from "./Wellness";
import { useLanguage } from "./AppNavigation";

type Tr = (el: string, en: string) => string;
const makeStats = (t: Tr) => [
  { value: "60%", label: t("νερό στο σώμα", "water in the body"), caption: t("Άριστος αγωγός του ήχου — φτάνει σε κυτταρικό επίπεδο.", "An excellent conductor of sound — it reaches cellular level.") },
  { value: "4–8Hz", label: t("κύματα Θήτα", "Theta waves"), caption: t("Ο ήχος οδηγεί τον εγκέφαλο σε βαθιά χαλάρωση & διαίσθηση.", "Sound guides the brain into deep relaxation & intuition.") },
  { value: "2.400+", label: t("χρόνια ιστορίας", "years of history"), caption: t("Οι ηχογαβάθες συνοδεύουν τον άνθρωπο από την εποχή του Βούδα.", "Singing bowls have accompanied humankind since the time of the Buddha.") },
  { value: "7", label: t("μέταλλα", "metals"), caption: t("Κάθε παραδοσιακό μπολ: μια νότα, ένας πλανήτης, ένα τσάκρα.", "Each traditional bowl: one note, one planet, one chakra.") },
];

const makeBenefits = (t: Tr): { icon: keyof typeof Ionicons.glyphMap; label: string }[] => [
  { icon: "leaf-outline", label: t("Βαθιά χαλάρωση", "Deep relaxation") },
  { icon: "pulse-outline", label: t("Λιγότερο άγχος & ένταση", "Less stress & tension") },
  { icon: "heart-outline", label: t("Χαμηλότερη πίεση", "Lower blood pressure") },
  { icon: "moon-outline", label: t("Καλύτερος ύπνος", "Better sleep") },
  { icon: "sparkles-outline", label: t("Πνευματική διαύγεια", "Mental clarity") },
  { icon: "color-palette-outline", label: t("Περισσότερη δημιουργικότητα", "More creativity") },
  { icon: "sync-outline", label: t("Ισορροπία στα τσάκρα", "Chakra balance") },
  { icon: "flower-outline", label: t("Εσωτερική αρμονία & γείωση", "Inner harmony & grounding") },
];

const makeInstruments = (t: Tr) => [
  t("Θιβετιανά μπολ", "Tibetan bowls"),
  t("Κρυστάλλινα μπολ", "Crystal bowls"),
  "Gong",
  t("Μονόχορδο", "Monochord"),
  t("Τύμπανο", "Drum"),
  "Chimes",
  t("Διαπασών", "Tuning forks"),
  t("Φωνή", "Voice"),
];

type Therapy = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  type: string;
  duration: string;
  text: string;
  benefits: string[];
};

const makeTherapies = (t: Tr): Therapy[] => [
  {
    icon: "body-outline",
    title: t("Ηχητικό Μασάζ", "Sound Massage"),
    type: t("Ατομική", "Individual"),
    duration: t("1 ώρα", "1 hour"),
    text: t("Θιβετιανά μπολ τοποθετούνται πάνω και γύρω από το σώμα, στέλνοντας δονήσεις που χαλαρώνουν τους μύες και απελευθερώνουν ένταση.", "Tibetan bowls are placed on and around the body, sending vibrations that relax the muscles and release tension."),
    benefits: [t("Βαθιά χαλάρωση", "Deep relaxation"), t("Απελευθέρωση έντασης", "Release of tension"), t("Ισορροπία στα τσάκρα", "Chakra balance")],
  },
  {
    icon: "water-outline",
    title: "Sound Bath",
    type: t("Ομαδική / ατομική", "Group / individual"),
    duration: t("1:30 – 2 ώρες", "1:30 – 2 hours"),
    text: t("«Λούζεσαι» σε θεραπευτικά ηχητικά κύματα από μπολ, gong, μονόχορδο και φωνή — ιδανικό για αρχάριους στον διαλογισμό.", "You \"bathe\" in therapeutic sound waves from bowls, gong, monochord and voice — ideal for beginners to meditation."),
    benefits: [t("Βαθιά διαλογιστική εμπειρία", "Deep meditative experience"), t("Ηρεμία & διαύγεια", "Calm & clarity"), t("Χωρίς καμία εμπειρία", "No experience needed")],
  },
  {
    icon: "compass-outline",
    title: "Hero's Journey",
    type: t("Ατομική σειρά", "Individual series"),
    duration: t("2 ώρες · 4–12 συνεδρίες", "2 hours · 4–12 sessions"),
    text: t("Ολιστική διαδρομή εμπνευσμένη από το «Ταξίδι του Ήρωα»: αφήνεις παλιά μοτίβα και δημιουργείς μια νέα ιστορία για τον εαυτό σου.", "A holistic journey inspired by the \"Hero's Journey\": you let go of old patterns and create a new story for yourself."),
    benefits: [t("Απελευθέρωση παλιών μοτίβων", "Releasing old patterns"), t("Αυτογνωσία", "Self-awareness"), t("Μεταμόρφωση & ανανέωση", "Transformation & renewal")],
  },
  {
    icon: "musical-note-outline",
    title: "Tuning Fork Therapy",
    type: t("Ατομική", "Individual"),
    duration: t("1 ώρα", "1 hour"),
    text: t("Διαπασών πάνω και γύρω από το σώμα συντονίζονται με τις φυσικές του συχνότητες και αποφορτίζουν το νευρικό σύστημα.", "Tuning forks on and around the body attune to its natural frequencies and discharge the nervous system."),
    benefits: [t("Ευθυγράμμιση τσάκρα", "Chakra alignment"), t("Διαύγεια σκέψης", "Clear thinking"), t("Βαθιά χαλάρωση", "Deep relaxation")],
  },
  {
    icon: "bed-outline",
    title: "Vibroacoustic Therapy",
    type: t("Ατομική", "Individual"),
    duration: t("~30 λεπτά", "~30 minutes"),
    text: t("Ειδικό στρώμα μεταδίδει δονήσεις χαμηλών συχνοτήτων στο σώμα, ενώ απολαμβάνεις θεραπευτικούς ήχους — μια πολυαισθητηριακή εμπειρία.", "A special mat transmits low-frequency vibrations into the body while you enjoy therapeutic sounds — a multisensory experience."),
    benefits: [t("Ρύθμιση νευρικού συστήματος", "Nervous system regulation"), t("Καλύτερος ύπνος", "Better sleep"), t("Αίσθηση γείωσης", "A sense of grounding")],
  },
];

const makeExpect = (t: Tr) => [
  t("Καλωσόρισμα & οι στόχοι της συνεδρίας", "Welcome & the goals of the session"),
  t("Σύντομος καθοδηγούμενος διαλογισμός", "A short guided meditation"),
  t("Η εμπειρία του ήχου σε όλο το σώμα", "The experience of sound throughout the body"),
  t("Απαλή επιστροφή στο «εδώ & τώρα»", "A gentle return to the «here & now»"),
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  const ui = useUi();
  const { wellness } = useTheme();
  return (
    <Text style={[ui.label, { color: wellness.lavenderInk, letterSpacing: 1.6 }]}>
      {children}
    </Text>
  );
}

function TherapyCard({ t, tone }: { t: Therapy; tone: { bg: string; ink: string } }) {
  const [open, setOpen] = useState(false);
  const ui = useUi();
  const { wellness } = useTheme();
  const { t: lt } = useLanguage();
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
          {lt("Δες τα οφέλη →", "See the benefits →")}
        </Text>
      )}
    </Pressable>
  );
}

export function SoundHealingGuide() {
  const router = useRouter();
  const ui = useUi();
  const { wellness } = useTheme();
  const { t } = useLanguage();
  const STATS = makeStats(t);
  const BENEFITS = makeBenefits(t);
  const INSTRUMENTS = makeInstruments(t);
  const THERAPIES = makeTherapies(t);
  const EXPECT = makeExpect(t);
  const TONES = [
    { bg: wellness.lavender, ink: wellness.lavenderInk },
    { bg: wellness.sage, ink: wellness.sageInk },
    { bg: wellness.champagne, ink: wellness.champagneInk },
    { bg: wellness.blueMist, ink: wellness.slate },
  ];
  return (
    <View style={{ gap: 32, paddingTop: 8 }}>
      {/* What is it */}
      <View style={{ gap: 10 }}>
        <Eyebrow>{t("ΤΙ ΕΙΝΑΙ", "WHAT IT IS")}</Eyebrow>
        <Text style={ui.heading}>{t("Ο ήχος ως θεραπεία", "Sound as therapy")}</Text>
        <Text style={[ui.body, { fontSize: 15, lineHeight: 24, color: wellness.ink }]}>
          {t(
            "Από την αρχαία Ελλάδα ως το Θιβέτ, πολιτισμοί χρησιμοποίησαν τον ήχο για θεραπεία και διαλογισμό. Μπολ, gong και κύμβαλα δονούνται σε συχνότητες που ταξιδεύουν μέσα στο σώμα και φέρνουν αρμονία σε νου, σώμα και πνεύμα.",
            "From ancient Greece to Tibet, cultures have used sound for healing and meditation. Bowls, gongs and cymbals vibrate at frequencies that travel through the body and bring harmony to mind, body and spirit.",
          )}
        </Text>
      </View>

      {/* Stats infographic */}
      <View style={{ gap: 12 }}>
        <Eyebrow>{t("ΜΕ ΜΙΑ ΜΑΤΙΑ", "AT A GLANCE")}</Eyebrow>
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
        <Eyebrow>{t("ΠΩΣ ΔΟΥΛΕΥΕΙ", "HOW IT WORKS")}</Eyebrow>
        <Text style={[ui.body, { fontSize: 15, lineHeight: 24, color: wellness.ink }]}>
          {t(
            "Τα πάντα δονούνται. Το άγχος «ξεκουρδίζει» το σώμα, όπως ένα όργανο εκτός τόνου. Οι ηχογαβάθες λειτουργούν σαν διαπασών: αποκαθιστούν την υγιή δόνηση και ενεργοποιούν τις αυτοθεραπευτικές δυνάμεις του οργανισμού.",
            "Everything vibrates. Stress «detunes» the body, like an instrument out of tune. Singing bowls act like a tuning fork: they restore healthy vibration and activate the body's self-healing powers.",
          )}
        </Text>
      </View>

      {/* Benefits */}
      <View style={{ gap: 12 }}>
        <Eyebrow>{t("ΤΑ ΟΦΕΛΗ", "THE BENEFITS")}</Eyebrow>
        <Text style={ui.heading}>{t("Τι κερδίζεις", "What you gain")}</Text>
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
        <Eyebrow>{t("ΤΑ ΟΡΓΑΝΑ", "THE INSTRUMENTS")}</Eyebrow>
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
        <Eyebrow>{t("ΟΙ ΘΕΡΑΠΕΙΕΣ", "THE THERAPIES")}</Eyebrow>
        <Text style={ui.heading}>{t("Βρες αυτή που σου ταιριάζει", "Find the one that suits you")}</Text>
        {THERAPIES.map((t, i) => (
          <TherapyCard key={t.title} t={t} tone={TONES[i % TONES.length]} />
        ))}
      </View>

      {/* What to expect */}
      <View style={{ gap: 12 }}>
        <Eyebrow>{t("ΤΙ ΝΑ ΠΕΡΙΜΕΝΕΙΣ", "WHAT TO EXPECT")}</Eyebrow>
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
        <Text style={[ui.heading, { color: wellness.ink }]}>{t("Έτοιμος να το βιώσεις;", "Ready to experience it?")}</Text>
        <Text style={[ui.body, { color: wellness.ink }]}>
          {t("Στείλε μήνυμα και βρες μαζί με τον Μανώλη τη συνεδρία που σου ταιριάζει.", "Send a message and find the session that suits you together with Manolis.")}
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
            {t("Μίλα μαζί μας", "Talk to us")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
