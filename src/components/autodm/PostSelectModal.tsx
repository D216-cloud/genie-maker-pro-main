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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  thumbnail: string;
  caption: string;
  date: string;
  mediaType?: string;
}

interface Connection {
  instagram_username?: string | null;
  profile_picture_url?: string | null;
}

interface PostSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (postId: string, postType: 'specific' | 'any' | 'next') => void;
  posts: Post[];
  connection?: Connection | null;
}

const PostSelectModal = ({ open, onClose, onSelect, posts, connection }: PostSelectModalProps) => {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [postType, setPostType] = useState<"specific" | "any" | "next">("specific");

  const handleNext = () => {
    if (postType === 'specific' && selectedPost) {
      onSelect(selectedPost, postType);
    } else if (postType !== 'specific') {
      onSelect('', postType);
    }
  };

  const username = connection?.instagram_username || 'Instagram User';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-sm sm:text-base">📱</span>
          </div>
          <DialogTitle className="text-base sm:text-lg font-semibold">
            When someone comments on your Post/Reel
          </DialogTitle>
          <VisuallyHidden.Root>
            <DialogDescription>Select a post to trigger the automation.</DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>

        {/* User Profile */}
        <div className="flex flex-col items-center py-4 sm:py-6 animate-scale-in">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-[3px]">
            <Avatar className="w-full h-full">
              <AvatarImage 
                src={connection?.profile_picture_url || undefined} 
                alt={username}
              />
              <AvatarFallback className="bg-card text-2xl sm:text-3xl font-bold text-foreground">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <p className="font-semibold text-foreground mt-3 text-sm sm:text-base">{username}</p>
          <button className="text-xs sm:text-sm text-primary hover:underline active:scale-95 transition-transform mt-1">
            Add another account
          </button>
        </div>

        {/* Post Type Selection */}
        <div className="space-y-3 animate-slide-in-up">
          <p className="text-xs sm:text-sm font-medium text-foreground">The Comment is on...</p>
          <div className="flex gap-2">
            {[
              { id: "specific", label: "Specific Post" },
              { id: "any", label: "Any Post" },
              { id: "next", label: "Next Post" },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setPostType(type.id as typeof postType)}
                className={cn(
                  "flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border text-xs sm:text-sm font-medium transition-all active:scale-95 touch-manipulation",
                  postType === type.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Post Grid */}
        {postType === "specific" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-4">
            {posts.map((post, index) => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post.id)}
                className={cn(
                  "relative aspect-square rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all active:scale-95 touch-manipulation animate-scale-in",
                  selectedPost === post.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-border"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img
                  src={post.thumbnail}
                  alt={post.caption}
                  className="w-full h-full object-cover"
                />
                {selectedPost === post.id && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center animate-fade-in">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-base sm:text-lg">✓</span>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/60 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                  {post.mediaType === 'VIDEO' ? '🎬' : post.mediaType === 'CAROUSEL_ALBUM' ? '📷' : '📷'}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <span className="text-xs sm:text-sm text-muted-foreground">Step 1 of 3</span>
          <div className="flex gap-2 sm:gap-3">
            <Button variant="outline" onClick={onClose} size="sm" className="active:scale-95 transition-transform">
              Back
            </Button>
            <Button onClick={handleNext} disabled={postType === "specific" && !selectedPost} size="sm" className="active:scale-95 transition-transform">
              Next
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostSelectModal;
