import { notFound } from "next/navigation";

import { QuestionWorkspace } from "@/components/question-workspace";
import { getChallengeBySlug, handwriteChallenges } from "@/lib/content";

export function generateStaticParams() {
  return handwriteChallenges.map((challenge) => ({ slug: challenge.slug }));
}

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const challenge = getChallengeBySlug(slug);

  if (!challenge) {
    notFound();
  }

  return <QuestionWorkspace challenge={challenge} />;
}
