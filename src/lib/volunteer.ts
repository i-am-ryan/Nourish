// src/lib/volunteer.ts
import { supabase } from "@/lib/supabase";
import type { Profile, VolunteerTask } from "@/lib/supabase";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export type Role = "pickup" | "delivery";

export type GlobalImpact = {
  mealsDelivered: number;
  surplusKg: number;
  hours: number;
};

export interface VolunteerStats {
  user_id: string;
  total_points: number;
  current_level: number;
  tasks_completed: number;
  pickup_tasks: number;
  delivery_tasks: number;
  total_hours: number;
  current_streak: number;
  longest_streak: number;
  last_activity: string | null;
  rank_title: string;
  current_xp?: number;
  tasks_this_week?: number;
}

export interface EarnedBadge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  earned_at: string;
}

export type LeaderboardEntry = {
  user_id: string;
  full_name: string | null;
  tasks_completed: number;
  hours: number;
  points: number;
};

export interface UserStats {
  totalTasks: number;
  tasksThisWeek: number;
  totalHours: number;
  level: number;
  xp: number;
  streak: number;
  badges: string[];
  rank?: string;
  impactPoints: number;
}

type DbLikeCount = { count?: number }[];
type DbCommentCount = { count?: number }[];

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */
async function getUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

/* ------------------------------------------------------------------ */
/* Profile                                                            */
/* ------------------------------------------------------------------ */
export async function getProfile() {
  const uid = await getUserId();
  if (!uid) return { data: null, error: new Error("No user") };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single<Profile>();

  return { data, error };
}


