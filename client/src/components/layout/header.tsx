import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, Menu } from "lucide-react";
import { useAuth } from "@/App";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
  console.log("Header component - about to call useAuth");
  const { user, setUser } = useAuth();
  console.log("Header component - user:", user);

  const handleSignOut = () => {
    setUser(null);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 bg-medical-blue rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-neutral-dark">MediHelp</h1>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/consultation" className="text-gray-600 hover:text-medical-blue transition-colors">
              For Patients
            </Link>
            <Link href="/doctor-dashboard" className="text-gray-600 hover:text-medical-blue transition-colors">
              For Doctors
            </Link>
            <Link href="/pharmacy" className="text-gray-600 hover:text-medical-blue transition-colors">
              Pharmacies
            </Link>
            <Link href="/donation" className="text-gray-600 hover:text-medical-blue transition-colors">
              Donate
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href={user.role === "doctor" ? "/doctor-dashboard" : user.role === "admin" ? "/admin" : "/patient-dashboard"}>
                  <Button variant="outline">
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={handleSignOut} variant="ghost">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button className="bg-medical-blue text-white hover:bg-blue-700">
                  Sign In
                </Button>
              </Link>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  <Link href="/consultation" className="text-gray-600 hover:text-medical-blue transition-colors">
                    For Patients
                  </Link>
                  <Link href="/doctor-dashboard" className="text-gray-600 hover:text-medical-blue transition-colors">
                    For Doctors
                  </Link>
                  <Link href="/pharmacy" className="text-gray-600 hover:text-medical-blue transition-colors">
                    Pharmacies
                  </Link>
                  <Link href="/donation" className="text-gray-600 hover:text-medical-blue transition-colors">
                    Donate
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
