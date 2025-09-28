import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Shield, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { sendVerificationApprovedNotification } from "@/lib/emailService";

const AdminVerification: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('volunteer_verification_requests')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to load requests",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDecision = async (requestId: string, decision: 'approved' | 'rejected', adminNotes: string = '') => {
    setProcessing(requestId);
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      // Update verification request
      const { error: updateError } = await supabase
        .from('volunteer_verification_requests')
        .update({
          status: decision,
          admin_notes: adminNotes,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, update profile and potentially set volunteer_active
      if (decision === 'approved') {
        const profileUpdates: any = { is_verified_volunteer: true };
        
        // The trigger will automatically set volunteer_active if wants_task_notifications is true
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', request.user_id);

        if (profileError) throw profileError;

        // Send approval email
        try {
          await sendVerificationApprovedNotification(
            request.profiles.email,
            request.profiles.full_name || request.full_name
          );
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
        }
      }

      toast({
        title: decision === 'approved' ? "Request Approved" : "Request Rejected",
        description: decision === 'approved' 
          ? request.wants_task_notifications
            ? "The volunteer has been verified and will receive task notifications."
            : "The volunteer has been verified."
          : "The request has been rejected."
      });

      await loadRequests();
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 pt-20">
        <div className="text-center">Loading verification requests...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 pt-20">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-8 h-8 text-emerald-600" />
        <h1 className="text-2xl font-bold">Volunteer Verification Requests</h1>
      </div>

      <div className="grid gap-6">
        {requests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{request.full_name}</span>
                    <Badge variant={
                      request.status === 'approved' ? 'default' :
                      request.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {request.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {request.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {request.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                      {request.status}
                    </Badge>
                    {/* Show notification preference */}
                    {request.wants_task_notifications && (
                      <Badge variant="outline" className="bg-blue-50 border-blue-200">
                        <Bell className="w-3 h-3 mr-1 text-blue-600" />
                        <span className="text-blue-700">Wants notifications</span>
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {request.profiles.email} • Applied {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Phone:</strong> {request.phone}</p>
                    <p><strong>Address:</strong> {request.address}</p>
                    <p><strong>Emergency Contact:</strong> {request.emergency_contact_name} ({request.emergency_contact_phone})</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Availability</h4>
                  <p className="text-sm">{request.availability}</p>
                  
                  {/* Show notification preference */}
                  {request.wants_task_notifications && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <Bell className="w-4 h-4" />
                        <span className="text-sm font-medium">Wants task notifications</span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        Will receive emails when new tasks are created
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Motivation</h4>
                <p className="text-sm">{request.motivation}</p>
              </div>

              {request.experience && (
                <div>
                  <h4 className="font-semibold mb-2">Previous Experience</h4>
                  <p className="text-sm">{request.experience}</p>
                </div>
              )}

              {request.status === 'pending' && (
                <div className="flex space-x-4 pt-4 border-t">
                  <Button
                    onClick={() => handleDecision(request.id, 'approved')}
                    disabled={processing === request.id}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleDecision(request.id, 'rejected')}
                    disabled={processing === request.id}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="text-center py-16">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Verification Requests</h3>
          <p className="text-gray-600">All verification requests will appear here for review.</p>
        </div>
      )}
    </div>
  );
};

export default AdminVerification;