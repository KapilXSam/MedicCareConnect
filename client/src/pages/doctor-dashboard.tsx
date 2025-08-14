import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import { useAuth } from "@/App";
import Header from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Video, Clock, User, Star, CheckCircle, AlertCircle } from "lucide-react";
import type { ConsultationWithUsers, DoctorWithUser } from "@/lib/types";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: doctorProfile } = useQuery<DoctorWithUser>({
    queryKey: ["/api/doctors", user?.id, "profile"],
    enabled: !!user?.id,
  });

  const { data: consultations = [], isLoading: consultationsLoading } = useQuery<ConsultationWithUsers[]>({
    queryKey: ["/api/consultations/doctor", user?.id],
    enabled: !!user?.id,
  });

  const availabilityMutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      const res = await apiRequest("PUT", `/api/doctors/${user?.id}/availability`, { isAvailable });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors", user?.id, "profile"] });
      toast({
        title: "Availability updated",
        description: "Your availability status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update availability.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">Please sign in to access your dashboard.</p>
              <Link href="/auth">
                <Button className="mt-4 bg-medical-blue hover:bg-blue-700">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user.isVerified) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verification Pending</h3>
              <p className="text-gray-600 mb-4">
                Your doctor profile is currently under review. You'll be able to access your dashboard once verification is complete.
              </p>
              <p className="text-sm text-gray-500">
                This process typically takes 24-48 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-dark">Doctor Dashboard</h1>
          <p className="text-gray-600">Manage your consultations and availability</p>
        </div>

        {/* Doctor Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-medical-blue rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Dr. {user.name}</h4>
                  <p className="text-sm text-gray-600">{doctorProfile?.specialization}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      <span>{doctorProfile?.rating || "0"} ({doctorProfile?.totalRatings || 0} reviews)</span>
                    </div>
                    <Badge 
                      variant={user.isVerified ? "default" : "secondary"}
                      className={user.isVerified ? "bg-healthcare-green" : ""}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Available</span>
                  <Switch
                    checked={doctorProfile?.isAvailable || false}
                    onCheckedChange={(checked) => availabilityMutation.mutate(checked)}
                    disabled={availabilityMutation.isPending}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-medical-blue mb-2">
                {consultations.filter(c => c.status === "pending").length}
              </div>
              <p className="text-sm text-gray-600">Pending Requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-healthcare-green mb-2">
                {consultations.filter(c => c.status === "completed").length}
              </div>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {consultations.length}
              </div>
              <p className="text-sm text-gray-600">Total Consultations</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                ₹{doctorProfile?.consultationFee || "0"}
              </div>
              <p className="text-sm text-gray-600">Consultation Fee</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Consultations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            {consultationsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading consultations...</p>
              </div>
            ) : consultations.length === 0 ? (
              <div className="text-center py-8">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No consultations yet</p>
                <p className="text-sm text-gray-500">
                  Make sure your availability is turned on to receive consultation requests.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {consultations.slice(0, 10).map((consultation) => (
                  <div key={consultation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{consultation.patient?.name || "Patient"}</p>
                        <p className="text-sm text-gray-600">
                          {consultation.type === "emergency" ? "Emergency" : "Regular"} Consultation
                        </p>
                        {consultation.symptoms && (
                          <p className="text-xs text-gray-500 mt-1">
                            Symptoms: {consultation.symptoms.substring(0, 50)}...
                          </p>
                        )}
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {consultation.createdAt ? new Date(consultation.createdAt).toLocaleDateString() : "Unknown date"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={
                          consultation.status === "completed" ? "default" : 
                          consultation.status === "active" ? "secondary" : 
                          consultation.status === "pending" ? "outline" :
                          "outline"
                        }
                        className={
                          consultation.status === "completed" ? "bg-healthcare-green" :
                          consultation.status === "active" ? "bg-blue-500" :
                          consultation.status === "pending" ? "bg-orange-500 text-white" :
                          ""
                        }
                      >
                        {consultation.status}
                      </Badge>
                      {(consultation.status === "pending" || consultation.status === "active") && (
                        <Link href={`/consultation/${consultation.id}`}>
                          <Button size="sm" className="bg-medical-blue hover:bg-blue-700">
                            {consultation.status === "pending" ? "Accept" : "Continue"}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
