import React from "react";
import { Redirect } from "expo-router";

// Legacy academy lesson/XP screen retired — route to the new school catalog.
export default function LegacyLevelRedirect() {
  return <Redirect href="/(tabs)/academy" />;
}
