import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Play, BookOpen, Settings, Instagram, Loader2, Trash2, Power, CheckCircle2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import TriggerModal from "@/components/autodm/TriggerModal";
import PostSelectModal from "@/components/autodm/PostSelectModal";
import KeywordConfigModal from "@/components/autodm/KeywordConfigModal";
import DMConfigModal from "@/components/autodm/DMConfigModal";
import SuccessModal from "@/components/autodm/SuccessModal";
import { useInstagram } from "@/hooks/useInstagram";
import { useAutomations } from "@/hooks/useAutomations";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AutoDM = () => {
  const { toast } = useToast();
  const { 
    connection, 
    media, 
    loading: instagramLoading, 
    connecting, 
    isConnected, 
    connectInstagram,
    disconnectInstagram 
  } = useInstagram();
  
  const { 
    automations, 
    loading: automationsLoading, 
    createAutomation, 
    toggleAutomation,
    deleteAutomation 
  } = useAutomations();

  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [showPostSelectModal, setShowPostSelectModal] = useState(false);
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [showDMConfigModal, setShowDMConfigModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<{
    id: string;
    thumbnail: string;
    caption: string;
    type: string;
  } | null>(null);
  const [keywordConfigData, setKeywordConfigData] = useState<{
    keywords: string[];
    autoReply: boolean;
    commentResponses: string[];
    commentType: 'specific' | 'any';
  } | null>(null);

  const handleCreateAutomation = () => {
    if (!isConnected) {
      toast({
        title: "Connect Instagram First",
        description: "Please connect your Instagram account to create automations.",
        variant: "destructive",
      });
      return;
    }
    setShowTriggerModal(true);
  };

  const handleTriggerSelect = (trigger: string) => {
    setSelectedTrigger(trigger);
    setShowTriggerModal(false);
    setShowPostSelectModal(true);
  };

  const handlePostSelect = (postId: string, postType: 'specific' | 'any' | 'next') => {
    if (postType === 'specific') {
      const post = media.find(m => m.id === postId);
      if (post) {
        // Use the actual Instagram media_id from the post
        console.log('Selected specific post:', { 
          id: post.id, 
          mediaType: post.media_type,
          caption: post.caption?.substring(0, 50) 
        });
        setSelectedPost({
          id: post.id, // This is the Instagram media_id
          thumbnail: post.thumbnail_url || post.media_url || '',
          caption: post.caption || '',
          type: 'specific', // Mark as specific, not the media_type
        });
      }
    } else if (postType === 'any') {
      // Apply to all posts
      setSelectedPost({
        id: 'any',
        thumbnail: '',
        caption: 'Any post',
        type: 'any',
      });
    } else {
      // Next post - for now treat as any
      setSelectedPost({
        id: 'next',
        thumbnail: '',
        caption: 'Next post',
        type: 'any', // Next post also applies to all
      });
    }
    setShowPostSelectModal(false);
    setShowKeywordModal(true);
  };

  const handleKeywordNext = (data: {
    keywords: string[];
    autoReply: boolean;
    commentResponses: string[];
    commentType: 'specific' | 'any';
  }) => {
    setKeywordConfigData(data);
    setShowKeywordModal(false);
    setShowDMConfigModal(true);
  };

  const handleDMSubmit = async (dmData: {
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
  }) => {
    setShowDMConfigModal(false);
    
    // Determine if this is a specific post or apply to all
    const isApplyToAll = selectedPost?.type === 'any';
    const mediaId = selectedPost?.type === 'specific' ? selectedPost.id : undefined;
    
    console.log('Submitting automation:', {
      isApplyToAll,
      mediaId,
      selectedPostType: selectedPost?.type,
      selectedPostId: selectedPost?.id,
    });

    const result = await createAutomation({
      name: `${selectedTrigger} - ${selectedPost?.caption?.slice(0, 30) || 'Automation'}`,
      triggerType: selectedTrigger || 'comment',
      mediaId: mediaId,
      mediaType: selectedPost?.type === 'specific' ? 'IMAGE' : undefined,
      mediaThumbnail: selectedPost?.thumbnail,
      mediaCaption: selectedPost?.caption,
      applyToAll: isApplyToAll,
      keywords: keywordConfigData?.keywords || [],
      dmMessage: dmData.dmMessage,
      autoReplyEnabled: keywordConfigData?.autoReply || false,
    });

    if (result.success) {
      setShowSuccessModal(true);
      toast({
        title: "✅ Automation Created!",
        description: `AutoDM is now active for ${isApplyToAll ? 'all posts' : 'the selected post'}. Comments matching your keywords will trigger a DM.`,
      });
    } else {
      // Show detailed error with troubleshooting tips
      let errorDetails = result.error || "Failed to create automation";
      let troubleshootingTip = "";
      
      if (errorDetails.includes("media_id")) {
        troubleshootingTip = "Please select a specific Instagram post to create this automation.";
      } else if (errorDetails.includes("check_media_id_required")) {
        troubleshootingTip = "You must either select a specific post OR choose 'Apply to all posts'.";
      }
      
      toast({
        title: "❌ Automation Failed",
        description: (
          <div className="space-y-2">
            <p>{errorDetails}</p>
            {troubleshootingTip && (
              <p className="text-xs text-muted-foreground">💡 Tip: {troubleshootingTip}</p>
            )}
          </div>
        ),
        variant: "destructive",
        duration: 8000,
      });
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    setSelectedTrigger(null);
    setSelectedPost(null);
    setKeywordConfigData(null);
  };

  const handleToggleAutomation = async (id: string) => {
    await toggleAutomation(id);
  };

  const handleDeleteAutomation = async (id: string) => {
    const result = await deleteAutomation(id);
    if (result.success) {
      toast({
        title: "Deleted",
        description: "Automation has been deleted.",
      });
    }
  };

  // Handle disconnect with loading state and user feedback
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnectClick = async () => {
    if (disconnecting) return;
    setDisconnecting(true);
    try {
      const result = await disconnectInstagram();
      if (result?.success) {
        toast({
          title: 'Disconnected',
          description: 'Instagram account disconnected.',
        });
      } else {
        toast({
          title: 'Failed to disconnect',
          description: result?.error || 'Could not disconnect',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Error disconnecting',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setDisconnecting(false);
    }
  };

  // Transform media to posts format for the modal
  const posts = media.map(m => ({
    id: m.id,
    thumbnail: m.thumbnail_url || m.media_url || '',
    caption: m.caption || 'No caption',
    date: m.timestamp ? format(new Date(m.timestamp), 'MMMM do') : '',
    mediaType: m.media_type,
  }));

  if (instagramLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="animate-slide-in-down">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">AutoDM</h1>
            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Premium</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">Automate replies and DMs with premium-level targeting and performance.</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto items-center animate-slide-in-down" style={{ animationDelay: '100ms' }}>
          <Link to="/dashboard/billing" className="hidden sm:inline">
            <Button variant="ghost" className="border border-amber-200 text-amber-700 hover:bg-amber-50">Upgrade</Button>
          </Link>

          {isConnected ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleDisconnectClick}
                disabled={disconnecting}
                className="flex-1 sm:flex-none active:scale-95 transition-transform text-sm"
                size="sm"
              >
                {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Disconnect'}
              </Button>
              <Button 
                onClick={handleCreateAutomation} 
                className="flex-1 sm:flex-none gap-2 active:scale-95 transition-transform text-sm bg-amber-500 text-white hover:bg-amber-600"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span> Automation
              </Button>
            </>
          ) : (
            <Button 
              onClick={async () => {
                try {
                  toast({ title: 'Redirecting to Instagram', description: 'You will be redirected to Instagram to complete the connection.' });
                  const res = await connectInstagram();
                  if (!res?.success) {
                    toast({ title: 'Failed to start Instagram auth', description: res?.error || 'Please try again', variant: 'destructive' });
                  }
                } catch (err) {
                  const msg = err instanceof Error ? err.message : String(err);
                  toast({ title: 'Error', description: msg, variant: 'destructive' });
                }
              }} 
              disabled={connecting} 
              className="w-full sm:w-auto gap-2 active:scale-95 transition-transform bg-gradient-to-r from-amber-400 to-amber-500 text-white"
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Instagram className="w-4 h-4" />
              )}
              Connect Instagram
            </Button>
          )}
        </div>
      </div>

      {/* Connected Account Card */}
      {isConnected && connection && (
        <div className="rounded-2xl p-4 sm:p-5 mb-6 animate-scale-in bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-elevated">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-2 ring-amber-200/60 ring-offset-2 ring-offset-background">
                  <AvatarImage 
                    src={connection.profile_picture_url || undefined} 
                    alt={connection.instagram_username || 'Instagram'}
                  />
                  <AvatarFallback className="bg-amber-500 text-white text-xl sm:text-2xl font-bold">
                    {connection.instagram_username?.charAt(0).toUpperCase() || 'I'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-600 rounded-full p-1 shadow-md">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-amber-600" />
                  <p className="font-semibold text-foreground text-base sm:text-lg">
                    @{connection.instagram_username || 'Unknown'}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                    <span className="text-xs font-semibold">Premium Active</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-muted/5 text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                    {media.length} posts
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open(`https://www.instagram.com/${connection.instagram_username}`, '_blank')}
                className="text-foreground border border-muted/10 hover:bg-muted/5"
              >
                View Profile
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDisconnectClick}
                disabled={disconnecting}
                className="text-muted-foreground hover:text-destructive hover:border-destructive active:scale-95 transition-all"
              >
                {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Disconnect'}
              </Button>
            </div>
          </div>
          
          {/* Important Info Alert */}
          <Alert className="mt-4 border-amber-200/60 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-700 font-semibold">Premium: Webhook Check</AlertTitle>
            <AlertDescription className="text-amber-700/80 text-sm">
              Make sure your Instagram account <strong>@{connection.instagram_username}</strong> (ID: {connection.instagram_account_id}) is the same one configured in your Meta Developer Console webhook. AutoDM will only work for comments on posts from this exact account.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {!isConnected ? (
        <div className="rounded-2xl p-8 sm:p-12 bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-elevated text-center animate-scale-in">
          <Instagram className="w-14 sm:w-20 h-14 sm:h-20 mx-auto text-amber-600 mb-4" />
          <h2 className="text-lg sm:text-2xl font-extrabold text-foreground mb-2">
            Unlock AutoDM Premium
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
            Upgrade to enable advanced automations, prioritized delivery, and richer targeting options.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button 
              onClick={() => window.location.href = '/dashboard/billing'} 
              size="lg" 
              className="gap-2 active:scale-95 transition-transform bg-amber-500 text-white w-full sm:w-auto"
            >
              Upgrade to Premium
            </Button>
            <Button 
              onClick={async () => {
                try {
                  toast({ title: 'Redirecting to Instagram', description: 'You will be redirected to Instagram to complete the connection.' });
                  const res = await connectInstagram();
                  if (!res?.success) {
                    toast({ title: 'Failed to start Instagram auth', description: res?.error || 'Please try again', variant: 'destructive' });
                  }
                } catch (err) {
                  const msg = err instanceof Error ? err.message : String(err);
                  toast({ title: 'Error', description: msg, variant: 'destructive' });
                }
              }} 
              disabled={connecting} 
              size="lg" 
              variant="outline"
              className="gap-2 active:scale-95 transition-transform w-full sm:w-auto"
            >
              {connecting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Instagram className="w-5 h-5" />
              )}
              Connect Instagram
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="mb-6">
            <Tabs defaultValue="automations" className="w-full">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <TabsList className="bg-muted w-full sm:w-auto rounded-full p-1">
                  <TabsTrigger 
                    value="automations" 
                    className="flex-1 sm:flex-none data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-full"
                  >
                    Automations
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex-1 sm:flex-none data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-full">
                    Settings
                  </TabsTrigger>
                </TabsList>

                <div className="hidden lg:flex items-center gap-3 text-sm text-muted-foreground">
                  <button className="flex items-center gap-2 hover:text-foreground transition-colors active:scale-95 text-amber-600">
                    <Play className="w-4 h-4" />
                    <span className="hidden xl:inline">View Demo</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-foreground transition-colors active:scale-95">
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden xl:inline">Resources</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-foreground transition-colors active:scale-95">
                    <Settings className="w-4 h-4" />
                    <span className="hidden xl:inline">Report an issue</span>
                  </button>
                </div>
              </div>

              <TabsContent value="automations" className="mt-6">
                {/* Active Automations */}
                {automations.length > 0 && (
                  <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-glass mb-6 animate-slide-in-up">
                    <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">
                      Your Automations ({automations.length})
                    </h2>
                    <div className="space-y-3">
                      {automations.map((automation, index) => (
                        <div 
                          key={automation.id} 
                          className={cn(
                            "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-200",
                            "animate-slide-in-up transition-all hover:shadow-lg"
                          )}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            {automation.media_thumbnail && (
                              <img 
                                src={automation.media_thumbnail} 
                                alt="" 
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover flex-shrink-0 shadow-sm"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground text-sm sm:text-base truncate">{automation.name}</p>
                                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">Premium</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                                {automation.apply_to_all ? (
                                  <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded">All Posts</span>
                                ) : automation.media_id ? (
                                  <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded">Post: {automation.media_id.slice(0, 8)}...</span>
                                ) : (
                                  <span className="text-xs bg-red-500/10 text-red-600 px-2 py-0.5 rounded">⚠️ No post linked</span>
                                )}
                                {automation.keywords.length > 0 && (
                                  <span className="text-xs text-muted-foreground">• Keywords: {automation.keywords.join(', ')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <Button
                              variant={automation.is_active ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleToggleAutomation(automation.id)}
                              className={cn("active:scale-95 transition-transform text-xs sm:text-sm", automation.is_active ? "bg-amber-500 text-white" : "")}
                            >
                              <Power className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              {automation.is_active ? 'Active' : 'Paused'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAutomation(automation.id)}
                              className="active:scale-95 transition-transform"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-glass animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                  <h2 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    Jump right in and automate your Instagram
                  </h2>

                  {/* Content Tabs */}
                  <Tabs defaultValue="posts" className="mt-4">
                    <TabsList className="bg-muted/5 rounded-full p-1 gap-2 sm:gap-4 w-full overflow-x-auto">
                      <TabsTrigger 
                        value="posts" 
                        className="rounded-full data-[state=active]:bg-amber-500 data-[state=active]:text-white px-3 py-1 text-xs sm:text-sm whitespace-nowrap"
                      >
                        Posts/Reels ({media.length})
                      </TabsTrigger>
                      <TabsTrigger 
                        value="stories"
                        className="rounded-full data-[state=active]:bg-amber-500 data-[state=active]:text-white px-3 py-1 text-xs sm:text-sm whitespace-nowrap"
                      >
                        Stories
                      </TabsTrigger>
                      <TabsTrigger 
                        value="live"
                        className="rounded-full data-[state=active]:bg-amber-500 data-[state=active]:text-white px-3 py-1 text-xs sm:text-sm whitespace-nowrap"
                      >
                        IG Live
                      </TabsTrigger>
                      <TabsTrigger 
                        value="dms"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-0 pb-3 text-xs sm:text-sm whitespace-nowrap"
                      >
                        DMs
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="mt-6">
                      {media.length === 0 ? (
                        <p className="text-muted-foreground py-12 text-center text-sm sm:text-base">
                          No posts found. Make sure your Instagram account has posts.
                        </p>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                            {(showAllPosts ? media : media.slice(0, 8)).map((post, index) => (
                              <div 
                                key={post.id} 
                                className={cn(
                                  "bg-background rounded-xl overflow-hidden border border-border",
                                  "hover:shadow-elevated transition-all active:scale-[0.98]",
                                  "animate-scale-in"
                                )}
                                style={{ animationDelay: `${Math.min(index, 7) * 50}ms` }}
                              >
                                <div className="aspect-square relative overflow-hidden">
                                  <img 
                                    src={post.thumbnail_url || post.media_url} 
                                    alt={post.caption || ''}
                                    className="w-full h-full object-cover transition-transform hover:scale-105"
                                  />
                                  {post.media_type === 'VIDEO' && (
                                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                      Reel
                                    </div>
                                  )}
                                  {post.media_type === 'CAROUSEL_ALBUM' && (
                                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                      Album
                                    </div>
                                  )}
                                </div>
                                <div className="p-3 sm:p-4">
                                  <p className="text-xs sm:text-sm text-foreground font-medium line-clamp-2 mb-1">
                                    {post.caption || 'No caption'}
                                  </p>
                                  <p className="text-xs text-muted-foreground mb-2 sm:mb-3">
                                    {post.timestamp && format(new Date(post.timestamp), 'MMM do')}
                                  </p>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full text-xs sm:text-sm active:scale-95 transition-transform"
                                    onClick={handleCreateAutomation}
                                  >
                                    Setup
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {media.length > 8 && (
                            <div className="text-center mt-6">
                              <Button 
                                variant="ghost" 
                                onClick={() => setShowAllPosts(!showAllPosts)}
                                className="text-primary font-medium hover:bg-primary/10 active:scale-95 transition-transform gap-2"
                              >
                                {showAllPosts ? (
                                  <>
                                    <ChevronUp className="w-4 h-4" />
                                    Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-4 h-4" />
                                    View all {media.length} posts
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </TabsContent>

                    <TabsContent value="stories">
                      <p className="text-muted-foreground py-12 text-center text-sm">Stories automation coming soon</p>
                    </TabsContent>

                    <TabsContent value="live">
                      <p className="text-muted-foreground py-12 text-center text-sm">IG Live automation coming soon</p>
                    </TabsContent>

                    <TabsContent value="dms">
                      <p className="text-muted-foreground py-12 text-center text-sm">DM automation coming soon</p>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-glass animate-scale-in">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Instagram Connection</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-pink-500/5 to-purple-500/5 rounded-xl border border-pink-500/20">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12 ring-2 ring-pink-500/30">
                          <AvatarImage 
                            src={connection?.profile_picture_url || undefined}
                            alt={connection?.instagram_username || 'Instagram'}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white font-bold">
                            {connection?.instagram_username?.charAt(0).toUpperCase() || 'I'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-pink-500" />
                          <p className="font-medium text-foreground truncate">
                            @{connection?.instagram_username || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            Connected
                          </span>
                          <span className="text-xs text-muted-foreground">
                            via Meta Business
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={disconnectInstagram}
                      className="w-full sm:w-auto active:scale-95 transition-transform hover:text-destructive hover:border-destructive"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}

      {/* Modals */}
      <TriggerModal 
        open={showTriggerModal} 
        onClose={() => setShowTriggerModal(false)}
        onSelect={handleTriggerSelect}
      />

      <PostSelectModal
        open={showPostSelectModal}
        onClose={() => setShowPostSelectModal(false)}
        onSelect={handlePostSelect}
        posts={posts}
        connection={connection}
      />

      <KeywordConfigModal
        open={showKeywordModal}
        onClose={() => setShowKeywordModal(false)}
        onNext={handleKeywordNext}
      />

      <DMConfigModal
        open={showDMConfigModal}
        onClose={() => setShowDMConfigModal(false)}
        onSubmit={handleDMSubmit}
        connection={connection}
      />

      <SuccessModal
        open={showSuccessModal}
        onContinue={handleSuccessContinue}
      />
    </div>
  );
};

export default AutoDM;
