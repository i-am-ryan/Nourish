// /components/volunteer/CommunityFeed.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Camera,
  Heart,
  MessageCircle,
  Share2,
  Users,
  Star,
  Clock,
  Award,
  Target,
  Upload,
  X,
  Send,
  MoreHorizontal,
  Pencil,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import * as V from "@/lib/volunteer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const FOOD_STORY_IMAGES = [
  "/lovable-uploads/ashwini-chaudhary-monty-_mj-M7clbKc-unsplash.jpg",
  "/lovable-uploads/annie-spratt-NAt6a3c3nz0-unsplash.jpg",
  "/lovable-uploads/uzuri-safaris-tanzania-w9E7dKCEUdI-unsplash.jpg",
  "/lovable-uploads/michael-ali-Mj0usFZ1oz8-unsplash.jpg",
  "/lovable-uploads/cdc-CCofbL9nLd8-unsplash.jpg",
  "/lovable-uploads/polina-kuzovkova-URihfzXq8O4-unsplash.jpg",
  "/lovable-uploads/ben-moreland-zaedsq0q1BM-unsplash.jpg",
  "/lovable-uploads/joel-muniz-BErJJL_KsjA-unsplash.jpg",
  "/lovable-uploads/tyson-gorbBYbo6KM-unsplash.jpg",
  "/lovable-uploads/michael-ali-PuwTnaVGJYA-unsplash.jpg",
];
const getStoryImage = (storyId: string, fallbackImage?: string) => {
  if (fallbackImage) return fallbackImage;
  
  // Create a more distributed hash function
  let hash = 0;
  for (let i = 0; i < storyId.length; i++) {
    const char = storyId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and ensure we get a good distribution
  const index = Math.abs(hash) % FOOD_STORY_IMAGES.length;
  return FOOD_STORY_IMAGES[index];
};

/** -----------------------------------------------------------------
 * Fixed curated stories (stable UUIDs) – food themed
 * ----------------------------------------------------------------- */
const CURATED = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    author: "Tebogo M.",
    story_text: "Seeing the smiles when fresh food arrives never gets old! 🥬🌟",
    image_url: "/lovable-uploads/michael-ali-Mj0usFZ1oz8-unsplash.jpg",
    is_featured: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    author: "Community Member",
    story_text: "Thank you to all volunteers! This food came at the perfect time for our family. Your kindness means everything.",
    image_url: "/lovable-uploads/annie-spratt-NAt6a3c3nz0-unsplash.jpg",
    is_featured: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    author: "Mike R.",
    story_text: "Instead of waste, we create hope. Every loaf saved is a family fed! 🍞❤️",
    image_url: "/lovable-uploads/joel-muniz-BErJJL_KsjA-unsplash.jpg",
    is_featured: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
] as const;

type Story = {
  id: string;
  user_id: string | null;
  story_text: string;
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
  profiles?: { full_name?: string | null } | null;
  likes_count?: number;
  comments_count?: number;
};

type CommentRow = {
  id: string;
  comment_text: string;
  created_at: string;
  profiles?: { full_name?: string | null } | null;
};

type LikerRow = {
  user_id: string;
  profiles?: { full_name?: string | null } | null;
};

const CommunityFeed: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // feed
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // upload
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // filters
  const [filter, setFilter] = useState<"all" | "featured" | "recent">("all");

  // comments modal
  const [openCommentsFor, setOpenCommentsFor] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [newComment, setNewComment] = useState("");

  // likes modal
  const [openLikesFor, setOpenLikesFor] = useState<string | null>(null);
  const [likers, setLikers] = useState<LikerRow[]>([]);

  // my likes set
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());

  // edit/delete
  const [editStoryFor, setEditStoryFor] = useState<Story | null>(null);
  const [editText, setEditText] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** ---------------- utilities ---------------- */
  const curatedAuthor = (id: string) =>
    CURATED.find((c) => c.id === id)?.author ?? null;

