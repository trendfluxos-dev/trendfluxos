import { supabase } from "@/integrations/supabase/client";

export type RecordingVisibility = "private" | "attendees" | "public";

export type ClassRecording = {
  id: string;
  class_id: string | null;
  teacher_id: string;
  title: string;
  description: string | null;
  storage_path: string;
  mime_type: string;
  duration_sec: number | null;
  size_bytes: number | null;
  visibility: RecordingVisibility;
  public_token: string | null;
  attached_module_id: string | null;
  attached_lesson_index: number | null;
  recorded_at: string;
  created_at: string;
};

export type SaveRecordingInput = {
  classId: string | null;
  teacherId: string;
  title: string;
  description?: string;
  visibility: RecordingVisibility;
  attachedModuleId?: string | null;
  attachedLessonIndex?: number | null;
  blob: Blob;
  mimeType: string;
  durationSec?: number;
  onProgress?: (pct: number) => void;
};

export async function uploadAndSaveRecording(
  input: SaveRecordingInput,
): Promise<ClassRecording> {
  const ext = input.mimeType.includes("mp4") ? "mp4" : "webm";
  const stamp = Date.now();
  const path = `${input.teacherId}/${input.classId ?? "standalone"}/${stamp}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("class-recordings")
    .upload(path, input.blob, {
      contentType: input.mimeType,
      upsert: false,
    });
  if (upErr) throw upErr;

  input.onProgress?.(100);

  const { data, error } = await supabase
    .from("class_recordings")
    .insert({
      class_id: input.classId,
      teacher_id: input.teacherId,
      title: input.title,
      description: input.description ?? null,
      storage_path: path,
      mime_type: input.mimeType,
      duration_sec: input.durationSec ?? null,
      size_bytes: input.blob.size,
      visibility: input.visibility,
      attached_module_id: input.attachedModuleId ?? null,
      attached_lesson_index: input.attachedLessonIndex ?? null,
    })
    .select("*")
    .single();

  if (error) {
    // Try to clean up the orphan file.
    await supabase.storage.from("class-recordings").remove([path]).catch(() => {});
    throw error;
  }
  return data as ClassRecording;
}

export async function publishRecordingPublic(id: string): Promise<string> {
  const { data, error } = await supabase.rpc("publish_recording_public", { _id: id });
  if (error) throw error;
  return data as string;
}

export async function unpublishRecordingPublic(id: string): Promise<void> {
  const { error } = await supabase.rpc("unpublish_recording_public", { _id: id });
  if (error) throw error;
}

export async function getRecordingUrlByToken(token: string) {
  const { data, error } = await supabase.functions.invoke("get-class-recording-url", {
    body: { token },
  });
  if (error) throw error;
  return data as { url: string; mime_type: string; title: string; duration_sec: number | null };
}

export async function getRecordingUrl(recordingId: string) {
  const { data, error } = await supabase.functions.invoke("get-class-recording-url", {
    body: { recording_id: recordingId },
  });
  if (error) throw error;
  return data as { url: string; mime_type: string; title: string; duration_sec: number | null };
}

export async function listMyRecordings(): Promise<ClassRecording[]> {
  const { data, error } = await supabase
    .from("class_recordings")
    .select("*")
    .order("recorded_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClassRecording[];
}

export async function listClassRecordings(classId: string): Promise<ClassRecording[]> {
  const { data, error } = await supabase
    .from("class_recordings")
    .select("*")
    .eq("class_id", classId)
    .order("recorded_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClassRecording[];
}

export async function listRecordingsForAttendee(): Promise<ClassRecording[]> {
  // RLS only returns rows the user is entitled to (attendee policy).
  const { data, error } = await supabase
    .from("class_recordings")
    .select("*")
    .order("recorded_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClassRecording[];
}

export async function updateRecording(
  id: string,
  patch: Partial<Pick<ClassRecording, "title" | "description" | "visibility" | "attached_module_id" | "attached_lesson_index">>,
): Promise<void> {
  const { error } = await supabase.from("class_recordings").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteRecording(rec: ClassRecording): Promise<void> {
  await supabase.storage.from("class-recordings").remove([rec.storage_path]).catch(() => {});
  const { error } = await supabase.from("class_recordings").delete().eq("id", rec.id);
  if (error) throw error;
}