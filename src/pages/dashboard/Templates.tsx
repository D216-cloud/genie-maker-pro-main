import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Play, Layers, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";

const mockTemplates = [
  { id: 'tmpl_01', title: 'Welcome Sequence', desc: 'Send a friendly welcome DM to new followers.', tags: ['welcome','engagement'], supportsStories: false, thumbnail: 'https://placehold.co/360x640/ede9fe/6b21a8?text=Welcome' },
  { id: 'tmpl_02', title: 'Promo Blast', desc: 'Announce new product launches with auto replies.', tags: ['promo','sales'], supportsStories: true, thumbnail: 'https://placehold.co/360x640/ccfbf1/0f172a?text=Promo', previewVideo: 'Ev4GOeRcUVU' },
  { id: 'tmpl_03', title: 'Lead Capture', desc: 'Ask for email and send a free download link.', tags: ['lead','capture'], supportsStories: false, thumbnail: 'https://placehold.co/360x640/eef2ff/1e293b?text=Lead' },
  { id: 'tmpl_04', title: 'Story Promo', desc: 'Short story-only promo template with CTA sticker.', tags: ['story','promo'], supportsStories: true, thumbnail: 'https://placehold.co/360x640/fff7ed/92400e?text=Story+Promo', previewVideo: 'M7lc1UVf-VE' },
  { id: 'tmpl_05', title: 'Discount Teaser', desc: 'Short story teaser with swipe-up CTA.', tags: ['story','sales'], supportsStories: true, thumbnail: 'https://placehold.co/360x640/ffedd5/b44d11?text=Teaser' },
  { id: 'tmpl_06', title: 'Event Reminder', desc: 'Remind followers about upcoming events using stories.', tags: ['story','events'], supportsStories: true, thumbnail: 'https://placehold.co/360x640/f0f9ff/0369a1?text=Event' },
];

