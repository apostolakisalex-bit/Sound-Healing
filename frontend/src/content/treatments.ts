import type { Ionicons } from "@expo/vector-icons";

type IoniconName = keyof typeof Ionicons.glyphMap;
type Lang = "el" | "en";
/** A bilingual string: Greek (authored) + English translation. */
type L = { el: string; en: string };

export type TreatmentContent = {
  slug: string;
  title: string;
  /** Short subtitle shown under the title. */
  tagline: string;
  /** Ionicon used on the home tile and the detail header. */
  icon: IoniconName;
  hero: string;
  intro: string;
  /** Infographic stat chips (duration / format / recommended series). */
  stats: { icon: IoniconName; label: string; value: string }[];
  /** "Τι είναι" paragraphs. */
  body: string[];
  /** Οφέλη — rendered as an infographic checklist. */
  benefits: string[];
  /** "Τι να περιμένεις" — rendered as a numbered infographic timeline. */
  expect: string[];
};

type RawTreatment = {
  slug: string;
  title: L;
  tagline: L;
  icon: IoniconName;
  hero: string;
  intro: L;
  stats: { icon: IoniconName; label: L; value: L }[];
  body: L[];
  benefits: L[];
  expect: L[];
};

const CDN = "https://www.soundhealing.gr/wp-content/uploads";
const CONTACT_URL = "https://www.soundhealing.gr/contact/";

export const TREATMENTS_CONTACT_URL = CONTACT_URL;
export const TREATMENTS_PHONE = "6945562818";

