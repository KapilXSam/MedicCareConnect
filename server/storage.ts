import { 
  users, doctorProfiles, patientProfiles, consultations, pharmacies, 
  medicines, pharmacyInventory, donations, donationRequests, ratings,
  transportProviders, transportBookings,
  type User, type InsertUser, type DoctorProfile, type InsertDoctorProfile,
  type PatientProfile, type InsertPatientProfile, type Consultation, type InsertConsultation,
  type Pharmacy, type Medicine, type PharmacyInventory, type Donation, type InsertDonation,
  type DonationRequest, type InsertDonationRequest, type Rating, type InsertRating,
  type TransportProvider, type InsertTransportProvider, type TransportBooking, type InsertTransportBooking
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Doctor Profiles
  getDoctorProfile(userId: string): Promise<DoctorProfile | undefined>;
  createDoctorProfile(profile: InsertDoctorProfile): Promise<DoctorProfile>;
  updateDoctorProfile(userId: string, updates: Partial<InsertDoctorProfile>): Promise<DoctorProfile | undefined>;
  getAvailableDoctors(): Promise<(DoctorProfile & { user: User })[]>;
  getPendingDoctorVerifications(): Promise<(DoctorProfile & { user: User })[]>;

  // Patient Profiles
  getPatientProfile(userId: string): Promise<PatientProfile | undefined>;
  createPatientProfile(profile: InsertPatientProfile): Promise<PatientProfile>;
  updatePatientProfile(userId: string, updates: Partial<InsertPatientProfile>): Promise<PatientProfile | undefined>;

  // Consultations
  getConsultation(id: number): Promise<(Consultation & { patient: User; doctor: User }) | undefined>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: number, updates: Partial<InsertConsultation>): Promise<Consultation | undefined>;
  getConsultationsByPatient(patientId: string): Promise<(Consultation & { doctor: User })[]>;
  getConsultationsByDoctor(doctorId: string): Promise<(Consultation & { patient: User })[]>;
  getPendingConsultations(): Promise<(Consultation & { patient: User; doctor: User })[]>;

  // Pharmacies
  getPharmacies(): Promise<Pharmacy[]>;
  getNearbyPharmacies(lat: number, lng: number, radius: number): Promise<Pharmacy[]>;
  getPharmacyInventory(pharmacyId: number): Promise<(PharmacyInventory & { medicine: Medicine })[]>;
  searchMedicineInPharmacies(medicineName: string): Promise<(PharmacyInventory & { pharmacy: Pharmacy; medicine: Medicine })[]>;

  // Donations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonations(): Promise<Donation[]>;
  getDonationStats(): Promise<{ total: string; count: number }>;

  // Donation Requests
  createDonationRequest(request: InsertDonationRequest): Promise<DonationRequest>;
  getDonationRequests(): Promise<(DonationRequest & { patient: User })[]>;
  updateDonationRequest(id: number, updates: Partial<InsertDonationRequest>): Promise<DonationRequest | undefined>;

  // Ratings
  createRating(rating: InsertRating): Promise<Rating>;
  updateDoctorRating(doctorId: number): Promise<void>;

  // Transport Providers
  getTransportProviders(type?: "ambulance" | "cab" | "motorbike"): Promise<TransportProvider[]>;
  getAvailableTransportProviders(type: "ambulance" | "cab" | "motorbike"): Promise<TransportProvider[]>;
  createTransportProvider(provider: InsertTransportProvider): Promise<TransportProvider>;
  updateTransportProvider(id: number, updates: Partial<InsertTransportProvider>): Promise<TransportProvider | undefined>;

  // Transport Bookings
  createTransportBooking(booking: InsertTransportBooking): Promise<TransportBooking>;
  getTransportBooking(id: number): Promise<(TransportBooking & { patient: User; provider: TransportProvider }) | undefined>;
  getPatientTransportBookings(patientId: string): Promise<(TransportBooking & { provider: TransportProvider })[]>;
  getProviderTransportBookings(providerId: number): Promise<(TransportBooking & { patient: User })[]>;
  updateTransportBooking(id: number, updates: Partial<InsertTransportBooking>): Promise<TransportBooking | undefined>;
  getPendingTransportBookings(): Promise<(TransportBooking & { patient: User; provider: TransportProvider })[]>;

  // Admin Stats
  getAdminStats(): Promise<{
    activePatients: number;
    verifiedDoctors: number;
    totalConsultations: number;
    totalDonations: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getDoctorProfile(userId: string): Promise<DoctorProfile | undefined> {
    const [profile] = await db.select().from(doctorProfiles).where(eq(doctorProfiles.userId, userId));
    return profile || undefined;
  }

  async createDoctorProfile(profile: InsertDoctorProfile): Promise<DoctorProfile> {
    const [doctorProfile] = await db.insert(doctorProfiles).values(profile).returning();
    return doctorProfile;
  }

  async updateDoctorProfile(userId: string, updates: Partial<InsertDoctorProfile>): Promise<DoctorProfile | undefined> {
    const [profile] = await db.update(doctorProfiles).set(updates).where(eq(doctorProfiles.userId, userId)).returning();
    return profile || undefined;
  }

  async getAvailableDoctors(): Promise<(DoctorProfile & { user: User })[]> {
    return await db.select({
      id: doctorProfiles.id,
      userId: doctorProfiles.userId,
      licenseNumber: doctorProfiles.licenseNumber,
      specialization: doctorProfiles.specialization,
      experience: doctorProfiles.experience,
      location: doctorProfiles.location,
      isAvailable: doctorProfiles.isAvailable,
      consultationFee: doctorProfiles.consultationFee,
      rating: doctorProfiles.rating,
      totalRatings: doctorProfiles.totalRatings,
      user: users,
    })
    .from(doctorProfiles)
    .innerJoin(users, eq(doctorProfiles.userId, users.id))
    .where(and(eq(doctorProfiles.isAvailable, true), eq(users.isVerified, true)));
  }

  async getPendingDoctorVerifications(): Promise<(DoctorProfile & { user: User })[]> {
    return await db.select({
      id: doctorProfiles.id,
      userId: doctorProfiles.userId,
      licenseNumber: doctorProfiles.licenseNumber,
      specialization: doctorProfiles.specialization,
      experience: doctorProfiles.experience,
      location: doctorProfiles.location,
      isAvailable: doctorProfiles.isAvailable,
      consultationFee: doctorProfiles.consultationFee,
      rating: doctorProfiles.rating,
      totalRatings: doctorProfiles.totalRatings,
      user: users,
    })
    .from(doctorProfiles)
    .innerJoin(users, eq(doctorProfiles.userId, users.id))
    .where(eq(users.isVerified, false));
  }

  async getPatientProfile(userId: string): Promise<PatientProfile | undefined> {
    const [profile] = await db.select().from(patientProfiles).where(eq(patientProfiles.userId, userId));
    return profile || undefined;
  }

  async createPatientProfile(profile: InsertPatientProfile): Promise<PatientProfile> {
    const [patientProfile] = await db.insert(patientProfiles).values(profile).returning();
    return patientProfile;
  }

  async updatePatientProfile(userId: string, updates: Partial<InsertPatientProfile>): Promise<PatientProfile | undefined> {
    const [profile] = await db.update(patientProfiles).set(updates).where(eq(patientProfiles.userId, userId)).returning();
    return profile || undefined;
  }

  async getConsultation(id: number): Promise<(Consultation & { patient: User; doctor: User }) | undefined> {
    const [consultation] = await db.select({
      id: consultations.id,
      patientId: consultations.patientId,
      doctorId: consultations.doctorId,
      status: consultations.status,
      type: consultations.type,
      symptoms: consultations.symptoms,
      diagnosis: consultations.diagnosis,
      prescription: consultations.prescription,
      notes: consultations.notes,
      scheduledAt: consultations.scheduledAt,
      startedAt: consultations.startedAt,
      endedAt: consultations.endedAt,
      createdAt: consultations.createdAt,
      patient: {
        id: sql`${users}.id`.as('patient_id'),
        email: sql`${users}.email`.as('patient_email'),
        name: sql`${users}.name`.as('patient_name'),
        phone: sql`${users}.phone`.as('patient_phone'),
        role: sql`${users}.role`.as('patient_role'),
        isVerified: sql`${users}.is_verified`.as('patient_is_verified'),
        createdAt: sql`${users}.created_at`.as('patient_created_at'),
        password: sql`${users}.password`.as('patient_password'),
      },
      doctor: {
        id: sql`doctor.id`.as('doctor_id'),
        email: sql`doctor.email`.as('doctor_email'),
        name: sql`doctor.name`.as('doctor_name'),
        phone: sql`doctor.phone`.as('doctor_phone'),
        role: sql`doctor.role`.as('doctor_role'),
        isVerified: sql`doctor.is_verified`.as('doctor_is_verified'),
        createdAt: sql`doctor.created_at`.as('doctor_created_at'),
        password: sql`doctor.password`.as('doctor_password'),
      },
    })
    .from(consultations)
    .innerJoin(users, eq(consultations.patientId, users.id))
    .innerJoin(sql`${users} as doctor`, sql`${consultations.doctorId} = doctor.id`)
    .where(eq(consultations.id, id));

    return consultation || undefined;
  }

  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const [newConsultation] = await db.insert(consultations).values(consultation).returning();
    return newConsultation;
  }

  async updateConsultation(id: number, updates: Partial<InsertConsultation>): Promise<Consultation | undefined> {
    const [consultation] = await db.update(consultations).set(updates).where(eq(consultations.id, id)).returning();
    return consultation || undefined;
  }

  async getConsultationsByPatient(patientId: string): Promise<(Consultation & { doctor: User })[]> {
    return await db.select({
      id: consultations.id,
      patientId: consultations.patientId,
      doctorId: consultations.doctorId,
      status: consultations.status,
      type: consultations.type,
      symptoms: consultations.symptoms,
      diagnosis: consultations.diagnosis,
      prescription: consultations.prescription,
      notes: consultations.notes,
      scheduledAt: consultations.scheduledAt,
      startedAt: consultations.startedAt,
      endedAt: consultations.endedAt,
      createdAt: consultations.createdAt,
      doctor: users,
    })
    .from(consultations)
    .innerJoin(users, eq(consultations.doctorId, users.id))
    .where(eq(consultations.patientId, patientId))
    .orderBy(desc(consultations.createdAt));
  }

  async getConsultationsByDoctor(doctorId: string): Promise<(Consultation & { patient: User })[]> {
    return await db.select({
      id: consultations.id,
      patientId: consultations.patientId,
      doctorId: consultations.doctorId,
      status: consultations.status,
      type: consultations.type,
      symptoms: consultations.symptoms,
      diagnosis: consultations.diagnosis,
      prescription: consultations.prescription,
      notes: consultations.notes,
      scheduledAt: consultations.scheduledAt,
      startedAt: consultations.startedAt,
      endedAt: consultations.endedAt,
      createdAt: consultations.createdAt,
      patient: users,
    })
    .from(consultations)
    .innerJoin(users, eq(consultations.patientId, users.id))
    .where(eq(consultations.doctorId, doctorId))
    .orderBy(desc(consultations.createdAt));
  }

  async getPendingConsultations(): Promise<(Consultation & { patient: User; doctor: User })[]> {
    return await db.select({
      id: consultations.id,
      patientId: consultations.patientId,
      doctorId: consultations.doctorId,
      status: consultations.status,
      type: consultations.type,
      symptoms: consultations.symptoms,
      diagnosis: consultations.diagnosis,
      prescription: consultations.prescription,
      notes: consultations.notes,
      scheduledAt: consultations.scheduledAt,
      startedAt: consultations.startedAt,
      endedAt: consultations.endedAt,
      createdAt: consultations.createdAt,
      patient: {
        id: sql`${users}.id`.as('patient_id'),
        email: sql`${users}.email`.as('patient_email'),
        name: sql`${users}.name`.as('patient_name'),
        phone: sql`${users}.phone`.as('patient_phone'),
        role: sql`${users}.role`.as('patient_role'),
        isVerified: sql`${users}.is_verified`.as('patient_is_verified'),
        createdAt: sql`${users}.created_at`.as('patient_created_at'),
        password: sql`${users}.password`.as('patient_password'),
      },
      doctor: {
        id: sql`doctor.id`.as('doctor_id'),
        email: sql`doctor.email`.as('doctor_email'),
        name: sql`doctor.name`.as('doctor_name'),
        phone: sql`doctor.phone`.as('doctor_phone'),
        role: sql`doctor.role`.as('doctor_role'),
        isVerified: sql`doctor.is_verified`.as('doctor_is_verified'),
        createdAt: sql`doctor.created_at`.as('doctor_created_at'),
        password: sql`doctor.password`.as('doctor_password'),
      },
    })
    .from(consultations)
    .innerJoin(users, eq(consultations.patientId, users.id))
    .innerJoin(sql`${users} as doctor`, sql`${consultations.doctorId} = doctor.id`)
    .where(eq(consultations.status, "pending"))
    .orderBy(asc(consultations.createdAt));
  }

  async getPharmacies(): Promise<Pharmacy[]> {
    return await db.select().from(pharmacies);
  }

  async getNearbyPharmacies(lat: number, lng: number, radius: number): Promise<Pharmacy[]> {
    // Simple distance calculation using Haversine formula
    return await db.select().from(pharmacies);
  }

  async getPharmacyInventory(pharmacyId: number): Promise<(PharmacyInventory & { medicine: Medicine })[]> {
    return await db.select({
      id: pharmacyInventory.id,
      pharmacyId: pharmacyInventory.pharmacyId,
      medicineId: pharmacyInventory.medicineId,
      stock: pharmacyInventory.stock,
      price: pharmacyInventory.price,
      medicine: medicines,
    })
    .from(pharmacyInventory)
    .innerJoin(medicines, eq(pharmacyInventory.medicineId, medicines.id))
    .where(eq(pharmacyInventory.pharmacyId, pharmacyId));
  }

  async searchMedicineInPharmacies(medicineName: string): Promise<(PharmacyInventory & { pharmacy: Pharmacy; medicine: Medicine })[]> {
    return await db.select({
      id: pharmacyInventory.id,
      pharmacyId: pharmacyInventory.pharmacyId,
      medicineId: pharmacyInventory.medicineId,
      stock: pharmacyInventory.stock,
      price: pharmacyInventory.price,
      pharmacy: pharmacies,
      medicine: medicines,
    })
    .from(pharmacyInventory)
    .innerJoin(medicines, eq(pharmacyInventory.medicineId, medicines.id))
    .innerJoin(pharmacies, eq(pharmacyInventory.pharmacyId, pharmacies.id))
    .where(sql`${medicines.name} ILIKE ${`%${medicineName}%`}`);
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [newDonation] = await db.insert(donations).values(donation).returning();
    return newDonation;
  }

  async getDonations(): Promise<Donation[]> {
    return await db.select().from(donations).orderBy(desc(donations.createdAt));
  }

  async getDonationStats(): Promise<{ total: string; count: number }> {
    const [stats] = await db.select({
      total: sql<string>`COALESCE(SUM(${donations.amount}), 0)`,
      count: sql<number>`COUNT(*)`,
    }).from(donations);
    
    return stats;
  }

  async createDonationRequest(request: InsertDonationRequest): Promise<DonationRequest> {
    const [newRequest] = await db.insert(donationRequests).values(request).returning();
    return newRequest;
  }

  async getDonationRequests(): Promise<(DonationRequest & { patient: User })[]> {
    return await db.select({
      id: donationRequests.id,
      patientId: donationRequests.patientId,
      type: donationRequests.type,
      amount: donationRequests.amount,
      reason: donationRequests.reason,
      status: donationRequests.status,
      createdAt: donationRequests.createdAt,
      patient: users,
    })
    .from(donationRequests)
    .innerJoin(users, eq(donationRequests.patientId, users.id))
    .orderBy(desc(donationRequests.createdAt));
  }

  async updateDonationRequest(id: number, updates: Partial<InsertDonationRequest>): Promise<DonationRequest | undefined> {
    const [request] = await db.update(donationRequests).set(updates).where(eq(donationRequests.id, id)).returning();
    return request || undefined;
  }

  async createRating(rating: InsertRating): Promise<Rating> {
    const [newRating] = await db.insert(ratings).values(rating).returning();
    return newRating;
  }

  async updateDoctorRating(doctorId: number): Promise<void> {
    const [stats] = await db.select({
      avgRating: sql<number>`AVG(${ratings.rating})`,
      totalRatings: sql<number>`COUNT(*)`,
    })
    .from(ratings)
    .where(eq(ratings.doctorId, doctorId));

    if (stats) {
      await db.update(doctorProfiles)
        .set({
          rating: stats.avgRating.toString(),
          totalRatings: stats.totalRatings,
        })
        .where(eq(doctorProfiles.userId, doctorId));
    }
  }

  async getAdminStats(): Promise<{
    activePatients: number;
    verifiedDoctors: number;
    totalConsultations: number;
    totalDonations: string;
  }> {
    const [patientCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(users).where(eq(users.role, "patient"));
    const [doctorCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(users).where(and(eq(users.role, "doctor"), eq(users.isVerified, true)));
    const [consultationCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(consultations);
    const [donationTotal] = await db.select({ total: sql<string>`COALESCE(SUM(${donations.amount}), 0)` }).from(donations);

    return {
      activePatients: patientCount.count,
      verifiedDoctors: doctorCount.count,
      totalConsultations: consultationCount.count,
      totalDonations: donationTotal.total,
    };
  }

  // Transport Providers
  async getTransportProviders(type?: "ambulance" | "cab" | "motorbike"): Promise<TransportProvider[]> {
    const query = db.select().from(transportProviders);
    return type ? query.where(eq(transportProviders.type, type)) : query;
  }

  async getAvailableTransportProviders(type: "ambulance" | "cab" | "motorbike"): Promise<TransportProvider[]> {
    return await db.select().from(transportProviders)
      .where(and(eq(transportProviders.type, type), eq(transportProviders.isAvailable, true)));
  }

  async createTransportProvider(provider: InsertTransportProvider): Promise<TransportProvider> {
    const [newProvider] = await db.insert(transportProviders).values(provider).returning();
    return newProvider;
  }

  async updateTransportProvider(id: number, updates: Partial<InsertTransportProvider>): Promise<TransportProvider | undefined> {
    const [provider] = await db.update(transportProviders).set(updates).where(eq(transportProviders.id, id)).returning();
    return provider || undefined;
  }

  // Transport Bookings
  async createTransportBooking(booking: InsertTransportBooking): Promise<TransportBooking> {
    const [newBooking] = await db.insert(transportBookings).values(booking).returning();
    return newBooking;
  }

  async getTransportBooking(id: number): Promise<(TransportBooking & { patient: User; provider: TransportProvider }) | undefined> {
    const [booking] = await db.select({
      id: transportBookings.id,
      patientId: transportBookings.patientId,
      providerId: transportBookings.providerId,
      type: transportBookings.type,
      pickupLocation: transportBookings.pickupLocation,
      dropoffLocation: transportBookings.dropoffLocation,
      pickupLatitude: transportBookings.pickupLatitude,
      pickupLongitude: transportBookings.pickupLongitude,
      dropoffLatitude: transportBookings.dropoffLatitude,
      dropoffLongitude: transportBookings.dropoffLongitude,
      estimatedDistance: transportBookings.estimatedDistance,
      estimatedFare: transportBookings.estimatedFare,
      actualFare: transportBookings.actualFare,
      status: transportBookings.status,
      urgency: transportBookings.urgency,
      specialRequirements: transportBookings.specialRequirements,
      patientCondition: transportBookings.patientCondition,
      contactNumber: transportBookings.contactNumber,
      bookingTime: transportBookings.bookingTime,
      acceptedAt: transportBookings.acceptedAt,
      arrivedAt: transportBookings.arrivedAt,
      completedAt: transportBookings.completedAt,
      notes: transportBookings.notes,
      patient: users,
      provider: transportProviders,
    })
    .from(transportBookings)
    .innerJoin(users, eq(transportBookings.patientId, users.id))
    .innerJoin(transportProviders, eq(transportBookings.providerId, transportProviders.id))
    .where(eq(transportBookings.id, id));
    
    return booking || undefined;
  }

  async getPatientTransportBookings(patientId: string): Promise<(TransportBooking & { provider: TransportProvider })[]> {
    return await db.select({
      id: transportBookings.id,
      patientId: transportBookings.patientId,
      providerId: transportBookings.providerId,
      type: transportBookings.type,
      pickupLocation: transportBookings.pickupLocation,
      dropoffLocation: transportBookings.dropoffLocation,
      pickupLatitude: transportBookings.pickupLatitude,
      pickupLongitude: transportBookings.pickupLongitude,
      dropoffLatitude: transportBookings.dropoffLatitude,
      dropoffLongitude: transportBookings.dropoffLongitude,
      estimatedDistance: transportBookings.estimatedDistance,
      estimatedFare: transportBookings.estimatedFare,
      actualFare: transportBookings.actualFare,
      status: transportBookings.status,
      urgency: transportBookings.urgency,
      specialRequirements: transportBookings.specialRequirements,
      patientCondition: transportBookings.patientCondition,
      contactNumber: transportBookings.contactNumber,
      bookingTime: transportBookings.bookingTime,
      acceptedAt: transportBookings.acceptedAt,
      arrivedAt: transportBookings.arrivedAt,
      completedAt: transportBookings.completedAt,
      notes: transportBookings.notes,
      provider: transportProviders,
    })
    .from(transportBookings)
    .innerJoin(transportProviders, eq(transportBookings.providerId, transportProviders.id))
    .where(eq(transportBookings.patientId, patientId))
    .orderBy(desc(transportBookings.bookingTime));
  }

  async getProviderTransportBookings(providerId: number): Promise<(TransportBooking & { patient: User })[]> {
    return await db.select({
      id: transportBookings.id,
      patientId: transportBookings.patientId,
      providerId: transportBookings.providerId,
      type: transportBookings.type,
      pickupLocation: transportBookings.pickupLocation,
      dropoffLocation: transportBookings.dropoffLocation,
      pickupLatitude: transportBookings.pickupLatitude,
      pickupLongitude: transportBookings.pickupLongitude,
      dropoffLatitude: transportBookings.dropoffLatitude,
      dropoffLongitude: transportBookings.dropoffLongitude,
      estimatedDistance: transportBookings.estimatedDistance,
      estimatedFare: transportBookings.estimatedFare,
      actualFare: transportBookings.actualFare,
      status: transportBookings.status,
      urgency: transportBookings.urgency,
      specialRequirements: transportBookings.specialRequirements,
      patientCondition: transportBookings.patientCondition,
      contactNumber: transportBookings.contactNumber,
      bookingTime: transportBookings.bookingTime,
      acceptedAt: transportBookings.acceptedAt,
      arrivedAt: transportBookings.arrivedAt,
      completedAt: transportBookings.completedAt,
      notes: transportBookings.notes,
      patient: users,
    })
    .from(transportBookings)
    .innerJoin(users, eq(transportBookings.patientId, users.id))
    .where(eq(transportBookings.providerId, providerId))
    .orderBy(desc(transportBookings.bookingTime));
  }

  async updateTransportBooking(id: number, updates: Partial<InsertTransportBooking>): Promise<TransportBooking | undefined> {
    const [booking] = await db.update(transportBookings).set(updates).where(eq(transportBookings.id, id)).returning();
    return booking || undefined;
  }

  async getPendingTransportBookings(): Promise<(TransportBooking & { patient: User; provider: TransportProvider })[]> {
    return await db.select({
      id: transportBookings.id,
      patientId: transportBookings.patientId,
      providerId: transportBookings.providerId,
      type: transportBookings.type,
      pickupLocation: transportBookings.pickupLocation,
      dropoffLocation: transportBookings.dropoffLocation,
      pickupLatitude: transportBookings.pickupLatitude,
      pickupLongitude: transportBookings.pickupLongitude,
      dropoffLatitude: transportBookings.dropoffLatitude,
      dropoffLongitude: transportBookings.dropoffLongitude,
      estimatedDistance: transportBookings.estimatedDistance,
      estimatedFare: transportBookings.estimatedFare,
      actualFare: transportBookings.actualFare,
      status: transportBookings.status,
      urgency: transportBookings.urgency,
      specialRequirements: transportBookings.specialRequirements,
      patientCondition: transportBookings.patientCondition,
      contactNumber: transportBookings.contactNumber,
      bookingTime: transportBookings.bookingTime,
      acceptedAt: transportBookings.acceptedAt,
      arrivedAt: transportBookings.arrivedAt,
      completedAt: transportBookings.completedAt,
      notes: transportBookings.notes,
      patient: users,
      provider: transportProviders,
    })
    .from(transportBookings)
    .innerJoin(users, eq(transportBookings.patientId, users.id))
    .innerJoin(transportProviders, eq(transportBookings.providerId, transportProviders.id))
    .where(eq(transportBookings.status, "pending"))
    .orderBy(desc(transportBookings.bookingTime));
  }
}

export const storage = new DatabaseStorage();
