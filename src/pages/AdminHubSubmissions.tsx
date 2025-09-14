import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { MapPin, Check, XCircle, Loader2, Globe, Phone, Mail, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Submission = {
  id: string;
  name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  city: string;
  suburb: string;
  address_line1?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  photo_url?: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  created_by?: string | null;
  admin_notes?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
};

export default function AdminHubSubmissions() {
  const [rows, setRows] = useState<Submission[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const { toast } = useToast();

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from("hub_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setRows((data as Submission[]) || []);
    } catch (e: any) {
      toast({
        title: "Error loading submissions",
        description: e.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    setBusy(id);
    try {
      // Try RPC function first
      const { error } = await supabase.rpc("approve_hub_submission", { p_id: id });
      if (error) throw error;
      
      toast({
        title: "Hub approved",
        description: "The hub has been approved and added to the system.",
      });
    } catch (e: any) {
      // Fallback to direct update
      try {
        const { error } = await supabase
          .from("hub_submissions")
          .update({ 
            status: "approved", 
            reviewed_at: new Date().toISOString(),
            admin_notes: "Hub approved and added to system" 
          })
          .eq("id", id);
        
        if (error) throw error;
        
        toast({
          title: "Hub approved",
          description: "The hub has been approved.",
        });
      } catch (fallbackError: any) {
        toast({
          title: "Approval failed",
          description: fallbackError.message || "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setBusy(null);
      load();
    }
  };

  const reject = async (id: string) => {
    setBusy(id);
    try {
      // Try RPC function first
      const { error } = await supabase.rpc("reject_hub_submission", { 
        p_id: id, 
        p_notes: "Does not meet criteria for food assistance hub" 
      });
      if (error) throw error;
      
      toast({
        title: "Hub rejected",
        description: "The submission has been rejected.",
      });
    } catch (e: any) {
      // Fallback to direct update
      try {
        const { error } = await supabase
          .from("hub_submissions")
          .update({ 
            status: "rejected", 
            reviewed_at: new Date().toISOString(),
            admin_notes: "Does not meet criteria for food assistance hub"
          })
          .eq("id", id);
        
        if (error) throw error;
        
        toast({
          title: "Hub rejected",
          description: "The submission has been rejected.",
        });
      } catch (fallbackError: any) {
        toast({
          title: "Rejection failed",
          description: fallbackError.message || "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setBusy(null);
      load();
    }
  };

  const filteredRows = rows.filter(row => {
    if (filter === "all") return true;
    return row.status === filter;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hub Submissions</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Review and manage food hub applications ({filteredRows.length} {filter !== "all" ? filter : "total"})
          </p>
        </div>
        
        {/* Status Filter Tabs */}
        <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === status
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {status} {status !== "all" && `(${rows.filter(r => r.status === status).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      {filteredRows.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No {filter !== "all" ? filter : ""} submissions found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === "pending" 
              ? "All caught up! No pending submissions to review."
              : "Submissions will appear here when available."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRows.map((s) => {
            const maps =
              s.latitude && s.longitude
                ? `https://www.google.com/maps?q=${s.latitude},${s.longitude}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${s.name} ${s.address_line1 ?? ""} ${s.suburb} ${s.city}`
                  )}`;
            
            return (
              <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="grid md:grid-cols-3 gap-6 p-6">
                  {/* Hub Image */}
                  <div className="md:col-span-1">
                    <img
                      src={
                        s.photo_url ||
                        "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1600&auto=format&fit=crop"
                      }
                      alt={s.name}
                      className="w-full h-64 md:h-48 object-cover rounded-xl shadow-sm"
                    />
                  </div>

                  {/* Hub Details */}
                  <div className="md:col-span-2 space-y-5">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{s.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(s.status)}`}>
                            {s.status}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="font-medium">{s.suburb}, {s.city}</span>
                        </div>
                        {s.address_line1 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">
                            {s.address_line1}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Submitted {new Date(s.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Description */}
                    {s.description && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          About This Hub
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {s.description}
                        </p>
                      </div>
                    )}

                    {/* Contact Grid */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {s.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-3 text-emerald-500" />
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Phone</div>
                              <div className="font-medium text-gray-900 dark:text-white">{s.phone}</div>
                            </div>
                          </div>
                        )}
                        {s.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-3 text-emerald-500" />
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                              <div className="font-medium text-gray-900 dark:text-white">{s.email}</div>
                            </div>
                          </div>
                        )}
                        {s.website && (
                          <div className="flex items-center sm:col-span-2">
                            <Globe className="w-4 h-4 mr-3 text-emerald-500" />
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Website</div>
                              <a 
                                href={s.website.startsWith('http') ? s.website : `https://${s.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                              >
                                {s.website}
                              </a>
                            </div>
                          </div>
                        )}
                        {s.latitude && s.longitude && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 sm:col-span-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <strong>GPS Coordinates:</strong> {s.latitude.toFixed(6)}, {s.longitude.toFixed(6)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Notes (if any) */}
                    {s.admin_notes && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Review Notes</h4>
                        <p className="text-blue-700 dark:text-blue-300">{s.admin_notes}</p>
                        {s.reviewed_at && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            Reviewed on {new Date(s.reviewed_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <a href={maps} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          View on Maps
                        </Button>
                      </a>
                      
                      {s.status === "pending" && (
                        <>
                          <Button 
                            onClick={() => approve(s.id)} 
                            disabled={busy === s.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center"
                          >
                            {busy === s.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4 mr-2" />
                            )}
                            Approve Hub
                          </Button>
                          <Button 
                            onClick={() => reject(s.id)} 
                            disabled={busy === s.id}
                            variant="destructive"
                            className="flex items-center"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}

                      {s.status === "approved" && (
                        <div className="flex items-center text-emerald-600 text-sm font-medium">
                          <Check className="w-4 h-4 mr-2" />
                          Hub approved and active
                        </div>
                      )}

                      {s.status === "rejected" && (
                        <div className="flex items-center text-red-600 text-sm font-medium">
                          <XCircle className="w-4 h-4 mr-2" />
                          Submission rejected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}