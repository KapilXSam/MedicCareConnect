import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageCircle,
  Send,
  User,
  FileText,
  Clock,
  Pill,
} from "lucide-react";
import type { ConsultationWithUsers, User as UserType } from "@/lib/types";

interface VideoInterfaceProps {
  consultation: ConsultationWithUsers | undefined;
  onComplete: (diagnosis: string, prescription: string, notes: string) => void;
  currentUser: UserType;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isDoctor: boolean;
}

export default function VideoInterface({ consultation, onComplete, currentUser }: VideoInterfaceProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: consultation?.doctor?.name || "Doctor",
      message: "Hello! How can I help you today?",
      timestamp: new Date(),
      isDoctor: true,
    },
  ]);
  const [sessionDuration, setSessionDuration] = useState("15:42");
  
  // Pill form state
  const [diagnosis, setDiagnosis] = useState(consultation?.diagnosis || "");
  const [prescription, setPrescription] = useState(consultation?.prescription || "");
  const [notes, setNotes] = useState(consultation?.notes || "");
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  const isDoctor = currentUser.role === "doctor";
  const otherUser = isDoctor ? consultation?.patient : consultation?.doctor;

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: currentUser.name,
      message: chatMessage,
      timestamp: new Date(),
      isDoctor: currentUser.role === "doctor",
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatMessage("");
  };

  const handleCompleteConsultation = () => {
    onComplete(diagnosis, prescription, notes);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-healthcare-green rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="text-white">
              <p className="font-medium">{otherUser?.name || "User"}</p>
              <p className="text-sm text-gray-300">
                {isDoctor ? "Patient" : `Dr. ${otherUser?.name}` || "Doctor"}
              </p>
            </div>
            <Badge className="bg-green-500 text-white">Online</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-white text-sm">{sessionDuration}</span>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-red-400 hover:text-red-300"
              onClick={() => onComplete(diagnosis, prescription, notes)}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Video Area */}
          <div className="flex-1 bg-gray-800 relative">
            {/* Main video (other person) */}
            <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-white/80" />
                </div>
                <p className="text-white/90 font-medium">{otherUser?.name || "User"}</p>
                <p className="text-white/70 text-sm">Video consultation in progress</p>
              </div>
            </div>
            
            {/* Self video (small overlay) */}
            <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-lg overflow-hidden border-2 border-white/20">
              <div className="w-full h-full bg-blue-200 flex items-center justify-center">
                {isVideoOn ? (
                  <User className="h-8 w-8 text-gray-600" />
                ) : (
                  <VideoOff className="h-8 w-8 text-gray-400" />
                )}
              </div>
            </div>

            {/* Call controls */}
            <div className="absolute bottom-4 left-4 flex space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className={`w-12 h-12 rounded-full ${isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'} text-white`}
                onClick={() => setIsAudioOn(!isAudioOn)}
              >
                {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`w-12 h-12 rounded-full ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'} text-white`}
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full text-white"
                onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h6 className="font-semibold">Chat</h6>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <div className={`p-2 rounded-lg ${
                      msg.isDoctor === (currentUser.role === "doctor")
                        ? "bg-medical-blue text-white ml-8"
                        : "bg-gray-100 mr-8"
                    }`}>
                      <p>{msg.message}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className={`text-xs ${
                          msg.isDoctor === (currentUser.role === "doctor")
                            ? "text-blue-200"
                            : "text-gray-500"
                        }`}>
                          {msg.sender}
                        </span>
                        <span className={`text-xs ${
                          msg.isDoctor === (currentUser.role === "doctor")
                            ? "text-blue-200"
                            : "text-gray-500"
                        }`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button 
                  onClick={handleSendMessage}
                  size="icon"
                  className="bg-medical-blue hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Notes (for doctors) */}
        {isDoctor && (
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h6 className="font-semibold mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-medical-blue" />
                    Patient Information
                  </h6>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white p-3 rounded-lg border-l-4 border-medical-blue">
                      <p className="font-medium text-medical-blue">Symptoms:</p>
                      <p className="text-gray-700">{consultation?.symptoms || "No symptoms recorded"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border-l-4 border-healthcare-green">
                      <p className="font-medium text-healthcare-green">Type:</p>
                      <p className="text-gray-700">{consultation?.type || "Regular"} consultation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h6 className="font-semibold mb-3 flex items-center">
                    <Pill className="h-4 w-4 mr-2 text-healthcare-green" />
                    Consultation Notes
                  </h6>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Diagnosis</label>
                      <Textarea
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Enter diagnosis..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Pill</label>
                      <Textarea
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                        placeholder="Enter prescription..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Additional Notes</label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter additional notes..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                    <Button 
                      onClick={handleCompleteConsultation}
                      className="w-full bg-healthcare-green hover:bg-green-700 text-sm"
                    >
                      Complete Consultation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
