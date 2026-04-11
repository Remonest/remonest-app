import { getPublishedLearningModules } from "@/features/learning-module/actions/fetch-learning";
import LearningClient from "./learning-client";

export default async function LearningPage() {
  const modules = await getPublishedLearningModules();

  return <LearningClient initialModules={modules} />;
}
