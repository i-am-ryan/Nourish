import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, AlertCircle, Phone, MapPin, User, Heart, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const VerificationForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    experience: '',
    motivation: '',
    availability: '',
    backgroundCheckConsent: false,
    wantsTaskNotifications: false // NEW FIELD
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.backgroundCheckConsent) {
      toast({
        title: "Consent Required",
        description: "Please consent to the background check to proceed",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('volunteer_verification_requests')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          emergency_contact_name: formData.emergencyContactName,
          emergency_contact_phone: formData.emergencyContactPhone,
          experience: formData.experience,
          motivation: formData.motivation,
          availability: formData.availability,
          background_check_consent: formData.backgroundCheckConsent,
          wants_task_notifications: formData.wantsTaskNotifications // NEW FIELD
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Verification Request Submitted",
        description: formData.wantsTaskNotifications 
          ? "Your request will be reviewed within 2-3 business days. You'll receive task notifications once approved."
          : "Your request will be reviewed within 2-3 business days."
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-8 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Application Submitted!</h3>
          <p className="text-gray-600 mb-4">
            Thank you for applying to become a verified volunteer. We'll review your application and get back to you within 2-3 business days.
          </p>
          {formData.wantsTaskNotifications && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-center space-x-2 text-blue-800">
                <Bell className="w-5 h-5" />
                <span className="font-medium">Task notifications enabled</span>
              </div>
              <p className="text-sm text-blue-700 mt-2">
                Once approved, you'll automatically receive email notifications when new volunteer tasks are created.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Become a Verified Volunteer</CardTitle>
          <p className="text-gray-600">
            Join our trusted community of verified volunteers and unlock additional opportunities to make a difference.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Full Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Street address, city, postal code"
                  required
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Phone className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold">Emergency Contact</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContactName">Contact Name *</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactPhone">Contact Phone *</Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Volunteer Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold">Volunteer Information</h3>
              </div>

              <div>
                <Label htmlFor="motivation">Why do you want to volunteer? *</Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                  placeholder="Tell us what motivates you to help your community..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="experience">Previous Volunteer Experience (Optional)</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  placeholder="Describe any previous volunteer work or relevant experience..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="availability">Availability *</Label>
                <Textarea
                  id="availability"
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                  placeholder="When are you typically available? (e.g., weekends, weekday evenings, etc.)"
                  rows={2}
                  required
                />
              </div>
            </div>

            {/* NEW: Task Notifications Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Task Notifications</h4>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="taskNotifications"
                  checked={formData.wantsTaskNotifications}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, wantsTaskNotifications: !!checked})
                  }
                />
                <Label htmlFor="taskNotifications" className="text-sm text-blue-800">
                  Get notified when new volunteer tasks are created
                </Label>
              </div>
              <p className="text-xs text-blue-700 mt-2 ml-6">
                Once verified, you'll receive email notifications about new tasks that match your interests.
              </p>
            </div>

            {/* Consent */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="backgroundCheck"
                  checked={formData.backgroundCheckConsent}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, backgroundCheckConsent: !!checked})
                  }
                />
                <Label htmlFor="backgroundCheck" className="text-sm">
                  I consent to a background check being performed as part of the volunteer verification process. *
                </Label>
              </div>
              <p className="text-xs text-amber-700 mt-2 ml-6">
                This helps ensure the safety of our community and the people we serve.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {loading ? "Submitting..." : "Submit Verification Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VerificationForm;