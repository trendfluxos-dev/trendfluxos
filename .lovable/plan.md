## Goal

Bring the two reference apps' best features into TrendFlux EdTech, but **rebuilt on our stack** (Lovable AI Gateway + Supabase, not Firebase / ElevenLabs / Gmail OAuth). Drop the parts that don't fit (Firebase auth, Make.com pane, Gmail studio, SaaS blueprint marketing page).

Homepage `/` is already loading correctly (verified: 200, no errors). No fix needed there.

## What goes in

### A. Class Voice Extractor → `/edtech/voice-notes`
From `class-voice-extractor.zip` (Recorder, LectureList, AudioPlayer, StudyHub).

- **Recorder** with 3 tabs: Mic record (WAV via Web Audio, not MediaRecorder webm — per our STT knowledge), Audio upload, Synthesize-from-topic.
- **Transcription** via edge function `transcribe-lecture` → `openai/gpt-4o-mini-transcribe`.
- **Study sheet generation** via edge function `extract-study-sheet` → `google/gemini-3-flash-preview` with structured output (summary, key concepts, flashcards, quiz).
- **Lecture list** with status (uploading → transcribing → ready) and per-lecture detail view with audio player + tabbed study materials.
- All persisted in new `voice_lectures` + `voice_lecture_materials` tables (RLS scoped to `auth.uid()`).

### B. Voice Cloner / AI Voice Sandbox → `/edtech/teach/voice-studio` (teachers only)
From `voice-ai-integration-studio.zip` (VoiceCloner, LovableSandbox).

- **Voice Profile manager**: upload 1–5 min reference sample, name + gender + stability/similarity sliders, "train" progress UI.
- **TTS preview**: type Bangla/English text → synthesize via Gemini TTS (`google/gemini-3-flash-tts` if available, otherwise document a stub clearly). NO ElevenLabs (we don't have that key, and we'd need user consent + secret).
- **Voice profiles** stored in `voice_profiles` table; sample audio in Supabase Storage bucket `voice-samples` (private, owner-only).
- Surface "speak this" buttons inside the AI Studio panel so teachers can preview AI explanations in their cloned voice during prep.

### C. Skipped / explicitly out of scope
- Firebase auth (we use Supabase).
- ElevenLabs direct calls (no key, would need user-provided secret + consent flow — propose later).
- Gmail Studio / Make.com / SaaS Blueprint pages — unrelated to EdTech.
- Real-time voice cloning during live class (deferred to Phase 6).

## Architecture

```text
Client (React)
  ├─ /edtech/voice-notes          (student + teacher)
  │   ├─ Recorder.tsx (WAV via Web Audio)
  │   ├─ LectureList.tsx
  │   └─ LectureDetail.tsx (AudioPlayer + StudyHub tabs)
  │
  └─ /edtech/teach/voice-studio   (teacher/admin only)
      ├─ VoiceProfileList.tsx
      ├─ VoiceCloner.tsx (upload → train → save profile)
      └─ TtsPreview.tsx

Supabase
  ├─ tables: voice_lectures, voice_lecture_materials, voice_profiles
  ├─ bucket: voice-samples (private)
  └─ edge functions:
      ├─ transcribe-lecture   (multipart audio → STT → returns transcript)
      ├─ extract-study-sheet  (transcript → Gemini structured JSON)
      └─ synthesize-voice     (text + profile → audio URL; stub if TTS model unavailable)
```

## Implementation order

1. **DB migration** — `voice_lectures`, `voice_lecture_materials`, `voice_profiles` with GRANTs + RLS (owner-only) + `voice-samples` private bucket.
2. **Edge functions**:
   - `transcribe-lecture` — multipart upload → `openai/gpt-4o-mini-transcribe`, streamed SSE back.
   - `extract-study-sheet` — Gemini with `Output.object` schema (summary, concepts[], flashcards[], quiz[]).
   - `synthesize-voice` — text → audio (Gemini TTS) returning signed URL.
3. **`/edtech/voice-notes` page** — Recorder + list + detail, hooked to functions.
4. **`/edtech/teach/voice-studio`** — gated by `RequireRole admin|teacher`.
5. **Nav wiring** in `EdtechShell` (Voice notes for everyone, Voice studio under teach).
6. **Smoke test** — Playwright run across all new routes for 200 + zero errors.

## Adapted from reference, not copied

- Recorder: rewrite to use Web Audio → WAV (per our `ai-speech-to-text` rules), not `MediaRecorder` webm.
- Voice profiles: drop ElevenLabs voice IDs; persist our own profile shape.
- Strip Tailwind class collisions (the references hardcode `bg-slate-900`, `text-amber-500`, etc.) — re-skin with our semantic tokens (`bg-card`, `text-primary`, `border-border`).
- Strip Firebase imports entirely.

## Technical notes (devs only)

- WAV-only uploads (16 kHz mono) to avoid Safari mp4 / OGG-Opus rejects.
- Block uploads > 25 MiB on the client; chunk longer lectures.
- All AI calls server-side; `LOVABLE_API_KEY` stays in edge functions.
- Reuse existing `StudioAiPanel`'s pattern (presets + textarea) for the TTS preview.

## Deliverable

A working Voice Notes page that any signed-in student can use to record/upload a class and get an AI study sheet, plus a teacher-only Voice Studio for managing personal voice profiles and previewing TTS. Roughly 8–10 new files + 1 migration + 3 edge functions. No homepage changes.
