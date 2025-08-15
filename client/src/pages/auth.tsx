import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";
import Header from "@/components/layout/header";
import { Heart, Stethoscope } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { apiRequest } from "@/lib/queryClient";

interface AuthData {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

interface DoctorProfileData {
  userId: string;
  licenseNumber: string;
  specialization: string;
  experience: number;
  location: string;
  consultationFee: string;
}

export default function Auth() {
  const [, setLocation] = useLocation();
  const { setUser } = useAuth();
  const { toast } = useToast();
  
  const [loginData, setLoginData] = useState<AuthData>({
    email: "",
    password: "",
  });
  
  const [registerData, setRegisterData] = useState<AuthData>({
    email: "",
    password: "",
    name: "",
    role: "patient",
  });

  const [doctorProfile, setDoctorProfile] = useState<Omit<DoctorProfileData, 'userId'>>({
    licenseNumber: "",
    specialization: "",
    experience: 0,
    location: "",
    consultationFee: "0",
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (data.user) {
      const user = await apiRequest("GET", `/api/users/${data.user.id}`).then(res => res.json());
      setUser(user);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      if (user.role === "doctor") {
        setLocation("/doctor-dashboard");
      } else if (user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/patient-dashboard");
      }
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: registerData.email,
      password: registerData.password,
      options: {
        data: {
          name: registerData.name,
          role: registerData.role,
        }
      }
    });

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (data.user) {
      const user = await apiRequest("POST", "/api/auth/register", { ...registerData, id: data.user.id }).then(res => res.json());
      setUser(user);
      toast({
        title: "Registration successful",
        description: "Welcome to MediHelp! Please check your email to verify your account.",
      });

      if (registerData.role === "doctor") {
        try {
          await apiRequest("POST", "/api/doctors/profile", {
            ...doctorProfile,
            userId: data.user.id,
          });
          toast({
            title: "Doctor profile created",
            description: "Your profile is pending verification.",
          });
        } catch (error) {
          console.error("Failed to create doctor profile:", error);
        }
        setLocation("/doctor-dashboard");
      } else {
        setLocation("/patient-dashboard");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-medical-blue rounded-xl flex items-center justify-center">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-neutral-dark">
              Welcome to MediHelp
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-medical-blue hover:bg-blue-700"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="register-role">I am a</Label>
                    <Select value={registerData.role} onValueChange={(value) => setRegisterData({ ...registerData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {registerData.role === "doctor" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Stethoscope className="h-4 w-4" />
                        <span>Doctor Profile Information</span>
                      </div>
                      
                      <div>
                        <Label htmlFor="license">Medical License Number</Label>
                        <Input
                          id="license"
                          value={doctorProfile.licenseNumber}
                          onChange={(e) => setDoctorProfile({ ...doctorProfile, licenseNumber: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                          id="specialization"
                          value={doctorProfile.specialization}
                          onChange={(e) => setDoctorProfile({ ...doctorProfile, specialization: e.target.value })}
                          placeholder="e.g., General Medicine, Cardiology"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input
                          id="experience"
                          type="number"
                          value={doctorProfile.experience}
                          onChange={(e) => setDoctorProfile({ ...doctorProfile, experience: parseInt(e.target.value) || 0 })}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={doctorProfile.location}
                          onChange={(e) => setDoctorProfile({ ...doctorProfile, location: e.target.value })}
                          placeholder="City, State"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="fee">Consultation Fee (₹)</Label>
                        <Input
                          id="fee"
                          type="number"
                          value={doctorProfile.consultationFee}
                          onChange={(e) => setDoctorProfile({ ...doctorProfile, consultationFee: e.target.value })}
                          placeholder="0 for free consultations"
                        />
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-medical-blue hover:bg-blue-700"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
