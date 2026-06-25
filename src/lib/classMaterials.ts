/**
 * CRUD helpers for `class_materials`.
 *
 * Storage layout (private bucket `class-materials`):
 *   <teacher_id>/<class_id>/<uuid>-<filename>
 *
 * Files themselves are reached through the existing `get-signed-url`
 * edge function — never via raw public URLs.
 */
import { supabase } from "@/integrations/supabase/client";

export type MaterialKind =
  | "pdf"
  | "image"
  | "video"
  | "doc"
  | "slide"
  | "link"
  | "audio";

export interface ClassMaterial {
  id: string;
  class_id: string;
  teacher_id: string;
  kind: MaterialKind;
  title: string;
  storage_path: string | null;
  external_url: string | null;
  mime: string | null;
  size_bytes: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const BUCKET = "class-materials";

export async function listMaterials(classId: string): Promise<ClassMaterial[]> {
  const { data, error } = await supabase
    .from("class_materials")
    .select("*")
    .eq("class_id", classId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ClassMaterial[];
}

export async function addLinkMaterial(input: {
  classId: string;
  teacherId: string;
  title: string;
  url: string;
}): Promise<ClassMaterial> {
  const { data, error } = await supabase
    .from("class_materials")
    .insert({
      class_id: input.classId,
      teacher_id: input.teacherId,
      kind: "link",
      title: input.title,
      external_url: input.url,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ClassMaterial;
}

/** Upload a file to the private bucket and persist a material row. */
export async function uploadMaterial(input: {
  classId: string;
  teacherId: string;
  file: File;
  kind: MaterialKind;
  title?: string;
}): Promise<ClassMaterial> {
  const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const path = `${input.teacherId}/${input.classId}/${crypto.randomUUID()}-${safeName}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, input.file, { upsert: false, contentType: input.file.type });
  if (upErr) throw upErr;

  const { data, error } = await supabase
    .from("class_materials")
    .insert({
      class_id: input.classId,
      teacher_id: input.teacherId,
      kind: input.kind,
      title: input.title ?? input.file.name,
      storage_path: path,
      mime: input.file.type || null,
      size_bytes: input.file.size,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ClassMaterial;
}

export async function deleteMaterial(material: ClassMaterial): Promise<void> {
  if (material.storage_path) {
    await supabase.storage.from(BUCKET).remove([material.storage_path]);
  }
  const { error } = await supabase
    .from("class_materials")
    .delete()
    .eq("id", material.id);
  if (error) throw error;
}