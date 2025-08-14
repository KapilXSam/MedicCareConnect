export interface PharmacyWithInventory {
  id: number;
  name: string;
  address: string;
  phone: string;
  latitude: string | null;
  longitude: string | null;
  isOpen24Hours: boolean;
  openingHours: any;
  rating: string;
  distance?: number;
  medicine?: {
    id: number;
    name: string;
    price: string;
    stock: number;
  };
}

export interface DoctorWithUser {
  id: number;
  userId: number;
  licenseNumber: string;
  specialization: string;
  experience: number;
  location: string;
  isAvailable: boolean;
  consultationFee: string;
  rating: string;
  totalRatings: number;
  user: {
    id: number;
    email: string;
    name: string;
    phone: string | null;
    role: string;
    isVerified: boolean;
    createdAt: Date | null;
    password: string;
  };
}

export interface ConsultationWithUsers {
  id: number;
  patientId: number;
  doctorId: number;
  status: string;
  type: string;
  symptoms: string | null;
  diagnosis: string | null;
  prescription: string | null;
  notes: string | null;
  scheduledAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date | null;
  patient?: {
    id: number;
    email: string;
    name: string;
    phone: string | null;
    role: string;
    isVerified: boolean;
    createdAt: Date | null;
    password: string;
  };
  doctor?: {
    id: number;
    email: string;
    name: string;
    phone: string | null;
    role: string;
    isVerified: boolean;
    createdAt: Date | null;
    password: string;
  };
}
