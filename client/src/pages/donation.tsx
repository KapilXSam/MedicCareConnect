import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import DonationForm from "@/components/donation/donation-form";
import { useAuth } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Heart, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Stethoscope, 
  Pill,
  User,
  Clock
} from "lucide-react";
import type { Donation, DonationRequest } from "@shared/schema";

interface DonationStats {
  total: string;
  count: number;
}

export default function Donation() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: donations = [], isLoading: donationsLoading } = useQuery<Donation[]>({
    queryKey: ["/api/donations"],
  });

  const { data: donationRequests = [], isLoading: requestsLoading } = useQuery<DonationRequest[]>({
    queryKey: ["/api/donation-requests"],
  });

  const { data: donationStats } = useQuery<DonationStats>({
    queryKey: ["/api/donations/stats"],
  });

  const createDonationMutation = useMutation({
    mutationFn: async (data: {
      donorName?: string;
      donorEmail?: string;
      amount: string;
      type: string;
      message?: string;
      isAnonymous: boolean;
    }) => {
      const res = await apiRequest("POST", "/api/donations", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/donations/stats"] });
      toast({
        title: "Donation successful",
        description: "Thank you for your generous donation!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Donation failed",
        description: error.message || "Failed to process donation",
        variant: "destructive",
      });
    },
  });

  const createDonationRequestMutation = useMutation({
    mutationFn: async (data: {
      patientId: number;
      type: string;
      amount: string;
      reason: string;
    }) => {
      const res = await apiRequest("POST", "/api/donation-requests", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donation-requests"] });
      toast({
        title: "Request submitted",
        description: "Your donation request has been submitted for review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    },
  });

  const mockStats = {
    totalDonated: donationStats?.total || "250000",
    patientsHelped: "1240",
    consultationsSponsored: "485",
    medicinesProvided: "2100",
  };

  const recentDonations = donations.slice(0, 5).map(donation => ({
    id: donation.id,
    donor: donation.isAnonymous ? "Anonymous" : (donation.donorName || "Anonymous"),
    amount: donation.amount,
    timeAgo: donation.createdAt ? getTimeAgo(new Date(donation.createdAt)) : "Just now",
  }));

  function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Help Others Get Medical Care</h1>
            <p className="text-xl text-purple-100">Your donation can provide free consultations and medicines to those in need</p>
          </div>

          {/* Impact Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300 mb-2">₹{(parseInt(mockStats.totalDonated) / 100000).toFixed(1)}L</div>
              <p className="text-sm text-purple-200">Total Donated</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300 mb-2">{mockStats.patientsHelped}</div>
              <p className="text-sm text-purple-200">Patients Helped</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300 mb-2">{mockStats.consultationsSponsored}</div>
              <p className="text-sm text-purple-200">Free Consultations</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300 mb-2">{mockStats.medicinesProvided}</div>
              <p className="text-sm text-purple-200">Medicines Provided</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Donation Form */}
          <DonationForm onSubmit={createDonationMutation.mutate} isLoading={createDonationMutation.isPending} />

          {/* Recent Activity */}
          <div className="space-y-6">
            {/* Recent Donations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-purple-600" />
                  Recent Donations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {donationsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading donations...</p>
                  </div>
                ) : recentDonations.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No donations yet</p>
                    <p className="text-sm text-gray-500">Be the first to help someone in need!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentDonations.map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between py-3 px-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{donation.donor}</p>
                            <p className="text-xs text-gray-500">{donation.timeAgo}</p>
                          </div>
                        </div>
                        <span className="text-purple-600 font-semibold">₹{donation.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Donation Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-orange-600" />
                  Help Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading requests...</p>
                  </div>
                ) : donationRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active requests</p>
                    {user && user.role === "patient" && (
                      <Button 
                        className="mt-3 bg-orange-600 hover:bg-orange-700"
                        onClick={() => {
                          if (user) {
                            createDonationRequestMutation.mutate({
                              patientId: user.id,
                              type: "consultation",
                              amount: "500",
                              reason: "Emergency medical consultation needed",
                            });
                          }
                        }}
                      >
                        Request Help
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {donationRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="p-4 border border-orange-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">
                              {request.type === "consultation" ? "Medical Consultation" : "Medicine Support"}
                            </p>
                            <p className="text-xs text-gray-600">{request.reason}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-orange-600">₹{request.amount}</p>
                            <Badge 
                              variant={request.status === "pending" ? "outline" : "default"}
                              className="text-xs"
                            >
                              {request.status}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          onClick={() => {
                            createDonationMutation.mutate({
                              amount: request.amount,
                              type: request.type,
                              message: `Donation for ${request.type} request`,
                              isAnonymous: false,
                              donorName: user?.name,
                              donorEmail: user?.email,
                            });
                          }}
                        >
                          Help with ₹{request.amount}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How Donations Help */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="text-center p-6 bg-blue-50 border-blue-100">
            <CardContent className="pt-6">
              <Stethoscope className="h-12 w-12 text-medical-blue mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Free Consultations</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your ₹500 donation can provide a complete medical consultation for someone in need.
              </p>
              <Button 
                className="bg-medical-blue hover:bg-blue-700"
                onClick={() => {
                  createDonationMutation.mutate({
                    amount: "500",
                    type: "consultation",
                    message: "Donation for free consultation",
                    isAnonymous: false,
                    donorName: user?.name,
                    donorEmail: user?.email,
                  });
                }}
              >
                Donate ₹500
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center p-6 bg-green-50 border-green-100">
            <CardContent className="pt-6">
              <Pill className="h-12 w-12 text-healthcare-green mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Medicine Support</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your ₹300 donation can cover essential medicines for emergency treatment.
              </p>
              <Button 
                className="bg-healthcare-green hover:bg-green-700"
                onClick={() => {
                  createDonationMutation.mutate({
                    amount: "300",
                    type: "medicine",
                    message: "Donation for medicine support",
                    isAnonymous: false,
                    donorName: user?.name,
                    donorEmail: user?.email,
                  });
                }}
              >
                Donate ₹300
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center p-6 bg-purple-50 border-purple-100">
            <CardContent className="pt-6">
              <Heart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">General Support</h3>
              <p className="text-sm text-gray-600 mb-4">
                Any amount helps us provide medical aid to those who need it most.
              </p>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  createDonationMutation.mutate({
                    amount: "100",
                    type: "general",
                    message: "General donation for medical aid",
                    isAnonymous: false,
                    donorName: user?.name,
                    donorEmail: user?.email,
                  });
                }}
              >
                Donate ₹100
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}
