import type { Ionicons } from "@expo/vector-icons";

type IoniconName = keyof typeof Ionicons.glyphMap;
type Lang = "el" | "en";
/** A bilingual string: Greek (authored) + English translation. */
type L = { el: string; en: string };

export type ServiceContent = {
  slug: string;
  title: string;
  /** Sacred-geometry symbol from soundhealing.gr used as the service glyph. */
  symbol: string;
  intro: string;
  body: string[];
  highlights: { icon: IoniconName; label: string }[];
  photos: { uri: string; alt: string }[];
  testimonial?: { quote: string; author: string; role: string; avatar?: string };
};

type RawService = {
  slug: string;
  title: L;
  symbol: string;
  intro: L;
  body: L[];
  highlights: { icon: IoniconName; label: L }[];
  photos: { uri: string; alt: L }[];
  testimonial?: { quote: L; author: L; role: L; avatar?: string };
};

const CDN = "https://www.soundhealing.gr/wp-content/uploads";

// Content and photos curated from https://www.soundhealing.gr (Επιπλέον Υπηρεσίες).
const RAW_SERVICES: RawService[] = [
  {
    slug: "ergastiria-omilies",
    title: {
      el: "Διαδραστικά εργαστήρια & ομιλίες",
      en: "Interactive workshops & talks",
    },
    symbol: `${CDN}/2021/02/rsz_7sacred_shape_5-01-1.png`,
    intro: {
      el: "Βιωματικά εργαστήρια και ομιλίες ηχοθεραπείας για σχολεία, φορείς, ημερίδες και φεστιβάλ ευεξίας.",
      en: "Experiential sound-therapy workshops and talks for schools, organisations, conferences and wellness festivals.",
    },
    body: [
      {
        el: "Τα διαδραστικά εργαστήρια διαμορφώνονται ανάλογα με τις ανάγκες της ομάδας σας — σχολεία, εκπαιδευτικά ιδρύματα, ημερίδες, φεστιβάλ ευεξίας και άλλες εκδηλώσεις.",
        en: "The interactive workshops are shaped around the needs of your group — schools, educational institutions, conferences, wellness festivals and other events.",
      },
      {
        el: "Οι συμμετέχοντες έχουν ενεργό ρόλο στο εργαστήριο. Με το πέρας της εκδήλωσης φεύγουν με πρακτικές ηχοθεραπείας και χρήσιμες γνώσεις που μπορούν να αξιοποιήσουν στην καθημερινότητά τους για ευεξία και χαλάρωση.",
        en: "Participants take an active role in the workshop. By the end they leave with sound-therapy practices and useful knowledge they can apply in daily life for wellbeing and relaxation.",
      },
      {
        el: "Ο Μανώλης έχει μοιραστεί τη δουλειά του σε σκηνές όπως το TEDxAthens, σε πανεπιστήμια και σε φεστιβάλ, φέρνοντας τον ήχο κοντά σε μεγάλο και διαφορετικό κοινό.",
        en: "Manolis has shared his work on stages such as TEDxAthens, at universities and festivals, bringing sound to a large and diverse audience.",
      },
    ],
    highlights: [
      {
        icon: "school-outline",
        label: {
          el: "Για σχολεία & εκπαιδευτικά ιδρύματα",
          en: "For schools & educational institutions",
        },
      },
      {
        icon: "people-outline",
        label: {
          el: "Ενεργή συμμετοχή της ομάδας",
          en: "Active participation of the group",
        },
      },
      {
        icon: "mic-outline",
        label: {
          el: "Ομιλίες σε ημερίδες & φεστιβάλ",
          en: "Talks at conferences & festivals",
        },
      },
      {
        icon: "sparkles-outline",
        label: {
          el: "Πρακτικές ήχου για την καθημερινότητα",
          en: "Sound practices for everyday life",
        },
      },
    ],
    photos: [
      {
        uri: `${CDN}/2024/10/6044294a-e6bc-411f-b18f-9b67e4ac2a7f-650x433.jpg`,
        alt: { el: "Ο Μανώλης στο TEDxAthens", en: "Manolis at TEDxAthens" },
      },
      {
        uri: `${CDN}/2024/10/DSC2522-650x433.jpeg`,
        alt: {
          el: "Εργαστήριο ήχου στο TEDxAthens 2024",
          en: "Sound workshop at TEDxAthens 2024",
        },
      },
      {
        uri: `${CDN}/2024/10/DSC2676-2-Medium.jpeg`,
        alt: {
          el: "Sound healing workshop στο TEDxAthens 2024",
          en: "Sound healing workshop at TEDxAthens 2024",
        },
      },
      {
        uri: `${CDN}/2024/10/Uni-workshop-650x433.jpeg`,
        alt: {
          el: "Ομιλία ηχοθεραπείας στο Hong Kong Baptist University",
          en: "Sound-therapy talk at Hong Kong Baptist University",
        },
      },
      {
        uri: `${CDN}/2023/11/Storytelling-festival-650x433.jpeg`,
        alt: {
          el: "Εργαστήριο σε φεστιβάλ αφήγησης",
          en: "Workshop at a storytelling festival",
        },
      },
      {
        uri: `${CDN}/2023/11/Flowsummit-e1700994135831-650x433.jpeg`,
        alt: { el: "Εργαστήριο στο Flow Summit", en: "Workshop at Flow Summit" },
      },
    ],
  },
  {
    slug: "xenodocheia-spa",
    title: {
      el: "Συμβουλευτική για ξενοδοχεία & Spa",
      en: "Consulting for hotels & spas",
    },
    symbol: `${CDN}/2021/02/flower-of-life-2.png`,
    intro: {
      el: "Ενσωματώστε την ηχοθεραπεία στις υπηρεσίες ευεξίας του ξενοδοχείου ή του spa σας.",
      en: "Integrate sound therapy into the wellness services of your hotel or spa.",
    },
    body: [
      {
        el: "Αναβαθμίστε τις προσφορές ευεξίας ενσωματώνοντας την ηχοθεραπεία. Οι υπηρεσίες ποικίλουν: από την εκπαίδευση του προσωπικού σας στη θεωρία και την πρακτική με συγκεκριμένα πρωτόκολλα, έως τη συμβουλευτική για τη δημιουργία του κατάλληλου χώρου.",
        en: "Upgrade your wellness offerings by integrating sound therapy. Services vary: from training your staff in the theory and practice with specific protocols, to consulting on creating the right space.",
      },
      {
        el: "Σας καθοδηγώ στην επιλογή των κατάλληλων οργάνων ηχοθεραπείας, εξασφαλίζοντας μια ξεχωριστή, ολοκληρωμένη και εμπλουτισμένη εμπειρία για τους πελάτες σας.",
        en: "I guide you in choosing the right sound-therapy instruments, ensuring a distinctive, complete and enriched experience for your clients.",
      },
    ],
    highlights: [
      {
        icon: "people-circle-outline",
        label: {
          el: "Εκπαίδευση προσωπικού με πρωτόκολλα",
          en: "Staff training with protocols",
        },
      },
      {
        icon: "home-outline",
        label: { el: "Σχεδιασμός του κατάλληλου χώρου", en: "Designing the right space" },
      },
      {
        icon: "musical-notes-outline",
        label: {
          el: "Επιλογή οργάνων ηχοθεραπείας",
          en: "Choosing sound-therapy instruments",
        },
      },
      {
        icon: "diamond-outline",
        label: { el: "Ολοκληρωμένη εμπειρία ευεξίας", en: "A complete wellness experience" },
      },
    ],
    photos: [
      {
        uri: `${CDN}/2023/02/Sound-Bath-in-Heraklion-Crete-1300x867.jpg`,
        alt: { el: "Gong bath στο Ηράκλειο, Κρήτη", en: "Gong bath in Heraklion, Crete" },
      },
      {
        uri: `${CDN}/2025/02/IMG_5794-650x433.jpg`,
        alt: {
          el: "Συνεδρία ηχοθεραπείας σε χώρο ευεξίας",
          en: "Sound-therapy session in a wellness space",
        },
      },
      {
        uri: `${CDN}/2023/07/DSC05614-1500x1875.jpg`,
        alt: {
          el: "Sound bath στο Syntopia hotel, Ρέθυμνο",
          en: "Sound bath at Syntopia hotel, Rethymno",
        },
      },
    ],
    testimonial: {
      quote: {
        el: "Απολαμβάνω να συνεργάζομαι με τον Μανώλη. Οι θεραπείες του είναι βαθιά χαλαρωτικές και βοηθούν τους πελάτες μας να αποβάλλουν το στρες και το άγχος. Τον συνιστώ ανεπιφύλακτα για οποιαδήποτε ομαδική ή ιδιωτική εκπαίδευση ή μάθημα.",
        en: "I love working with Manolis. His treatments are deeply relaxing and help our guests let go of stress and anxiety. I wholeheartedly recommend him for any group or private training or class.",
      },
      author: { el: "Ελένη Παπαδοπούλου", en: "Eleni Papadopoulou" },
      role: {
        el: "Director of Wellness, Daios Cove Luxury Resort",
        en: "Director of Wellness, Daios Cove Luxury Resort",
      },
      avatar: `${CDN}/2025/02/Eleni-Papadopoulou-Daios-Cove-Director-of-Wellness-e1739896313164-160x160.jpg`,
    },
  },
  {
    slug: "etairikes-ekdiloseis",
    title: {
      el: "Εταιρικές εκδηλώσεις & εργαστήρια",
      en: "Corporate events & workshops",
    },
    symbol: `${CDN}/2021/02/rsz_sacred_shape_2-01-1.png`,
    intro: {
      el: "Μοναδικά εργαστήρια και συνεδρίες ηχοθεραπείας για team-building και εταιρική ευεξία.",
      en: "Unique sound-therapy workshops and sessions for team-building and corporate wellbeing.",
    },
    body: [
      {
        el: "Εισάγετε ένα μοναδικό και αναζωογονητικό στοιχείο στις εταιρικές σας εκδηλώσεις με εξατομικευμένα εργαστήρια και συνεδρίες ηχοθεραπείας.",
        en: "Bring a unique and refreshing element to your corporate events with tailored sound-therapy workshops and sessions.",
      },
      {
        el: "Είναι ιδανικά για team-building και βοηθούν στη μείωση του στρες, στην ενίσχυση της δημιουργικότητας και στη σύσφιξη της ομάδας. Μπορούν να πραγματοποιηθούν ως αυτοτελή event ή να ενσωματωθούν σε εταιρικές ημερίδες, εκδρομές και ημέρες ευεξίας.",
        en: "They are ideal for team-building and help reduce stress, boost creativity and strengthen the team. They can run as stand-alone events or be integrated into corporate conferences, retreats and wellness days.",
      },
    ],
    highlights: [
      {
        icon: "people-outline",
        label: { el: "Ιδανικό για team-building", en: "Ideal for team-building" },
      },
      {
        icon: "pulse-outline",
        label: { el: "Μείωση στρες & άγχους", en: "Reduced stress & anxiety" },
      },
      {
        icon: "bulb-outline",
        label: { el: "Ενίσχυση δημιουργικότητας", en: "Boosted creativity" },
      },
      {
        icon: "calendar-outline",
        label: {
          el: "Αυτοτελή ή σε εταιρικές ημερίδες",
          en: "Stand-alone or in corporate conferences",
        },
      },
    ],
    photos: [
      {
        uri: `${CDN}/2023/11/348576872_553633543598389_6354842472324874483_n-650x433.jpg`,
        alt: { el: "Ομαδική συνεδρία ηχοθεραπείας", en: "Group sound-therapy session" },
      },
      {
        uri: `${CDN}/2023/11/348846227_550603047279062_3444804177702507608_n-650x433.jpg`,
        alt: { el: "Εργαστήριο ήχου για ομάδα", en: "Sound workshop for a team" },
      },
      {
        uri: `${CDN}/2023/04/Seminar-650x433.jpg`,
        alt: { el: "Εργαστήριο ηχοθεραπείας", en: "Sound-therapy workshop" },
      },
      {
        uri: `${CDN}/2024/10/IMG_5333-1-650x433.jpg`,
        alt: { el: "Ομαδική εμπειρία ήχου", en: "Group sound experience" },
      },
      {
        uri: `${CDN}/2024/10/20240330_122715-650x433.jpg`,
        alt: { el: "Συνεδρία με singing bowls", en: "Session with singing bowls" },
      },
    ],
  },
];

const pick = (l: L, lang: Lang) => (lang === "en" ? l.en : l.el);

export function getServices(lang: Lang): ServiceContent[] {
  return RAW_SERVICES.map((r) => ({
    slug: r.slug,
    title: pick(r.title, lang),
    symbol: r.symbol,
    intro: pick(r.intro, lang),
    body: r.body.map((b) => pick(b, lang)),
    highlights: r.highlights.map((h) => ({ icon: h.icon, label: pick(h.label, lang) })),
    photos: r.photos.map((p) => ({ uri: p.uri, alt: pick(p.alt, lang) })),
    testimonial: r.testimonial
      ? {
          quote: pick(r.testimonial.quote, lang),
          author: pick(r.testimonial.author, lang),
          role: pick(r.testimonial.role, lang),
          avatar: r.testimonial.avatar,
        }
      : undefined,
  }));
}

export const serviceBySlug = (slug: string | undefined, lang: Lang) =>
  getServices(lang).find((s) => s.slug === slug);

/** Matches a title in either language back to its slug (used by the home grid). */
export const serviceSlugByTitle = (title: string) =>
  RAW_SERVICES.find((s) => s.title.el === title || s.title.en === title)?.slug;
