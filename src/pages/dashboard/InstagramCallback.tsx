import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInstagram } from '@/hooks/useInstagram';
import { Loader2, CheckCircle, XCircle, Instagram, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileData {
  username: string | null;
  profilePictureUrl: string | null;
  accountType: string | null;
  mediaCount: number | null;
}

const InstagramCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useInstagram();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting your Instagram account...');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple processing
    if (processedRef.current) return;
    
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('Instagram callback received:', { code: code?.slice(0, 20) + '...', error });

    if (error) {
      setStatus('error');
      setMessage(errorDescription || 'Instagram authorization was cancelled.');
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received. Please try again.');
      return;
    }

    // Mark as processed immediately
    processedRef.current = true;

    const processCallback = async () => {
      try {
        console.log('Processing Instagram callback with code (once)...');
        const result = await handleCallback(code);
        console.log('Callback result:', result);
        
        if (result.success) {
          setStatus('success');
          setProfile({
            username: result.username || null,
            profilePictureUrl: result.profilePictureUrl || null,
            accountType: result.accountType || null,
            mediaCount: result.mediaCount || null,
          });
          setMessage('Your Instagram account has been connected successfully!');
        } else {
          setStatus('error');
          setMessage(result.error || 'Failed to connect Instagram account. Please try again.');
        }
      } catch (err) {
        console.error('Error processing callback:', err);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    processCallback();
  }, [searchParams, handleCallback]);

  const handleContinue = () => {
    navigate('/dashboard/autodm');
  };

  const handleRetry = () => {
    navigate('/dashboard/autodm');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="bg-card rounded-2xl p-8 shadow-glass max-w-md w-full text-center space-y-6 border border-border/50">
        {/* Instagram Logo Header */}
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center">
          <Instagram className="w-8 h-8 text-white" />
        </div>
        
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Connecting...</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
          </>
        )}
        
        {status === 'success' && profile && (
          <>
            <div className="relative">
              <CheckCircle className="h-8 w-8 text-green-500 absolute -top-2 -right-2 z-10 bg-card rounded-full" />
              <Avatar className="w-24 h-24 mx-auto border-4 border-green-500/20">
                <AvatarImage src={profile.profilePictureUrl || undefined} alt={profile.username || 'Profile'} />
                <AvatarFallback className="bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white text-2xl">
                  <User className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Connected!</h2>
              {profile.username && (
                <p className="text-lg font-medium bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  @{profile.username}
                </p>
              )}
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                {profile.accountType && (
                  <span className="px-2 py-1 bg-primary/10 rounded-full text-primary text-xs font-medium">
                    {profile.accountType.replace('_', ' ')}
                  </span>
                )}
                {profile.mediaCount !== null && profile.mediaCount > 0 && (
                  <span>{profile.mediaCount} posts</span>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-2">{message}</p>
            </div>
            
            <Button onClick={handleContinue} className="w-full" size="lg">
              Continue to Dashboard
            </Button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Connection Failed</h2>
              <p className="text-muted-foreground text-sm">{message}</p>
            </div>
            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full" size="lg">
                Try Again
              </Button>
              <Button onClick={handleContinue} variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InstagramCallback;
