import { useTRPC } from "@/router";
import {
  feedbackTypeOptions,
  isFeedbackType,
  type FeedbackType,
} from "@repo/feedback";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useMutation } from "@tanstack/react-query";
import { MessageSquareText, Send } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

export function FeedbackButton() {
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("feedback");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const trimmedMessage = useMemo(() => message.trim(), [message]);

  const mutation = useMutation(
    trpc.sendFeedback.mutationOptions({
      onSuccess: () => {
        toast.success("Sent to support.");
        setOpen(false);
        setType("feedback");
        setEmail("");
        setMessage("");
      },
      onError: error => {
        toast.error(error.message || "Failed to send. Please try again.");
      },
    }),
  );

  const canSubmit = trimmedMessage.length >= 10 && !mutation.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    mutation.mutate({
      type,
      email,
      message: trimmedMessage,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DialogTrigger
              render={
                <Button
                  aria-label="Send feedback or report a bug"
                  size="icon-lg"
                  className="fixed right-4 bottom-4 z-40 size-12 rounded-full shadow-lg md:right-6 md:bottom-6"
                />
              }
            >
              <MessageSquareText className="size-5" />
            </DialogTrigger>
          }
        />
        <TooltipContent side="left">Send feedback</TooltipContent>
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>
            Share an idea, issue, or anything that is not working as expected.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label id="feedback-type-label">Type</Label>

            <Select
              aria-labelledby="feedback-type-label"
              value={type}
              onValueChange={value => {
                if (isFeedbackType(value)) setType(value);
              }}
            >
              <SelectTrigger
                nativeButton={false}
                className="w-full cursor-pointer"
                render={
                  <span>
                    {
                      feedbackTypeOptions.find(option => option.value === type)
                        ?.label
                    }
                  </span>
                }
              />

              <SelectContent
                alignItemWithTrigger={false}
                align="center"
                side="bottom"
              >
                {feedbackTypeOptions.map(option => (
                  <SelectItem
                    className="cursor-pointer"
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="feedback-email">Email</Label>
            <Input
              id="feedback-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="feedback-message">Message</Label>
            <Textarea
              id="feedback-message"
              required
              minLength={10}
              maxLength={5000}
              placeholder="What should we know?"
              className="min-h-36 resize-y"
              value={message}
              onChange={event => setMessage(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit}>
              <Send />
              {mutation.isPending ? "Sending" : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
