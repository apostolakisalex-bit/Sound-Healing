import React from "react";
import { PublicScreen } from "@/src/components/Experience";
import { Welcome } from "@/src/components/Welcome";

// Resets on each cold start, so the welcome screen greets on app open.
let seenWelcome = false;

export default function Index() {
  const [entered, setEntered] = React.useState(seenWelcome);
  if (!entered) {
    return (
      <Welcome
        onStart={() => {
          seenWelcome = true;
          setEntered(true);
        }}
      />
    );
  }
  return <PublicScreen />;
}
