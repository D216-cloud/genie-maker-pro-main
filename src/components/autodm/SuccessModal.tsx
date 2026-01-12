import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
interface SuccessModalProps {
  open: boolean;
  onContinue: () => void;
}

const SuccessModal = ({ open, onContinue }: SuccessModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onContinue}>
      <DialogContent className="sm:max-w-md text-center">
        <VisuallyHidden.Root>
          <DialogTitle>Account Reconnected</DialogTitle>
          <DialogDescription>Your Instagram account has been successfully reconnected.</DialogDescription>
        </VisuallyHidden.Root>
        {/* Gradient Background */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan-200 via-green-100 to-transparent rounded-t-lg" />
        
        <div className="relative pt-8">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto bg-reely-green rounded-full flex items-center justify-center mb-6 shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
          </div>

          <h2 className="text-xl font-bold text-foreground mb-6">
            Account reconnected successfully!
          </h2>

          {/* User Info */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-0.5">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">deepak_maheta_01</p>
                <p className="text-sm text-muted-foreground">0 Automations</p>
              </div>
            </div>
            <div className="w-6 h-6 bg-reely-green rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-xs">✓</span>
            </div>
          </div>

          <Button onClick={onContinue} variant="outline" size="lg" className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
