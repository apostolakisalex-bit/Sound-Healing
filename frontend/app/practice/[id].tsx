import React from "react";
import { Redirect } from "expo-router";

// Legacy practice detail retired — route straight to the new school practice screen.
export default function LegacyPracticeDetailRedirect() {
  return <Redirect href="/(tabs)/practice" />;
}
