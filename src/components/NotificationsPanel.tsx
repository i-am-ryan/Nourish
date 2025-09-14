import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Bell,
  Check,
  Package,
  Heart,
  Users,
  AlertTriangle,
  Info,
  MapPin,
  CalendarClock,
  ExternalLink,
  ClipboardList,
  Trash2,
} from "lucide-react";
import type { Notification } from "@/lib/supabase";

/* ────────────────────────────────────────────────────────────────────
 * Extra payload shape we read from notification.payload
 * (fields are optional; UI guards if missing)
 * ───────────────────────────────────────────────────────────────────*/
type HubLite = { name?: string; city?: string; suburb?: string | null; address?: string };
type NotificationPayload = Partial<{
  donation_id: string;
  title: string;
  dropoff_time: string;
  hub: HubLite;
  maps_url: string;

  task_id: string;
  role: "pickup" | "delivery" | string;
  when: string;

  request_id: string;
  pickup_time: string;

  hub_id: string;

  author: string;
  link: string;
}>;

/* Union of all types we use in the UI */
type NotifType =
  | "donation_created"
  | "donation_match"
  | "bag_request_created"
  | "volunteer_task_assigned"
  | "task_assignment"
  | "claim_update"
  | "hub_registered"
  | "announcement"
  | "system";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selected, setSelected] = useState<Notification | null>(null);

  useEffect(() => {
    if (user && isOpen) void loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isOpen]);

  useEffect(() => {
    if (!user || !isOpen) return;
    const channel = supabase
      .channel("notifications_panel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => void loadNotifications()
      )
      .subscribe();
    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isOpen]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await apiService.getNotifications(user.id);
      if (error) throw error;
      const list = (data || []) as Notification[];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } catch (error: any) {
      console.error("Error loading notifications:", error);
      toast({
        title: "Error Loading Notifications",
        description: error.message || "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await apiService.markNotificationAsRead(notificationId);
      if (error) throw error;
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // Try via apiService first; fall back to direct Supabase if not implemented.
      const res = await (apiService as any).deleteNotification?.(notificationId);
      if (res?.error) throw res.error;
      if (!res) {
        const { error } = await supabase.from("notifications").delete().eq("id", notificationId);
        if (error) throw error;
      }

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => {
        const removed = notifications.find((n) => n.id === notificationId);
        return removed?.is_read ? prev : Math.max(0, prev - 1);
      });

      if (selected?.id === notificationId) setSelected(null);

      toast({ title: "Notification deleted" });
    } catch (error: any) {
      console.error("Delete notification failed:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    await Promise.all(
      notifications.filter((n) => !n.is_read).map((n) => markAsRead(n.id))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type as NotifType) {
      case "donation_created":
      case "donation_match":
        return <Package className="h-5 w-5 text-emerald-600" />;
      case "bag_request_created":
      case "claim_update":
        return <Heart className="h-5 w-5 text-teal-600" />;
      case "volunteer_task_assigned":
      case "task_assignment":
        return <Users className="h-5 w-5 text-purple-600" />;
      case "hub_registered":
        return <ClipboardList className="h-5 w-5 text-blue-600" />;
      case "announcement":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "system":
        return <Info className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type as NotifType) {
      case "donation_created":
      case "donation_match":
        return <Badge className="bg-emerald-600">Donation</Badge>;
      case "bag_request_created":
      case "claim_update":
        return <Badge className="bg-teal-600">Bag</Badge>;
      case "volunteer_task_assigned":
      case "task_assignment":
        return <Badge className="bg-purple-600">Task</Badge>;
      case "hub_registered":
        return <Badge className="bg-blue-600">Hub</Badge>;
      case "announcement":
        return <Badge className="bg-orange-600">Announcement</Badge>;
      case "system":
        return <Badge variant="secondary">System</Badge>;
      default:
        return <Badge variant="secondary">Notification</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const openDetails = async (n: Notification) => {
    setSelected(n);
    if (!n.is_read) await markAsRead(n.id);
  };
  const closeDetails = () => setSelected(null);

  const { announcements, normal } = useMemo(() => {
    const a = notifications.filter((n) => n.type === "announcement");
    const rest = notifications.filter((n) => n.type !== "announcement");
    return { announcements: a, normal: rest };
  }, [notifications]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-emerald-600 to-teal-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 bg-white text-emerald-700">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <Button variant="secondary" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
                ✕
              </Button>
            </div>
          </div>
          <p className="text-xs text-white/90 mt-1">
            Click a message to see full details and actions.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading notifications…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
              <p className="text-gray-600">You’re all caught up!</p>
            </div>
          ) : (
            <>
              {announcements.length > 0 && (
                <div className="p-3">
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Announcements
                  </div>
                  <div className="space-y-3">
                    {announcements.map((n) => (
                      <Card
                        key={n.id}
                        onClick={() => openDetails(n)}
                        className={`cursor-pointer transition-all border-2 hover:border-emerald-400/70 hover:shadow-md hover:bg-orange-50/60 ${
                          !n.is_read ? "bg-orange-50/40 border-orange-200" : "border-transparent"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-sm text-gray-900">{n.title}</h4>
                                {getNotificationBadge(n.type)}
                              </div>
                              <p className="text-sm text-gray-700 mt-1">{n.message}</p>
                              <div className="text-xs text-gray-500 mt-2">
                                {formatTimeAgo(n.created_at)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3">
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Recent
                </div>
                <div className="space-y-3">
                  {normal.map((n) => (
                    <Card
                      key={n.id}
                      onClick={() => openDetails(n)}
                      className={`cursor-pointer transition-all border-2 hover:border-emerald-400/70 hover:shadow-md hover:bg-emerald-50/60 ${
                        !n.is_read ? "bg-emerald-50/40 border-emerald-200" : "border-transparent"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm text-gray-900">{n.title}</h4>
                              <div className="flex items-center gap-2">
                                {getNotificationBadge(n.type)}
                                {!n.is_read && (
                                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" />
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mt-1 line-clamp-2">{n.message}</p>
                            <div className="text-xs text-gray-500 mt-2">
                              {formatTimeAgo(n.created_at)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {notifications.length > 0 && !loading && (
          <div className="p-4 border-t bg-white">
            <Button variant="outline" className="w-full" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          </div>
        )}
      </div>

      {selected && (
        <NotificationDetails
          notification={selected}
          onClose={() => setSelected(null)}
          formatTimeAgo={formatTimeAgo}
          onDelete={deleteNotification}
        />
      )}
    </div>
  );
};

function NotificationDetails({
  notification,
  onClose,
  formatTimeAgo,
  onDelete,
}: {
  notification: Notification;
  onClose: () => void;
  formatTimeAgo: (d: string) => string;
  onDelete: (id: string) => Promise<void>;
}) {
  const payload = (notification as any).payload as NotificationPayload | undefined;

  const computedMapsUrl = React.useMemo(() => {
    if (payload?.maps_url) return payload.maps_url;
    const hub = payload?.hub;
    if (!hub) return "#";
    const q = encodeURIComponent(
      [hub.address, hub.suburb ?? "", hub.city].filter(Boolean).join(", ")
    );
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }, [payload]);

  return (
    <div className="w-full max-w-lg h-full bg-white shadow-2xl border-l border-emerald-100 animate-in slide-in-from-right fixed right-0 top-0 z-[60] flex flex-col">
      <div className="p-4 border-b bg-gradient-to-r from-emerald-600 to-teal-500 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{notification.title}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(notification.id)}
              className="inline-flex items-center gap-1"
              title="Delete notification"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
              ✕
            </Button>
          </div>
        </div>
        <p className="text-xs text-white/90 mt-1">{formatTimeAgo(notification.created_at)}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
            <CardDescription className="text-gray-600">
              {notification.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">

{(notification.type as NotifType) === "donation_created" ||
(notification.type as NotifType) === "donation_match" ? (
  <>
    {payload?.title && (
      <Row label="Item">
        <span className="font-medium">{payload.title}</span>
      </Row>
    )}
    {payload?.dropoff_time && (
      <Row label="Drop-off time">
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="w-4 h-4 text-emerald-600" />
          {payload.dropoff_time}
        </span>
      </Row>
    )}
    
    {/* Enhanced hub location section */}
    {payload?.hub ? (
      <Row label="Drop-off Location">
        <div className="space-y-3">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200">
            <div className="font-semibold text-emerald-800 dark:text-emerald-200">
              {payload.hub.name || 'Food Hub Location'}
            </div>
            <div className="text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {[payload.hub.suburb, payload.hub.city].filter(Boolean).join(" • ") || 'Location details available'}
            </div>
            {payload.hub.address && (
              <div className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                📍 {payload.hub.address}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200">
            💡 Bring this donation to the location above during your scheduled drop-off time
          </div>
        </div>
      </Row>
    ) : (
      <Row label="Drop-off Location">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200">
          <div className="text-yellow-800 dark:text-yellow-200 text-sm">
            Location details will be provided via email or phone
          </div>
        </div>
      </Row>
    )}

    <div className="mt-4">
      {payload?.hub && computedMapsUrl !== "#" ? (
        <Button asChild className="rounded-xl w-full bg-emerald-600 hover:bg-emerald-700">
          <a href={computedMapsUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Get Directions to Drop-off Location
          </a>
        </Button>
      ) : (
        <Button 
          className="rounded-xl w-full bg-blue-600 hover:bg-blue-700" 
          onClick={() => window.location.href = '/donate'}
        >
          View My Donations
        </Button>
      )}
    </div>
  </>
) : null}

{(notification.type as NotifType) === "volunteer_task_assigned" ||
(notification.type as NotifType) === "task_assignment" ? (
  <>
    {payload?.role && (
      <Row label="Role">
        <span className="font-medium capitalize text-blue-600">{payload.role}</span>
      </Row>
    )}
    {payload?.when && (
      <Row label="When">
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="w-4 h-4 text-emerald-600" />
          {payload.when}
        </span>
      </Row>
    )}
    {payload?.hub && (
      <Row label="Location">
        <div className="space-y-2">
          <div className="font-medium text-gray-900 dark:text-gray-100">{payload.hub.name}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-blue-600" />
            {[payload.hub.city, payload.hub.suburb].filter(Boolean).join(" • ")}
          </div>
          {payload.hub.address && (
            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
              📍 {payload.hub.address}
            </div>
          )}
        </div>
      </Row>
    )}
    
    {/* Task details if available */}
    {payload?.task_id && (
      <Row label="Task Details">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            Click below to view full task details and accept the assignment
          </div>
        </div>
      </Row>
    )}

    <div className="mt-4 space-y-2">
      <Button asChild className="rounded-xl w-full bg-blue-600 hover:bg-blue-700">
        <a href="/volunteer" target="_blank" rel="noopener noreferrer">
          <ExternalLink className="w-4 h-4 mr-2" />
          View Task in Volunteer Dashboard
        </a>
      </Button>
      {payload?.hub && (
        <Button asChild variant="outline" className="rounded-xl w-full">
          <a href={computedMapsUrl} target="_blank" rel="noreferrer">
            <MapPin className="w-4 h-4 mr-2" />
            Get Directions to Location
          </a>
        </Button>
      )}
    </div>
  </>
) : null}

            {(notification.type as NotifType) === "bag_request_created" ? (
              <>
                {payload?.pickup_time && (
                  <Row label="Pickup time">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="w-4 h-4 text-emerald-600" />
                      {payload.pickup_time}
                    </span>
                  </Row>
                )}
                {payload?.hub && (
                  <Row label="Hub">
                    <div>
                      <div className="font-medium">{payload.hub.name}</div>
                      <div className="text-sm text-gray-600">
                        {[payload.hub.city, payload.hub.suburb].filter(Boolean).join(" • ")}
                      </div>
                      {payload.hub.address && (
                        <div className="text-sm text-gray-600">{payload.hub.address}</div>
                      )}
                    </div>
                  </Row>
                )}
              </>
            ) : null}

            {(notification.type as NotifType) === "hub_registered" && payload?.hub ? (
              <Row label="Hub">
                <div>
                  <div className="font-medium">{payload.hub.name}</div>
                  <div className="text-sm text-gray-600">
                    {[payload.hub.city, payload.hub.suburb].filter(Boolean).join(" • ")}
                  </div>
                  {payload.hub.address && (
                    <div className="text-sm text-gray-600">{payload.hub.address}</div>
                  )}
                </div>
              </Row>
            ) : null}

            {(notification.type as NotifType) === "announcement" ? (
              <>
                {payload?.author && (
                  <Row label="Posted by">
                    <span className="font-medium">{payload.author}</span>
                  </Row>
                )}
                {payload?.link && (
                  <div>
                    <Button asChild className="rounded-xl">
                      <a href={payload.link} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Read more
                      </a>
                    </Button>
                  </div>
                )}
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground w-28 shrink-0">
        {label}
      </span>
      <div className="text-sm">{children}</div>
    </div>
  );
}
