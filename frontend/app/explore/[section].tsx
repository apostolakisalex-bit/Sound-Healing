export { default } from "@/src/components/PublicExperience";
export function generateStaticParams() {
  return ["services", "training", "about", "events", "journal", "contact"].map(
    (section) => ({ section }),
  );
}
