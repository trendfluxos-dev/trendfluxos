
# Live Studio v2 — Feature-Parity Plan

আপনার দুটি reference project (`liveclassstdio-main` + `ClassFlow Studio`) থেকে যে features শ্রেণিভুক্ত করেছেন, আমাদের existing `EdtechLiveStudio`-এর সাথে gap analysis করলাম। নিচে যা missing/incomplete সেগুলোই ধাপে ধাপে port করব। প্রতিটা ধাপ আলাদা ডেলিভারেবল।

---

## Current state vs. reference (gap)

| Feature | Reference | আমাদের state | Action |
|---|---|---|---|
| Stage vs Live Output separation | ✅ | ✅ আছে | keep |
| Presenter Dock (left rail with materials + web + whiteboard) | ✅ | ⚠ আছে কিন্তু polish কম | redesign |
| Send-to-Live, Hide, Hot-swap | ✅ | ✅ আছে | keep |
| **Student Mirror** (PiP — teacher দেখে student real-time কী দেখছে) | ✅ | ❌ নেই | **port** |
| **Layout Preview dialog** (3-panel student-view সিমুলেশন publish ছাড়াই) | ✅ | ❌ নেই | **port** |
| Whiteboard (tldraw, live snapshot) | ✅ | ✅ আছে | verify realtime sync |
| Web URL preview (iframe) | ✅ | ✅ আছে | keep |
| Materials library + upload + Drive import | ✅ | partial (upload আছে, Drive import নেই) | **port Drive import (optional later)** |
| Teacher AI panel (explain/example/quiz/summary/answer) | ✅ | ✅ আছে কিন্তু simpler | **upgrade modes** |
| Teacher Notes (private, autosave) | ✅ | ✅ আছে | keep |
| Web search shortcut tab | ✅ | ❌ নেই | port (small) |
| Reset share token | ✅ | ❌ নেই | **port** |
| Schedule on Google Calendar dialog | ✅ | partial (admin-side) | port to studio top-bar |
| **PRIVATE STUDIO badge** + lock hints | ✅ | ❌ নেই | port |
| **Onboarding wizard / checklist** (first-class UX) | ✅ | ❌ নেই | **port** |
| Class share via `/class/$token` public viewer | ✅ | ✅ আছে (`/class/by-token/:token`) | verify parity with `live_state` |
| Screen broadcast (WebRTC for window share) | optional | ✅ আছে | keep |
| Recording (browser MediaRecorder + save dialog) | optional | ✅ আছে | keep |

---

## ধাপ ১ — Student Mirror + Layout Preview + Private badge

Studio center stage-এ floating Mirror PiP (minimize/close-যোগ্য) যেখানে teacher দেখবে student বর্তমানে যা দেখছে। উপরে `PRIVATE STUDIO` badge, "Layout Preview" button (3-panel student view সিমুলেশন dialog), এবং `Reset link` button।

**Files**
- `src/components/edtech/StudentMirror.tsx` (new)
- `src/components/edtech/StudentLayoutPreview.tsx` (new — port from reference)
- `src/pages/edtech/EdtechLiveStudio.tsx` (top-bar + stage overlay wiring)

---

## ধাপ ২ — Presenter Dock polish + Web search panel + Onboarding checklist

Left rail-কে রেফারেন্স-এর মতো grouped করব (Materials list with kind icons, Web page card, Whiteboard card, "Send to Live" badges দেখানো)। Right rail-এ Tabs: AI / Notes / Web Search। প্রথমবার studio খুললে collapsible onboarding checklist (5 ধাপ: Add material → Copy link → Schedule → Send to Live → End class) — localStorage-এ persist।

**Files**
- `src/components/edtech/OnboardingChecklist.tsx` (new — port)
- `src/components/edtech/WebSearchPanel.tsx` (new — small)
- `src/components/edtech/StudioAiPanel.tsx` (add 5 modes if missing)
- `src/pages/edtech/EdtechLiveStudio.tsx` (Tabs restructure)

---

## ধাপ ৩ — Schedule on Google Calendar (studio top-bar)

Reference-এর `ScheduleDialog` port করব। আমাদের existing `calendar-sync` edge function বা serverFn-এর সাথে wire করব। Onboarding-এর "scheduled" step এতেই tick হবে।

**Files**
- `src/components/edtech/ScheduleClassDialog.tsx` (new — port)
- `src/pages/edtech/EdtechLiveStudio.tsx` (button in top-bar)

---

## ধাপ ৪ — Verify student viewer parity

`EdtechLiveWatch.tsx` এবং `ClassByToken.tsx` যেন `live_state` subscribe করে stage hot-swap দেখায়, এবং `is_live_visible=false` হলে polished waiting screen দেখায় (reference-এর crossfade animation সহ)। কোনো DB change লাগবে না — শুধু client polish।

**Files**
- `src/pages/edtech/EdtechLiveWatch.tsx`
- `src/pages/edtech/ClassByToken.tsx`

---

## ধাপ ৫ (optional, পরে) — Google Drive import + Admin Live Monitor

Reference-এর `DriveImportDialog` + `drive.functions.ts` port করতে Google OAuth scope-extension লাগবে। Admin Live Monitor `/admin/live-monitor` reuse করে currently-live classes-এর read-only student view দেখাবে। এগুলো আলাদা turn-এ ধরব।

---

## Privacy & DB

- কোনো নতুন table লাগবে না — `live_state`, `teacher_notes`, `class_materials`, `live_classes`, `class_recordings` সব already আছে।
- "Reset link" → `live_classes.share_token` regenerate; existing RLS যথেষ্ট।
- Onboarding/Layout preview/Mirror — পুরোটাই client-side; কিছু broadcast হয় না।
- PRIVATE STUDIO badge হল visual confirmation — গাণিতিকভাবে দেখায় "কেবল আপনার চাপানো content student-এর `live_state` channel-এ যায়; desktop/notes কখনোই নয়।"

---

## প্রথমে কোনটা করব

আপনি OK দিলে **ধাপ ১ → ২ → ৩ → ৪** এই ক্রমে যাব — প্রতি ধাপের পর দেখাবো। Drive import + admin monitor (ধাপ ৫) পরে আলাদা প্রম্পটে। কোনো ধাপ বাদ/পুনঃক্রম চাইলে এখনই বলুন।
