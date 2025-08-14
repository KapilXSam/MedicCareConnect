import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Video, MapPin, User, Users, Stethoscope, AlertTriangle, Phone } from "lucide-react";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />
      
      {/* Emergency Banner */}
      <div className="bg-emergency-red text-white py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <span className="font-medium">Need immediate medical help?</span>
            <Link href="/consultation">
              <Button variant="secondary" size="sm" className="bg-white text-emergency-red hover:bg-red-50">
                Emergency Consult
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-medical-blue to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Instant Medical Aid
                <span className="text-blue-200 block">When You Need It Most</span>
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Connect with verified doctors instantly. Get free or low-cost consultations, prescriptions, and find nearby pharmacies with medicine availability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/consultation">
                  <Button size="lg" className="bg-white text-medical-blue hover:bg-blue-50 font-semibold">
                    <Video className="mr-2 h-5 w-5" />
                    Start Free Consultation
                  </Button>
                </Link>
                <Link href="/pharmacy">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-medical-blue font-semibold">
                    Find Pharmacies
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="w-full aspect-video bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Stethoscope className="h-16 w-16 mx-auto mb-4 text-white/80" />
                    <p className="text-white/90 font-medium">Doctor Consultation Interface</p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-healthcare-green rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">24/7 Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-neutral-dark mb-4">How MediHelp Works</h3>
            <p className="text-gray-600 text-lg">Three simple steps to get the medical help you need</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 bg-blue-50 border-blue-100">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-medical-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Sign Up & Describe</h4>
                <p className="text-gray-600">Quick registration and describe your medical concern or emergency</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-green-50 border-green-100">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-healthcare-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Connect with Doctor</h4>
                <p className="text-gray-600">Get connected instantly with verified doctors via video, audio, or chat</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-purple-50 border-purple-100">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Get Treatment</h4>
                <p className="text-gray-600">Receive prescription and find nearby pharmacies with medicine availability</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-16 bg-neutral-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-neutral-dark mb-4">Quick Access</h3>
            <p className="text-gray-600 text-lg">Get started with MediHelp services</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/consultation">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-blue-50 border-blue-100">
                <CardContent className="p-6">
                  <Video className="h-8 w-8 text-medical-blue mb-4" />
                  <h5 className="font-semibold mb-2">Quick Consult</h5>
                  <p className="text-sm text-gray-600 mb-3">Connect with available doctors instantly</p>
                  <div className="flex items-center text-sm text-healthcare-green">
                    <div className="w-2 h-2 bg-healthcare-green rounded-full mr-2"></div>
                    <span>Doctors online</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pharmacy">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-green-50 border-green-100">
                <CardContent className="p-6">
                  <MapPin className="h-8 w-8 text-healthcare-green mb-4" />
                  <h5 className="font-semibold mb-2">Find Pharmacy</h5>
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
                  <Heart className="h-8 w-8 text-purple-600 mb-4" />
                  <h5 className="font-semibold mb-2">Request Help</h5>
                  <p className="text-sm text-gray-600 mb-3">Get medicine or consultation sponsored</p>
                  <div className="flex items-center text-sm text-purple-600">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                    <span>Community support</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/auth">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-orange-50 border-orange-100">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-orange-600 mb-4" />
                  <h5 className="font-semibold mb-2">Join as Doctor</h5>
                  <p className="text-sm text-gray-600 mb-3">Provide medical help to those in need</p>
                  <div className="flex items-center text-sm text-orange-600">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                    <span>Verification required</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-dark text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-medical-blue rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold">MediHelp</h1>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting patients with doctors instantly. Free and affordable medical consultations for everyone.
              </p>
            </div>

            <div>
              <h6 className="font-semibold mb-4">For Patients</h6>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/consultation" className="hover:text-white transition-colors">Emergency Consultation</Link></li>
                <li><Link href="/auth" className="hover:text-white transition-colors">Find Doctors</Link></li>
                <li><Link href="/pharmacy" className="hover:text-white transition-colors">Find Pharmacies</Link></li>
                <li><Link href="/patient-dashboard" className="hover:text-white transition-colors">Medical Records</Link></li>
              </ul>
            </div>

            <div>
              <h6 className="font-semibold mb-4">For Doctors</h6>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/auth" className="hover:text-white transition-colors">Join as Doctor</Link></li>
                <li><Link href="/doctor-dashboard" className="hover:text-white transition-colors">Doctor Portal</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Verification Process</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h6 className="font-semibold mb-4">Support</h6>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 MediHelp. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      <MobileNav />
    </div>
  );
}