// Content & photos curated and adapted from https://www.soundhealing.gr/treatments/
const RAW_TREATMENTS: RawTreatment[] = [
  {
    slug: "ihomasaz",
    title: {
      el: "Ηχομασάζ με θιβετιανά μπολ",
      en: "Sound massage with Tibetan bowls",
    },
    tagline: {
      el: "Ατομική συνεδρία αφής, ήχου & δόνησης",
      en: "One-to-one session of touch, sound & vibration",
    },
    icon: "body-outline",
    hero: `${CDN}/2026/10/9A2A1175-Medium.jpeg`,
    intro: {
      el: "Θιβετιανά singing bowls διαφορετικών μεγεθών τοποθετούνται απαλά πάνω και γύρω από το ντυμένο σώμα. Ο ήχος και η δόνηση ταξιδεύουν στο σώμα, φέρνοντας γείωση και βαθιά χαλάρωση.",
      en: "Tibetan singing bowls of different sizes are placed gently on and around the clothed body. Sound and vibration travel through the body, bringing grounding and deep relaxation.",
    },
    stats: [
      {
        icon: "time-outline",
        label: { el: "Διάρκεια", en: "Duration" },
        value: { el: "90′", en: "90′" },
      },
      {
        icon: "person-outline",
        label: { el: "Μορφή", en: "Format" },
        value: { el: "Ατομική", en: "One-to-one" },
      },
      {
        icon: "repeat-outline",
        label: { el: "Συνεδρίες", en: "Sessions" },
        value: { el: "3–4", en: "3–4" },
      },
    ],
    body: [
      {
        el: "Μέσα από την επαφή και την εγγύτητα, ο συνεχής ήχος και η δόνηση δημιουργούν μια λεπτή εσωτερική διέγερση που συχνά βιώνεται ως γείωση και βαθιά χαλάρωση.",
        en: "Through touch and closeness, the continuous sound and vibration create a subtle inner stimulation often experienced as grounding and deep relaxation.",
      },
      {
        el: "Σε φυσιολογικό επίπεδο, η δόνηση μπορεί να υποστηρίξει τη ρύθμιση του νευρικού συστήματος, βοηθώντας το σώμα να στραφεί σε καταστάσεις ξεκούρασης και ανάκαμψης, με φυσική επιβράδυνση της αναπνοής και μείωση της μυϊκής έντασης.",
        en: "On a physiological level, vibration can support the regulation of the nervous system, helping the body shift into states of rest and recovery, with naturally slower breathing and reduced muscle tension.",
      },
      {
        el: "Το εύρος συχνοτήτων των μπολ δημιουργεί ένα πλούσιο ηχητικό πεδίο που ενθαρρύνει τη μετάβαση από την ενεργή σκέψη σε πιο χαλαρές, διαλογιστικές καταστάσεις.",
        en: "The frequency range of the bowls creates a rich sound field that encourages the transition from active thinking to more relaxed, meditative states.",
      },
    ],
    benefits: [
      {
        el: "Βαθιά χαλάρωση και μείωση του στρες",
        en: "Deep relaxation and stress reduction",
      },
      {
        el: "Υποστήριξη στη ρύθμιση του νευρικού συστήματος",
        en: "Support for nervous-system regulation",
      },
      { el: "Μείωση της μυϊκής έντασης", en: "Reduced muscle tension" },
      {
        el: "Πιο αργή αναπνοή και καρδιακός ρυθμός",
        en: "Slower breathing and heart rate",
      },
      { el: "Καθαρότητα σκέψης και συγκέντρωση", en: "Mental clarity and focus" },
      {
        el: "Αίσθηση γείωσης και παρουσίας",
        en: "A sense of grounding and presence",
      },
    ],
    expect: [
      {
        el: "Σύντομη εισαγωγή στη διαδικασία και ορισμός μιας απλής πρόθεσης.",
        en: "A short introduction to the process and setting a simple intention.",
      },
      {
        el: "Ξαπλώνεις άνετα, ενώ τα μπολ τοποθετούνται πάνω και γύρω από το σώμα.",
        en: "You lie down comfortably while the bowls are placed on and around the body.",
      },
      {
        el: "Ο ήχος εφαρμόζεται με δομή και διαίσθηση, με στιγμές σιωπής.",
        en: "Sound is applied with structure and intuition, with moments of silence.",
      },
      {
        el: "Σταδιακή επιστροφή σε εγρήγορση, χρόνος ανάπαυσης και ένα τσάι.",
        en: "A gradual return to alertness, time to rest and a cup of tea.",
      },
    ],
  },
  {
    slug: "sound-bath",
    title: { el: "Sound Bath", en: "Sound Bath" },
    tagline: {
      el: "Ομαδική, ζευγαριού ή ατομική ηχητική εμβύθιση",
      en: "Group, couples or one-to-one sound immersion",
    },
    icon: "water-outline",
    hero: `${CDN}/2025/03/IMG_5446-650x433.jpg`,
    intro: {
      el: "Μια βαθιά καθηλωτική, διαλογιστική εμπειρία ακρόασης όπου «λούζεσαι» σε στρώματα ήχου και δόνησης από singing bowls, γκονγκ, τύμπανα, μονόχορδο, chimes και φωνή.",
      en: "A deeply immersive, meditative listening experience where you are 'bathed' in layers of sound and vibration from singing bowls, gongs, drums, monochord, chimes and voice.",
    },
    stats: [
      {
        icon: "time-outline",
        label: { el: "Διάρκεια", en: "Duration" },
        value: { el: "~90′", en: "~90′" },
      },
      {
        icon: "people-outline",
        label: { el: "Μορφή", en: "Format" },
        value: { el: "Ομαδική / Ατομική", en: "Group / One-to-one" },
      },
      {
        icon: "sparkles-outline",
        label: { el: "Εμπειρία", en: "Experience" },
        value: { el: "Χωρίς εμπειρία", en: "No experience needed" },
      },
    ],
    body: [
      {
        el: "Η συνεδρία υποστηρίζει τη χαλάρωση και την εσωτερική επίγνωση μέσα από τον ήχο, χωρίς να απαιτείται προηγούμενη εμπειρία διαλογισμού.",
        en: "The session supports relaxation and inner awareness through sound, with no prior meditation experience required.",
      },
      {
        el: "Λειτουργεί τόσο ως εισαγωγή σε διαλογιστικές καταστάσεις για αρχάριους, όσο και ως συμπληρωματική πρακτική για έμπειρους.",
        en: "It works both as an introduction to meditative states for beginners and as a complementary practice for the experienced.",
      },
      {
        el: "Προσφέρεται σε ομαδικά, ιδιωτικά ή ημι-ιδιωτικά πλαίσια και προσαρμόζεται σε studios, ιδιωτικούς χώρους και χώρους ευεξίας.",
        en: "It is offered in group, private or semi-private settings and adapts to studios, private spaces and wellness venues.",
      },
    ],
    benefits: [
      {
        el: "Βαθιά χαλάρωση και μείωση του στρες",
        en: "Deep relaxation and stress reduction",
      },
      {
        el: "Υποστήριξη στη ρύθμιση του νευρικού συστήματος",
        en: "Support for nervous-system regulation",
      },
      {
        el: "Μείωση νοητικής και σωματικής έντασης",
        en: "Reduced mental and physical tension",
      },
      { el: "Πιο ήρεμη συναισθηματική κατάσταση", en: "A calmer emotional state" },
      { el: "Βελτίωση εστίασης και διαύγειας", en: "Improved focus and clarity" },
      {
        el: "Αίσθηση γείωσης και παρουσίας",
        en: "A sense of grounding and presence",
      },
    ],
    expect: [
      {
        el: "Σύντομη καλωσόρισμα και καθοδηγούμενη μετάβαση για να ηρεμήσουν σώμα και νους.",
        en: "A short welcome and a guided transition to settle body and mind.",
      },
      {
        el: "Ξαπλώνεις άνετα και η συνεδρία ξετυλίγεται σε συνεχή ροή ήχου.",
        en: "You lie down comfortably and the session unfolds in a continuous flow of sound.",
      },
      {
        el: "Όργανα πλούσια σε αρμονικές δημιουργούν ένα στρωματικό ηχητικό περιβάλλον.",
        en: "Instruments rich in harmonics create a layered sound environment.",
      },
      {
        el: "Σταδιακή επιστροφή σε εγρήγορση και μια σύντομη ανάπαυση.",
        en: "A gradual return to alertness and a short rest.",
      },
    ],
  },
  {
    slug: "integral-sound-healing",
    title: { el: "Ολιστική ηχοθεραπεία", en: "Integral sound healing" },
    tagline: {
      el: "Hero's Journey · δομημένος κύκλος ατομικών συνεδριών",
      en: "Hero's Journey · a structured cycle of one-to-one sessions",
    },
    icon: "compass-outline",
    hero: `${CDN}/2025/03/IMG_5445-650x433.jpg`,
    intro: {
      el: "Μια δομημένη ατομική διαδικασία που συνδυάζει πρακτικές ήχου με ένα ευρύτερο πλαίσιο προσωπικής εξερεύνησης και επίγνωσης.",
      en: "A structured one-to-one process that combines sound practices with a wider framework of personal exploration and awareness.",
    },
    stats: [
      {
        icon: "time-outline",
        label: { el: "Διάρκεια", en: "Duration" },
        value: { el: "~90′", en: "~90′" },
      },
      {
        icon: "person-outline",
        label: { el: "Μορφή", en: "Format" },
        value: { el: "Ατομική", en: "One-to-one" },
      },
      {
        icon: "repeat-outline",
        label: { el: "Συνεδρίες", en: "Sessions" },
        value: { el: "4", en: "4" },
      },
    ],
    body: [
      {
        el: "Με όργανα όπως θιβετιανά και κρυστάλλινα μπολ, γκονγκ, διαπασών, τύμπανα και φωνή, η συνεδρία δουλεύει πάνω και γύρω από το σώμα, υποστηρίζοντας χαλάρωση και εσωτερική παρατήρηση.",
        en: "With instruments such as Tibetan and crystal bowls, gongs, tuning forks, drums and voice, the session works on and around the body, supporting relaxation and inner observation.",
      },
      {
        el: "Η προσέγγιση εμπνέεται από το «Ταξίδι του Ήρωα» του Joseph Campbell, ως πλαίσιο καθοδήγησης και όχι ως σταθερή μεθοδολογία.",
        en: "The approach is inspired by Joseph Campbell's 'Hero's Journey' as a guiding framework rather than a fixed methodology.",
      },
      {
        el: "Μέσα από έναν κύκλο συνεδριών, η διαδικασία υποστηρίζει τη σταδιακή εξερεύνηση μοτίβων και εσωτερικών αφηγήσεων, σε έναν γειωμένο και υποστηρικτικό χώρο.",
        en: "Over a cycle of sessions, the process supports the gradual exploration of patterns and inner narratives, in a grounded and supportive space.",
      },
    ],
    benefits: [
      {
        el: "Ρύθμιση νευρικού συστήματος & μείωση στρες",
        en: "Nervous-system regulation & stress reduction",
      },
      {
        el: "Απελευθέρωση έντασης και περιοριστικών μοτίβων",
        en: "Release of tension and limiting patterns",
      },
      {
        el: "Αυξημένη διαύγεια, εστίαση & αυτογνωσία",
        en: "Greater clarity, focus & self-awareness",
      },
      {
        el: "Ενίσχυση συναισθηματικής αντοχής",
        en: "Stronger emotional resilience",
      },
      {
        el: "Ενεργειακή ισορροπία και ευθυγράμμιση",
        en: "Energetic balance and alignment",
      },
      {
        el: "Υποστήριξη προσωπικού μετασχηματισμού",
        en: "Support for personal transformation",
      },
    ],
    expect: [
      {
        el: "Σύντομη συζήτηση για τον ορισμό της πρόθεσης ή της εστίασης της συνεδρίας.",
        en: "A short conversation to define the intention or focus of the session.",
      },
      {
        el: "Καθοδήγηση σε συνεδρία ήχου με πολλαπλά όργανα, πάνω και γύρω από το σώμα.",
        en: "Guidance through a multi-instrument sound session, on and around the body.",
      },
      {
        el: "Αναπνευστικές ασκήσεις, τεχνικές ευθυγράμμισης και στιγμές επίγνωσης.",
        en: "Breathing exercises, alignment techniques and moments of awareness.",
      },
      {
        el: "Ήπια επανένταξη στο παρόν — φεύγεις γειωμένος και υποστηριγμένος.",
        en: "A gentle return to the present — you leave grounded and supported.",
      },
    ],
  },
  {
    slug: "diapason",
    title: {
      el: "Ηχοθεραπεία με διαπασών",
      en: "Sound therapy with tuning forks",
    },
    tagline: {
      el: "Ατομική συνεδρία με βαθμονομημένα διαπασών",
      en: "One-to-one session with calibrated tuning forks",
    },
    icon: "pulse-outline",
    hero: `${CDN}/2026/10/9A2A1313-650x433.jpeg`,
    intro: {
      el: "Βαθμονομημένα διαπασών εφαρμόζονται πάνω και γύρω από το σώμα, εισάγοντας ακριβείς συχνότητες μέσα από ήχο και ήπια δόνηση.",
      en: "Calibrated tuning forks are applied on and around the body, introducing precise frequencies through sound and gentle vibration.",
    },
    stats: [
      {
        icon: "time-outline",
        label: { el: "Διάρκεια", en: "Duration" },
        value: { el: "~60′", en: "~60′" },
      },
      {
        icon: "person-outline",
        label: { el: "Μορφή", en: "Format" },
        value: { el: "Ατομική", en: "One-to-one" },
      },
      {
        icon: "repeat-outline",
        label: { el: "Συνεδρίες", en: "Sessions" },
        value: { el: "3–4", en: "3–4" },
      },
    ],
    body: [
      {
        el: "Όταν ενεργοποιούνται, τα διαπασών παράγουν σταθερούς, μετρήσιμους τόνους που αλληλεπιδρούν με το σώμα μέσω επαφής και εγγύτητας.",
        en: "When activated, the tuning forks produce steady, measurable tones that interact with the body through touch and closeness.",
      },
      {
        el: "Οι δονήσεις μπορούν να υποστηρίξουν το νευρικό σύστημα, ενθαρρύνοντας καταστάσεις χαλάρωσης και μειωμένης έντασης, με πιο στοχευμένη και λιτή προσέγγιση.",
        en: "The vibrations can support the nervous system, encouraging states of relaxation and reduced tension, with a more targeted and minimal approach.",
      },
      {
        el: "Αντλώντας από ανατολικές παραδόσεις, η συνεδρία υποστηρίζει την ισορροπία στις ενεργειακές οδούς του σώματος.",
        en: "Drawing on Eastern traditions, the session supports balance in the body's energy pathways.",
      },
    ],
    benefits: [
      {
        el: "Μείωση στρες, άγχους & συναισθηματικής έντασης",
        en: "Reduced stress, anxiety & emotional tension",
      },
      {
        el: "Συναισθηματική απελευθέρωση και διαύγεια",
        en: "Emotional release and clarity",
      },
      {
        el: "Καλύτερη οξυγόνωση και κυκλοφορία",
        en: "Better oxygenation and circulation",
      },
      {
        el: "Ενίσχυση ενσυνειδητότητας & παρουσίας",
        en: "Greater mindfulness & presence",
      },
      { el: "Υποστήριξη στη ροή της ενέργειας", en: "Support for the flow of energy" },
      {
        el: "Βελτίωση εστίασης και συγκέντρωσης",
        en: "Improved focus and concentration",
      },
    ],
    expect: [
      {
        el: "Σύντομη εισαγωγή και ορισμός μιας απλής πρόθεσης.",
        en: "A short introduction and setting a simple intention.",
      },
      {
        el: "Ξαπλώνεις ή κάθεσαι άνετα, ενώ τα διαπασών εφαρμόζονται σε σημεία του σώματος.",
        en: "You lie or sit comfortably while the tuning forks are applied to points of the body.",
      },
      {
        el: "Δομημένη εφαρμογή με διαισθητικό ρυθμό και στιγμές ακινησίας.",
        en: "A structured application with intuitive pacing and moments of stillness.",
      },
      {
        el: "Σταδιακή επιστροφή σε εγρήγορση και χρόνος ανάπαυσης.",
        en: "A gradual return to alertness and time to rest.",
      },
    ],
  },
  {
    slug: "donitikoakoustiki",
    title: { el: "Δονητικοακουστική θεραπεία", en: "Vibroacoustic therapy" },
    tagline: {
      el: "Ατομική συνεδρία σε ειδικό δονητικό κρεβάτι",
      en: "One-to-one session on a specialised vibrating bed",
    },
    icon: "bed-outline",
    hero: `${CDN}/2026/10/9A2A1347-Medium-427x433.jpeg`,
    intro: {
      el: "Ένα εξειδικευμένο δονητικοακουστικό κρεβάτι μεταφέρει επιλεγμένες χαμηλές συχνότητες σε όλο το σώμα, ενώ ακούς θεραπευτικές ηχητικές συνθέσεις.",
      en: "A specialised vibroacoustic bed transmits selected low frequencies throughout the body while you listen to therapeutic sound compositions.",
    },
    stats: [
      {
        icon: "time-outline",
        label: { el: "Διάρκεια", en: "Duration" },
        value: { el: "~30′", en: "~30′" },
      },
      {
        icon: "person-outline",
        label: { el: "Μορφή", en: "Format" },
        value: { el: "Ατομική", en: "One-to-one" },
      },
      {
        icon: "repeat-outline",
        label: { el: "Συνεδρίες", en: "Sessions" },
        value: { el: "4–6", en: "4–6" },
      },
    ],
    body: [
      {
        el: "Οι συχνότητες και τα ηχητικά μοτίβα επιλέγονται ανάλογα με τις ανάγκες σου, δημιουργώντας μια καθηλωτική εμπειρία που συνδυάζει ακουστό ήχο και σωματική δόνηση.",
        en: "The frequencies and sound patterns are selected according to your needs, creating an immersive experience that combines audible sound and physical vibration.",
      },
      {
        el: "Η χαμηλόσυχνη δόνηση μπορεί να μειώσει τη μυϊκή ένταση, να υποστηρίξει το παρασυμπαθητικό νευρικό σύστημα και να προάγει καταστάσεις βαθιάς ξεκούρασης.",
        en: "Low-frequency vibration can reduce muscle tension, support the parasympathetic nervous system and promote states of deep rest.",
      },
      {
        el: "Μπορεί να συνδυαστεί με άλλες πρακτικές ηχοθεραπείας, όπως ηχομασάζ, sound bath και διαπασών.",
        en: "It can be combined with other sound-therapy practices, such as sound massage, sound bath and tuning forks.",
      },
    ],
    benefits: [
      {
        el: "Μείωση στρες και νευρικής υπερφόρτωσης",
        en: "Reduced stress and nervous overload",
      },
      {
        el: "Βαθιά χαλάρωση και αναζωογονητική ξεκούραση",
        en: "Deep relaxation and restorative rest",
      },
      {
        el: "Ενεργοποίηση του παρασυμπαθητικού συστήματος",
        en: "Activation of the parasympathetic system",
      },
      {
        el: "Απελευθέρωση μυϊκής έντασης & κόπωσης",
        en: "Release of muscle tension & fatigue",
      },
      { el: "Ενίσχυση της σωματικής επίγνωσης", en: "Greater bodily awareness" },
      { el: "Βελτίωση διάθεσης και εστίασης", en: "Improved mood and focus" },
    ],
    expect: [
      {
        el: "Σύντομη συζήτηση για τις ανάγκες και την πρόθεσή σου.",
        en: "A short conversation about your needs and intention.",
      },
      {
        el: "Ξαπλώνεις άνετα στο δονητικοακουστικό κρεβάτι.",
        en: "You lie comfortably on the vibroacoustic bed.",
      },
      {
        el: "Ήπιες χαμηλές δονήσεις ταξιδεύουν στο σώμα μαζί με θεραπευτικά ηχοτοπία.",
        en: "Gentle low vibrations travel through the body alongside therapeutic soundscapes.",
      },
      {
        el: "Οι συχνότητες απαλύνουν σταδιακά και επιστρέφεις σε εγρήγορση.",
        en: "The frequencies gradually soften and you return to alertness.",
      },
    ],
  },
  {
    slug: "breathwork",
    title: { el: "Breathwork & ήχος", en: "Breathwork & sound" },
    tagline: {
      el: "Συνειδητή συνδεδεμένη αναπνοή με ζωντανά ηχοτοπία",
      en: "Conscious connected breathing with live soundscapes",
    },
    icon: "leaf-outline",
    hero: `${CDN}/2026/05/Breathwork2.jpg`,
    intro: {
      el: "Μια μοναδική ατομική συνεδρία που συνδυάζει πρακτικές συνειδητής αναπνοής με θεραπευτικά ηχοτοπία, για βαθιά χαλάρωση, συναισθηματική απελευθέρωση και εσωτερική θεραπεία.",
      en: "A unique one-to-one session that combines conscious breathing practices with therapeutic soundscapes, for deep relaxation, emotional release and inner healing.",
    },
    stats: [
      {
        icon: "time-outline",
        label: { el: "Διάρκεια", en: "Duration" },
        value: { el: "~2 ώρες", en: "~2 hours" },
      },
      {
        icon: "person-outline",
        label: { el: "Μορφή", en: "Format" },
        value: { el: "Ατομική", en: "One-to-one" },
      },
      {
        icon: "repeat-outline",
        label: { el: "Συνεδρίες", en: "Sessions" },
        value: { el: "4", en: "4" },
      },
    ],
    body: [
      {
        el: "Η συνεδρία ξεκινά με τεχνικές αναπνοής που ενεργοποιούν το παρασυμπαθητικό νευρικό σύστημα και στη συνέχεια στρέφεται σε πρακτικές που απελευθερώνουν αποθηκευμένα συναισθήματα.",
        en: "The session begins with breathing techniques that activate the parasympathetic nervous system and then moves to practices that release stored emotions.",
      },
      {
        el: "Η αναπνοή ενισχύεται από προσεκτικά επιλεγμένη μουσική, με ζωντανές στιγμές ηχοθεραπείας από singing bowls, τύμπανα, chimes και γκονγκ.",
        en: "The breath is supported by carefully selected music, with live moments of sound therapy from singing bowls, drums, chimes and gongs.",
      },
      {
        el: "Είναι μια ευκαιρία να επαναπρογραμματίσεις μοτίβα, να απελευθερώσεις μπλοκαρίσματα και να επανασυνδεθείς με τον εαυτό σου.",
        en: "It is an opportunity to re-pattern old habits, release blockages and reconnect with yourself.",
      },
    ],
    benefits: [
      { el: "Μείωση στρες, άγχους & έντασης", en: "Reduced stress, anxiety & tension" },
      {
        el: "Συναισθηματική απελευθέρωση και διαύγεια",
        en: "Emotional release and clarity",
      },
      {
        el: "Καλύτερη οξυγόνωση και ζωτικότητα",
        en: "Better oxygenation and vitality",
      },
      {
        el: "Απελευθέρωση αποθηκευμένου τραύματος",
        en: "Release of stored trauma",
      },
      {
        el: "Ενίσχυση αυτογνωσίας & παρουσίας",
        en: "Greater self-awareness & presence",
      },
      {
        el: "Βαθύτερη σύνδεση σώματος, νου & πνεύματος",
        en: "Deeper connection of body, mind & spirit",
      },
    ],
    expect: [
      {
        el: "Σύντομη συζήτηση για την πρόθεση και την εστίασή σου.",
        en: "A short conversation about your intention and focus.",
      },
      {
        el: "Ήπια κίνηση και ασκήσεις γείωσης για προετοιμασία.",
        en: "Gentle movement and grounding exercises to prepare.",
      },
      {
        el: "Καθοδηγούμενη αναπνοή μαζί με ζωντανή και ηχογραφημένη ηχητική εμπειρία.",
        en: "Guided breathing alongside a live and recorded sound experience.",
      },
      {
        el: "Χρόνος ανάπαυσης, ενσωμάτωσης και αναστοχασμού στο τέλος.",
        en: "Time to rest, integrate and reflect at the end.",
      },
    ],
  },
];

const pick = (l: L, lang: Lang) => (lang === "en" ? l.en : l.el);

export function getTreatments(lang: Lang): TreatmentContent[] {
  return RAW_TREATMENTS.map((r) => ({
    slug: r.slug,
    title: pick(r.title, lang),
    tagline: pick(r.tagline, lang),
    icon: r.icon,
    hero: r.hero,
    intro: pick(r.intro, lang),
    stats: r.stats.map((s) => ({
      icon: s.icon,
      label: pick(s.label, lang),
      value: pick(s.value, lang),
    })),
    body: r.body.map((b) => pick(b, lang)),
    benefits: r.benefits.map((b) => pick(b, lang)),
    expect: r.expect.map((e) => pick(e, lang)),
  }));
}

export const treatmentBySlug = (slug: string | undefined, lang: Lang) =>
  getTreatments(lang).find((t) => t.slug === slug);
