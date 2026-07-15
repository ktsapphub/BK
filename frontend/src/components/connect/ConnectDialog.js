import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ConnectForm from "./ConnectForm";

// Responsive dialog shell for the floating "Let's Connect" button:
//   - very small screens  -> full-screen
//   - mobile              -> bottom sheet
//   - standard desktop    -> centered modal
//   - wide desktop (2xl+) -> right-side drawer
// Traps focus + closes on Escape (Radix built-in), prevents background
// scroll (Radix built-in), warns before discarding entered content, and
// returns focus to the triggering button on close.
export default function ConnectDialog({ open, onOpenChange, settings, projects, initialProjectId, sourcePage, sourceSection, triggerRef }) {
  const isWideDesktop = useMediaQuery("(min-width: 1536px)");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isVerySmall = useMediaQuery("(max-width: 399px)");
  const [dirty, setDirty] = useState(false);
  const [justSucceeded, setJustSucceeded] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const variant = isVerySmall ? "fullscreen" : isWideDesktop ? "drawer" : isDesktop ? "modal" : "sheet";

  useEffect(() => {
    if (!open) {
      setDirty(false);
      setJustSucceeded(false);
    }
  }, [open]);

  const requestClose = () => {
    if (dirty && !justSucceeded) {
      setConfirmDiscardOpen(true);
      return;
    }
    onOpenChange(false);
  };

  const handleOpenChange = (next) => {
    if (!next) requestClose();
    else onOpenChange(true);
  };

  const confirmDiscard = () => {
    setConfirmDiscardOpen(false);
    setDirty(false);
    onOpenChange(false);
  };

  const contentClassByVariant = {
    fullscreen: "inset-0 w-screen h-[100dvh] max-h-[100dvh] rounded-none",
    sheet:
      "inset-x-0 bottom-0 w-full max-h-[92dvh] rounded-t-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300",
    modal:
      "left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl max-h-[88dvh] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200",
    drawer:
      "right-0 top-0 h-full w-full sm:w-[480px] rounded-l-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300",
  };

  return (
    <>
      <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            data-testid="connect-dialog-content"
            onEscapeKeyDown={(e) => {
              e.preventDefault();
              requestClose();
            }}
            onPointerDownOutside={(e) => {
              e.preventDefault();
              requestClose();
            }}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              triggerRef?.current?.focus();
            }}
            className={`fixed z-[70] flex flex-col bg-[var(--background-primary)] text-[var(--text-primary)] shadow-[var(--shadow-float)] border border-[var(--border-primary)] overflow-hidden focus:outline-none ${contentClassByVariant[variant]}`}
          >
            <div className="shrink-0 flex items-start justify-between gap-3 px-6 py-5 border-b border-[var(--border-primary)]">
              <div>
                <DialogPrimitive.Title data-testid="connect-dialog-heading" className="font-display font-bold text-xl">
                  {settings?.connect_dialog_heading || "Let's Connect."}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="font-body text-sm opacity-70 mt-1">
                  {settings?.connect_dialog_copy || "Tell me what brought you here, and I'll follow up to learn more."}
                </DialogPrimitive.Description>
              </div>
              <button
                type="button"
                onClick={requestClose}
                aria-label="Close dialog"
                data-testid="connect-dialog-close-button"
                className="focus-ring shrink-0 h-9 w-9 rounded-full flex items-center justify-center hover:bg-[var(--background-secondary)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <ConnectForm
                settings={settings}
                projects={projects}
                initialProjectId={initialProjectId}
                sourcePage={sourcePage}
                sourceSection={sourceSection}
                sourceChannel="floating_dialog"
                idPrefix="dialog-connect"
                onDirtyChange={setDirty}
                onSuccess={() => {
                  setJustSucceeded(true);
                  setDirty(false);
                }}
              />
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <AlertDialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <AlertDialogContent data-testid="connect-discard-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard your message?</AlertDialogTitle>
            <AlertDialogDescription>You've started filling out this form. If you close now, what you've entered will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="connect-discard-cancel-button">Keep Editing</AlertDialogCancel>
            <AlertDialogAction data-testid="connect-discard-confirm-button" onClick={confirmDiscard}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