export async function upsertPreferredRole(role: Role) {
  const uid = await getUserId();
  if (!uid) return { error: new Error("No user") };

  const { error } = await supabase
    .from("profiles")
    .update({
      volunteer_role: role,
      volunteer_active: true,
      volunteer_since: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", uid);

  return { error };
}

/* ------------------------------------------------------------------ */
/* Admin helpers for managing volunteer_tasks                          */
/* ------------------------------------------------------------------ */
export async function adminListTasks() {
  return await supabase
    .from("volunteer_tasks")
    .select("*, profiles!assigned_to(full_name, email)")
    .order("created_at", { ascending: false });
}

export async function adminCreateTask(input: Partial<VolunteerTask>) {
  const uid = await getUserId();
  if (!uid) return { data: null, error: new Error("No user") };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, role")
    .eq("id", uid)
    .single();

  if (!profile?.is_admin && profile?.role !== "admin") {
    return { data: null, error: new Error("Admin access required") };
  }

  const { points_reward, ...cleanInput } = (input || {}) as any;

  const payload: Partial<VolunteerTask> = {
    status: "open",
    created_by: uid as any,
    ...cleanInput,
  };

  return await supabase.from("volunteer_tasks").insert(payload).select().single();
}

export async function adminUpdateTask(id: string, updates: Partial<VolunteerTask>) {
  const uid = await getUserId();
  if (!uid) return { data: null, error: new Error("No user") };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, role")
    .eq("id", uid)
    .single();

  if (!profile?.is_admin && profile?.role !== "admin") {
    return { data: null, error: new Error("Admin access required") };
  }

  return await supabase
    .from("volunteer_tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
}

export async function adminDeleteTask(id: string) {
  const uid = await getUserId();
  if (!uid) return { error: new Error("No user") };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, role")
    .eq("id", uid)
    .single();

  if (!profile?.is_admin && profile?.role !== "admin") {
    return { error: new Error("Admin access required") };
  }

  return await supabase.from("volunteer_tasks").delete().eq("id", id);
}

export async function adminAssignToUserEmail(taskId: string, email: string) {
  const uid = await getUserId();
  if (!uid) return { data: null, error: new Error("No user") };

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("is_admin, role")
    .eq("id", uid)
    .single();

  if (!adminProfile?.is_admin && adminProfile?.role !== "admin") {
    return { data: null, error: new Error("Admin access required") };
  }

  const { data: prof, error: pErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (pErr) return { data: null, error: pErr };
  if (!prof?.id) return { data: null, error: new Error("User not found") };

  return await supabase
    .from("volunteer_tasks")
    .update({
      assigned_to: prof.id,
      status: "assigned",
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();
}

/* ------------------------------------------------------------------ */
/* Volunteer tasks (volunteer side)                                   */
/* ------------------------------------------------------------------ */
export async function listOpenTasks(role?: Role) {
  let query = supabase
    .from("volunteer_tasks")
    .select("*")
    .eq("status", "open")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (role) query = query.eq("task_type", role);

  const { data, error } = await query;
  return { data: (data || []) as VolunteerTask[], error };
}

export async function listMyTasks() {
  const uid = await getUserId();
  if (!uid) return { data: [], error: new Error("No user") };

  const { data, error } = await supabase
    .from("volunteer_tasks")
    .select("*")
    .eq("assigned_to", uid)
    .neq("status", "cancelled")
    .order("scheduled_date", { ascending: true })
    .order("created_at", { ascending: false });

  return { data: (data || []) as VolunteerTask[], error };
}

export async function listMyCompletedTasks(limit = 12) {
  const uid = await getUserId();
  if (!uid) return { data: [], error: new Error("No user") };

  const { data, error } = await supabase
    .from("volunteer_tasks")
    .select("*")
    .eq("assigned_to", uid)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(limit);

  return { data: (data || []) as VolunteerTask[], error };
}

/* === NEW: use RPCs so RLS never blocks === */
export async function startTask(taskId: string) {
  const uid = await getUserId();
  if (!uid) return { error: new Error("Not authenticated") };

  const { data, error } = await supabase.rpc('start_volunteer_task', {
    task_id: taskId,
    user_id: uid
  });

  if (error) return { error };
  return { data, error: null };
}

export async function completeTask(taskId: string) {
  const uid = await getUserId();
  if (!uid) return { error: new Error("Not authenticated") };

  console.log('Starting task completion for:', taskId, 'user:', uid);

  try {
    // First, get task details before completion
    const { data: taskDetails, error: taskError } = await supabase
      .from("volunteer_tasks")
      .select("title, task_type, description")
      .eq("id", taskId)
      .single();

    if (taskError) {
      console.error('Error fetching task details:', taskError);
    } else {
      console.log('Task details found:', taskDetails);
    }

    // Complete the task using RPC
    const { data, error } = await supabase.rpc('complete_volunteer_task', {
      task_id: taskId,
      user_id: uid
    });

    if (error) {
      console.error('RPC completion error:', error);
      return { error };
    }

    console.log('Task completion RPC successful:', data);

    // Send completion email notification
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", uid)
        .single();
      
      console.log('Profile found for email:', profile);
      
      if (profile?.email && taskDetails) {
        console.log('Sending completion email...');
        const { sendTaskCompletedNotification } = await import("@/lib/emailService");
        await sendTaskCompletedNotification(
          profile.email,
          profile.full_name || 'Volunteer',
          taskDetails
        );
        console.log('Task completed email sent successfully');
      } else {
        console.log('Missing email or task details:', { email: profile?.email, taskDetails });
      }
    } catch (emailError) {
      console.error('Failed to send task completed email notification:', emailError);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Complete task error:', error);
    return { error };
  }
}

export async function acceptTask(taskId: string) {
  const uid = await getUserId();
  console.log('User ID:', uid);
  console.log('Task ID:', taskId);
  
  if (!uid) return { error: new Error("Not authenticated") };

  try {
    // Simple direct update without the initial check
    console.log('Attempting to update task...');
    
    const { data, error } = await supabase
      .from('volunteer_tasks')
      .update({ 
        status: 'assigned', 
        assigned_to: uid,
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select();

    console.log('Update result:', { data, error });

    if (error) {
      console.error('Supabase error:', error);
      return { error };
    }

    if (!data || data.length === 0) {
      return { error: new Error("No rows updated - task may have been taken") };
    }

    // Award points for accepting
    await awardPoints(uid, 50, 'task_accepted');

    // ADD EMAIL NOTIFICATION HERE
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", uid)
        .single();
      
      if (profile?.email) {
        const { sendTaskAcceptedNotification } = await import("@/lib/emailService");
        await sendTaskAcceptedNotification(
          profile.email,
          profile.full_name || 'Volunteer',
          data[0]  // This is the key fix - data[0] not just data
        );
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    return { data: data[0], error: null };

  } catch (error) {
    console.error('Accept task error:', error);
    return { error };
  }
}

export async function awardPoints(userId: string, points: number, reason: string) {
  try {
    const { error: rpcError } = await supabase.rpc('award_volunteer_points', {
      p_user_id: userId,
      p_points: points,
      p_reason: reason
    });
    
    if (rpcError) {
      console.log('RPC failed, using fallback:', rpcError);
      // Fallback - just insert basic stats
      await supabase
        .from('volunteer_stats')
        .upsert({
          user_id: userId,
          total_points: points,
          current_xp: points,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }
  } catch (error) {
    console.error('Error awarding points:', error);
  }
}

// ADD THESE FUNCTIONS HERE ↓↓↓

// ADD ABOVE HERE ↑↑↑

/* ------------------------------------------------------------------ */
/* Utility functions for UI                                           */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Utility functions for UI                                           */
/* ------------------------------------------------------------------ */
export function formatTaskDate(dateString: string | null): string {
  if (!dateString) return "No date set";

  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

export function getTaskPriorityColor(priority: string): string {
  switch (priority) {
    case "urgent":
      return "from-red-500 to-red-600";
    case "high":
      return "from-orange-500 to-orange-600";
    case "medium":
      return "from-emerald-500 to-teal-600";
    case "low":
      return "from-blue-500 to-cyan-600";
    default:
      return "from-gray-500 to-gray-600";
  }
}

export function getTaskTypeIcon(taskType: string): string {
  switch (taskType) {
    case "pickup":
      return "package";
    case "delivery":
      return "truck";
    default:
      return "heart";
  }
}

/* ------------------------------------------------------------------ */
/* Enhanced Stats & Gamification                                      */
/* ------------------------------------------------------------------ */
export async function getMyStats(): Promise<{ data: VolunteerStats | null; error: any }> {
  const uid = await getUserId();
  if (!uid) return { data: null, error: new Error("No user") };

  const { data, error } = await supabase
    .from("volunteer_stats")
    .select("*")
    .eq("user_id", uid)
    .single<VolunteerStats>();

  if (error && (error as any).code === "PGRST116") {
    return {
      data: {
        user_id: uid,
        total_points: 0,
        current_level: 1,
        tasks_completed: 0,
        pickup_tasks: 0,
        delivery_tasks: 0,
        total_hours: 0,
        current_streak: 0,
        longest_streak: 0,
        last_activity: null,
        rank_title: "Newcomer",
        current_xp: 0,
        tasks_this_week: 0,
      },
      error: null,
    };
  }
  return { data: data || null, error };
}

export async function getUserStats(userId: string): Promise<{ data: UserStats | null; error: any }> {
  try {
    const { data: statsData, error: statsError } = await supabase
      .from("volunteer_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (statsError && statsError.code !== "PGRST116") {
      return { data: null, error: statsError };
    }

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: weeklyTasks } = await supabase
      .from("volunteer_tasks")
      .select("id")
      .eq("assigned_to", userId)
      .eq("status", "completed")
      .gte("completed_at", startOfWeek.toISOString());

    const { data: badges } = await supabase
      .from("user_badges")
      .select("volunteer_badges(name)")
      .eq("user_id", userId);

    const userStats: UserStats = {
      totalTasks: statsData?.tasks_completed || 0,
      tasksThisWeek: weeklyTasks?.length || 0,
      totalHours: Math.round(statsData?.total_hours || 0),
      level: statsData?.current_level || 1,
      xp: statsData?.total_points || 0,
      streak: statsData?.current_streak || 0,
      badges: (badges || [])
        .map((b: any) => b?.volunteer_badges?.name)
        .filter(Boolean),
      rank: statsData?.rank_title || "Newcomer",
      impactPoints: statsData?.total_points || 0,
    };

    return { data: userStats, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function checkAdminStatus(userId: string): Promise<{ data: boolean; error: any }> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin, role")
      .eq("id", userId)
      .single();

    if (error) return { data: false, error };
    return { data: !!(data.is_admin || data.role === "admin"), error: null };
  } catch (error) {
    return { data: false, error };
  }
}

export async function getMyBadges(): Promise<{ data: EarnedBadge[]; error: any }> {
  const uid = await getUserId();
  if (!uid) return { data: [], error: new Error("No user") };

  const { data, error } = await supabase
    .from("user_badges")
    .select("earned_at, volunteer_badges ( id, name, description, icon, color )")
    .eq("user_id", uid)
    .order("earned_at", { ascending: false });

  if (error) return { data: [], error };

  const mapped: EarnedBadge[] =
    (data || []).map((row: any) => ({
      id: row.volunteer_badges?.id,
      name: row.volunteer_badges?.name,
      description: row.volunteer_badges?.description ?? null,
      icon: row.volunteer_badges?.icon ?? null,
      color: row.volunteer_badges?.color ?? null,
      earned_at: row.earned_at,
    })) ?? [];

  return { data: mapped, error: null };
}

export async function getLeaderboard(limit = 10): Promise<{ data: LeaderboardEntry[]; error: any }> {
  try {
    // Use a simpler query that works with your current schema
    const { data, error } = await supabase
      .from("volunteer_stats")
      .select(`
        user_id,
        tasks_completed,
        total_hours,
        total_points
      `)
      .order("total_points", { ascending: false })
      .limit(limit);

    if (error) return { data: [], error };

    // Get profile names separately
    const userIds = (data || []).map(row => row.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const leaderboard: LeaderboardEntry[] = (data || []).map((row: any) => {
      const profile = profiles?.find(p => p.id === row.user_id);
      return {
        user_id: row.user_id,
        full_name: profile?.full_name || 'Anonymous User',
        tasks_completed: row.tasks_completed || 0,
        hours: Math.round(row.total_hours || 0),
        points: row.total_points || 0,
      };
    });

    return { data: leaderboard, error: null };
  } catch (e) {
    return { data: [], error: e };
  }
}

export async function getGlobalImpact(): Promise<{ data: GlobalImpact; error: any }> {
  try {
    const { data, error } = await supabase.rpc("get_global_impact_stats");

    if (error) {
      return {
        data: { mealsDelivered: 47000, surplusKg: 28500, hours: 125800 },
        error,
      };
    }

    const result = (data as any)?.[0] || {};
    return {
      data: {
        mealsDelivered: Number.parseInt(result.meals_delivered) || 47000,
        surplusKg: Number.parseInt(result.surplus_kg) || 28500,
        hours: Number.parseInt(result.hours) || 125800,
      },
      error: null,
    };
  } catch (e) {
    return {
      data: { mealsDelivered: 47000, surplusKg: 28500, hours: 125800 },
      error: e,
    };
  }
}

/* ------------------------------------------------------------------ */
/* Community stories (with likes & comments)                          */
/* ------------------------------------------------------------------ */
export async function listStories() {
  const { data, error } = await supabase
    .from("community_stories")
    .select(`
      id, 
      user_id, 
      story_text, 
      image_url, 
      is_featured, 
      created_at,
      likes_count,
      comments_count,
      profiles!community_stories_user_id_fkey(full_name)
    `)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error('Error fetching stories:', error);
    return { data: [], error };
  }

  const mapped = (data || []).map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    story_text: row.story_text,
    image_url: row.image_url,
    is_featured: row.is_featured,
    created_at: row.created_at,
    likes_count: row.likes_count || 0,
    comments_count: row.comments_count || 0,
    profiles: row.profiles || null
  }));

  return { data: mapped, error: null };
}

export async function uploadStory(file: File | null, caption: string) {
  const uid = await getUserId();
  if (!uid) return { error: new Error("No user") };

  let image_url: string | null = null;

  try {
    if (file) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `stories/${uid}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("stories")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("stories").getPublicUrl(path);
      image_url = pub?.publicUrl || null;
    }

    // Ensure user has a profile before creating story
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", uid)
      .single();

    if (profileError || !profile) {
      const { data: authUser } = await supabase.auth.getUser();
      const email = authUser.user?.email || '';
      const displayName = authUser.user?.user_metadata?.full_name || 
                          authUser.user?.user_metadata?.name || 
                          email.split('@')[0];

      await supabase
        .from("profiles")
        .upsert({
          id: uid,
          email: email,
          full_name: displayName
        });
    }

    const { error: insErr } = await supabase
      .from("community_stories")
      .insert({ 
        user_id: uid, 
        story_text: caption || "", 
        image_url, 
        is_featured: false,
        likes_count: 0,
        comments_count: 0
      });

    return { error: insErr };
  } catch (e) {
    console.error('Error uploading story:', e);
    return { error: e as any };
  }
}

export async function toggleLike(story_id: string) {
  const uid = await getUserId();
  if (!uid) return { error: new Error("No user") };

  const { data } = await supabase
    .from("story_likes")
    .select("id")
    .eq("story_id", story_id)
    .eq("user_id", uid)
    .maybeSingle();

  if (data?.id) {
    const { error } = await supabase.from("story_likes").delete().eq("id", data.id);
    return { error };
  }

  const { error } = await supabase.from("story_likes").insert({ user_id: uid, story_id });
  return { error };
}

export async function addStoryComment(story_id: string, text: string) {
  const uid = await getUserId();
  if (!uid) return { error: new Error("No user") };

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", uid)
      .single();

    if (!profile) {
      const { data: authUser } = await supabase.auth.getUser();
      const email = authUser.user?.email || '';
      const displayName = authUser.user?.user_metadata?.full_name || 
                          authUser.user?.user_metadata?.name || 
                          email.split('@')[0];

      await supabase
        .from("profiles")
        .upsert({
          id: uid,
          email: email,
          full_name: displayName
        });
    }

    const { error } = await supabase
      .from("story_comments")
      .insert({ 
        user_id: uid, 
        story_id, 
        comment_text: text 
      });

    return { error };
  } catch (e) {
    console.error('Error adding comment:', e);
    return { error: e as any };
  }
}

export async function deleteStoryComment(commentId: string) {
  const uid = await getUserId();
  if (!uid) return { error: new Error("No user") };

  try {
    const { error } = await supabase
      .from("story_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", uid); // Only allow deleting own comments

    return { error };
  } catch (e) {
    console.error('Error deleting comment:', e);
    return { error: e as any };
  }
}

export async function listStoryComments(story_id: string) {
  console.log('Fetching comments for story:', story_id);
  
  // Check auth first
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  console.log('Auth user for comments query:', currentUser?.id);

  // Use the simplest possible query
  const { data, error } = await supabase
    .from("story_comments")
    .select("id, comment_text, created_at, user_id")
    .eq("story_id", story_id)
    .order("created_at", { ascending: false });

  console.log('Comments query result:', { data, error });

  if (error) {
    console.error('Error fetching comments:', error);
    return { data: [], error };
  }

  if (!data || data.length === 0) {
    console.log('No comments found for story:', story_id);
    return { data: [], error: null };
  }

  // Get profiles separately with a simple query
  const userIds = [...new Set(data.map(c => c.user_id).filter(Boolean))];
  console.log('User IDs for profiles:', userIds);

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);

  console.log('Profiles result:', { profiles, profileError });

  // Map the results
  const mapped = data.map((comment: any) => {
    const profile = profiles?.find(p => p.id === comment.user_id);
    return {
      id: comment.id,
      comment_text: comment.comment_text,
      created_at: comment.created_at,
      user_id: comment.user_id,
      profiles: profile ? { full_name: profile.full_name } : null
    };
  });

  console.log('Final mapped comments:', mapped);
  return { data: mapped, error: null };
}



/** Seed 3 featured stories once with stable IDs (won't duplicate). */
export async function seedMockStoriesIfEmpty() {
  const FLAG = "nourish_seeded_stories_v2";
  if (typeof localStorage !== "undefined" && localStorage.getItem(FLAG)) return;

  const { data, error } = await supabase.from("community_stories").select("id").limit(1);
  if (error) return;
  if (data && data.length > 0) {
    if (typeof localStorage !== "undefined") localStorage.setItem(FLAG, "1");
    return;
  }

  const samples = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      story_text: `Seeing the smiles when fresh food arrives never gets old! 🥬🌟`,
      image_url:
        "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1600&auto=format&fit=crop",
      is_featured: true,
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      story_text: `Thank you to all volunteers! This food came at the perfect time for our family.`,
      image_url:
        "https://images.unsplash.com/photo-1576765608148-5a38f984b740?q=80&w=1600&auto=format&fit=crop",
      is_featured: true,
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      story_text: `Instead of waste, we create hope. Every loaf saved is a family fed! 🍞❤️`,
      image_url:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
      is_featured: true,
    },
  ];

  try {
    const uid = await getUserId();
    await supabase
      .from("community_stories")
      .upsert(samples.map((s) => ({ ...s, user_id: uid ?? null })), { onConflict: "id" });
  } catch {
    // ignore
  }

  if (typeof localStorage !== "undefined") localStorage.setItem(FLAG, "1");
}
