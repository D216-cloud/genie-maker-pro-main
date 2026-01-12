import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import badgeLogo from "@/assets/logos/reelychat-mascot-badge.svg";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const signUpSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type Step = "name" | "email";

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const [step, setStep] = useState<Step>("name");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleNext = async () => {
    if (step === "name") {
      if (formData.fullName.trim().length < 2) {
        toast.error("Please enter your full name");
        return;
      }
      setStep("email");
    } else if (step === "email") {
      try {
        signUpSchema.parse(formData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast.error(error.errors[0].message);
          return;
        }
      }

      setLoading(true);
      
      const { data, error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: "",
      });

      setLoading(false);

      if (error) {
        if (error.message && error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in.");
        } else {
          const msg = error?.message || String(error);
          toast.error(msg || "Failed to create account");
        }
        return;
      }

      // If signUp returns a session, user is signed in immediately
      if (data?.session) {
        toast.success("Account created! Welcome to ReelyChat!");
        navigate("/dashboard");
        return;
      }

      // Try to sign in automatically (this helps when email confirmations are not required in Supabase)
      setLoading(true);
      const { data: signInData, error: signInError } = await signIn(formData.email, formData.password);
      setLoading(false);

      if (!signInError && signInData?.session) {
        toast.success("Account created and signed in! Welcome to ReelyChat!");
        navigate('/dashboard');
        return;
      }

      // If auto sign-in failed, fall back to email confirmation flow
      toast.success("Account created! Check your inbox to confirm your email.");
      navigate('/signin');
    }
  };

  const handleBack = () => {
    if (step === "email") setStep("name");
  };

  const testimonials = [
    {
      quote: "Building my paid community with ReelyChat was seamless. My audience loves it!",
      author: "Stephanie Gardner",
      role: "Social Media Marketing",
    },
  ];

  const featuredIn = ["Forbes", "ThePrint", "YourStory", "Entrepreneur"];

  const getStepTitle = () => {
    switch (step) {
      case "name": return "What's your name?";
      case "email": return "Enter your email & password";
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case "name": return "Let's start with your name";
      case "email": return "You'll use this to sign in";
    }
  };

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      {/* Left side - Testimonial - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 p-8 xl:p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/80 via-blue-300/80 to-blue-400/80" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <img src={badgeLogo} alt="ReelyChat" className="w-12 h-12" />
          </Link>
        </div>"

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="max-w-md">
            <div className="relative">
              <div className="absolute -top-2 -left-2 w-full h-full bg-card/40 rounded-2xl xl:rounded-3xl transform rotate-2" />
              <div className="absolute -top-1 -left-1 w-full h-full bg-card/60 rounded-2xl xl:rounded-3xl transform rotate-1" />
              <div className="relative bg-card rounded-2xl xl:rounded-3xl p-6 xl:p-8 shadow-elevated">
                <p className="text-lg xl:text-xl font-medium text-foreground leading-relaxed mb-6 xl:mb-8">
                  {testimonials[0].quote}
                </p>
                <div className="flex items-center gap-3 xl:gap-4">
                  <div className="w-10 h-10 xl:w-12 xl:h-12 bg-muted rounded-full flex items-center justify-center text-xl xl:text-2xl">
                    👩‍💼
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm xl:text-base">{testimonials[0].author}</p>
                    <p className="text-xs xl:text-sm text-muted-foreground">{testimonials[0].role}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-6 xl:mt-8">
              <div className={`w-2 h-2 rounded-full transition-all ${step === "name" ? "w-6 xl:w-8 bg-foreground" : "bg-foreground/60"}`} />
              <div className={`w-2 h-2 rounded-full transition-all ${step === "email" ? "w-6 xl:w-8 bg-foreground" : "bg-foreground/60"}`} />
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-foreground/20" />
            <span className="text-xs xl:text-sm text-foreground/60">Featured in</span>
            <div className="flex-1 h-px bg-foreground/20" />
          </div>
          <div className="flex items-center justify-center gap-4 xl:gap-8">
            {featuredIn.map((name) => (
              <span key={name} className="font-bold text-foreground/70 text-xs xl:text-sm">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6 sm:mb-8">
            <Link to="/" className="flex items-center gap-2">
              <img src={badgeLogo} alt="ReelyChat" className="w-9 h-9 sm:w-10 sm:h-10" />
            </Link>
          </div>"

          {step !== "name" && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {getStepTitle()}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            {getStepSubtitle()}
          </p>

          <div className="space-y-3 sm:space-y-4">
            {step === "name" && (
              <Input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="h-11 sm:h-12 rounded-lg border-border text-sm sm:text-base"
                autoFocus
              />
            )}

            {step === "email" && (
              <>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 sm:h-12 rounded-lg border-border text-sm sm:text-base"
                  autoFocus
                />
                <Input
                  type="password"
                  placeholder="Create password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-11 sm:h-12 rounded-lg border-border text-sm sm:text-base"
                />
              </>
            )}

            <Button
              onClick={handleNext}
              variant="dark"
              size="lg"
              className="w-full h-11 sm:h-12"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Continue"
              )}
            </Button>
          </div>

          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-5 sm:mt-6">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>

          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
              Terms
            </a>
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
