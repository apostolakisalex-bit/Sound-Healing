import { wellness } from "@/src/theme";
import { pickPhoto } from "@/src/utils/pickPhoto";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "@/src/api/client";
import { useAuth } from "@/src/auth/AuthContext";
import { Button, Choices, Field, Shell, Status, ui, palette, useLoad } from "./Wellness";
import { iconSurface } from "./AppNavigation";

type Level = {
  cohort_id?: string | null;
  credited_practice_ids?: string[];
  level_id: string;
  enabled: boolean;
  target: number | null;
  historical_completed: number;
  verified_in_app: number;
  completed: number;
  complete: boolean;
  revision: number;
  note: string;
};
type Reviewed = {
  id: string;
  level_id: string;
  session_date: string;
  practitioner_submitted: boolean;
  receiver_responses: number;
};
type Member = {
  reviewed_practices?: Reviewed[];
  id: string;
  name: string;
  bio: string;
  profile_image: string;
  membership_status: string;
  instruments: string[];
  levels: Level[];
  stats: {
    minutes: number;
    sessions: number;
    receivers: number;
    evaluations: number;
  };
  application?: Record<string, any>;
  email?: string;
  requests: { level_id: string; status: string; decision_note?: string }[];
};
const empty: Member = {
  id: "",
  name: "",
  bio: "",
  profile_image: "",
  membership_status: "",
  instruments: [],
  levels: [],
  stats: { minutes: 0, sessions: 0, receivers: 0, evaluations: 0 },
  requests: [],
};
const statusLabel: Record<string, string> = {
  pending: "Αναμονή έγκρισης",
  approved: "Εγκεκριμένο μέλος",
  rejected: "Η αίτηση δεν εγκρίθηκε",
};
export function MemberProfile({
  memberId,
  cohorts = [],
}: {
  memberId?: string;
  cohorts?: { id: string; title: string; level_id: string }[];
}) {
  const { user, updateProfile, logout, refresh } = useAuth();
  const router = useRouter();
  const staff = !!memberId;
  const state = useLoad<Member>(
    staff ? `/admin/members/${memberId}` : "/members/me",
    empty,
  );
  const p = state.data;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [instrument, setInstrument] = useState("");
  const [showInstruments, setShowInstruments] = useState(false);
  const [level, setLevel] = useState("L1");
  const [note, setNote] = useState("");
  const [selectedCohort, setSelectedCohort] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const run = async (task: () => Promise<unknown>) => {
    setBusy(true);
    setMessage("");
    try {
      await task();
      await state.reload();
      if (!staff) await refresh();
      setMessage("Αποθηκεύτηκε.");
    } catch (e: any) {
      setMessage(
        typeof e?.response?.data?.detail === "string"
          ? e.response.data.detail
          : "Δεν αποθηκεύτηκε. Έλεγξε τα στοιχεία.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ gap: 20, width: "100%", maxWidth: 720, alignSelf: "center" }}>
      <Status state={state} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
        <View
          style={[
            iconSurface,
            {
              width: 84,
              height: 84,
              borderRadius: 42,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          {p.profile_image ? (
            <Image
              source={{ uri: p.profile_image }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
            />
          ) : (
            <Ionicons name="person-outline" size={36} color={wellness.muted} />
          )}
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <Text
            style={[
              ui.body,
              { fontWeight: "600", color: wellness.ink, fontSize: 17 },
            ]}
          >
            {p.name}
          </Text>
          {p.levels.map((l) => (
            <View
              key={l.level_id}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={{ fontSize: 11, width: 20 }}>{l.level_id}</Text>
              <View
                style={{
                  flex: 1,
                  height: 7,
                  borderRadius: 5,
                  backgroundColor: "#E3E0DA",
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${l.enabled && l.target ? Math.min(100, (l.completed / l.target) * 100) : 0}%`,
                    height: 7,
                    backgroundColor: l.complete ? "#79A887" : "#D7AF4B",
                  }}
                />
              </View>
              <Text style={{ fontSize: 10 }}>
                {l.enabled
                  ? l.target
                    ? `${l.completed}/${l.target}`
                    : "—"
                  : "—"}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={ui.body}>{statusLabel[p.membership_status] || ""}</Text>
      {!!p.bio && <Text style={ui.body}>{p.bio}</Text>}
      {!staff && (
        <Button
          secondary
          label="Επεξεργασία προφίλ"
          onPress={() => setEditing(!editing)}
        />
      )}
      {!!message && (
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          {message}
        </Text>
      )}
      {editing && (
        <View style={ui.card}>
          {p.membership_status === "approved" && (
            <Button
              secondary
              label="Αλλαγή φωτογραφίας προφίλ"
              disabled={busy}
              onPress={() =>
                void run(async () => {
                  const data = await pickPhoto();
                  if (data) await api.post("/members/me/avatar", { data });
                })
              }
            />
          )}
          <Field label="Όνομα προφίλ" value={name} onChange={setName} />
          <Field label="Λίγα λόγια" value={bio} onChange={setBio} multiline />
          <Button
            label="Αποθήκευση προφίλ"
            disabled={busy}
            onPress={() =>
              void run(async () => {
                await updateProfile({ name, bio });
                setEditing(false);
              })
            }
          />
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingVertical: 6 }}
      >
        {[
          [`${(p.stats.minutes / 60).toFixed(1)}`, "Ώρες"],
          [String(p.stats.sessions), "Συνεδρίες"],
          [String(p.stats.receivers), "Άτομα"],
          [String(p.stats.evaluations), "Αξιολογήσεις"],
        ].map(([value, label]) => (
          <View key={label} style={{ width: 74, alignItems: "center", gap: 7 }}>
            <View
              style={[
                iconSurface,
                {
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: wellness.line,
                },
              ]}
            >
              <Text style={{ fontSize: 20, color: wellness.slate }}>{value}</Text>
            </View>
            <Text style={{ fontSize: 11 }}>{label}</Text>
          </View>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Τα όργανά μου"
          onPress={() => setShowInstruments(!showInstruments)}
          style={{ width: 74, alignItems: "center", gap: 7 }}
        >
          <View
            style={[
              iconSurface,
              {
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <Ionicons name="musical-notes-outline" size={25} color={wellness.slate} />
          </View>
          <Text style={{ fontSize: 11 }}>Όργανα · {p.instruments.length}</Text>
        </Pressable>
      </ScrollView>
      <Text style={[ui.body, { fontSize: 11 }]}>
        Οι ώρες και οι συνεδρίες προκύπτουν από υποβληθείσες πρακτικές. Τα
        μοναδικά άτομα υπολογίζονται από τους κωδικούς δεκτών ατομικών
        συνεδριών.
      </Text>
      {(showInstruments || staff) && (
        <View style={ui.card}>
          <Text style={ui.heading}>Όργανα</Text>
          {p.instruments.map((i) => (
            <View key={i} style={ui.row}>
              <Text style={ui.body}>{i}</Text>
              {!staff && (
                <Button
                  secondary
                  label={`Αφαίρεση ${i}`}
                  disabled={busy}
                  onPress={() =>
                    void run(() =>
                      api.put("/members/me/instruments", {
                        instruments: p.instruments.filter((x) => x !== i),
                      }),
                    )
                  }
                />
              )}
            </View>
          ))}
          {!staff && p.membership_status === "approved" && (
            <>
              <Field
                label="Προσθήκη οργάνου"
                value={instrument}
                onChange={setInstrument}
              />
              <Button
                label="Προσθήκη"
                disabled={busy || !instrument.trim()}
                onPress={() =>
                  void run(async () => {
                    await api.put("/members/me/instruments", {
                      instruments: [...p.instruments, instrument],
                    });
                    setInstrument("");
                  })
                }
              />
            </>
          )}
        </View>
      )}
      {p.levels.map((l) => (
        <View key={l.level_id} style={ui.card}>
          <Text style={[ui.body, { fontWeight: "600" }]}>
            {l.level_id} ·{" "}
            {l.complete
              ? "Ολοκληρωμένες πρακτικές"
              : l.enabled
                ? "Σε εξέλιξη"
                : "Δεν έχει ενεργοποιηθεί"}
          </Text>
          {l.enabled && l.target ? (
            <View
              accessibilityLabel={`${l.completed} από ${l.target} πρακτικές`}
              style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}
            >
              {Array.from({ length: l.target }, (_, i) => (
                <Ionicons
                  key={i}
                  name={i < l.completed ? "star" : "star-outline"}
                  size={22}
                  color={i < l.completed ? "#D6AB35" : wellness.ink}
                  style={{
                    textShadowColor: "#BAA271",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 2,
                  }}
                />
              ))}
            </View>
          ) : (
            <Text style={ui.body}>
              {l.enabled
                ? "Ο στόχος πρακτικών δεν έχει οριστεί από τον διαχειριστή."
                : "Αναμονή επιβεβαίωσης από τη σχολή."}
            </Text>
          )}
          {l.enabled && (
            <Text style={[ui.body, { fontSize: 12 }]}>
              {l.historical_completed} επιβεβαιωμένες παλαιότερες ·{" "}
              {l.verified_in_app} από την εφαρμογή
            </Text>
          )}
          {staff && (
            <LevelEditor
              key={`${l.level_id}:${l.revision}`}
              uid={memberId!}
              level={l}
              cohorts={cohorts.filter((c) => c.level_id === l.level_id)}
              practices={(p.reviewed_practices || []).filter(
                (r) => r.level_id === l.level_id,
              )}
              done={state.reload}
            />
          )}
        </View>
      ))}
      {staff && p.application && (
        <View style={ui.card}>
          <Text style={ui.heading}>Στοιχεία αίτησης</Text>
          <Text style={ui.body}>{p.email}</Text>
          <Text style={ui.body}>
            {p.application.first_name} {p.application.last_name} ·{" "}
            {p.application.birth_month}/{p.application.birth_year}
          </Text>
          <Text style={ui.body}>
            {p.application.phone} · {p.application.address}
          </Text>
          <Text style={ui.body}>
            Δηλωμένο Level: {p.application.declared_level}
          </Text>
        </View>
      )}
      {staff && (
        <View style={ui.card}>
          <Field
            label="Σχόλιο απόφασης"
            value={note}
            onChange={setNote}
            multiline
          />
          {p.membership_status === "pending" && (
            <View style={ui.row}>
              {["approved", "rejected"].map((decision) => (
                <Button
                  key={decision}
                  secondary={decision === "rejected"}
                  label={
                    decision === "approved"
                      ? "Έγκριση εγγραφής μέλους"
                      : "Απόρριψη εγγραφής μέλους"
                  }
                  disabled={busy || note.trim().length < 2}
                  onPress={() =>
                    void run(() =>
                      api.post(`/admin/members/${memberId}/decision`, {
                        decision,
                        note,
                      }),
                    )
                  }
                />
              ))}
            </View>
          )}
        </View>
      )}
      {!staff && p.membership_status === "approved" && (
        <View style={ui.card}>
          <Text style={ui.heading}>Συμμετοχή σε εκπαιδευτικό</Text>
          <Choices
            label="Επιθυμητό Level"
            values={["L1", "L2", "L3", "L4"]}
            value={level}
            onChange={setLevel}
          />
          <Field label="Μήνυμα προς τη σχολή" value={note} onChange={setNote} />
          <Button
            label="Αποστολή αίτησης συμμετοχής"
            disabled={busy}
            onPress={() =>
              void run(() =>
                api.post("/members/me/training-requests", {
                  level_id: level,
                  note,
                }),
              )
            }
          />
        </View>
      )}
      {p.requests.map((r) => (
        <View key={r.level_id} style={ui.card}>
          <Text style={ui.body}>
            Αίτηση {r.level_id} · {statusLabel[r.status] || r.status}
          </Text>
          {!!r.decision_note && <Text style={ui.body}>{r.decision_note}</Text>}
          {staff && r.status === "pending" && (
            <>
              <Text style={ui.body}>Επιλογή τμήματος για έγκριση</Text>
              <View style={ui.row}>
                {cohorts
                  .filter((c) => c.level_id === r.level_id)
                  .map((c) => (
                    <Button
                      key={c.id}
                      secondary={selectedCohort !== c.id}
                      label={c.title}
                      onPress={() => setSelectedCohort(c.id)}
                    />
                  ))}
              </View>
              <View style={ui.row}>
                {["approved", "rejected"].map((decision) => (
                  <Button
                    key={decision}
                    label={
                      decision === "approved"
                        ? `Έγκριση συμμετοχής ${r.level_id}`
                        : `Απόρριψη συμμετοχής ${r.level_id}`
                    }
                    secondary={decision === "rejected"}
                    disabled={
                      busy ||
                      note.trim().length < 2 ||
                      (decision === "approved" && !selectedCohort)
                    }
                    onPress={() =>
                      void run(() =>
                        api.post(
                          `/admin/members/${memberId}/training/${r.level_id}/decision`,
                          { decision, note, cohort_id: selectedCohort || null },
                        ),
                      )
                    }
                  />
                ))}
              </View>
            </>
          )}
        </View>
      ))}
      {!staff && p.membership_status === "approved" && (
        <View style={ui.row}>
          <Button
            secondary
            label="Η σχολή μου"
            onPress={() => router.push("/academy")}
          />
          <Button
            secondary
            label="Οι πρακτικές μου"
            onPress={() => router.push("/practice")}
          />
          <Button
            secondary
            label="Journey"
            onPress={() => router.push("/journey")}
          />
          <Button
            secondary
            label="Chat μελών"
            onPress={() => router.push("/explore/contact")}
          />
        </View>
      )}
      {!staff && (
        <>
          <Button
            secondary
            label="Ανανέωση κατάστασης"
            onPress={() => void run(async () => {})}
          />
          <Button
            secondary
            label="Αποσύνδεση"
            onPress={() => void logout().then(() => router.replace("/"))}
          />
        </>
      )}
    </View>
  );
}

function LevelEditor({
  uid,
  level: l,
  cohorts,
  practices,
  done,
}: {
  uid: string;
  level: Level;
  cohorts: { id: string; title: string }[];
  practices: Reviewed[];
  done: () => Promise<void>;
}) {
  const [cohort, setCohort] = useState(l.cohort_id || "");
  const [credited, setCredited] = useState(l.credited_practice_ids || []);
  const [target, setTarget] = useState(l.target ? String(l.target) : "");
  const [count, setCount] = useState(String(l.historical_completed));
  const [enabled, setEnabled] = useState(l.enabled);
  const [note, setNote] = useState(l.note);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <Text style={ui.body}>
        Προαιρετική ένταξη σε τμήμα για καταγραφή εκκρεμών πρακτικών
      </Text>
      <View style={ui.row}>
        <Button
          secondary={!cohort}
          label="Χωρίς νέα ένταξη"
          onPress={() => setCohort("")}
        />
        {cohorts.map((c) => (
          <Button
            key={c.id}
            secondary={cohort !== c.id}
            label={c.title}
            onPress={() => setCohort(c.id)}
          />
        ))}
      </View>
      <Text style={ui.body}>
        Ελεγμένες πρακτικές για προσμέτρηση — επιλέγει ο διαχειριστής μετά τον
        έλεγχο των αξιολογήσεων.
      </Text>
      {practices.map((r) => (
        <Button
          key={r.id}
          secondary={!credited.includes(r.id)}
          label={`${credited.includes(r.id) ? "✓ " : ""}${r.session_date} · Αξιολόγηση μαθητή: ${r.practitioner_submitted ? "ναι" : "όχι"} · Απαντήσεις δεκτών: ${r.receiver_responses}`}
          onPress={() =>
            setCredited((old) =>
              old.includes(r.id)
                ? old.filter((id) => id !== r.id)
                : [...old, r.id],
            )
          }
        />
      ))}
      <Choices
        label="Επιβεβαίωση Level"
        values={["Ενεργό", "Ανενεργό"]}
        value={enabled ? "Ενεργό" : "Ανενεργό"}
        onChange={(v) => setEnabled(v === "Ενεργό")}
      />
      <Field
        label="Απαιτούμενες πρακτικές (κενό αν εκκρεμεί)"
        value={target}
        onChange={setTarget}
      />
      {Number(target) > 0 && Number(target) <= 200 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {Array.from({ length: Number(target) }, (_, i) => (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={`${i + 1} παλαιότερες πρακτικές`}
              onPress={() =>
                setCount(String(Number(count) === i + 1 ? i : i + 1))
              }
            >
              <Ionicons
                name={i < Number(count) ? "star" : "star-outline"}
                size={24}
                color={i < Number(count) ? "#D6AB35" : wellness.ink}
              />
            </Pressable>
          ))}
        </View>
      )}
      <Field
        label="Παλαιότερες ολοκληρωμένες πρακτικές"
        value={count}
        onChange={setCount}
      />
      <Field label="Τεκμηρίωση επιβεβαίωσης" value={note} onChange={setNote} />
      <Button
        label={`Επιβεβαίωση πορείας ${l.level_id}`}
        disabled={busy || note.trim().length < 2}
        onPress={async () => {
          setBusy(true);
          setError("");
          try {
            await api.put(`/admin/members/${uid}/levels/${l.level_id}`, {
              cohort_id: cohort || null,
              credited_practice_ids: credited,
              enabled,
              target: target ? Number(target) : null,
              historical_completed: Number(count),
              note,
              revision: l.revision,
            });
            await done();
          } catch {
            setError("Δεν αποθηκεύτηκε. Έλεγξε αριθμούς ή ανανέωσε το προφίλ.");
          } finally {
            setBusy(false);
          }
        }}
      />
      {!!error && <Text style={ui.body}>{error}</Text>}
    </View>
  );
}

export function ProfilePage() {
  return (
    <Shell eyebrow="" title="" notifications>
      <MemberProfile />
    </Shell>
  );
}

export function MembersAdmin({
  cohorts,
}: {
  cohorts: { id: string; title: string; level_id: string }[];
}) {
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const state = useLoad<{
    items: {
      id: string;
      name: string;
      email: string;
      membership_status?: string;
      level?: string;
      profile_image?: string;
    }[];
    total: number;
  }>(`/admin/members?offset=${offset}&q=${encodeURIComponent(query)}`, {
    items: [],
    total: 0,
  });
  return (
    <View style={{ gap: 16 }}>
      {selected ? (
        <>
          <Button
            secondary
            label="Πίσω στη λίστα μελών"
            onPress={() => {
              setSelected(null);
              void state.reload();
            }}
          />
          <MemberProfile key={selected} memberId={selected} cohorts={cohorts} />
        </>
      ) : (
        <>
          <Field
            label="Αναζήτηση μέλους"
            value={query}
            onChange={(v) => {
              setQuery(v);
              setOffset(0);
            }}
          />
          <Status state={state} />
          <View style={rosterStyles.collage}>
            {[...state.data.items]
              .sort((a, b) => a.name.localeCompare(b.name, "el"))
              .map((m) => (
                <RosterCard
                  key={m.id}
                  member={m}
                  onPress={() => setSelected(m.id)}
                />
              ))}
          </View>
          <View style={ui.row}>
            <Button
              secondary
              label="Προηγούμενα μέλη"
              disabled={!offset}
              onPress={() => setOffset(Math.max(0, offset - 30))}
            />
            <Button
              secondary
              label="Επόμενα μέλη"
              disabled={offset + 30 >= state.data.total}
              onPress={() => setOffset(offset + 30)}
            />
          </View>
        </>
      )}
    </View>
  );
}

// Admin roster: students as a collage of small cards (avatar circle + name +
// level). Cards are ordered alphabetically; higher level -> slightly larger card.
const LEVEL_SCALE: Record<string, number> = {
  L1: 1,
  L2: 1.14,
  L3A: 1.28,
  L3B: 1.28,
  L4: 1.44,
};

function RosterCard({
  member,
  onPress,
}: {
  member: {
    id: string;
    name: string;
    level?: string;
    profile_image?: string;
  };
  onPress: () => void;
}) {
  const level = member.level || "L1";
  const scale = LEVEL_SCALE[level] ?? 1;
  const avatar = Math.round(52 * scale);
  const width = Math.round(110 * scale);
  const initial = (member.name || "?").trim().charAt(0).toUpperCase();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Προφίλ: ${member.name}`}
      style={({ pressed }) => [
        rosterStyles.card,
        { width, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View
        style={[
          rosterStyles.avatar,
          { width: avatar, height: avatar, borderRadius: avatar / 2 },
        ]}
      >
        {member.profile_image ? (
          <Image
            source={{ uri: member.profile_image }}
            style={{ width: avatar, height: avatar }}
          />
        ) : (
          <Text
            style={[
              rosterStyles.initial,
              { fontSize: Math.round(avatar * 0.42) },
            ]}
          >
            {initial}
          </Text>
        )}
      </View>
      <Text numberOfLines={2} style={[ui.label, rosterStyles.name]}>
        {member.name}
      </Text>
      <View style={rosterStyles.badge}>
        <Text style={rosterStyles.badgeText}>{level}</Text>
      </View>
    </Pressable>
  );
}

const rosterStyles = StyleSheet.create({
  collage: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "flex-start",
  },
  card: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    boxShadow: "0 2px 4px rgba(45,38,66,0.08), 0 14px 26px rgba(45,38,66,0.14)",
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    backgroundColor: wellness.sage,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initial: {
    color: wellness.lavenderInk,
    fontWeight: "700",
  },
  name: {
    fontSize: 13,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  badge: {
    backgroundColor: wellness.lavenderInk,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    color: palette.white,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
