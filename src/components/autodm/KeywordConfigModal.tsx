import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Plus, Info } from "lucide-react";

interface KeywordConfigModalProps {
  open: boolean;
  onClose: () => void;
  onNext: (data: {
    keywords: string[];
    autoReply: boolean;
    commentResponses: string[];
    commentType: 'specific' | 'any';
  }) => void;
}

const KeywordConfigModal = ({ open, onClose, onNext }: KeywordConfigModalProps) => {
  const [commentType, setCommentType] = useState<"specific" | "any">("specific");
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [autoReply, setAutoReply] = useState(false);
  const [commentResponses, setCommentResponses] = useState([
    "Thanks! Please see DMs.",
    "Sent you a message! Check it out!",
    "Nice! Check your DMs!"
  ]);

  const handleAddKeyword = () => {
    if (keyword.trim() && keyword.length >= 2) {
      setKeywords([...keywords, keyword.trim()]);
      setKeyword("");
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleResponseChange = (index: number, value: string) => {
    const newResponses = [...commentResponses];
    newResponses[index] = value;
    setCommentResponses(newResponses);
  };

  const handleNext = () => {
    onNext({
      keywords: commentType === 'any' ? [] : keywords,
      autoReply,
      commentResponses: autoReply ? commentResponses : [],
      commentType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-sm sm:text-base">⚙️</span>
          </div>
          <DialogTitle className="text-base sm:text-lg font-semibold">
            Configure your AutoDM
          </DialogTitle>
          <VisuallyHidden.Root>
            <DialogDescription>Set up keywords and auto-reply options for your automation.</DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>

        {/* Comment Type */}
        <div className="space-y-3 animate-slide-in-up">
          <p className="text-xs sm:text-sm font-medium text-foreground">
            What triggers this automation?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCommentType("specific")}
              className={cn(
                "flex-1 px-3 py-2.5 sm:py-3 rounded-lg border text-xs sm:text-sm font-medium transition-all active:scale-95 touch-manipulation",
                commentType === "specific"
                  ? "bg-background border-border"
                  : "bg-background border-border hover:border-primary"
              )}
            >
              Specific keyword
            </button>
            <button
              onClick={() => setCommentType("any")}
              className={cn(
                "flex-1 px-3 py-2.5 sm:py-3 rounded-lg border text-xs sm:text-sm font-medium transition-all active:scale-95 touch-manipulation",
                commentType === "any"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary"
              )}
            >
              Any comment
            </button>
          </div>
        </div>

        {/* Keywords Section */}
        {commentType === "specific" && (
          <div className="space-y-3 mt-4 animate-fade-in">
            <p className="text-xs sm:text-sm font-medium text-foreground">Keywords:</p>
            
            <div className="flex gap-2">
              <Input
                placeholder="Type keyword..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                className="flex-1 text-sm"
              />
              <Button variant="outline" onClick={handleAddKeyword} size="sm" className="active:scale-95">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm animate-scale-in"
                  >
                    {kw}
                    <button onClick={() => handleRemoveKeyword(index)} className="hover:text-destructive ml-1">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Auto-Reply Toggle */}
        <div className="mt-6 p-4 bg-muted/50 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Auto-Reply to comments on the post</span>
            <Switch checked={autoReply} onCheckedChange={setAutoReply} />
          </div>
          
          {autoReply && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Write 3 replies which will be sent in a random order so that your replies don't look like a bot. Automating comment replies comes with risk - Stay informed.</p>
              </div>
              
              {commentResponses.map((response, index) => (
                <div key={index} className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Comment response {index + 1} <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      value={response}
                      onChange={(e) => handleResponseChange(index, e.target.value)}
                      placeholder={`Enter response ${index + 1}...`}
                      maxLength={140}
                      className="pr-16 text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {response.length}/140
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <span className="text-xs sm:text-sm text-muted-foreground">Step 2 of 3</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} size="sm" className="active:scale-95">Back</Button>
            <Button onClick={handleNext} size="sm" className="active:scale-95">
              Next
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeywordConfigModal;
