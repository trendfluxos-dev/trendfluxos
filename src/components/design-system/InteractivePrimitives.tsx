import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TfxCard, TfxEyebrow, TfxHeading, TfxSection } from "@/components/design-system";

/**
 * Interactive Radix primitives rendered inside the design-system page so
 * Playwright keyboard tests have deterministic targets for:
 *   - focus trapping (Dialog, Popover, DropdownMenu)
 *   - Escape-to-close behaviour
 *   - initial focus, roving focus, and return-focus semantics
 *
 * Every trigger is tagged with `data-testid` so tests never depend on
 * unrelated layout changes on the page.
 */
export function InteractivePrimitives() {
  return (
    <TfxSection tone="default" padding="md" divide id="interactive-primitives">
      <TfxEyebrow>08 · Interactive primitives</TfxEyebrow>
      <TfxHeading level={2} className="mt-2">
        Dialog · Popover · Dropdown
      </TfxHeading>
      <p className="mt-1 text-sm text-muted-foreground">
        Keyboard-driven wrappers around Radix primitives. Each shows the
        expected focus-trap / escape-to-close contract our design system
        promises.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <TfxCard>
          <p className="font-mono text-[11px] text-muted-foreground">Dialog</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-3" data-testid="ds-dialog-trigger">
                Open dialog
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="ds-dialog-content">
              <DialogHeader>
                <DialogTitle>Focus-trap demo</DialogTitle>
                <DialogDescription>
                  Tab cycles inside this dialog. Escape closes it and returns
                  focus to the trigger button.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Button variant="outline" data-testid="ds-dialog-item-1">
                  First action
                </Button>
                <Button variant="outline" data-testid="ds-dialog-item-2">
                  Second action
                </Button>
              </div>
              <DialogFooter>
                <Button data-testid="ds-dialog-item-3">Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TfxCard>

        <TfxCard>
          <p className="font-mono text-[11px] text-muted-foreground">Popover</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button className="mt-3" variant="outline" data-testid="ds-popover-trigger">
                Open popover
              </Button>
            </PopoverTrigger>
            <PopoverContent data-testid="ds-popover-content">
              <div className="grid gap-2">
                <p className="text-sm">Focus lands inside on open.</p>
                <Button size="sm" data-testid="ds-popover-item-1">
                  Popover action
                </Button>
                <Button size="sm" variant="ghost" data-testid="ds-popover-item-2">
                  Secondary
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </TfxCard>

        <TfxCard>
          <p className="font-mono text-[11px] text-muted-foreground">DropdownMenu</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="mt-3" variant="outline" data-testid="ds-dropdown-trigger">
                Open menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent data-testid="ds-dropdown-content">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem data-testid="ds-dropdown-item-1">Item one</DropdownMenuItem>
              <DropdownMenuItem data-testid="ds-dropdown-item-2">Item two</DropdownMenuItem>
              <DropdownMenuItem data-testid="ds-dropdown-item-3">Item three</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TfxCard>
      </div>
    </TfxSection>
  );
}

export default InteractivePrimitives;