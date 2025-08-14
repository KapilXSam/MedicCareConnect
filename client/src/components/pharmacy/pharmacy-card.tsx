import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Navigation, Star, Clock, MapPin } from "lucide-react";
import type { Pharmacy } from "@shared/schema";

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  medicine?: {
    name: string;
    price: string;
    stock: number;
  };
  distance?: number;
  status?: "in-stock" | "low-stock" | "out-of-stock";
}

export default function PharmacyCard({ pharmacy, medicine, distance, status }: PharmacyCardProps) {
  const getStatusBadge = () => {
    if (!medicine) return null;
    
    if (status) {
      switch (status) {
        case "in-stock":
          return <Badge className="bg-healthcare-green">In Stock</Badge>;
        case "low-stock":
          return <Badge className="bg-orange-500">Low Stock</Badge>;
        case "out-of-stock":
          return <Badge className="bg-red-500">Out of Stock</Badge>;
        default:
          return null;
      }
    }
    
    if (medicine.stock > 10) {
      return <Badge className="bg-healthcare-green">In Stock</Badge>;
    } else if (medicine.stock > 0) {
      return <Badge className="bg-orange-500">Low Stock</Badge>;
    } else {
      return <Badge className="bg-red-500">Out of Stock</Badge>;
    }
  };

  const getActionButton = () => {
    if (!medicine) {
      return (
        <Button className="bg-medical-blue hover:bg-blue-700 text-sm">
          View Inventory
        </Button>
      );
    }
    
    if (status === "out-of-stock" || medicine.stock === 0) {
      return (
        <Button 
          variant="outline" 
          className="text-sm cursor-not-allowed opacity-50" 
          disabled
        >
          Notify When Available
        </Button>
      );
    }
    
    if (status === "low-stock" || medicine.stock <= 10) {
      return (
        <Button className="bg-orange-500 hover:bg-orange-600 text-sm">
          Reserve Now
        </Button>
      );
    }
    
    return (
      <Button className="bg-medical-blue hover:bg-blue-700 text-sm">
        Reserve
      </Button>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h5 className="font-semibold text-lg">{pharmacy.name}</h5>
            <div className="flex items-start space-x-1 text-sm text-gray-600 mb-1">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{pharmacy.address}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              {distance && (
                <span className="text-healthcare-green font-medium">
                  {distance.toFixed(1)} km away
                </span>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span className={pharmacy.isOpen24Hours ? "text-healthcare-green" : "text-orange-600"}>
                  {pharmacy.isOpen24Hours ? "Open 24/7" : "Limited Hours"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right flex flex-col items-end space-y-2">
            {getStatusBadge()}
            <div className="flex items-center text-sm text-gray-600">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              <span>{pharmacy.rating}</span>
            </div>
          </div>
        </div>
        
        {medicine && (
          <div className="bg-gray-50 p-3 rounded-lg mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{medicine.name}</p>
                <p className="text-healthcare-green font-semibold">₹{medicine.price}</p>
              </div>
              {medicine.stock > 0 && (
                <div className="text-right">
                  <p className="text-xs text-gray-600">Stock: {medicine.stock}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              onClick={() => window.open(`tel:${pharmacy.phone}`, '_self')}
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                const address = encodeURIComponent(pharmacy.address);
                window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
              }}
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
          
          {getActionButton()}
        </div>
      </CardContent>
    </Card>
  );
}
