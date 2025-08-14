import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import PharmacyCard from "@/components/pharmacy/pharmacy-card";
import { Search, MapPin, Navigation, Phone } from "lucide-react";
import type { Pharmacy, PharmacyInventory, Medicine } from "@shared/schema";

interface PharmacyWithMedicine extends PharmacyInventory {
  pharmacy: Pharmacy;
  medicine: Medicine;
}

export default function PharmacyLocator() {
  const [searchMedicine, setSearchMedicine] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchResults, setSearchResults] = useState<PharmacyWithMedicine[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock nearby pharmacies for display when no search is performed
  const { data: allPharmacies = [], isLoading: pharmaciesLoading } = useQuery<Pharmacy[]>({
    queryKey: ["/api/pharmacies"],
  });

  const handleSearch = async () => {
    if (!searchMedicine.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const response = await fetch(`/api/medicines/search?name=${encodeURIComponent(searchMedicine)}`);
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const mockPharmacyData = [
    {
      id: 1,
      name: "Apollo Pharmacy",
      address: "123 Main Street, Andheri West, Mumbai",
      phone: "+91-9876543210",
      isOpen24Hours: true,
      rating: "4.5",
      distance: 0.8,
      medicine: {
        name: "Paracetamol 500mg",
        price: "45",
        stock: 25,
      },
      status: "in-stock" as const,
    },
    {
      id: 2,
      name: "MedPlus Pharmacy",
      address: "456 Park Road, Bandra East, Mumbai",
      phone: "+91-9876543211",
      isOpen24Hours: false,
      rating: "4.2",
      distance: 1.2,
      medicine: {
        name: "Paracetamol 500mg",
        price: "42",
        stock: 3,
      },
      status: "low-stock" as const,
    },
    {
      id: 3,
      name: "Wellness Pharmacy",
      address: "789 Central Avenue, Worli, Mumbai",
      phone: "+91-9876543212",
      isOpen24Hours: false,
      rating: "3.9",
      distance: 2.1,
      medicine: {
        name: "Paracetamol 500mg",
        price: "48",
        stock: 0,
      },
      status: "out-of-stock" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-dark mb-4">Find Nearby Pharmacies</h1>
          <p className="text-gray-600 text-lg">Locate pharmacies with real-time medicine availability</p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search for medicine..."
                  value={searchMedicine}
                  onChange={(e) => setSearchMedicine(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Enter your location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !searchMedicine.trim()}
                className="bg-medical-blue hover:bg-blue-700"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map Placeholder */}
          <Card>
            <CardContent className="p-6">
              <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Interactive Map</p>
                  <p className="text-sm text-gray-500">Showing nearby pharmacies</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            console.log("User location:", position.coords);
                            // Here you would integrate with Google Maps API
                          },
                          (error) => {
                            console.error("Geolocation error:", error);
                          }
                        );
                      }
                    }}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Current Location
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pharmacy Results */}
          <div className="space-y-4">
            {isSearching ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue mx-auto mb-4"></div>
                <p className="text-gray-600">Searching pharmacies...</p>
              </div>
            ) : hasSearched && searchResults.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No pharmacies found</p>
                <p className="text-sm text-gray-500">
                  Try searching for a different medicine or check your location.
                </p>
              </div>
            ) : hasSearched && searchResults.length > 0 ? (
              searchResults.map((result) => (
                <PharmacyCard 
                  key={`${result.pharmacy.id}-${result.medicine.id}`}
                  pharmacy={result.pharmacy}
                  medicine={{
                    name: result.medicine.name,
                    price: result.price || "0",
                    stock: result.stock,
                  }}
                  distance={Math.random() * 3 + 0.5} // Mock distance
                />
              ))
            ) : (
              // Show mock nearby pharmacies when no search performed
              mockPharmacyData.map((pharmacy) => (
                <PharmacyCard 
                  key={pharmacy.id}
                  pharmacy={{
                    id: pharmacy.id,
                    name: pharmacy.name,
                    address: pharmacy.address,
                    phone: pharmacy.phone,
                    isOpen24Hours: pharmacy.isOpen24Hours,
                    rating: pharmacy.rating,
                    latitude: null,
                    longitude: null,
                    openingHours: null,
                  }}
                  medicine={pharmacy.medicine}
                  distance={pharmacy.distance}
                  status={pharmacy.status}
                />
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-blue-50 border-blue-100">
            <CardContent className="p-6 text-center">
              <Search className="h-8 w-8 text-medical-blue mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Medicine Search</h3>
              <p className="text-sm text-gray-600">Search for specific medicines across all pharmacies</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-green-50 border-green-100">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-healthcare-green mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Nearby Pharmacies</h3>
              <p className="text-sm text-gray-600">Find pharmacies near your current location</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-purple-50 border-purple-100">
            <CardContent className="p-6 text-center">
              <Phone className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Call for Delivery</h3>
              <p className="text-sm text-gray-600">Check if medicine delivery is available</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}
