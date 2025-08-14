import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/App";
import { Heart, Stethoscope, Pill, DollarSign } from "lucide-react";

interface DonationFormProps {
  onSubmit: (data: {
    donorName?: string;
    donorEmail?: string;
    amount: string;
    type: string;
    message?: string;
    isAnonymous: boolean;
  }) => void;
  isLoading?: boolean;
}

export default function DonationForm({ onSubmit, isLoading }: DonationFormProps) {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<"consultation" | "medicine" | "general">("consultation");
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState(user?.name || "");
  const [donorEmail, setDonorEmail] = useState(user?.email || "");

  const donationTypes = [
    {
      type: "consultation" as const,
      icon: Stethoscope,
      title: "Consultation",
      amount: "500",
      description: "Fund a medical consultation",
    },
    {
      type: "medicine" as const,
      icon: Pill,
      title: "Medicine",
      amount: "300",
      description: "Help buy essential medicines",
    },
    {
      type: "general" as const,
      icon: Heart,
      title: "General",
      amount: "100",
      description: "Support our mission",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = customAmount || donationTypes.find(t => t.type === selectedType)?.amount || "100";
    
    onSubmit({
      donorName: isAnonymous ? undefined : donorName,
      donorEmail: isAnonymous ? undefined : donorEmail,
      amount,
      type: selectedType,
      message: message.trim() || undefined,
      isAnonymous,
    });

    // Reset form
    setCustomAmount("");
    setMessage("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="h-5 w-5 mr-2 text-purple-600" />
          Make a Donation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Donation Type Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Choose Donation Type</Label>
            <div className="grid grid-cols-1 gap-3">
              {donationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.type}
                    type="button"
                    onClick={() => setSelectedType(type.type)}
                    className={`p-4 rounded-lg text-left transition-colors border-2 ${
                      selectedType === type.type
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-6 w-6 ${
                        selectedType === type.type ? "text-purple-600" : "text-gray-600"
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{type.title}</p>
                          <span className="text-sm font-semibold text-purple-600">₹{type.amount}</span>
                        </div>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <Label htmlFor="custom-amount">Custom Amount (Optional)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="custom-amount"
                type="number"
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="pl-10"
                min="1"
              />
            </div>
            {customAmount && (
              <p className="text-sm text-purple-600 mt-1">
                Custom donation: ₹{customAmount}
              </p>
            )}
          </div>

          {/* Donor Information */}
          {!user && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="donor-name">Your Name</Label>
                <Input
                  id="donor-name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Enter your name"
                  required={!isAnonymous}
                  disabled={isAnonymous}
                />
              </div>
              
              <div>
                <Label htmlFor="donor-email">Email Address</Label>
                <Input
                  id="donor-email"
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="Enter your email"
                  required={!isAnonymous}
                  disabled={isAnonymous}
                />
              </div>
            </div>
          )}

          {/* Anonymous Donation */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Make this donation anonymous
            </Label>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message of Support (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a message of support..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Payment Note */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a demo donation form. In a real implementation, 
              this would integrate with payment gateways like Razorpay, Stripe, or PayPal.
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading || (!customAmount && !selectedType)}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                Donate ₹{customAmount || donationTypes.find(t => t.type === selectedType)?.amount || "100"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
