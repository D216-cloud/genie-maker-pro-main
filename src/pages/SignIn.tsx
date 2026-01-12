import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import badgeLogo from "@/assets/logos/reelychat-mascot-badge.svg";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    const { data, error } = await signIn(formData.email, formData.password);
    setLoading(false);

    if (error) {
      const msg = error?.message || String(error);
      toast.error(msg || 'Failed to sign in');
      return;
    }

    // If signIn returns a session, navigate to dashboard. Otherwise inform the user.
    if (data?.session) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.success("Check your email to confirm your account or complete sign-in if needed.");
      navigate('/signin');
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
                  "Building my paid community with ReelyChat was seamless. My audience loves it!"
                </p>
                <div className="flex items-center gap-3 xl:gap-4">
                  <div className="w-10 h-10 xl:w-12 xl:h-12 bg-muted rounded-full flex items-center justify-center text-xl xl:text-2xl">
                    👩‍💼
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm xl:text-base">Stephanie Gardner</p>
                    <p className="text-xs xl:text-sm text-muted-foreground">Social Media Marketing</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-6 xl:mt-8">
              <div className={`w-2 h-2 rounded-full transition-all bg-foreground/60`} />
              <div className={`w-2 h-2 rounded-full transition-all bg-foreground/60`} />
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
            <span className="font-bold text-foreground/70 text-xs xl:text-sm">Forbes</span>
            <span className="font-bold text-foreground/70 text-xs xl:text-sm">ThePrint</span>
            <span className="font-bold text-foreground/70 text-xs xl:text-sm">YourStory</span>
            <span className="font-bold text-foreground/70 text-xs xl:text-sm">Entrepreneur</span>
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

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            Sign in to your account or create a new one
          </p>

          <div className="space-y-3 sm:space-y-4">
            <form onSubmit={handleEmailSignIn} className="space-y-3 sm:space-y-4">
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
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11 sm:h-12 rounded-lg border-border text-sm sm:text-base"
              />

              <Button type="submit" variant="dark" size="lg" className="w-full h-11 sm:h-12" disabled={loading}>
                {loading ? (<Loader2 className="w-5 h-5 animate-spin" />) : ("Sign In")}
              </Button>
            </form>

            <div className="mt-2">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-11 sm:h-12 flex items-center justify-center"
                onClick={async () => {
                  try {
                    setLoading(true);
                    const { data, error } = await signInWithGoogle();
                    if (data?.url) window.location.href = data.url;
                    if (error) throw error;
                  } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : String(err);
                    toast.error(message || 'Failed to start Google sign-in');
                    setLoading(false);
                  }
                }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                      <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.4-34.1-4.1-50.3H272v95.3h146.9c-6.3 34.5-25.5 63.7-54.6 83.3v69.2h88.2c51.6-47.5 81-118 81-197.5z" />
                      <path fill="#34A853" d="M272 544.3c73.6 0 135.4-24.3 180.6-66.1l-88.2-69.2c-24.5 16.4-55.9 26.1-92.4 26.1-71 0-131.2-47.9-152.6-112.3H28.6v70.6C74 486 166.1 544.3 272 544.3z" />
                      <path fill="#FBBC05" d="M119.4 330.8c-10.6-31.9-10.6-66.2 0-98.1V162.1H28.6c-39.6 78.9-39.6 171.9 0 250.8l90.8-82.1z" />
                      <path fill="#EA4335" d="M272 107.7c39.8 0 75.6 13.7 103.8 40.6l77.9-76C407.4 24.6 345.6 0 272 0 166.1 0 74 58.3 28.6 146.1l90.8 82.1C140.8 155.6 201 107.7 272 107.7z" />
                    </svg>
                    Continue with Google
                  </span>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">Forgot your password?</a>
              <Link to="/signup" className="text-xs sm:text-sm text-primary hover:underline">Create account</Link>
            </div>

          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">Terms</a>
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">Privacy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;