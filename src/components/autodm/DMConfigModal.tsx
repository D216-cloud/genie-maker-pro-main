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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Info, Plus, Hash, Link2 } from "lucide-react";

interface Connection {
  instagram_username?: string | null;
  profile_picture_url?: string | null;
}

interface DMConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    askFollow: boolean;
    followOpeningMessage: string;
    followCheckMessage: string;
    followButtonText: string;
    followRetryAction: string;
    askEmail: boolean;
    dmType: string;
    dmMessage: string;
    dmButtonText: string;
    dmButtonUrl: string;
  }) => void;
  connection?: Connection | null;
}

const DMConfigModal = ({ open, onClose, onSubmit, connection }: DMConfigModalProps) => {
  const [askFollow, setAskFollow] = useState(false);
  const [askEmail, setAskEmail] = useState(false);
  const [followOpeningMessage, setFollowOpeningMessage] = useState(
    "Hey! I'm so glad you're here - thanks a ton for stopping by 😊\n\nTap below and I'll send you the access in just a moment ✨"
  );
  const [followCheckMessage, setFollowCheckMessage] = useState(
    "Oops! Looks like you haven't followed me yet 👀\n\nIt would mean a lot if you could visit my profile and hit that follow button 😊."
  );
  const [followButtonText, setFollowButtonText] = useState("Send me the access");
  const [followRetryAction, setFollowRetryAction] = useState("send_anyway");
  
  const [dmType, setDmType] = useState("text_button");
  const [dmMessage, setDmMessage] = useState(
    "Hi there!\nAppreciate your comment 🙌 As promised, here's the link for you ⬇️"
  );
  const [dmButtonText, setDmButtonText] = useState("");
  const [dmButtonUrl, setDmButtonUrl] = useState("");

  const username = connection?.instagram_username || 'Instagram User';

  const handleSubmit = () => {
    onSubmit({
      askFollow,
      followOpeningMessage: askFollow ? followOpeningMessage : '',
      followCheckMessage: askFollow ? followCheckMessage : '',
      followButtonText: askFollow ? followButtonText : '',
      followRetryAction: askFollow ? followRetryAction : '',
      askEmail,
      dmType,
      dmMessage,
      dmButtonText,
      dmButtonUrl,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-sm sm:text-base">💬</span>
          </div>
          <DialogTitle className="text-base sm:text-lg font-semibold">
            When someone comments on your Post/Reel
          </DialogTitle>
          <VisuallyHidden.Root>
            <DialogDescription>Configure your DM message and options.</DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>

        {/* User Profile */}
        <div className="flex flex-col items-center py-4 animate-scale-in">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-[2px]">
            <Avatar className="w-full h-full">
              <AvatarImage 
                src={connection?.profile_picture_url || undefined} 
                alt={username}
              />
              <AvatarFallback className="bg-card text-xl sm:text-2xl font-bold text-foreground">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <p className="font-semibold text-foreground mt-2 text-sm sm:text-base">{username}</p>
        </div>

        {/* Pre-DM Options */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Before you send your primary DM, send them...</p>
          
          {/* Ask to Follow */}
          <Collapsible open={askFollow} onOpenChange={setAskFollow}>
            <div className="rounded-xl border border-border overflow-hidden">
              <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <span className="text-sm font-medium">a DM asking to follow you</span>
                <div className="flex items-center gap-3">
                  <Switch checked={askFollow} onCheckedChange={setAskFollow} onClick={(e) => e.stopPropagation()} />
                  {askFollow ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                  {/* Opening Message */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-foreground">
                        Opening Message <span className="text-destructive">*</span>
                      </label>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="relative">
                      <Textarea
                        value={followOpeningMessage}
                        onChange={(e) => setFollowOpeningMessage(e.target.value)}
                        placeholder="Enter your opening message..."
                        maxLength={1000}
                        className="min-h-[100px] text-sm resize-none"
                      />
                      <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                        {followOpeningMessage.length}/1000
                      </span>
                    </div>
                    <div className="flex items-center justify-center p-2 bg-muted/50 rounded-lg border border-dashed border-border">
                      <span className="text-sm text-muted-foreground">{followButtonText || 'Send me the access'} ✏️</span>
                    </div>
                  </div>
                  
                  {/* Follow Check Message */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-foreground">
                        Follow Check Message <span className="text-destructive">*</span>
                      </label>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="relative">
                      <Textarea
                        value={followCheckMessage}
                        onChange={(e) => setFollowCheckMessage(e.target.value)}
                        placeholder="Message if user hasn't followed..."
                        maxLength={1000}
                        className="min-h-[80px] text-sm resize-none"
                      />
                      <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                        {followCheckMessage.length}/1000
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 bg-muted/30 p-2 rounded-lg">
                      <div className="flex items-center justify-center p-2 bg-background rounded-lg border border-border">
                        <span className="text-sm text-muted-foreground">Visit Profile ✏️</span>
                      </div>
                      <div className="flex items-center justify-center p-2 bg-background rounded-lg border border-border">
                        <span className="text-sm text-muted-foreground">I'm following ✅ ✏️</span>
                      </div>
                    </div>
                  </div>

                  {/* Retry Action */}
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs font-medium text-foreground">Retry 3 times and if the user still hasn't followed:</p>
                    <RadioGroup value={followRetryAction} onValueChange={setFollowRetryAction} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="send_anyway" id="send_anyway" />
                        <Label htmlFor="send_anyway" className="text-sm">Send them the DM anyway</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dont_send" id="dont_send" />
                        <Label htmlFor="dont_send" className="text-sm text-muted-foreground">Don't send them the DM</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Ask for Email */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border">
            <span className="text-sm font-medium">a DM asking to share their email</span>
            <Switch checked={askEmail} onCheckedChange={setAskEmail} />
          </div>
        </div>

        {/* Primary DM Section */}
        <div className="space-y-4 mt-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Then send the primary DM...</p>
            <p className="text-xs text-muted-foreground">Write the message you want to auto-send with a button that takes them to your link or product.</p>
          </div>

          {/* DM Type Select */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">DM type</label>
            <Select value={dmType} onValueChange={setDmType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select DM type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Only</SelectItem>
                <SelectItem value="text_button">Text + Button</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* DM Content */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">DM content</label>
            <div className="relative">
              <Textarea
                value={dmMessage}
                onChange={(e) => setDmMessage(e.target.value)}
                placeholder="Enter your DM message..."
                maxLength={900}
                className="min-h-[120px] text-sm resize-none"
              />
              <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                {dmMessage.length}/900
              </span>
            </div>
            <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <Hash className="w-3 h-3" />
              Add a variable
            </button>
          </div>

          {/* Button Config */}
          {dmType === "text_button" && (
            <div className="space-y-3 animate-fade-in">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Button text</label>
                <Input
                  value={dmButtonText}
                  onChange={(e) => setDmButtonText(e.target.value)}
                  placeholder="e.g., Get Access Now"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Button URL</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={dmButtonUrl}
                    onChange={(e) => setDmButtonUrl(e.target.value)}
                    placeholder="https://your-link.com"
                    className="pl-10 text-sm"
                  />
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Plus className="w-4 h-4" />
                Add a button
              </button>
            </div>
          )}

          {/* Follow-up Message */}
          <button className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-primary/50 rounded-lg text-sm text-primary hover:bg-primary/5 transition-colors">
            <Plus className="w-4 h-4" />
            Add follow-up message
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <span className="text-xs sm:text-sm text-muted-foreground">Step 3 of 3</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} size="sm" className="active:scale-95">Back</Button>
            <Button onClick={handleSubmit} size="sm" className="active:scale-95">
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DMConfigModal;
