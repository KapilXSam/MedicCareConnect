import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertDoctorProfileSchema, insertPatientProfileSchema, insertConsultationSchema, insertDonationSchema, insertDonationRequestSchema, insertRatingSchema, insertTransportProviderSchema, insertTransportBookingSchema } from "@shared/schema";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = authSchema;
const registerSchema = authSchema.extend({
  name: z.string().min(1),
  role: z.enum(["patient", "doctor"]),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create user
      const user = await storage.createUser(data);
      
      // Create profile based on role
      if (data.role === "patient") {
        await storage.createPatientProfile({ userId: user.id });
      }

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user || user.password !== data.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Login failed" });
    }
  });

  // Doctor routes
  app.post("/api/doctors/profile", async (req, res) => {
    try {
      const data = insertDoctorProfileSchema.parse(req.body);
      const profile = await storage.createDoctorProfile(data);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create doctor profile" });
    }
  });

  app.get("/api/doctors/available", async (req, res) => {
    try {
      const doctors = await storage.getAvailableDoctors();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available doctors" });
    }
  });

  app.put("/api/doctors/:userId/availability", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { isAvailable } = req.body;
      
      const profile = await storage.updateDoctorProfile(userId, { isAvailable });
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: "Failed to update availability" });
    }
  });

  // Patient routes
  app.get("/api/patients/:userId/profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getPatientProfile(userId);
      res.json(profile);
    } catch (error) {
      res.status(404).json({ message: "Profile not found" });
    }
  });

  app.put("/api/patients/:userId/profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const updates = insertPatientProfileSchema.partial().parse(req.body);
      
      const profile = await storage.updatePatientProfile(userId, updates);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  // Consultation routes
  app.post("/api/consultations", async (req, res) => {
    try {
      const data = insertConsultationSchema.parse(req.body);
      const consultation = await storage.createConsultation(data);
      res.json(consultation);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create consultation" });
    }
  });

  app.get("/api/consultations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const consultation = await storage.getConsultation(id);
      
      if (!consultation) {
        return res.status(404).json({ message: "Consultation not found" });
      }
      
      res.json(consultation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consultation" });
    }
  });

  app.put("/api/consultations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertConsultationSchema.partial().parse(req.body);
      
      const consultation = await storage.updateConsultation(id, updates);
      res.json(consultation);
    } catch (error) {
      res.status(400).json({ message: "Failed to update consultation" });
    }
  });

  app.get("/api/consultations/patient/:patientId", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const consultations = await storage.getConsultationsByPatient(patientId);
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consultations" });
    }
  });

  app.get("/api/consultations/doctor/:doctorId", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const consultations = await storage.getConsultationsByDoctor(doctorId);
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consultations" });
    }
  });

  // Pharmacy routes
  app.get("/api/pharmacies", async (req, res) => {
    try {
      const pharmacies = await storage.getPharmacies();
      res.json(pharmacies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pharmacies" });
    }
  });

  app.get("/api/pharmacies/nearby", async (req, res) => {
    try {
      const { lat, lng, radius = 10 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const pharmacies = await storage.getNearbyPharmacies(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseFloat(radius as string)
      );
      
      res.json(pharmacies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nearby pharmacies" });
    }
  });

  app.get("/api/pharmacies/:id/inventory", async (req, res) => {
    try {
      const pharmacyId = parseInt(req.params.id);
      const inventory = await storage.getPharmacyInventory(pharmacyId);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pharmacy inventory" });
    }
  });

  app.get("/api/medicines/search", async (req, res) => {
    try {
      const { name } = req.query;
      
      if (!name) {
        return res.status(400).json({ message: "Medicine name is required" });
      }
      
      const results = await storage.searchMedicineInPharmacies(name as string);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search medicines" });
    }
  });

  // Donation routes
  app.post("/api/donations", async (req, res) => {
    try {
      const data = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation(data);
      res.json(donation);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create donation" });
    }
  });

  app.get("/api/donations", async (req, res) => {
    try {
      const donations = await storage.getDonations();
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  app.get("/api/donations/stats", async (req, res) => {
    try {
      const stats = await storage.getDonationStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donation stats" });
    }
  });

  // Donation request routes
  app.post("/api/donation-requests", async (req, res) => {
    try {
      const data = insertDonationRequestSchema.parse(req.body);
      const request = await storage.createDonationRequest(data);
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create donation request" });
    }
  });

  app.get("/api/donation-requests", async (req, res) => {
    try {
      const requests = await storage.getDonationRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donation requests" });
    }
  });

  // Rating routes
  app.post("/api/ratings", async (req, res) => {
    try {
      const data = insertRatingSchema.parse(req.body);
      const rating = await storage.createRating(data);
      await storage.updateDoctorRating(data.doctorId);
      res.json(rating);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create rating" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/pending-doctors", async (req, res) => {
    try {
      const doctors = await storage.getPendingDoctorVerifications();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending doctor verifications" });
    }
  });

  app.put("/api/admin/doctors/:userId/verify", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { isVerified } = req.body;
      
      const user = await storage.updateUser(userId, { isVerified });
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to verify doctor" });
    }
  });

  app.get("/api/admin/pending-consultations", async (req, res) => {
    try {
      const consultations = await storage.getPendingConsultations();
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending consultations" });
    }
  });

  // Transport Provider routes
  app.get("/api/transport/providers", async (req, res) => {
    try {
      const { type } = req.query;
      const providers = await storage.getTransportProviders(type as "ambulance" | "cab" | "motorbike" | undefined);
      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transport providers" });
    }
  });

  app.get("/api/transport/providers/available", async (req, res) => {
    try {
      const { type } = req.query;
      if (!type) {
        return res.status(400).json({ message: "Transport type is required" });
      }
      const providers = await storage.getAvailableTransportProviders(type as "ambulance" | "cab" | "motorbike");
      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available transport providers" });
    }
  });

  app.post("/api/transport/providers", async (req, res) => {
    try {
      const data = insertTransportProviderSchema.parse(req.body);
      const provider = await storage.createTransportProvider(data);
      res.json(provider);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create transport provider" });
    }
  });

  app.put("/api/transport/providers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const provider = await storage.updateTransportProvider(id, updates);
      res.json(provider);
    } catch (error) {
      res.status(400).json({ message: "Failed to update transport provider" });
    }
  });

  // Transport Booking routes
  app.post("/api/transport/bookings", async (req, res) => {
    try {
      const data = insertTransportBookingSchema.parse(req.body);
      const booking = await storage.createTransportBooking(data);
      res.json(booking);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create transport booking" });
    }
  });

  app.get("/api/transport/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getTransportBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Transport booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transport booking" });
    }
  });

  app.get("/api/transport/bookings/patient/:patientId", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const bookings = await storage.getPatientTransportBookings(patientId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient transport bookings" });
    }
  });

  app.get("/api/transport/bookings/provider/:providerId", async (req, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      const bookings = await storage.getProviderTransportBookings(providerId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch provider transport bookings" });
    }
  });

  app.put("/api/transport/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const booking = await storage.updateTransportBooking(id, updates);
      res.json(booking);
    } catch (error) {
      res.status(400).json({ message: "Failed to update transport booking" });
    }
  });

  app.get("/api/transport/bookings/pending", async (req, res) => {
    try {
      const bookings = await storage.getPendingTransportBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending transport bookings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
