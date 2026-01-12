import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Zap, Users, MessageSquare, Link2, Smartphone, ArrowRight, ArrowDown, CheckCircle, BarChart3, Loader2, FileText, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { useInstagram } from "@/hooks/useInstagram";
import { useNavigate } from "react-router-dom";

const DashboardHome = () => {
  const { user } = useAuth();
  const fullName = user?.user_metadata?.full_name || "Creator";

  // Placeholder values - replace with real data when available
  const totalAutomations = 8;
  const totalFollowers = 1200;
  const totalAutoDMSent = 3412;

  // YouTube player refs/state
  const playerRef = useRef<any>(null);
  const playerContainerId = "reely-youtube-player";
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Use the provided promo video for the Premium feature tour
  const demoVideoId = "Ev4GOeRcUVU";

  // Instagram hook (connect flow)
  const { connectInstagram, connecting, isConnected } = useInstagram();
  const navigate = useNavigate();

  useEffect(() => {
    // Load YT API if needed
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    const createPlayer = () => {
      if ((window as any).YT && !playerRef.current) {
        playerRef.current = new (window as any).YT.Player(playerContainerId, {
          videoId: demoVideoId,
          playerVars: {
            modestbranding: 1,
            rel: 0,
            controls: 1,
            disablekb: 0,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onStateChange: (e: any) => {
              // 1 = playing, 2 = paused, 0 = ended
              setIsPlaying(e.data === 1);
            },
            onError: () => {
              setVideoError(true);
            }
          },
        });
      }
    };

    // If API already loaded, create immediately, otherwise attach global
    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      // cleanup if needed
      try {
        if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy();
      } catch (err) {}
    };
  }, []);

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    const state = p.getPlayerState();
    // 1 playing, 2 paused
    if (state === 1) {
      p.pauseVideo();
    } else {
      p.playVideo();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Hello, {fullName}!</h1>
          <p className="text-sm sm:text-base font-medium leading-relaxed text-muted-foreground block max-w-xl">Welcome back — quick summary of your account.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden md:inline-flex">Quick actions</Button>

          {/* Desktop buttons (visible sm+) */}
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" asChild>
              <a href="/dashboard/autodm">Connect Instagram</a>
            </Button>
            <Button variant="dark" asChild>
              <a href="/dashboard/autodm">Create Automation</a>
            </Button>
          </div>

          {/* Mobile inline buttons (visible only on xs screens) */}
          <div className="flex sm:hidden items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => connectInstagram()} disabled={connecting || isConnected}>{isConnected ? 'Connected' : 'Connect'}</Button>
            <Button size="sm" variant="dark" asChild>
              <a href="/dashboard/autodm">Create</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero / Overview banner */}
      <div className="bg-gradient-to-r from-amber-50 to-white border border-amber-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Overview</p>
          <h2 className="text-lg font-semibold text-foreground mt-1">Your Genie Maker Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1 hidden sm:block">Quick access to your most important actions, recent activity, and performance highlights.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/dashboard/analytics">
            <Button className="bg-amber-500 text-white">View Analytics</Button>
          </Link>
          <Link to="/dashboard/templates">
            <Button variant="outline">Templates</Button>
          </Link>
          <Link to="/dashboard/billing">
            <Button variant="ghost">Manage</Button>
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button variant="ghost" className="flex items-center gap-2 justify-start"><Zap className="w-4 h-4"/> Create Automation</Button>
          <Button variant="ghost" className="flex items-center gap-2 justify-start"> <Users className="w-4 h-4"/> View Audience</Button>
          <Button variant="ghost" className="flex items-center gap-2 justify-start"> <FileText className="w-4 h-4"/> Templates</Button>
          <Button variant="ghost" className="flex items-center gap-2 justify-start"> <CreditCard className="w-4 h-4"/> Billing</Button>
        </div>
      </div>

      {/* Three diamond stat boxes (mobile-first: stacked and centered) */}
      <div className="mb-6">
        <div className="flex gap-2 items-stretch sm:grid sm:grid-cols-3 sm:gap-4">
          {[{
            title: 'Total Automations',
            value: totalAutomations,
            icon: <Zap className="-rotate-45 text-white w-5 h-5 sm:w-6 sm:h-6" />,
            bg: 'linear-gradient(180deg,#7c3aed,#4f46e5)'
          }, {
            title: 'Total Followers',
            value: totalFollowers.toLocaleString(),
            icon: <Users className="-rotate-45 text-white w-5 h-5 sm:w-6 sm:h-6" />,
            bg: 'linear-gradient(180deg,#06b6d4,#0891b2)'
          }, {
            title: 'AutoDM Sent',
            value: totalAutoDMSent.toLocaleString(),
            icon: <MessageSquare className="-rotate-45 text-white w-5 h-5 sm:w-6 sm:h-6" />,
            bg: 'linear-gradient(180deg,#f97316,#fb923c)'
          }].map((card) => (
            <div key={card.title} className="bg-card rounded-xl p-2 sm:p-4 sm:pl-6 overflow-hidden shadow-elevated flex-shrink-0 flex flex-col items-center text-center gap-2 w-1/3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:text-left sm:gap-4">
              <div className="w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center rounded-sm transform rotate-45" style={{ background: card.bg }}>
                <div className="-rotate-45">{card.icon}</div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">{card.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground mt-1 sm:mt-0">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* White video card with connect flow */}
      <div className="bg-card rounded-xl p-6 shadow-elevated">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden relative bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-elevated">
              <div className="p-4 flex items-start justify-between border-b border-muted/10">
                <div>
                  <h4 className="text-lg font-semibold text-foreground">Genie Maker Premium — Feature Overview</h4>
                  <p className="text-sm text-muted-foreground">A quick look at premium capabilities and how to get started.</p>
                </div>
                <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">Premium</span>
              </div>

              {/* Desktop / sm+ iframe */}
              <div className="hidden sm:block aspect-[16/9] w-full bg-black relative">
                {!videoError ? (
                  <>
                    <div id={playerContainerId} className="w-full h-full" />

                    {/* Play/Pause overlay */}
                    <button
                      onClick={togglePlay}
                      className="absolute left-4 bottom-4 bg-amber-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                      aria-label="Play/Pause video"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground">
                    <div>
                      <p className="text-lg font-semibold mb-2">Video unavailable</p>
                      <p className="text-sm mb-4">This video cannot be played here. You can open it on YouTube.</p>
                      <div className="flex items-center justify-center gap-3">
                        <a href={`https://www.youtube.com/watch?v=${demoVideoId}`} target="_blank" rel="noreferrer">
                          <Button variant="ghost">Open on YouTube</Button>
                        </a>
                        <Button onClick={() => setVideoError(false)} variant="outline">Try again</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile thumbnail fallback */}
              <div className="block sm:hidden aspect-[16/9] w-full bg-center bg-cover relative" style={{ backgroundImage: `url(https://img.youtube.com/vi/${demoVideoId}/hqdefault.jpg)` }}>
                <a href={`https://www.youtube.com/watch?v=${demoVideoId}`} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-amber-500 rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
                    <Play className="w-7 h-7 text-white" />
                  </div>
                </a>
              </div>
            </div>


          </div>

          <div className="space-y-4">
            <div className="rounded-lg p-4 bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold">Performance</h4>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </div>
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <div className="h-28 bg-muted/10 rounded-md flex items-center justify-center text-muted-foreground">Chart placeholder</div>
            </div>

            <div className="bg-muted/5 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Connect your Instagram</h3>
                  <p className="text-sm text-muted-foreground">Link your Instagram Business / Creator account to start automations and sell.</p>
                </div>
                <a href="/support" className="text-sm text-primary hover:underline">Need help?</a>
              </div>

              {/* Vertical connected flow with arrows (stacked) */}
              <div className="flex flex-col items-center gap-2 w-full">
                {/* Step 1 */}
                <div className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(180deg,#7c3aed,#4f46e5)' }}>
                      <Link2 className="w-5 h-5 text-white -rotate-45" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Step 1</p>
                      <p className="font-medium text-foreground">Connect your Instagram</p>
                    </div>
                  </div>
                  <div>
                    <Button className="w-full sm:w-auto" size="sm" onClick={async () => { await connectInstagram(); }} disabled={connecting}>
                      {connecting ? (<span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Connecting</span>) : (isConnected ? (<span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Connected</span>) : 'Connect')}</Button>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-center text-muted-foreground">
                  <ArrowDown className="w-5 h-5 mx-auto" />
                </div>

                {/* Step 2 */}
                <div className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(180deg,#06b6d4,#0891b2)' }}>
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Step 2</p>
                      <p className="font-medium text-foreground">Create Automation</p>
                    </div>
                  </div>
                  <div>
                    <Button className="w-full sm:w-auto" size="sm" onClick={() => navigate('/dashboard/autodm')} disabled={!isConnected}>
                      Create
                    </Button>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-center text-muted-foreground">
                  <ArrowDown className="w-5 h-5 mx-auto" />
                </div>

                {/* Step 3 */}
                <div className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(180deg,#f97316,#fb923c)' }}>
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Step 3</p>
                      <p className="font-medium text-foreground">View Analytics</p>
                    </div>
                  </div>
                  <div>
                    <Button className="w-full sm:w-auto" size="sm" onClick={() => navigate('/dashboard/analytics')} disabled={!isConnected}>Open</Button>
                  </div>
                </div>

              </div>

              <div className="mt-3 text-xs text-muted-foreground">{!isConnected ? 'Connect your Instagram first to enable creating automations and viewing analytics.' : 'You are connected — proceed to create automations or view analytics.'}</div>

              <div className="mt-4 text-xs text-muted-foreground">Still stuck? <a href="/support" className="text-primary hover:underline">Contact support</a> or read the <a href="/docs" className="text-primary hover:underline">docs</a>.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity + Insights */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-elevated">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <ul className="space-y-3">
            {["Automation created","New follower","AutoDM sent","Template used","Billing updated","Scheduled post"].map((a, i) => (
              <li key={i} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-muted/5 flex items-center justify-center text-muted-foreground">{i+1}</div>
                  <div>
                    <p className="text-sm font-medium">{a}</p>
                    <p className="text-xs text-muted-foreground">{i === 0 ? '2m ago' : `${(i+1)*5}m ago`}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Details</div>
              </li>
            ))}
          </ul>
        </div>
        <aside className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-2xl p-4 shadow-elevated">
          <h4 className="text-sm font-semibold">Insights</h4>
          <p className="text-sm mt-2 text-muted-foreground">Quick snapshot</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Automations</span><strong>{totalAutomations}</strong></div>
            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Followers</span><strong>{totalFollowers.toLocaleString()}</strong></div>
            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">AutoDM Sent</span><strong>{totalAutoDMSent.toLocaleString()}</strong></div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashboardHome;
