import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Head from "expo-router/head";
import { api } from "@/src/api/client";
import {
  AssessmentFields,
  AssessmentQuestion,
  AnswerValues,
} from "@/src/components/Assessments";
import { Button, useUi } from "@/src/components/Wellness";
import { useLanguage } from "@/src/components/AppNavigation";
export default function Evaluation() {
  const ui = useUi();
  const { t } = useLanguage();
  const [token, setToken] = useState(""),
    [questions, setQuestions] = useState<AssessmentQuestion[]>([]),
    [answers, setAnswers] = useState<AnswerValues>({}),
    [message, setMessage] = useState("…"),
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
          setMessage(`${t("Συνεδρία:", "Session:")} ${data.session_date}`);
        }
      })
      .catch(() => {
        if (active)
          setMessage(
            t(
              "Ο σύνδεσμος δεν είναι διαθέσιμος. Μπορεί να έληξε, να ανακλήθηκε ή να έχει ήδη χρησιμοποιηθεί.",
              "The link is not available. It may have expired, been revoked, or already been used.",
            ),
          );
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <ScrollView style={ui.page}>
      <Head>
        <title>{t("Αξιολόγηση συνεδρίας", "Session evaluation")} · Sound Healing Greece</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Head>
      <View style={[ui.wrap, { maxWidth: 720 }]}>
        <Text style={ui.title}>{t("Η εμπειρία σου μετράει.", "Your experience matters.")}</Text>
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          {message}
        </Text>
        {!!questions.length && !done && (
          <>
            <Text style={ui.body}>
              {t(
                "Συμπλήρωσε την αξιολόγηση, ιδανικά μέσα σε 48 ώρες. Οι απαντήσεις σου θα διαβαστούν από τον αρμόδιο εκπαιδευτή και τον διαχειριστή της σχολής. Τα πεδία με * είναι υποχρεωτικά.",
                "Complete the evaluation, ideally within 48 hours. Your answers will be read by the relevant instructor and the school administrator. Fields marked with * are required.",
              )}
            </Text>
            <AssessmentFields
              questions={questions}
              answers={answers}
              onChange={setAnswers}
            />
            <Button
              label={t("Υποβολή αξιολόγησης", "Submit evaluation")}
              disabled={busy}
              onPress={async () => {
                setBusy(true);
                try {
                  await api.post("/evaluations/submit", { token, answers });
                  setDone(true);
                  setAnswers({});
                  setMessage(t("Σε ευχαριστούμε. Η αξιολόγησή σου παραλήφθηκε.", "Thank you. Your evaluation has been received."));
                } catch (e: any) {
                  setMessage(
                    typeof e?.response?.data?.detail === "string"
                      ? e.response.data.detail
                      : t("Έλεγξε τις απαντήσεις σου και δοκίμασε ξανά.", "Check your answers and try again."),
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
