import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Ambulance, Car, Bike, Clock, MapPin, Phone, Star, DollarSign } from "lucide-react";
import type { TransportProvider, TransportBooking } from "@shared/schema";

const transportTypeIcons = {
  ambulance: Ambulance,
  cab: Car,
  motorbike: Bike,
};

const urgencyColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  emergency: "bg-red-100 text-red-800",
};

export default function Transport() {
  const [selectedType, setSelectedType] = useState<"ambulance" | "cab" | "motorbike" | "">("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<TransportProvider | null>(null);
  const [bookingData, setBookingData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    urgency: "medium" as "low" | "medium" | "high" | "emergency",
    specialRequirements: "",
    patientCondition: "",
    contactNumber: "",
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const { data: providers = [], isLoading } = useQuery<TransportProvider[]>({
    queryKey: ["/api/transport/providers/available", { type: selectedType }],
    enabled: !!selectedType,
  });

  const { data: userBookings = [] } = useQuery<TransportBooking[]>({
    queryKey: ["/api/transport/bookings/patient", user?.id],
    enabled: !!user?.id,
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/transport/bookings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transport booking created successfully!",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/transport/bookings/patient", user?.id],
      });
      setShowBookingForm(false);
      setSelectedProvider(null);
      setBookingData({
        pickupLocation: "",
        dropoffLocation: "",
        urgency: "medium",
        specialRequirements: "",
        patientCondition: "",
        contactNumber: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const handleBooking = () => {
    if (!selectedProvider || !user) return;

    const estimatedFare = calculateFare(selectedProvider);
    
    bookingMutation.mutate({
      patientId: user.id,
      providerId: selectedProvider.id,
      type: selectedType,
      ...bookingData,
      estimatedFare,
    });
  };

  const calculateFare = (provider: TransportProvider) => {
    const baseDistance = 5; // Estimated 5km for demo
    return parseFloat(provider.baseFare) + (parseFloat(provider.perKmRate) * baseDistance);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-blue-100 text-blue-800";
      case "en_route": return "bg-purple-100 text-purple-800";
      case "arrived": return "bg-green-100 text-green-800";
      case "in_transit": return "bg-indigo-100 text-indigo-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Emergency Transport Services
          </h1>
          <p className="text-gray-600">
            Quick and reliable transport for medical emergencies
          </p>
        </div>

        {/* Transport Type Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Select Transport Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["ambulance", "cab", "motorbike"] as const).map((type) => {
                const Icon = transportTypeIcons[type];
                return (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    className="h-24 flex-col gap-2"
                    onClick={() => setSelectedType(type)}
                  >
                    <Icon className="h-8 w-8" />
                    <span className="capitalize">{type}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Available Providers */}
        {selectedType && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Available {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading providers...</div>
              ) : providers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No {selectedType} services available right now
                </div>
              ) : (
                <div className="grid gap-4">
                  {providers.map((provider) => (
                    <div key={provider.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{provider.name}</h3>
                          <p className="text-gray-600">{provider.location}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{provider.phone}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{provider.rating} ({provider.totalRatings} reviews)</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm">₹{provider.baseFare} + ₹{provider.perKmRate}/km</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          {provider.driverName && (
                            <Badge variant="secondary">Driver: {provider.driverName}</Badge>
                          )}
                          {provider.vehicleNumber && (
                            <Badge variant="outline">{provider.vehicleNumber}</Badge>
                          )}
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedProvider(provider);
                            setShowBookingForm(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Booking Form */}
        {showBookingForm && selectedProvider && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Book {selectedProvider.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickup">Pickup Location *</Label>
                  <Input
                    id="pickup"
                    value={bookingData.pickupLocation}
                    onChange={(e) => setBookingData({ ...bookingData, pickupLocation: e.target.value })}
                    placeholder="Enter pickup address"
                  />
                </div>
                <div>
                  <Label htmlFor="dropoff">Drop-off Location *</Label>
                  <Input
                    id="dropoff"
                    value={bookingData.dropoffLocation}
                    onChange={(e) => setBookingData({ ...bookingData, dropoffLocation: e.target.value })}
                    placeholder="Enter destination address"
                  />
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select value={bookingData.urgency} onValueChange={(value: any) => setBookingData({ ...bookingData, urgency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Routine Transport</SelectItem>
                      <SelectItem value="medium">Medium - Scheduled Appointment</SelectItem>
                      <SelectItem value="high">High - Urgent Care</SelectItem>
                      <SelectItem value="emergency">Emergency - Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contact">Contact Number *</Label>
                  <Input
                    id="contact"
                    value={bookingData.contactNumber}
                    onChange={(e) => setBookingData({ ...bookingData, contactNumber: e.target.value })}
                    placeholder="Your phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="condition">Patient Condition</Label>
                  <Textarea
                    id="condition"
                    value={bookingData.patientCondition}
                    onChange={(e) => setBookingData({ ...bookingData, patientCondition: e.target.value })}
                    placeholder="Describe patient's condition (optional)"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="requirements">Special Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={bookingData.specialRequirements}
                    onChange={(e) => setBookingData({ ...bookingData, specialRequirements: e.target.value })}
                    placeholder="Any special requirements (wheelchair accessibility, oxygen tank, etc.)"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Estimated Fare</h4>
                <div className="flex justify-between items-center">
                  <span>Base Fare + 5km estimate:</span>
                  <span className="font-semibold text-green-600">₹{calculateFare(selectedProvider).toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">*Final fare may vary based on actual distance and time</p>
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  onClick={handleBooking}
                  disabled={!bookingData.pickupLocation || !bookingData.dropoffLocation || !bookingData.contactNumber || bookingMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {bookingMutation.isPending ? "Booking..." : "Confirm Booking"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedProvider(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Bookings */}
        {userBookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                My Transport Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{booking.type.charAt(0).toUpperCase() + booking.type.slice(1)} Booking</h3>
                        <p className="text-sm text-gray-600">
                          {booking.pickupLocation} → {booking.dropoffLocation}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Booked: {new Date(booking.bookingTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.replace("_", " ")}
                        </Badge>
                        <div className="mt-2">
                          <Badge className={urgencyColors[booking.urgency]}>
                            {booking.urgency}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Contact:</span>
                        <span className="ml-2">{booking.contactNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Estimated Fare:</span>
                        <span className="ml-2 text-green-600">₹{booking.estimatedFare}</span>
                      </div>
                    </div>
                    
                    {booking.patientCondition && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Condition:</span>
                        <span className="ml-2">{booking.patientCondition}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}