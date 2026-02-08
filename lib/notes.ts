import { logServerError } from "@/lib/logger";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";

export type InterviewNote = {
  id: number;
  title: string;
  digest: string;
  tags: string[];
  content: string;
  createdAt: string;
};

type RawInterviewNote = {
  id: number;
  title: string;
  digest: string;
  tags: string[] | null;
  content: string | null;
  created_at: string;
};

export function normalizeInterviewNote(item: RawInterviewNote): InterviewNote {
  return {
    id: item.id,
    title: item.title,
    digest: item.digest,
    tags: item.tags ?? [],
    content: item.content ?? "",
    createdAt: item.created_at,
  };
}

export async function getPublishedNotes() {
  if (!isSupabaseConfigured) {
    return [] as InterviewNote[];
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("admin_notes")
      .select("id,title,digest,tags,content,created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      logServerError("notes.getPublishedNotes", error);
      return [] as InterviewNote[];
    }

    return (data ?? []).map((item) => normalizeInterviewNote(item as RawInterviewNote));
  } catch (error) {
    logServerError("notes.getPublishedNotes", error);
    return [] as InterviewNote[];
  }
}
