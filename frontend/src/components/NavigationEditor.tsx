import React from "react";
import { Text, View } from "react-native";
import { Button, Field, ui } from "./Wellness";
export type NavigationItem = {
  section: string;
  label: string;
  visible: boolean;
};
const defaults: NavigationItem[] = [
  "services:Εμπειρίες",
  "training:Σχολή",
  "about:Μανώλης",
  "events:Εκδηλώσεις",
  "journal:Άρθρα",
  "contact:Επικοινωνία",
].map((pair) => {
  const [section, label] = pair.split(":");
  return { section, label, visible: true };
});
export function NavigationEditor({
  value,
  onChange,
}: {
  value?: NavigationItem[] | null;
  onChange: (value: NavigationItem[] | null) => void;
}) {
  const items = value ?? defaults;
  function change(index: number, patch: Partial<NavigationItem>) {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }
  function move(index: number, direction: number) {
    const next = [...items];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    onChange(next);
  }
  return (
    <View style={ui.card}>
      <Text style={ui.heading}>Δημόσια πλοήγηση</Text>
      <Text style={ui.body}>
        Άλλαξε ονομασία, σειρά και εμφάνιση στο μενού. Η απόκρυψη δεν
        απενεργοποιεί τη σελίδα. Η σύνδεση και η εγγραφή παραμένουν διαθέσιμες.
      </Text>
      {items.map((item, index) => (
        <View key={item.section} style={ui.card}>
          <Field
            label={"Ονομασία · " + item.section}
            value={item.label}
            onChange={(label) => change(index, { label })}
          />
          <View style={ui.row}>
            <Button
              secondary
              label={
                item.visible ? "Απόκρυψη από το μενού" : "Εμφάνιση στο μενού"
              }
              onPress={() => change(index, { visible: !item.visible })}
            />
            <Button
              secondary
              label={"Πάνω · " + item.label}
              disabled={index === 0}
              onPress={() => move(index, -1)}
            />
            <Button
              secondary
              label={"Κάτω · " + item.label}
              disabled={index === items.length - 1}
              onPress={() => move(index, 1)}
            />
          </View>
        </View>
      ))}
      <Text style={ui.label}>ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΜΕΝΟΥ</Text>
      <Text style={ui.body}>
        {items
          .filter((item) => item.visible)
          .map((item) => item.label)
          .concat(["Σύνδεση", "Εγγραφή"])
          .join(" · ")}
      </Text>
      <Button
        secondary
        label="Επαναφορά αρχικού μενού στο πρόχειρο"
        onPress={() => onChange(null)}
      />
    </View>
  );
}
