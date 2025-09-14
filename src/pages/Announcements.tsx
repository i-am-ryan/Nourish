import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Megaphone } from "lucide-react";

type Ann = {
  id: string;
  title: string;
  body: string;
  link_url: string | null;
  is_published: boolean;
  created_at: string;
};

export default function AdminAnnouncements() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [list, setList] = useState<Ann[]>([]);
  const [loading, setLoading] = useState(false);

  const isAdmin = profile?.role === "admin";

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setList((data as Ann[]) || []);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const publish = async () => {
    if (!isAdmin) {
      toast({ title: "Forbidden", description: "Admins only.", variant: "destructive" });
      return;
    }
    if (!title.trim() || !body.trim()) {
      toast({ title: "Missing fields", description: "Title and body are required." });
      return;
    }
    setPublishing(true);
    const { error } = await supabase.from("announcements").insert({
      author_id: user?.id ?? null,
      title: title.trim(),
      body: body.trim(),
      link_url: link.trim() || null,
      is_published: true, // trigger will broadcast
    } as any);
    setPublishing(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTitle(""); setBody(""); setLink("");
      toast({ title: "Announcement published", description: "Sent to all users' notifications." });
      load();
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            You don’t have access to this page.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            <CardTitle>Create announcement</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short, clear title" />
          </div>
          <div className="space-y-2">
            <Label>Body</Label>
            <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message that all users will see" />
          </div>
          <div className="space-y-2">
            <Label>Optional link (learn more)</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://example.org/update" />
          </div>
          <div className="flex justify-end">
            <Button onClick={publish} disabled={publishing} className="bg-emerald-600 hover:bg-emerald-700">
              {publishing ? "Publishing…" : "Publish to all users"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Previous announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : list.length === 0 ? (
            <div className="text-sm text-gray-600">None yet.</div>
          ) : (
            <ul className="divide-y">
              {list.map((a) => (
                <li key={a.id} className="py-3">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{a.body}</div>
                  {a.link_url && (
                    <a className="text-emerald-700 text-sm hover:underline" href={a.link_url} target="_blank" rel="noreferrer">
                      {a.link_url}
                    </a>
                  )}
                  <div className="text-xs text-gray-500 mt-1">{new Date(a.created_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
