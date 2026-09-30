import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Head from "expo-router/head";
import { api } from "@/src/api/client";
import {
  AssessmentFields,
  AssessmentQuestion,
  AnswerValues,
} from "@/src/components/Assessments";
import { Button, ui } from "@/src/components/Wellness";
export default function Evaluation() {
  const [token, setToken] = useState(""),
    [questions, setQuestions] = useState<AssessmentQuestion[]>([]),
    [answers, setAnswers] = useState<AnswerValues>({}),
    [message, setMessage] = useState("Φόρτωση…"),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false);
  useEffect(() => {
    let active = true;
    const value =
      typeof window === "undefined"
        ? ""
        : new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
    setToken(value);
    api
      .post("/evaluations/access", { token: value })
      .then(({ data }) => {
        if (active) {
          setQuestions(data.questions);
          setMessage(`Συνεδρία: ${data.session_date}`);
        }
      })
      .catch(() => {
        if (active)
          setMessage(
            "Ο σύνδεσμος δεν είναι διαθέσιμος. Μπορεί να έληξε, να ανακλήθηκε ή να έχει ήδη χρησιμοποιηθεί.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <ScrollView style={ui.page}>
      <Head>
        <title>Αξιολόγηση συνεδρίας · Sound Healing Greece</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Head>
      <View style={[ui.wrap, { maxWidth: 720 }]}>
        <Text style={ui.title}>Η εμπειρία σου μετράει.</Text>
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          {message}
        </Text>
        {!!questions.length && !done && (
          <>
            <Text style={ui.body}>
              Συμπλήρωσε την αξιολόγηση, ιδανικά μέσα σε 48 ώρες. Οι απαντήσεις
              σου θα διαβαστούν από τον αρμόδιο εκπαιδευτή και τον διαχειριστή
              της σχολής. Τα πεδία με * είναι υποχρεωτικά.
            </Text>
            <AssessmentFields
              questions={questions}
              answers={answers}
              onChange={setAnswers}
            />
            <Button
              label="Υποβολή αξιολόγησης"
              disabled={busy}
              onPress={async () => {
                setBusy(true);
                try {
                  await api.post("/evaluations/submit", { token, answers });
                  setDone(true);
                  setAnswers({});
                  setMessage("Σε ευχαριστούμε. Η αξιολόγησή σου παραλήφθηκε.");
                } catch (e: any) {
                  setMessage(
                    typeof e?.response?.data?.detail === "string"
                      ? e.response.data.detail
                      : "Έλεγξε τις απαντήσεις σου και δοκίμασε ξανά.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}
