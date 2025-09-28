// /src/components/admin/AdminHubSubmissions.tsx
import React, { useEffect, useState } from "react";
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

function Pill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleString() : "—");

export default function AdminHubSubmissions() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hub_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSubmissions(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to load submissions",
        description: error.message,
        variant: "destructive"
      });
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleApproval = async (submissionId: string, decision: 'approved' | 'rejected', adminNotes?: string) => {
    setProcessing(submissionId);
    try {
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission) throw new Error('Submission not found');

      // Update submission status
      const { error: updateError } = await supabase
        .from('hub_submissions')
        .update({
          status: decision,
          admin_notes: adminNotes || null,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      // If approved, create actual food hub
      if (decision === 'approved') {
        const hubData = {
          name: submission.name,
          description: submission.description,
          city: submission.city,
          suburb: submission.suburb,
          address: submission.address_line1,
          address_line1: submission.address_line1,
          phone: submission.phone,
          email: submission.email,
          website: submission.website,
          latitude: submission.latitude,
          longitude: submission.longitude,
          photo_url: submission.photo_url,
          is_active: true,
          verified: true
        };

        const { error: hubError } = await supabase
          .from('food_hubs')
          .insert(hubData);

        if (hubError) throw hubError;
      }

      toast({
        title: decision === 'approved' ? "Hub Approved" : "Hub Rejected",
        description: decision === 'approved' 
          ? "The food hub has been approved and added to the platform."
          : "The hub submission has been rejected."
      });

      setSelectedSubmission(null);
      await loadSubmissions();
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

  if (selectedSubmission) {
    const submission = selectedSubmission;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Hub Submission - {submission.name}</h3>
          <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
            Back to List
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>{submission.name}</span>
              <Pill className={
                submission.status === 'approved' ? "bg-emerald-600 text-white" :
                submission.status === 'rejected' ? "bg-rose-600 text-white" : 
                "bg-amber-500 text-white"
              }>
                {submission.status}
              </Pill>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Submitted {new Date(submission.created_at).toLocaleDateString()}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Phone:</strong> {submission.phone || "—"}</p>
                  <p><strong>Email:</strong> {submission.email || "—"}</p>
                  <p><strong>Website:</strong> {submission.website || "—"}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Location</h4>
                <div className="text-sm space-y-1">
                  <p><strong>City:</strong> {submission.city}</p>
                  <p><strong>Suburb:</strong> {submission.suburb || "—"}</p>
                  <p><strong>Address:</strong> {submission.address_line1 || "—"}</p>
                  {submission.latitude && submission.longitude && (
                    <p><strong>Coordinates:</strong> {submission.latitude}, {submission.longitude}</p>
                  )}
                </div>
              </div>
            </div>

            {submission.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm">{submission.description}</p>
              </div>
            )}

            {submission.photo_url && (
              <div>
                <h4 className="font-semibold mb-2">Photo</h4>
                <img src={submission.photo_url} alt="Hub photo" className="max-w-xs rounded-lg" />
              </div>
            )}

            {submission.status === 'pending' && (
              <div className="flex space-x-4 pt-4 border-t">
                <Button
                  onClick={() => handleApproval(submission.id, 'approved')}
                  disabled={processing === submission.id}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Approve Hub
                </Button>
                <Button
                  onClick={() => handleApproval(submission.id, 'rejected')}
                  disabled={processing === submission.id}
                  variant="destructive"
                >
                  Reject Submission
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hub Submissions</CardTitle>
          <CardDescription>Review and approve food hub submissions from users</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hub submissions found
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  onClick={() => setSelectedSubmission(submission)}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{submission.name}</h4>
                        <Pill className={
                          submission.status === 'approved' ? "bg-emerald-600 text-white" :
                          submission.status === 'rejected' ? "bg-rose-600 text-white" : 
                          "bg-amber-500 text-white"
                        }>
                          {submission.status}
                        </Pill>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {submission.city}{submission.suburb ? `, ${submission.suburb}` : ""} • {fmtDate(submission.created_at)}
                      </p>
                      {submission.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {submission.description.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      Click to review →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}