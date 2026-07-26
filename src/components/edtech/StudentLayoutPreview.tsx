import { GraduationCap, MonitorPlay, MessageCircle, Video, Send, Lock, ExternalLink } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  isLive: boolean;
  hasPublishedContent: boolean;
  hasMeetLink: boolean;
  studentUrl: string;
};

/**
 * 3-panel preview of the student class viewer.
 * Pure presentational — no live data is fetched here.
 */
export function StudentLayoutPreview({
  open,
  onOpenChange,
  title,
  isLive,
  hasPublishedContent,
  hasMeetLink,
  studentUrl,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MonitorPlay className="h-5 w-5 text-primary" />
            Student View — Layout Preview
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold",
              isLive ? "bg-rose-500 text-white" : "bg-muted text-foreground/70",
            ].join(" ")}
          >
            {isLive ? "● LIVE" : "Class শুরু হয়নি"}
          </span>
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-semibold",
              hasPublishedContent
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border bg-background text-foreground/65",
            ].join(" ")}
          >
            {hasPublishedContent ? "Content publish হয়েছে" : "কিছু publish হয়নি"}
          </span>
          <span className="text-muted-foreground">
            — এই দুটোই ✅ হলে students live content দেখবে
          </span>
          {studentUrl && (
            <a
              href={studentUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-foreground/70 hover:bg-accent"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open real student view
            </a>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-background shadow">
          <div className="flex h-12 items-center justify-between border-b border-border bg-card px-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <div className="line-clamp-1 max-w-[260px] text-xs font-semibold">
                  {title || "Class title"}
                </div>
                <div className="text-[10px] text-muted-foreground">Joined as student-name</div>
              </div>
              {isLive ? (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  ● LIVE
                </span>
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground/70">
                  Waiting…
                </span>
              )}
            </div>
            {isLive && hasMeetLink && (
              <span className="inline-flex h-7 items-center gap-1 rounded-full bg-primary px-3 text-[11px] font-semibold text-primary-foreground">
                <Video className="h-3 w-3" />
                Join video
              </span>
            )}
          </div>

          <div className="grid h-[440px] grid-cols-12">
            <div className="col-span-9 flex flex-col bg-muted/30">
              <div className="flex items-center gap-1.5 border-b border-border bg-card/60 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur">
                <MonitorPlay className="h-3.5 w-3.5" />
                Live Output
              </div>
              <div className="flex flex-1 items-center justify-center p-4">
                {isLive && hasPublishedContent ? (
                  <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-primary/40 bg-card/50 text-center">
                    <div>
                      <MonitorPlay className="mx-auto mb-2 h-10 w-10 text-primary" />
                      <p className="text-sm font-semibold">
                        এখানে আপনার publish-করা content দেখাবে
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        PDF · Image · Video · Web · Whiteboard
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    {isLive ? (
                      <MonitorPlay className="mx-auto mb-2 h-10 w-10 opacity-50" />
                    ) : (
                      <Lock className="mx-auto mb-2 h-10 w-10 opacity-50" />
                    )}
                    <p className="text-sm font-medium">
                      {isLive ? "শিক্ষক কিছু publish করেননি…" : "ক্লাস শুরু হয়নি"}
                    </p>
                    <p className="text-xs">শিক্ষক "Send to Live" চাপলেই content এখানে দেখাবে।</p>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-3 flex flex-col border-l border-border bg-card">
              <div className="flex items-center gap-1.5 border-b border-border px-3 py-2 text-xs font-semibold">
                <MessageCircle className="h-3.5 w-3.5" />
                Class chat
              </div>
              <div className="flex-1 space-y-1.5 overflow-hidden p-2 text-[11px]">
                <div className="rounded-md border border-primary/30 bg-primary/5 p-1.5">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    You · Teacher
                  </div>
                  <div>স্বাগতম! শুরু করছি একটু পরেই।</div>
                </div>
                <div className="rounded-md bg-muted p-1.5">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Rahim
                  </div>
                  <div>স্যার, শোনা যাচ্ছে।</div>
                </div>
                <div className="rounded-md bg-muted p-1.5">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Karim
                  </div>
                  <div>👋</div>
                </div>
              </div>
              <div className="flex gap-1 border-t border-border p-1.5">
                <div className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-[11px] leading-7 text-muted-foreground">
                  Message…
                </div>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Send className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• বাম প্যানেল (৭৫%) — Live Output, এখানে material / web / whiteboard দেখাবে।</li>
          <li>• ডান প্যানেল (২৫%) — Real-time class chat।</li>
          <li>• উপরে header — class title, LIVE badge, video call button।</li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}