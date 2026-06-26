## লক্ষ্য

Live class হবে কোর্স থেকে আলাদা একটা system। class চলাকালীন teacher চাইলে browser-এই recording করতে পারবেন। class শেষ হলে recording + materials student-দের কাছে auto পৌঁছাবে (in-app + email), teacher চাইলে public link দিয়েও share করতে পারবেন, এবং recording-টিকে কোনো module-এর lesson হিসেবে attach করতে পারবেন।

## যা তৈরি হবে

### 1. Database (এক migration-এ)
- `class_recordings` টেবিল — class_id, teacher_id, storage_path, mime_type, duration_sec, size_bytes, title, description, public_token (nullable, share করলে set হয়), is_public, attached_module_id, attached_lesson_id, recorded_at
- নতুন private storage bucket `class-recordings`
- RLS:
  - Teacher/admin: own recordings-এ full access
  - Student: শুধু সেই class-এর recording যেখানে তিনি RSVP/join করেছিলেন
  - Public: শুধু RPC `get_recording_by_token(token)` দিয়ে — token থাকলে যেকেউ দেখতে পাবেন
- RPC: `publish_recording_public(id)` → token generate করে, `unpublish_recording_public(id)` → token সরায়

### 2. Studio-তে Recording UI (`EdtechLiveStudio.tsx`)
- নতুন **Record** button top bar-এ (Share window-এর পাশে)
- Record শুরু হলে: shared window stream + mic mix → `MediaRecorder` (webm/vp9+opus)
- Recording indicator + timer
- Stop / class end হলে → **Save Recording** dialog
  - Title (default: class title + date), description
  - Visibility: Private (teacher only) / Students who joined / Public link
  - Attach to module: dropdown — None / existing module → lesson
  - Save চাপলে: webm blob → `class-recordings` bucket-এ upload, row insert, প্রয়োজনে token generate ও lesson-এ attach

### 3. Student delivery
- নতুন page `/edtech/my-classes` — তাঁর RSVP করা সব class + recording + materials list
- Class card click-এ recording player + materials list ("Save to my library" button — student-side download)
- Email: `class-recording-ready` template — RSVP-করা student-দের কাছে recording link সহ যাবে (email infra আগে scaffold করা না থাকলে আমি setup করবো)

### 4. Public share page
- নতুন route `/class-recording/:token`
- কোনো auth লাগবে না — RPC দিয়ে recording fetch করে signed video URL দেখাবে

### 5. Module library integration
- Save dialog থেকে recording module/lesson-এ attach করলে existing `course_modules` / lesson player সেটাকে video lesson হিসেবে দেখাবে
- Admin চাইলে পরে `/edtech/admin/recordings`-এ গিয়ে recordings library থেকে module-এ move/attach করতে পারবেন

## টেকনিক্যাল ডিটেইল

- **Recorder source**: studio-র Share-window MediaStream-এর video track + `getUserMedia({audio:true})`-এর audio track মিশিয়ে একটি `MediaStream` → `MediaRecorder({mimeType:'video/webm;codecs=vp9,opus'})`। share বন্ধ থাকলে record disabled।
- **Browser fallback**: MediaRecorder unsupported হলে clear notice + "Use external screen recorder, then upload manually" CTA।
- **Upload**: chunked না — `recorder.ondataavailable` থেকে blobs জমিয়ে stop-এ single `.webm` upload (Supabase storage 5 GB/file)। বড় হলে warning দেখাবো।
- **Public token**: 32-char `gen_random_uuid` base32; revoke করলে instantly invalid।
- **Email**: যদি email infrastructure এখনো scaffold করা না থাকে, আমি `setup_email_infra` + `scaffold_transactional_email` চালাবো; domain না থাকলে আগে domain setup dialog দেখাবো।

## ধাপ
1. DB migration + storage bucket + RLS + RPCs
2. Recorder + Save dialog UI (studio)
3. `EdtechMyClasses` page + route
4. Public `/class-recording/:token` page + route
5. Email setup check → template + send hook
6. Admin recordings library page
7. Smoke test: record → save → student dashboard → public link → email
