// Real student reviews sourced from soundhealing.gr (training-seminars page,
// Greek & English versions). Shown in the gently moving Home testimonials
// carousel as a dependable fallback alongside any CMS testimonials.
export type StudentReview = {
  el: string;
  en: string;
  name_el: string;
  name_en: string;
  avatar?: string;
};

export const STUDENT_REVIEWS: StudentReview[] = [
  {
    el: "Το σεμινάριο με τον Μανώλη ήταν πολλά παραπάνω από ένα εκπαιδευτικό — ένα ταξίδι στον κόσμο του ήχου και της εσωτερικής γαλήνης. Μου άνοιξε νέες προοπτικές και μου άφησε ένα βαθύ αίσθημα ευγνωμοσύνης. Το συνιστώ ανεπιφύλακτα!",
    en: "The course with Manolis was so much more than a training — a journey into the world of sound and inner silence. It opened new perspectives and left me with deep gratitude. I wholeheartedly recommend it!",
    name_el: "Ελένη Ζ.",
    name_en: "Eleni Z.",
    avatar:
      "https://www.soundhealing.gr/wp-content/uploads/2025/12/Screenshot-2025-12-10-at-5.29.38-PM-160x160.png",
  },
  {
    el: "Ως ενεργειακή θεραπεύτρια ήθελα να προσθέσω τα singing bowls στις θεραπείες μου. Έφυγα εφοδιασμένη με γνώση, τεχνικές και πρωτόκολλα — κι ας μην παίζω κάποιο όργανο. Ένιωσα απόλυτα άνετα και το συνιστώ ανεπιφύλακτα.",
    en: "As an energy therapist I wanted to add singing bowls to my practice. I left equipped with knowledge, techniques and protocols — even though I don't play any instrument. I felt completely at ease and wholeheartedly recommend it.",
    name_el: "Γεωργία Κ.",
    name_en: "Georgia K.",
    avatar:
      "https://www.soundhealing.gr/wp-content/uploads/2023/04/Screenshot-2023-04-02-at-8.15.52-PM-160x160.png",
  },
  {
    el: "Είναι σπάνιο να γνωρίζεις ανθρώπους σαν τον Μανώλη. Υπέροχη εμπειρία στο διήμερο σεμινάριο — γνώρισα τα Himalayan singing bowls και μια ομάδα υπέροχων ανθρώπων. Μας καθοδήγησε με σεβασμό, αγάπη, γνώση και χιούμορ!",
    en: "It's rare to meet people like Manolis. A wonderful experience at the two-day seminar — I discovered the Himalayan singing bowls and a group of lovely people. He guided us with respect, love, knowledge and humour!",
    name_el: "Μάκης Σ.",
    name_en: "Makis S.",
    avatar:
      "https://www.soundhealing.gr/wp-content/uploads/2024/12/Screenshot-2024-12-12-at-5.55.45-PM-160x160.jpg",
  },
  {
    el: "Παρακολούθησα το Επίπεδο 1 και το Επίπεδο 2 και ήταν μια καταπληκτική εμπειρία! Ο Μανώλης είναι προσηλωμένος στη λεπτομέρεια και πειθαρχημένος, μα συνάμα ζεστός και γενναιόδωρος. Φεύγεις γεμάτος γνώση και πρακτική.",
    en: "I took both Level 1 and Level 2 and it was such an amazing experience! Manolis is detail-oriented and disciplined, yet warm and generous. You leave full of knowledge and practice.",
    name_el: "Jihane A.",
    name_en: "Jihane A.",
    avatar:
      "https://www.soundhealing.gr/wp-content/uploads/2025/12/Screenshot-2025-12-10-at-5.33.14-PM-160x160.jpeg",
  },
];
