import React, { useState } from "react";
import { Platform, Text, View } from "react-native";
import { api } from "@/src/api/client";
import { Button, Field, Status, ui, useLoad } from "./Wellness";
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
                  Μπορείς να επιλέξεις περισσότερες από μία απαντήσεις.
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
  return (
    <View style={{ gap: 12 }}>
      <Button
        secondary
        label={open ? "Κλείσιμο αξιολογήσεων" : "Αξιολογήσεις μαθητή & δέκτη"}
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
          : "Δεν ολοκληρώθηκε. Έλεγξε τις απαντήσεις και δοκίμασε ξανά.",
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
          <Text style={ui.heading}>Αναστοχασμός μαθητή</Text>
          {!state.data.practitioner.form ? (
            <Text style={ui.body}>
              Η επίσημη φόρμα αυτού του Level αναμένει ενεργοποίηση από τον
              admin.
            </Text>
          ) : staff || response?.status === "submitted" ? (
            <>
              <Text style={ui.body}>
                {response?.status === "submitted"
                  ? "Υποβλήθηκε"
                  : "Δεν έχει υποβληθεί"}
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
                      ? "Οριστική υποβολή αξιολόγησης"
                      : "Αποθήκευση πρόχειρης αξιολόγησης"
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
                          ? "Η αξιολόγηση υποβλήθηκε στον εκπαιδευτή και στον admin."
                          : "Το πρόχειρο αποθηκεύτηκε.",
                      );
                    })
                  }
                />
              ))}
            </>
          )}
          <Text style={ui.heading}>Αξιολόγηση δέκτη / συμμετεχόντων</Text>
          {!state.data.receiver.form ? (
            <Text style={ui.body}>
              Η φόρμα δέκτη αναμένει ενεργοποίηση από τον admin.
            </Text>
          ) : (
            <>
              {!staff && (
                <>
                  <Text style={ui.body}>
                    Μετά την υποβολή της πρακτικής, δημιούργησε ξεχωριστό
                    σύνδεσμο για κάθε συμμετέχοντα. Οι απαντήσεις είναι ορατές
                    στον αρμόδιο εκπαιδευτή και στον admin.
                  </Text>
                  <Button
                    disabled={busy}
                    label="Δημιουργία προσωπικού συνδέσμου"
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
                            "Χρειάζεται EXPO_PUBLIC_WEB_URL για κοινοποίηση από κινητή εφαρμογή.",
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
                      ? "Η αξιολόγηση παραλήφθηκε"
                      : inv.status === "revoked"
                        ? "Ο σύνδεσμος ανακλήθηκε"
                        : new Date(inv.expires_at) < new Date()
                          ? "Ο σύνδεσμος έληξε"
                          : "Αναμονή απάντησης"}
                  </Text>
                  {!staff && inv.status === "pending" && (
                    <Button
                      secondary
                      disabled={busy}
                      label="Ανάκληση συνδέσμου"
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
