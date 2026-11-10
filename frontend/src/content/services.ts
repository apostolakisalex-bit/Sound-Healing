import type { Ionicons } from "@expo/vector-icons";

type IoniconName = keyof typeof Ionicons.glyphMap;

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

const CDN = "https://www.soundhealing.gr/wp-content/uploads";

// Content and photos curated from https://www.soundhealing.gr (Επιπλέον Υπηρεσίες).
export const SERVICES: ServiceContent[] = [
  {
    slug: "ergastiria-omilies",
    title: "Διαδραστικά εργαστήρια & ομιλίες",
    symbol: `${CDN}/2021/02/rsz_7sacred_shape_5-01-1.png`,
    intro:
      "Βιωματικά εργαστήρια και ομιλίες ηχοθεραπείας για σχολεία, φορείς, ημερίδες και φεστιβάλ ευεξίας.",
    body: [
      "Τα διαδραστικά εργαστήρια διαμορφώνονται ανάλογα με τις ανάγκες της ομάδας σας — σχολεία, εκπαιδευτικά ιδρύματα, ημερίδες, φεστιβάλ ευεξίας και άλλες εκδηλώσεις.",
      "Οι συμμετέχοντες έχουν ενεργό ρόλο στο εργαστήριο. Με το πέρας της εκδήλωσης φεύγουν με πρακτικές ηχοθεραπείας και χρήσιμες γνώσεις που μπορούν να αξιοποιήσουν στην καθημερινότητά τους για ευεξία και χαλάρωση.",
      "Ο Μανώλης έχει μοιραστεί τη δουλειά του σε σκηνές όπως το TEDxAthens, σε πανεπιστήμια και σε φεστιβάλ, φέρνοντας τον ήχο κοντά σε μεγάλο και διαφορετικό κοινό.",
    ],
    highlights: [
      { icon: "school-outline", label: "Για σχολεία & εκπαιδευτικά ιδρύματα" },
      { icon: "people-outline", label: "Ενεργή συμμετοχή της ομάδας" },
      { icon: "mic-outline", label: "Ομιλίες σε ημερίδες & φεστιβάλ" },
      { icon: "sparkles-outline", label: "Πρακτικές ήχου για την καθημερινότητα" },
    ],
    photos: [
      { uri: `${CDN}/2024/10/6044294a-e6bc-411f-b18f-9b67e4ac2a7f-650x433.jpg`, alt: "Ο Μανώλης στο TEDxAthens" },
      { uri: `${CDN}/2024/10/DSC2522-650x433.jpeg`, alt: "Εργαστήριο ήχου στο TEDxAthens 2024" },
      { uri: `${CDN}/2024/10/DSC2676-2-Medium.jpeg`, alt: "Sound healing workshop στο TEDxAthens 2024" },
      { uri: `${CDN}/2024/10/Uni-workshop-650x433.jpeg`, alt: "Ομιλία ηχοθεραπείας στο Hong Kong Baptist University" },
      { uri: `${CDN}/2023/11/Storytelling-festival-650x433.jpeg`, alt: "Εργαστήριο σε φεστιβάλ αφήγησης" },
      { uri: `${CDN}/2023/11/Flowsummit-e1700994135831-650x433.jpeg`, alt: "Εργαστήριο στο Flow Summit" },
    ],
  },
  {
    slug: "xenodocheia-spa",
    title: "Συμβουλευτική για ξενοδοχεία & Spa",
    symbol: `${CDN}/2021/02/flower-of-life-2.png`,
    intro:
      "Ενσωματώστε την ηχοθεραπεία στις υπηρεσίες ευεξίας του ξενοδοχείου ή του spa σας.",
    body: [
      "Αναβαθμίστε τις προσφορές ευεξίας ενσωματώνοντας την ηχοθεραπεία. Οι υπηρεσίες ποικίλουν: από την εκπαίδευση του προσωπικού σας στη θεωρία και την πρακτική με συγκεκριμένα πρωτόκολλα, έως τη συμβουλευτική για τη δημιουργία του κατάλληλου χώρου.",
      "Σας καθοδηγώ στην επιλογή των κατάλληλων οργάνων ηχοθεραπείας, εξασφαλίζοντας μια ξεχωριστή, ολοκληρωμένη και εμπλουτισμένη εμπειρία για τους πελάτες σας.",
    ],
    highlights: [
      { icon: "people-circle-outline", label: "Εκπαίδευση προσωπικού με πρωτόκολλα" },
      { icon: "home-outline", label: "Σχεδιασμός του κατάλληλου χώρου" },
      { icon: "musical-notes-outline", label: "Επιλογή οργάνων ηχοθεραπείας" },
      { icon: "diamond-outline", label: "Ολοκληρωμένη εμπειρία ευεξίας" },
    ],
    photos: [
      { uri: `${CDN}/2023/02/Sound-Bath-in-Heraklion-Crete-1300x867.jpg`, alt: "Gong bath στο Ηράκλειο, Κρήτη" },
      { uri: `${CDN}/2025/02/IMG_5794-650x433.jpg`, alt: "Συνεδρία ηχοθεραπείας σε χώρο ευεξίας" },
      { uri: `${CDN}/2023/07/DSC05614-1500x1875.jpg`, alt: "Sound bath στο Syntopia hotel, Ρέθυμνο" },
    ],
    testimonial: {
      quote:
        "Απολαμβάνω να συνεργάζομαι με τον Μανώλη. Οι θεραπείες του είναι βαθιά χαλαρωτικές και βοηθούν τους πελάτες μας να αποβάλλουν το στρες και το άγχος. Τον συνιστώ ανεπιφύλακτα για οποιαδήποτε ομαδική ή ιδιωτική εκπαίδευση ή μάθημα.",
      author: "Ελένη Παπαδοπούλου",
      role: "Director of Wellness, Daios Cove Luxury Resort",
      avatar: `${CDN}/2025/02/Eleni-Papadopoulou-Daios-Cove-Director-of-Wellness-e1739896313164-160x160.jpg`,
    },
  },
  {
    slug: "etairikes-ekdiloseis",
    title: "Εταιρικές εκδηλώσεις & εργαστήρια",
    symbol: `${CDN}/2021/02/rsz_sacred_shape_2-01-1.png`,
    intro:
      "Μοναδικά εργαστήρια και συνεδρίες ηχοθεραπείας για team-building και εταιρική ευεξία.",
    body: [
      "Εισάγετε ένα μοναδικό και αναζωογονητικό στοιχείο στις εταιρικές σας εκδηλώσεις με εξατομικευμένα εργαστήρια και συνεδρίες ηχοθεραπείας.",
      "Είναι ιδανικά για team-building και βοηθούν στη μείωση του στρες, στην ενίσχυση της δημιουργικότητας και στη σύσφιξη της ομάδας. Μπορούν να πραγματοποιηθούν ως αυτοτελή event ή να ενσωματωθούν σε εταιρικές ημερίδες, εκδρομές και ημέρες ευεξίας.",
    ],
    highlights: [
      { icon: "people-outline", label: "Ιδανικό για team-building" },
      { icon: "pulse-outline", label: "Μείωση στρες & άγχους" },
      { icon: "bulb-outline", label: "Ενίσχυση δημιουργικότητας" },
      { icon: "calendar-outline", label: "Αυτοτελή ή σε εταιρικές ημερίδες" },
    ],
    photos: [
      { uri: `${CDN}/2023/11/348576872_553633543598389_6354842472324874483_n-650x433.jpg`, alt: "Ομαδική συνεδρία ηχοθεραπείας" },
      { uri: `${CDN}/2023/11/348846227_550603047279062_3444804177702507608_n-650x433.jpg`, alt: "Εργαστήριο ήχου για ομάδα" },
      { uri: `${CDN}/2023/04/Seminar-650x433.jpg`, alt: "Εργαστήριο ηχοθεραπείας" },
      { uri: `${CDN}/2024/10/IMG_5333-1-650x433.jpg`, alt: "Ομαδική εμπειρία ήχου" },
      { uri: `${CDN}/2024/10/20240330_122715-650x433.jpg`, alt: "Συνεδρία με singing bowls" },
    ],
  },
];

export const serviceBySlug = (slug?: string) =>
  SERVICES.find((s) => s.slug === slug);

export const serviceSlugByTitle = (title: string) =>
  SERVICES.find((s) => s.title === title)?.slug;
