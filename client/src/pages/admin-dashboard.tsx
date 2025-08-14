import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/App";
import Header from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  UserCheck, 
  Video, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Stethoscope,
  Heart,
  Pill,
  AlertTriangle
} from "lucide-react";
import type { DoctorWithUser, ConsultationWithUsers } from "@/lib/types";

interface AdminStats {
  activePatients: number;
  verifiedDoctors: number;
  totalConsultations: number;
  totalDonations: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: adminStats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: pendingDoctors = [], isLoading: doctorsLoading } = useQuery<DoctorWithUser[]>({
    queryKey: ["/api/admin/pending-doctors"],
  });

  const { data: pendingConsultations = [], isLoading: consultationsLoading } = useQuery<ConsultationWithUsers[]>({
    queryKey: ["/api/admin/pending-consultations"],
  });

  const verifyDoctorMutation = useMutation({
    mutationFn: async ({ userId, isVerified }: { userId: number; isVerified: boolean }) => {
      const res = await apiRequest("PUT", `/api/admin/doctors/${userId}/verify`, { isVerified });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Doctor verification updated",
        description: "The doctor's verification status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update doctor verification.",
        variant: "destructive",
      });
    },
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const mockRecentActivity = [
    {
      id: "1",
      type: "user_registration",
      description: "New patient registration: Rahul Kumar",
      timestamp: "5 minutes ago",
      icon: User,
      iconColor: "text-blue-500",
    },
    {
      id: "2",
      type: "consultation",
      description: "Consultation completed by Dr. Sarah Johnson",
      timestamp: "12 minutes ago",
      icon: Video,
      iconColor: "text-green-500",
    },
    {
      id: "3",
      type: "donation",
      description: "New donation received: ₹1,000",
      timestamp: "1 hour ago",
      icon: Heart,
      iconColor: "text-purple-500",
    },
    {
      id: "4",
      type: "medicine",
      description: "Medicine reserved at Apollo Pharmacy",
      timestamp: "2 hours ago",
      icon: Pill,
      iconColor: "text-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-dark">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor platform activity and manage users</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Patients</p>
                  <p className="text-2xl font-bold text-medical-blue">
                    {statsLoading ? "..." : adminStats?.activePatients.toLocaleString() || "0"}
                  </p>
                </div>
                <Users className="h-8 w-8 text-medical-blue" />
              </div>
              <div className="mt-2 text-sm text-healthcare-green">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                <span>+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Verified Doctors</p>
                  <p className="text-2xl font-bold text-healthcare-green">
                    {statsLoading ? "..." : adminStats?.verifiedDoctors || "0"}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-healthcare-green" />
              </div>
              <div className="mt-2 text-sm text-healthcare-green">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                <span>+{pendingDoctors.length} pending</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Consultations</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {statsLoading ? "..." : adminStats?.totalConsultations.toLocaleString() || "0"}
                  </p>
                </div>
                <Video className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2 text-sm text-healthcare-green">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                <span>+{pendingConsultations.length} pending</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Donations</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{statsLoading ? "..." : (parseInt(adminStats?.totalDonations || "0") / 100000).toFixed(1) + "L"}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mt-2 text-sm text-healthcare-green">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                <span>+₹15K this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Doctor Verifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-medical-blue" />
                Pending Doctor Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doctorsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading pending verifications...</p>
                </div>
              ) : pendingDoctors.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">All doctors are verified!</p>
                  <p className="text-sm text-gray-500">No pending verifications at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingDoctors.map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-medical-blue rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Dr. {doctor.user.name}</p>
                          <p className="text-sm text-gray-600">{doctor.specialization}</p>
                          <p className="text-xs text-gray-500">
                            License: {doctor.licenseNumber} • {doctor.experience} years exp.
                          </p>
                          <p className="text-xs text-gray-500">{doctor.location}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-healthcare-green hover:bg-green-700"
                          onClick={() => verifyDoctorMutation.mutate({ userId: doctor.userId, isVerified: true })}
                          disabled={verifyDoctorMutation.isPending}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => verifyDoctorMutation.mutate({ userId: doctor.userId, isVerified: false })}
                          disabled={verifyDoctorMutation.isPending}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.iconColor === "text-blue-500" ? "bg-blue-100" :
                        activity.iconColor === "text-green-500" ? "bg-green-100" :
                        activity.iconColor === "text-purple-500" ? "bg-purple-100" :
                        "bg-orange-100"
                      }`}>
                        <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Consultations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2 text-purple-600" />
              Pending Consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {consultationsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading consultations...</p>
              </div>
            ) : pendingConsultations.length === 0 ? (
              <div className="text-center py-8">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending consultations</p>
                <p className="text-sm text-gray-500">All consultations are being handled by doctors.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Patient</th>
                      <th className="text-left py-3 px-4">Doctor</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Symptoms</th>
                      <th className="text-left py-3 px-4">Requested</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingConsultations.map((consultation) => (
                      <tr key={consultation.id} className="border-b">
                        <td className="py-3 px-4">{consultation.patient?.name || "Unknown"}</td>
                        <td className="py-3 px-4">Dr. {consultation.doctor?.name || "Unknown"}</td>
                        <td className="py-3 px-4">
                          <Badge variant={consultation.type === "emergency" ? "destructive" : "outline"}>
                            {consultation.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-sm truncate">
                            {consultation.symptoms || "No symptoms provided"}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {consultation.createdAt ? new Date(consultation.createdAt).toLocaleDateString() : "Unknown"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-orange-500">Pending</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
