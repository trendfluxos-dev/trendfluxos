/**
 * Teacher's private notebook.
 *
 * RLS guarantees this is teacher-only — there is no read path for
 * students, anon callers, or other teachers. The row is keyed by
 * (class_id, teacher_id) so two co-hosts can each keep their own pad
 * without overwriting each other.
 *
 * IMPORTANT: do NOT broadcast notes content through any realtime channel
 * or `live_state.payload`. The lock spec forbids it.
 */
import { supabase } from "@/integrations/supabase/client";

export interface TeacherNote {
  id: string;
  class_id: string;
  teacher_id: string;
  content: string;
  updated_at: string;
  created_at: string;
}

export async function fetchTeacherNote(
  classId: string,
  teacherId: string,
): Promise<TeacherNote | null> {
  const { data, error } = await supabase
    .from("teacher_notes")
    .select("*")
    .eq("class_id", classId)
    .eq("teacher_id", teacherId)
    .maybeSingle();
  if (error) throw error;
  return (data as TeacherNote | null) ?? null;
}

export async function saveTeacherNote(
  classId: string,
  teacherId: string,
  content: string,
): Promise<TeacherNote> {
  const { data, error } = await supabase
    .from("teacher_notes")
    .upsert(
      { class_id: classId, teacher_id: teacherId, content },
      { onConflict: "class_id,teacher_id" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as TeacherNote;
}