const Templates = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'stories'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [showAll, setShowAll] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);

  // Derived lists & categories
  const categories = Array.from(new Set(mockTemplates.flatMap(t => t.tags))).sort();
  const allFiltered = mockTemplates.filter(t => (filter === 'stories' ? t.supportsStories : true) && (selectedCategory === 'all' ? true : t.tags.includes(selectedCategory)));
  // Default show up to 8 templates in the grid; user can toggle "Show all"
  const templatesToShow = showAll ? allFiltered : allFiltered.slice(0, 8);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setVideoFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handlePostStory = async (asStoryOnly = true) => {
    if (!selectedTemplate) {
      toast({ title: 'Select a template first', description: 'Choose a template to use for posting.', variant: 'destructive' });
      return;
    }

    if (!videoFile) {
      toast({ title: 'No video selected', description: 'Please choose a video file to upload for Story.', variant: 'destructive' });
      return;
    }

    // Placeholder: simulate upload/post - in real app, call backend endpoint
    setPosting(true);
    try {
      await new Promise(res => setTimeout(res, 1200));
      toast({ title: 'Posted (simulated)', description: `Template "${selectedTemplate.title}" was posted as a Story.`, variant: 'success' });
      // Reset
      setSelectedTemplate(null);
      setVideoFile(null);
      setPreviewUrl(null);
    } catch (err) {
      toast({ title: 'Post failed', description: 'Something went wrong while posting your Story.', variant: 'destructive' });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Templates</h1>
            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Premium</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">Ready-to-use automations to help you grow — customize and deploy instantly.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard/templates/new">
            <Button className="bg-amber-500 text-white">Create from Template</Button>
          </Link>
          <Button variant="outline">Browse marketplace</Button>
        </div>
      </div>

      {/* Filter: All / Stories / Category */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={() => { setFilter('all'); setShowAll(false); }} className={"px-3 py-1 rounded-full text-sm " + (filter === 'all' ? 'bg-amber-500 text-white' : 'bg-muted/5')}>All</button>
        <button onClick={() => { setFilter('stories'); setShowAll(false); }} className={"px-3 py-1 rounded-full text-sm " + (filter === 'stories' ? 'bg-amber-500 text-white' : 'bg-muted/5')}>Stories only</button>

        <div className="ml-2 flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Category</label>
          <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setShowAll(false); }} className="text-sm rounded-md border px-2 py-1 bg-white">
            <option value="all">All</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-muted-foreground ml-3">
          Showing {allFiltered.length} templates ({templatesToShow.length}{allFiltered.length > templatesToShow.length ? ` of ${allFiltered.length}` : ''})
        </div>

        {!showAll && allFiltered.length > templatesToShow.length && (
          <button onClick={() => setShowAll(true)} className="ml-2 text-sm text-amber-600 underline">Show all</button>
        )}

        {showAll && allFiltered.length > 8 && (
          <button onClick={() => setShowAll(false)} className="ml-2 text-sm text-muted-foreground underline">Show less</button>
        )}
      </div>

      {/* Selected template panel */}
      {selectedTemplate && (
        <div className="mb-4 rounded-2xl p-4 bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-elevated">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-md bg-amber-100 flex items-center justify-center text-amber-700">
              <Layers className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{selectedTemplate.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedTemplate.desc}</p>

              <div className="mt-3">
                <label className="block text-xs text-muted-foreground mb-1">Upload video (Story)</label>
                <input type="file" accept="video/*" onChange={handleFileChange} />
                {previewUrl && (
                  <div className="mt-3 w-full sm:w-1/2">
                    <video src={previewUrl} controls className="w-full rounded-md border" />
                    <p className="text-xs text-muted-foreground mt-2">Uploaded: <span className="font-medium text-foreground">{videoFile?.name || '1 video'}</span></p>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <Button className="bg-amber-500 text-white" onClick={() => handlePostStory(true)} disabled={posting}>{posting ? 'Posting...' : 'Post Story'}</Button>
                  <Button variant="outline" onClick={() => { setSelectedTemplate(null); setVideoFile(null); setPreviewUrl(null); }}>Cancel</Button>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">Note: Posting is simulated in this dev build. To enable real posts, connect Instagram and a backend endpoint to handle uploads.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {templatesToShow.map(t => (
          <div key={t.id} className="p-0 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-elevated flex flex-col overflow-hidden">
            {/* 9:16 thumbnail frame */}
            <div
              className="aspect-[9/16] w-full bg-center bg-cover relative"
              style={{ backgroundImage: t.thumbnail ? `url(${t.thumbnail})` : undefined }}
            >
              <button
                onClick={() => { setPreviewTemplate(t); setPreviewOpen(true); }}
                className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
                aria-label="Preview"
              >
                <div className="bg-amber-500 hover:bg-amber-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6" />
                </div>
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{t.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>

                  {/* Video count + preview link */}
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                    <span>Videos: <strong className="text-foreground">{t.previewVideo ? 1 : 0}</strong></span>
                    {t.previewVideo && (
                      <a href={`https://www.youtube.com/watch?v=${t.previewVideo}`} target="_blank" rel="noreferrer" className="text-amber-600 underline">Preview video</a>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{t.supportsStories ? 'Story' : 'Template'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-auto">
                <Button size="sm" className="bg-amber-500 text-white" onClick={() => setSelectedTemplate(t)}>{t.supportsStories ? 'Use for Story' : 'Use'}</Button>
                <Button variant="outline" size="sm" onClick={() => { setPreviewTemplate(t); setPreviewOpen(true); }}>
                  <Play className="w-4 h-4 mr-2" /> Preview
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={(open) => { if (!open) { setPreviewOpen(false); setPreviewTemplate(null); } else setPreviewOpen(true); }}>
        <DialogContent className="max-w-2xl w-[96%] sm:w-[720px]">
          <div className="relative">
            <DialogClose className="absolute right-3 top-3 p-2 rounded-full hover:bg-muted/5"><X className="w-4 h-4" /></DialogClose>
            {previewTemplate ? (
              <div className="aspect-[9/16] w-full bg-black rounded-md overflow-hidden flex items-center justify-center">
                {previewTemplate.previewVideo ? (
                  <iframe
                    title={previewTemplate.title}
                    src={`https://www.youtube.com/embed/${previewTemplate.previewVideo}?autoplay=0&rel=0`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <img src={previewTemplate.thumbnail} alt={previewTemplate.title} className="w-full h-full object-cover" />
                )}
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{previewTemplate?.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{previewTemplate?.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="bg-amber-500 text-white" onClick={() => { setSelectedTemplate(previewTemplate); setPreviewOpen(false); }}>Use Template</Button>
                {previewTemplate?.supportsStories && (
                  <Button size="sm" variant="outline" onClick={() => { setSelectedTemplate(previewTemplate); setPreviewOpen(false); }}>
                    Use for Story
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Templates;