const authorName = (s: Story) => {
  // First check if this is a curated story with a predefined author
  const curatedStory = CURATED.find((c) => c.id === s.id);
  if (curatedStory) return curatedStory.author;
  
  // For real user stories, show their actual profile name
  if (s.profiles?.full_name) {
    return s.profiles.full_name;
  }
  
  // Fallback to generic names only if no profile name exists
  return s.is_featured ? "Community Hero" : "Anonymous Volunteer";
};

 const getInitials = (name: string) => {
  // Handle specific curated author names
  if (name === "Tebogo M.") return "TM";
  if (name === "Community Member") return "CM";
  if (name === "Mike R.") return "MR";
  if (name === "Community Hero") return "CH";
  if (name === "Anonymous Volunteer") return "AV";
  
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

  /** Ensure curated stories exist in DB (best-effort) */
const ensureCuratedStories = async () => {
  try {
    const uid = user?.id;
    if (!uid) return;
    
    // Create different user IDs for different authors to show variety
    const rows = CURATED.map((c, index) => ({
      id: c.id,
      user_id: uid, // Keep the same user for database permissions, but...
      story_text: c.story_text,
      image_url: c.image_url,
      is_featured: c.is_featured,
      created_at: c.created_at,
    }));
    
    await supabase
      .from("community_stories")
      .upsert(rows, { onConflict: "id", ignoreDuplicates: true });
  } catch {
    /* ignore */
  }
};

  const maybeSeedIfEmpty = async () => {
    try {
      await V.seedMockStoriesIfEmpty();
    } catch {
      /* ignore */
    }
  };

  const hydrateMyLikes = async () => {
    if (!user) {
      setLikedStories(new Set());
      return;
    }
    const { data } = await supabase
      .from("story_likes")
      .select("story_id")
      .eq("user_id", user.id);
    if (data) setLikedStories(new Set((data as any[]).map((r) => r.story_id)));
  };

  const load = async () => {
    setLoading(true);
    try {
      await ensureCuratedStories();
      await maybeSeedIfEmpty();

      const { data } = await V.listStories();
      const dbStories = ((data as Story[]) || []).sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // guarantee curated cards in UI even if DB rows are missing
      const dbIds = new Set(dbStories.map((s) => s.id));
      const missingCurated = CURATED.filter((c) => !dbIds.has(c.id)).map(
        (c) =>
          ({
            id: c.id,
            user_id: null,
            story_text: c.story_text,
            image_url: c.image_url,
            is_featured: c.is_featured,
            created_at: c.created_at,
            likes_count: 0,
            comments_count: 0,
          } as Story)
      );

      setStories(
        [...missingCurated, ...dbStories].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
      await hydrateMyLikes();
    } catch {
      toast({
        title: "Error loading stories",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    // realtime updates
    const channel = supabase
      .channel("community-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "story_likes" },
        load
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "story_likes" },
        load
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "story_comments" },
        load
      )
      .subscribe();

    // Cleanup MUST NOT return a Promise (fixes TS 2345)
    return () => {
      void supabase.removeChannel(channel); // non-async cleanup
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // file preview (create)
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  const filteredStories = useMemo(() => {
    switch (filter) {
      case "featured":
        return stories.filter((s) => s.is_featured);
      case "recent":
        return stories.slice(0, 10);
      default:
        return stories;
    }
  }, [stories, filter]);

  /** ---------------- actions ---------------- */
  const onUpload = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to share a story.",
        variant: "destructive",
      });
      return;
    }
    if (!caption.trim()) {
      toast({
        title: "Caption required",
        description: "Please add a caption.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      await V.uploadStory(file, caption.trim());
      setFile(null);
      setCaption("");
      setPreviewUrl(null);
      toast({
        title: "Story shared!",
        description: "Thank you for sharing your experience.",
      });
      await load();
    } catch {
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const toggleLike = async (id: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like stories.",
        variant: "destructive",
      });
      return;
    }
    // prevent likes on client-only curated ghosts
    if (!stories.find((s) => s.id === id && s.user_id !== null)) {
      toast({
        title: "Please try again",
        description:
          "Story is loading. If it persists, refresh so the fixed stories sync to the server.",
        variant: "destructive",
      });
      return;
    }

    // optimistic heart
    setStories((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              likes_count: (s.likes_count || 0) + (likedStories.has(id) ? -1 : 1),
            }
          : s
      )
    );
    setLikedStories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

    try {
      await V.toggleLike(id);
    } catch {
      // rollback
      setStories((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                likes_count:
                  (s.likes_count || 0) + (likedStories.has(id) ? 1 : -1),
              }
            : s
        )
      );
      setLikedStories((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
      toast({
        title: "Action failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const openComments = async (id: string) => {
    setOpenCommentsFor(id);
    try {
      const { data } = await V.listStoryComments(id);
      setComments((data as CommentRow[]) || []);
    } catch {
      toast({
        title: "Error loading comments",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const postComment = async () => {
    if (!openCommentsFor || !newComment.trim()) return;
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment.",
        variant: "destructive",
      });
      return;
    }

    const text = newComment.trim();
    // optimistic append + count bump
    const temp: CommentRow = {
      id: `temp-${Date.now()}`,
      comment_text: text,
      created_at: new Date().toISOString(),
      profiles: { full_name: user.user_metadata?.full_name || "You" },
    };
    setComments((prev) => [temp, ...prev]);
    setStories((prev) =>
      prev.map((s) =>
        s.id === openCommentsFor
          ? { ...s, comments_count: (s.comments_count || 0) + 1 }
          : s
      )
    );
    setNewComment("");

    try {
      await V.addStoryComment(openCommentsFor, text);
      await openComments(openCommentsFor);
    } catch {
      setStories((prev) =>
        prev.map((s) =>
          s.id === openCommentsFor
            ? {
                ...s,
                comments_count: Math.max(0, (s.comments_count || 0) - 1),
              }
            : s
        )
      );
      toast({
        title: "Comment failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadLikers = async (id: string) => {
    setOpenLikesFor(id);
    const { data } = await supabase
      .from("story_likes")
      .select("user_id, profiles(full_name)")
      .eq("story_id", id);
    setLikers((data as LikerRow[]) || []);
  };

  // ---- edit/delete helpers ----
  const canEdit = (s: Story) => !!user && s.user_id === user.id && !s.is_featured;

  const beginEdit = (s: Story) => {
    setEditStoryFor(s);
    setEditText(s.story_text);
    setEditFile(null);
  };

  const uploadImageAndGetUrl = async (f: File): Promise<string | null> => {
    if (!user || !f) return null;
    const ext = f.name.split(".").pop() || "jpg";
    const path = `stories/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("stories").upload(path, f, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("stories").getPublicUrl(path);
    return data?.publicUrl ?? null;
  };

  const saveEdit = async () => {
    if (!editStoryFor || !user) return;
    setSavingEdit(true);
    try {
      let newUrl = editStoryFor.image_url;
      if (editFile) {
        newUrl = await uploadImageAndGetUrl(editFile);
      }
      const { error } = await supabase
        .from("community_stories")
        .update({ story_text: editText.trim(), image_url: newUrl })
        .eq("id", editStoryFor.id)
        .eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Story updated" });
      setEditStoryFor(null);
      await load();
    } catch {
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteStory = async (id: string) => {
    if (!user) return;
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("community_stories")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Story deleted" });
      await load();
    } catch {
      toast({
        title: "Delete failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const shareStory = async (s: Story) => {
    const url = `${window.location.origin}/volunteer#story-${s.id}`;
    const text = `"${s.story_text.replace(/^“|”$/g, "")}" — shared on NourishSA`;
    try {
      if (navigator.share) await navigator.share({ title: "NourishSA Story", text, url });
      else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied", description: "Story link copied to clipboard." });
      }
    } catch {
      /* cancelled */
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  /** ---------------- render ---------------- */
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-xl">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
          Community Impact Stories
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Real moments from our volunteer community—like, comment, edit your own, or share.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex justify-center">
        <div className="flex bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/50 dark:border-gray-700/30">
          {[
            { id: "all", label: "All Stories", icon: Users },
            { id: "featured", label: "Featured", icon: Star },
            { id: "recent", label: "Recent", icon: Clock },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                filter === tab.id
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                  : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Upload */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 dark:border-gray-700/30"
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-500 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-teal-500 rounded-full" />
          </div>

          <div className="relative">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Share Your Impact Story</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Inspire others with your volunteer experience
                </p>
              </div>
            </div>

            {previewUrl && (
              <div className="relative mb-6 rounded-2xl overflow-hidden">
                <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="space-y-4">
              <Textarea
                placeholder="Share your volunteer story…"
                className="min-h-[120px] bg-white/50 dark:bg-gray-800/50 border-emerald-200 focus:border-emerald-400 rounded-2xl"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={500}
              />

              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="bg-white/50 dark:bg-gray-800/50 border-emerald-200 focus:border-emerald-400 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">{caption.length}/500</div>
                  <Button
                    onClick={onUpload}
                    disabled={uploading || !caption.trim()}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Sharing…
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Share Story
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stories */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="animate-pulse">
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-3xl p-6">
                <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded-2xl mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredStories.map((story, idx) => (
              <motion.div
                key={story.id}
                id={`story-${story.id}`}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group"
              >
                <div
                  className="relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                  onClick={() => openComments(story.id)} /* open comments */
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
  src={getStoryImage(story.id, story.image_url)}
  alt="Community impact"
  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {story.is_featured && (
                      <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}

                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
                      <Target className="w-3 h-3 mr-1" />
                      Impact Story
                    </Badge>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    {/* author + owner menu */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                        {getInitials(authorName(story))}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{authorName(story)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(story.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {story.is_featured && <Award className="w-5 h-5 text-yellow-500" />}

                      {canEdit(story) && (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            className="rounded-full p-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              const menu = document.getElementById(`menu-${story.id}`);
                              menu?.classList.toggle("hidden");
                            }}
                            title="More"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>

                          <div
                            id={`menu-${story.id}`}
                            className="hidden absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border rounded-xl shadow-xl z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-xl"
                              onClick={() => beginEdit(story)}
                            >
                              <Pencil className="w-4 h-4" /> Edit
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-b-xl disabled:opacity-50"
                              disabled={deletingId === story.id}
                              onClick={() => deleteStory(story.id)}
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* text */}
                    <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-2xl border border-emerald-200/30 dark:border-emerald-700/30">
                      <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                        {story.story_text}
                      </p>
                    </div>

                    {/* actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-4">
                        <button
                          className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            likedStories.has(story.id)
                              ? "bg-red-100 text-red-600 hover:bg-red-200"
                              : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(story.id);
                          }}
                          title="Like"
                        >
                          <Heart
                            className={`w-4 h-4 ${likedStories.has(story.id) ? "fill-current" : ""}`}
                          />
                          <span>{story.likes_count ?? 0}</span>
                        </button>

                        <button
                          className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            openComments(story.id);
                          }}
                          title="Comments"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{story.comments_count ?? 0}</span>
                        </button>

                        {/* View likes list */}
                        <button
                          className="text-sm text-gray-500 hover:text-emerald-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            loadLikers(story.id);
                          }}
                          title="See who liked"
                        >
                          Liked by
                        </button>
                      </div>

                      <button
                        className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          shareStory(story);
                        }}
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredStories.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Camera className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-4">No Stories Yet</h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-8">
            Be the first to share your volunteer experience and inspire the community!
          </p>
          {user && (
            <Button
              onClick={() => document.querySelector("textarea")?.focus()}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Camera className="w-4 h-4 mr-2" />
              Share Your Story
            </Button>
          )}
        </motion.div>
      )}

      {/* Comments modal */}
      <AnimatePresence>
        {openCommentsFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpenCommentsFor(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-white/50 dark:border-gray-700/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Comments</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenCommentsFor(null)}
                  className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-6">
                {comments.map((c) => (
                  <div key={c.id} className="flex items-start space-x-3 p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-2xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(c.profiles?.full_name || "User")}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {c.profiles?.full_name || "Community Member"}
                      </div>
                      <div className="mt-1">{c.comment_text}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(c.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}

                {!comments.length && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>

              {user && (
                <div className="flex gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <Textarea
                    rows={2}
                    placeholder="Share your thoughts…"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-white/50 dark:bg-gray-800/50 border-emerald-200 focus:border-emerald-400 rounded-xl"
                  />
                  <Button
                    onClick={postComment}
                    disabled={!newComment.trim()}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 rounded-xl self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Likes modal */}
      <AnimatePresence>
        {openLikesFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpenLikesFor(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white/95 dark:bg-gray-800/95 rounded-3xl p-6 max-w-md w-full shadow-2xl border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Liked by</h3>
                <Button variant="ghost" size="sm" onClick={() => setOpenLikesFor(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {likers.length ? (
                  likers.map((l) => (
                    <div key={l.user_id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div className="font-medium">
                        {l.profiles?.full_name || "Community Member"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No likes yet.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editStoryFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditStoryFor(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white/95 dark:bg-gray-800/95 rounded-3xl p-6 max-w-lg w-full shadow-2xl border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit story</h3>
                <Button variant="ghost" size="sm" onClick={() => setEditStoryFor(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <Textarea
                  rows={4}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="bg-white/50 dark:bg-gray-800/50 border-emerald-200 focus:border-emerald-400 rounded-xl"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                  className="bg-white/50 dark:bg-gray-800/50 border-emerald-200 focus:border-emerald-400 rounded-xl"
                />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setEditStoryFor(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={saveEdit}
                    disabled={savingEdit || !editText.trim()}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  >
                    {savingEdit ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityFeed;
