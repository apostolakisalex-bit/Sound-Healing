import React, { useState } from "react";
import { Platform, Text, View } from "react-native";
import { api } from "@/src/api/client";
import { Button, Field, Status, useUi, useLoad } from "./Wellness";
import { useLanguage } from "./AppNavigation";
export type AssessmentQuestion = {
  key: string;
  label: string;
  kind: string;
  required: boolean;
  options: string[];
};
export type AnswerValues = Record<string, string | string[]>;
export function AssessmentFields({
  questions,
  answers,
  onChange,
}: {
  questions: AssessmentQuestion[];
  answers: AnswerValues;
  onChange: (a: AnswerValues) => void;
}) {
  const ui = useUi();
  const { t } = useLanguage();
  return (
    <View style={{ gap: 24 }}>
      {questions.map((q) => (
        <View key={q.key} style={{ gap: 8 }}>
          {q.kind === "text" ? (
            <Field
              label={q.label + (q.required ? " *" : "")}
              value={String(answers[q.key] || "")}
              onChange={(v) => onChange({ ...answers, [q.key]: v })}
              multiline
            />
          ) : (
            <>
              <Text style={ui.body}>
                {q.label}
                {q.required ? " *" : ""}
              </Text>
              {q.kind === "multi" && (
                <Text style={ui.body}>
                  {t(
                    "Μπορείς να επιλέξεις περισσότερες από μία απαντήσεις.",
                    "You can select more than one answer.",
                  )}
                </Text>
              )}
              {q.options.map((option) => {
                const value = answers[q.key];
                const selected = Array.isArray(value)
                  ? value.includes(option)
                  : value === option;
                return (
                  <Button
                    key={option}
                    secondary={!selected}
                    label={(selected ? "✓ " : "") + option}
                    onPress={() =>
                      onChange({
                        ...answers,
                        [q.key]:
                          q.kind === "multi"
                            ? Array.isArray(value)
                              ? selected
                                ? value.filter((v) => v !== option)
                                : [...value, option]
                              : [option]
                            : option,
                      })
                    }
                  />
                );
              })}
            </>
          )}
        </View>
      ))}
    </View>
  );
}
type Form = { id: string; questions: AssessmentQuestion[] };
type Response = { revision: number; status: string; answers: AnswerValues };
type Invitation = {
  id: string;
  status: string;
  expires_at: string;
  answers?: AnswerValues;
};
type Overview = {
  practitioner: { form: Form | null; response: Response | null };
  receiver: { form: Form | null };
  invitations: Invitation[];
};
export function PracticeAssessments({
  practiceId,
  staff = false,
  onChanged,
}: {
  practiceId: string;
  staff?: boolean;
  onChanged?: () => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  return (
    <View style={{ gap: 12 }}>
      <Button
        secondary
        label={
          open
            ? t("Κλείσιμο αξιολογήσεων", "Close assessments")
            : t("Αξιολογήσεις μαθητή & δέκτη", "Learner & receiver assessments")
        }
        onPress={() => setOpen(!open)}
      />
      {open && (
        <AssessmentPanel
          practiceId={practiceId}
          staff={staff}
          onChanged={onChanged}
        />
      )}
    </View>
  );
}
function AssessmentPanel({
  practiceId,
  staff,
  onChanged,
}: {
  practiceId: string;
  staff: boolean;
  onChanged?: () => Promise<unknown>;
}) {
  const ui = useUi();
  const { t } = useLanguage();
  const state = useLoad<Overview>(
    `/school/practices/${practiceId}/assessments`,
    {
      practitioner: { form: null, response: null },
      receiver: { form: null },
      invitations: [],
    },
  );
  const [draft, setDraft] = useState<AnswerValues | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [link, setLink] = useState("");
  const response = state.data.practitioner.response;
  const run = async (work: () => Promise<unknown>) => {
    setBusy(true);
    setMessage("");
    try {
      await work();
      await state.reload();
      await onChanged?.();
    } catch (e: any) {
      setMessage(
        typeof e?.response?.data?.detail === "string"
          ? e.response.data.detail
          : t(
              "Δεν ολοκληρώθηκε. Έλεγξε τις απαντήσεις και δοκίμασε ξανά.",
              "Not completed. Check your answers and try again.",
            ),
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ gap: 16 }}>
      <Status state={state} />
      {!state.loading && !state.error && (
        <>
          <Text style={ui.heading}>{t("Αναστοχασμός μαθητή", "Learner reflection")}</Text>
          {!state.data.practitioner.form ? (
            <Text style={ui.body}>
              {t(
                "Η επίσημη φόρμα αυτού του Level αναμένει ενεργοποίηση από τον admin.",
                "The official form for this Level is awaiting activation by the admin.",
              )}
            </Text>
          ) : staff || response?.status === "submitted" ? (
            <>
              <Text style={ui.body}>
                {response?.status === "submitted"
                  ? t("Υποβλήθηκε", "Submitted")
                  : t("Δεν έχει υποβληθεί", "Not submitted")}
              </Text>
              {response?.status === "submitted" && (
                <AnswerReview
                  form={state.data.practitioner.form}
                  answers={response.answers}
                />
              )}
            </>
          ) : (
            <>
              <AssessmentFields
                questions={state.data.practitioner.form.questions}
                answers={draft ?? response?.answers ?? {}}
                onChange={setDraft}
              />
              {[false, true].map((submit) => (
                <Button
                  key={String(submit)}
                  secondary={!submit}
                  disabled={busy}
                  label={
                    submit
                      ? t("Οριστική υποβολή αξιολόγησης", "Submit assessment")
                      : t("Αποθήκευση πρόχειρης αξιολόγησης", "Save draft assessment")
                  }
                  onPress={() =>
                    void run(async () => {
                      await api.post(
                        `/school/practices/${practiceId}/assessment`,
                        {
                          answers: draft ?? response?.answers ?? {},
                          revision: response?.revision ?? 0,
                          submit,
                        },
                      );
                      setDraft(null);
                      setMessage(
                        submit
                          ? t(
                              "Η αξιολόγηση υποβλήθηκε στον εκπαιδευτή και στον admin.",
                              "The assessment was submitted to the instructor and the admin.",
                            )
                          : t("Το πρόχειρο αποθηκεύτηκε.", "The draft was saved."),
                      );
                    })
                  }
                />
              ))}
            </>
          )}
          <Text style={ui.heading}>{t("Αξιολόγηση δέκτη / συμμετεχόντων", "Receiver / participant assessment")}</Text>
          {!state.data.receiver.form ? (
            <Text style={ui.body}>
              {t(
                "Η φόρμα δέκτη αναμένει ενεργοποίηση από τον admin.",
                "The receiver form is awaiting activation by the admin.",
              )}
            </Text>
          ) : (
            <>
              {!staff && (
                <>
                  <Text style={ui.body}>
                    {t(
                      "Μετά την υποβολή της πρακτικής, δημιούργησε ξεχωριστό σύνδεσμο για κάθε συμμετέχοντα. Οι απαντήσεις είναι ορατές στον αρμόδιο εκπαιδευτή και στον admin.",
                      "After submitting the practice, create a separate link for each participant. Answers are visible to the responsible instructor and the admin.",
                    )}
                  </Text>
                  <Button
                    disabled={busy}
                    label={t("Δημιουργία προσωπικού συνδέσμου", "Create personal link")}
                    onPress={() =>
                      void run(async () => {
                        const { data } = await api.post(
                          `/school/practices/${practiceId}/invitations`,
                        );
                        const base =
                          Platform.OS === "web"
                            ? window.location.origin
                            : process.env.EXPO_PUBLIC_WEB_URL;
                        if (!base) {
                          setMessage(
                            t(
                              "Χρειάζεται EXPO_PUBLIC_WEB_URL για κοινοποίηση από κινητή εφαρμογή.",
                              "EXPO_PUBLIC_WEB_URL is required to share from the mobile app.",
                            ),
                          );
                          return;
                        }
                        setLink(
                          `${base}/evaluation#token=${encodeURIComponent(data.token)}`,
                        );
                      })
                    }
                  />
                  {!!link && (
                    <Text selectable style={ui.body}>
                      {link}
                    </Text>
                  )}
                </>
              )}
              {state.data.invitations.map((inv) => (
                <View key={inv.id} style={ui.card}>
                  <Text style={ui.body}>
                    {inv.status === "submitted"
                      ? t("Η αξιολόγηση παραλήφθηκε", "The assessment was received")
                      : inv.status === "revoked"
                        ? t("Ο σύνδεσμος ανακλήθηκε", "The link was revoked")
                        : new Date(inv.expires_at) < new Date()
                          ? t("Ο σύνδεσμος έληξε", "The link expired")
                          : t("Αναμονή απάντησης", "Awaiting response")}
                  </Text>
                  {!staff && inv.status === "pending" && (
                    <Button
                      secondary
                      disabled={busy}
                      label={t("Ανάκληση συνδέσμου", "Revoke link")}
                      onPress={() =>
                        void run(() =>
                          api.post(
                            `/school/practices/${practiceId}/invitations/${inv.id.split(":").pop()}/revoke`,
                          ),
                        )
                      }
                    />
                  )}
                  {staff && inv.answers && (
                    <AnswerReview
                      form={state.data.receiver.form!}
                      answers={inv.answers}
                    />
                  )}
                </View>
              ))}
            </>
          )}
        </>
      )}
      {!!message && (
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          {message}
        </Text>
      )}
    </View>
  );
}
function AnswerReview({
  form,
  answers,
}: {
  form: Form;
  answers: AnswerValues;
}) {
  const ui = useUi();
  return (
    <View style={{ gap: 12 }}>
      {form.questions.map((q) => (
        <View key={q.key}>
          <Text style={ui.body}>{q.label}</Text>
          <Text selectable style={ui.body}>
            {Array.isArray(answers[q.key])
              ? (answers[q.key] as string[]).join(", ")
              : answers[q.key] || "—"}
          </Text>
        </View>
      ))}
    </View>
  );
}
