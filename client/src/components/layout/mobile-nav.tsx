import { Link, useLocation } from "wouter";
import { Home, Video, MapPin, User } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Video, label: "Consult", href: "/consultation" },
    { icon: MapPin, label: "Pharmacy", href: "/pharmacy" },
    { icon: User, label: "Profile", href: "/auth" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <button className={`flex flex-col items-center p-2 ${isActive ? 'text-medical-blue' : 'text-gray-600'}`}>
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
