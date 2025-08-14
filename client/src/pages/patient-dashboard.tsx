import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useAuth } from "@/App";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { Video, MapPin, Heart, FileText, AlertTriangle, User, Clock, Car } from "lucide-react";
import type { ConsultationWithUsers } from "@/lib/types";

export default function PatientDashboard() {
  const { user } = useAuth();

  const { data: consultations = [], isLoading: consultationsLoading } = useQuery<ConsultationWithUsers[]>({
    queryKey: ["/api/consultations/patient", user?.id],
    enabled: !!user?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ["/api/patients", user?.id, "profile"],
    enabled: !!user?.id,
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

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-dark">Patient Dashboard</h1>
          <p className="text-gray-600">Manage your health consultations and medical needs</p>
        </div>

        {/* Patient Info Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <Link href="/consultation">
                <Button className="bg-emergency-red hover:bg-red-700 text-white">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Emergency
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/consultation">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-blue-50 border-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Video className="h-6 w-6 text-medical-blue" />
                  <h5 className="font-semibold">Quick Consult</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Connect with available doctors instantly</p>
                <div className="flex items-center text-sm text-healthcare-green">
                  <div className="w-2 h-2 bg-healthcare-green rounded-full mr-2"></div>
                  <span>Doctors available</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pharmacy">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-green-50 border-green-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <MapPin className="h-6 w-6 text-healthcare-green" />
                  <h5 className="font-semibold">Find Pharmacy</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Locate nearby pharmacies with medicine stock</p>
                <div className="flex items-center text-sm text-healthcare-green">
                  <div className="w-2 h-2 bg-healthcare-green rounded-full mr-2"></div>
                  <span>Real-time inventory</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/donation">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-purple-50 border-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Heart className="h-6 w-6 text-purple-600" />
                  <h5 className="font-semibold">Request Help</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Get medicine or consultation sponsored</p>
                <div className="flex items-center text-sm text-purple-600">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                  <span>Community support</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/transport">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-orange-50 border-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Car className="h-6 w-6 text-orange-600" />
                  <h5 className="font-semibold">Transport</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Book ambulance, cab, or motorbike transport</p>
                <div className="flex items-center text-sm text-orange-600">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                  <span>Emergency transport</span>
                </div>
              </CardContent>
            </Card>
          </Link>
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
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No consultations yet</p>
                <Link href="/consultation">
                  <Button className="bg-medical-blue hover:bg-blue-700">
                    Start Your First Consultation
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {consultations.slice(0, 5).map((consultation) => (
                  <div key={consultation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-medical-blue rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{consultation.doctor?.name || "Doctor"}</p>
                        <p className="text-sm text-gray-600">
                          {consultation.type === "emergency" ? "Emergency" : "Regular"} Consultation
                        </p>
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
                          "outline"
                        }
                        className={
                          consultation.status === "completed" ? "bg-healthcare-green" :
                          consultation.status === "active" ? "bg-blue-500" :
                          ""
                        }
                      >
                        {consultation.status}
                      </Badge>
                      {consultation.status === "active" && (
                        <Link href={`/consultation/${consultation.id}`}>
                          <Button size="sm" className="bg-medical-blue hover:bg-blue-700">
                            Join
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
      
      <MobileNav />
    </div>
  );
}
