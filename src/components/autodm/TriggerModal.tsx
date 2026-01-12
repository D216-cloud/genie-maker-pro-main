import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MessageSquare, Send, MessageCircle, Radio, X } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface TriggerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (trigger: string) => void;
}

const triggers = [
  {
    id: "comments",
    icon: MessageSquare,
    label: "Comments on your Post or Reel",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "dms",
    icon: Send,
    label: "Sends you a DM",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "stories",
    icon: MessageCircle,
    label: "Replies to your Story",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "live",
    icon: Radio,
    label: "Comments on your Live",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
];

const TriggerModal = ({ open, onClose, onSelect }: TriggerModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-semibold">
            Trigger AutoDM when someone...
          </DialogTitle>
          <VisuallyHidden.Root>
            <DialogDescription>Select a trigger for your AutoDM automation.</DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {triggers.map((trigger, index) => (
            <button
              key={trigger.id}
              onClick={() => onSelect(trigger.id)}
              className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 active:scale-[0.98] transition-all text-left animate-slide-in-up touch-manipulation"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${trigger.bgColor} flex items-center justify-center flex-shrink-0`}>
                <trigger.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${trigger.color}`} />
              </div>
              <span className="font-medium text-foreground text-sm sm:text-base">{trigger.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TriggerModal;
