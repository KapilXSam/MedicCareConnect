import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/App";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import VideoInterface from "@/components/consultation/video-interface";
import { 
  Video, 
  Phone, 
  MessageCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Star,
  Send,
  Stethoscope,
  Heart
} from "lucide-react";
import type { DoctorWithUser, ConsultationWithUsers } from "@/lib/types";

export default function Consultation() {
  const [, params] = useRoute("/consultation/:id?");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithUser | null>(null);
  const [consultationType, setConsultationType] = useState<"regular" | "emergency">("regular");
  const [symptoms, setSymptoms] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [isInConsultation, setIsInConsultation] = useState(false);

  const consultationId = params?.id ? parseInt(params.id) : null;

  // Fetch available doctors
  const { data: availableDoctors = [], isLoading: doctorsLoading } = useQuery<DoctorWithUser[]>({
    queryKey: ["/api/doctors/available"],
  });

  // Fetch existing consultation if ID provided
  const { data: existingConsultation, isLoading: consultationLoading } = useQuery<ConsultationWithUsers>({
    queryKey: ["/api/consultations", consultationId],
    enabled: !!consultationId,
  });

  // Create consultation mutation
  const createConsultationMutation = useMutation({
    mutationFn: async (data: {
      patientId: number;
      doctorId: number;
      type: string;
      symptoms: string;
    }) => {
      const res = await apiRequest("POST", "/api/consultations", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Consultation requested",
        description: "Your consultation request has been sent to the doctor.",
      });
      setLocation(`/consultation/${data.id}`);
      setIsInConsultation(true);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create consultation",
        variant: "destructive",
      });
    },
  });

  // Update consultation mutation
  const updateConsultationMutation = useMutation({
    mutationFn: async (data: { status?: string; diagnosis?: string; prescription?: string; notes?: string }) => {
      if (!consultationId) throw new Error("No consultation ID");
      const res = await apiRequest("PUT", `/api/consultations/${consultationId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations", consultationId] });
      toast({
        title: "Consultation updated",
        description: "Consultation details have been updated.",
      });
    },
  });

  useEffect(() => {
    if (existingConsultation) {
      setIsInConsultation(existingConsultation.status === "active");
    }
  }, [existingConsultation]);

  const handleStartConsultation = () => {
    if (!user) {
      setLocation("/auth");
      return;
    }

    if (!selectedDoctor) {
      toast({
        title: "Select a doctor",
        description: "Please select a doctor to start the consultation.",
        variant: "destructive",
      });
      return;
    }

    createConsultationMutation.mutate({
      patientId: user.id,
      doctorId: selectedDoctor.userId,
      type: consultationType,
      symptoms,
    });
  };

  const handleAcceptConsultation = () => {
    updateConsultationMutation.mutate({ status: "active" });
    setIsInConsultation(true);
  };

  const handleCompleteConsultation = (diagnosis: string, prescription: string, notes: string) => {
    updateConsultationMutation.mutate({ 
      status: "completed", 
      diagnosis, 
      prescription, 
      notes 
    });
    setIsInConsultation(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <Heart className="h-12 w-12 text-medical-blue mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sign in Required</h3>
              <p className="text-gray-600 mb-4">Please sign in to start a consultation.</p>
              <Button 
                onClick={() => setLocation("/auth")}
                className="bg-medical-blue hover:bg-blue-700"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (consultationId && consultationLoading) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading consultation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isInConsultation && (existingConsultation || consultationId)) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Header />
        <VideoInterface 
          consultation={existingConsultation}
          onComplete={handleCompleteConsultation}
          currentUser={user}
        />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Banner */}
        <div className="bg-emergency-red text-white p-4 rounded-lg mb-8">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
            <div>
              <h3 className="font-semibold">Need Emergency Help?</h3>
              <p className="text-sm text-red-100">Connect with available doctors instantly for urgent medical concerns.</p>
            </div>
            <Button 
              onClick={() => setConsultationType("emergency")}
              variant="secondary" 
              className="bg-white text-emergency-red hover:bg-red-50 ml-auto"
            >
              Emergency Consult
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Doctor Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                {doctorsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading doctors...</p>
                  </div>
                ) : availableDoctors.length === 0 ? (
                  <div className="text-center py-8">
                    <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No doctors available right now</p>
                    <p className="text-sm text-gray-500">Please try again later or create an emergency request.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableDoctors.map((doctor) => (
                      <div 
                        key={doctor.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedDoctor?.id === doctor.id 
                            ? "border-medical-blue bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedDoctor(doctor)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-medical-blue rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Dr. {doctor.user.name}</h4>
                              <p className="text-sm text-gray-600">{doctor.specialization}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                  <span>{doctor.rating} ({doctor.totalRatings} reviews)</span>
                                </div>
                                <span className="text-sm text-gray-500">{doctor.experience} years exp.</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-healthcare-green mb-2">Available</Badge>
                            <p className="text-sm font-semibold">
                              {doctor.consultationFee === "0" ? "Free" : `₹${doctor.consultationFee}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Consultation Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Start Consultation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="type">Consultation Type</Label>
                  <Select value={consultationType} onValueChange={(value: "regular" | "emergency") => setConsultationType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular Consultation</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="symptoms">Describe Your Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Please describe your symptoms, concerns, or medical questions..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={4}
                  />
                </div>

                {selectedDoctor && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">Selected Doctor:</p>
                    <p className="text-sm text-blue-600">Dr. {selectedDoctor.user.name}</p>
                    <p className="text-xs text-blue-500">{selectedDoctor.specialization}</p>
                  </div>
                )}

                <Button 
                  onClick={handleStartConsultation}
                  disabled={!selectedDoctor || !symptoms.trim() || createConsultationMutation.isPending}
                  className="w-full bg-medical-blue hover:bg-blue-700"
                >
                  {createConsultationMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Requesting...
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Start Consultation
                    </>
                  )}
                </Button>

                {consultationType === "emergency" && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-600">
                      Emergency consultations are prioritized and will connect you with the first available doctor.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Consultation */}
            {existingConsultation && existingConsultation.status === "pending" && user.role === "doctor" && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Pending Consultation Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Patient: {existingConsultation.patient?.name}</p>
                      <p className="text-sm text-gray-600">Type: {existingConsultation.type}</p>
                    </div>
                    
                    {existingConsultation.symptoms && (
                      <div>
                        <p className="text-sm font-medium">Symptoms:</p>
                        <p className="text-sm text-gray-600">{existingConsultation.symptoms}</p>
                      </div>
                    )}

                    <Button 
                      onClick={handleAcceptConsultation}
                      disabled={updateConsultationMutation.isPending}
                      className="w-full bg-healthcare-green hover:bg-green-700"
                    >
                      Accept Consultation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}
