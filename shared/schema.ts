import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role", { enum: ["patient", "doctor", "admin"] }).notNull().default("patient"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const doctorProfiles = pgTable("doctor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  licenseNumber: text("license_number").notNull(),
  specialization: text("specialization").notNull(),
  experience: integer("experience").notNull(),
  location: text("location").notNull(),
  isAvailable: boolean("is_available").default(false),
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }).default("0"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalRatings: integer("total_ratings").default(0),
});

export const patientProfiles = pgTable("patient_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"),
  location: text("location"),
  emergencyContact: text("emergency_contact"),
  medicalHistory: jsonb("medical_history"),
});

export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => users.id).notNull(),
  doctorId: integer("doctor_id").references(() => users.id).notNull(),
  status: text("status", { enum: ["pending", "active", "completed", "cancelled"] }).notNull().default("pending"),
  type: text("type", { enum: ["emergency", "regular"] }).notNull().default("regular"),
  symptoms: text("symptoms"),
  diagnosis: text("diagnosis"),
  prescription: text("prescription"),
  notes: text("notes"),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pharmacies = pgTable("pharmacies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isOpen24Hours: boolean("is_open_24_hours").default(false),
  openingHours: jsonb("opening_hours"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
});

export const medicines = pgTable("medicines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  dosage: text("dosage"),
  manufacturer: text("manufacturer"),
  price: decimal("price", { precision: 10, scale: 2 }),
});

export const pharmacyInventory = pgTable("pharmacy_inventory", {
  id: serial("id").primaryKey(),
  pharmacyId: integer("pharmacy_id").references(() => pharmacies.id).notNull(),
  medicineId: integer("medicine_id").references(() => medicines.id).notNull(),
  stock: integer("stock").notNull().default(0),
  price: decimal("price", { precision: 10, scale: 2 }),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorName: text("donor_name"),
  donorEmail: text("donor_email"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type", { enum: ["consultation", "medicine", "general"] }).notNull(),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donationRequests = pgTable("donation_requests", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => users.id).notNull(),
  type: text("type", { enum: ["consultation", "medicine"] }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  status: text("status", { enum: ["pending", "approved", "fulfilled", "rejected"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  consultationId: integer("consultation_id").references(() => consultations.id).notNull(),
  patientId: integer("patient_id").references(() => users.id).notNull(),
  doctorId: integer("doctor_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transportProviders = pgTable("transport_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  type: text("type", { enum: ["ambulance", "cab", "motorbike"] }).notNull(),
  location: text("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isAvailable: boolean("is_available").default(true),
  baseFare: decimal("base_fare", { precision: 10, scale: 2 }).notNull(),
  perKmRate: decimal("per_km_rate", { precision: 10, scale: 2 }).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalRatings: integer("total_ratings").default(0),
  licenseNumber: text("license_number"),
  driverName: text("driver_name"),
  vehicleNumber: text("vehicle_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transportBookings = pgTable("transport_bookings", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => users.id).notNull(),
  providerId: integer("provider_id").references(() => transportProviders.id).notNull(),
  type: text("type", { enum: ["ambulance", "cab", "motorbike"] }).notNull(),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  pickupLatitude: decimal("pickup_latitude", { precision: 10, scale: 8 }),
  pickupLongitude: decimal("pickup_longitude", { precision: 11, scale: 8 }),
  dropoffLatitude: decimal("dropoff_latitude", { precision: 10, scale: 8 }),
  dropoffLongitude: decimal("dropoff_longitude", { precision: 11, scale: 8 }),
  estimatedDistance: decimal("estimated_distance", { precision: 10, scale: 2 }),
  estimatedFare: decimal("estimated_fare", { precision: 10, scale: 2 }),
  actualFare: decimal("actual_fare", { precision: 10, scale: 2 }),
  status: text("status", { enum: ["pending", "accepted", "en_route", "arrived", "in_transit", "completed", "cancelled"] }).notNull().default("pending"),
  urgency: text("urgency", { enum: ["low", "medium", "high", "emergency"] }).notNull().default("medium"),
  specialRequirements: text("special_requirements"),
  patientCondition: text("patient_condition"),
  contactNumber: text("contact_number").notNull(),
  bookingTime: timestamp("booking_time").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  arrivedAt: timestamp("arrived_at"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  doctorProfile: one(doctorProfiles, {
    fields: [users.id],
    references: [doctorProfiles.userId],
  }),
  patientProfile: one(patientProfiles, {
    fields: [users.id],
    references: [patientProfiles.userId],
  }),
  consultationsAsPatient: many(consultations, { relationName: "patientConsultations" }),
  consultationsAsDoctor: many(consultations, { relationName: "doctorConsultations" }),
  donationRequests: many(donationRequests),
  ratingsGiven: many(ratings, { relationName: "patientRatings" }),
  ratingsReceived: many(ratings, { relationName: "doctorRatings" }),
  transportBookings: many(transportBookings),
}));

export const doctorProfilesRelations = relations(doctorProfiles, ({ one }) => ({
  user: one(users, {
    fields: [doctorProfiles.userId],
    references: [users.id],
  }),
}));

export const patientProfilesRelations = relations(patientProfiles, ({ one }) => ({
  user: one(users, {
    fields: [patientProfiles.userId],
    references: [users.id],
  }),
}));

export const consultationsRelations = relations(consultations, ({ one, many }) => ({
  patient: one(users, {
    fields: [consultations.patientId],
    references: [users.id],
    relationName: "patientConsultations",
  }),
  doctor: one(users, {
    fields: [consultations.doctorId],
    references: [users.id],
    relationName: "doctorConsultations",
  }),
  rating: one(ratings, {
    fields: [consultations.id],
    references: [ratings.consultationId],
  }),
}));

export const pharmaciesRelations = relations(pharmacies, ({ many }) => ({
  inventory: many(pharmacyInventory),
}));

export const medicinesRelations = relations(medicines, ({ many }) => ({
  inventory: many(pharmacyInventory),
}));

export const pharmacyInventoryRelations = relations(pharmacyInventory, ({ one }) => ({
  pharmacy: one(pharmacies, {
    fields: [pharmacyInventory.pharmacyId],
    references: [pharmacies.id],
  }),
  medicine: one(medicines, {
    fields: [pharmacyInventory.medicineId],
    references: [medicines.id],
  }),
}));

export const donationRequestsRelations = relations(donationRequests, ({ one }) => ({
  patient: one(users, {
    fields: [donationRequests.patientId],
    references: [users.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  consultation: one(consultations, {
    fields: [ratings.consultationId],
    references: [consultations.id],
  }),
  patient: one(users, {
    fields: [ratings.patientId],
    references: [users.id],
    relationName: "patientRatings",
  }),
  doctor: one(users, {
    fields: [ratings.doctorId],
    references: [users.id],
    relationName: "doctorRatings",
  }),
}));

export const transportProvidersRelations = relations(transportProviders, ({ many }) => ({
  bookings: many(transportBookings),
}));

export const transportBookingsRelations = relations(transportBookings, ({ one }) => ({
  patient: one(users, {
    fields: [transportBookings.patientId],
    references: [users.id],
  }),
  provider: one(transportProviders, {
    fields: [transportBookings.providerId],
    references: [transportProviders.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertDoctorProfileSchema = createInsertSchema(doctorProfiles).omit({ id: true });
export const insertPatientProfileSchema = createInsertSchema(patientProfiles).omit({ id: true });
export const insertConsultationSchema = createInsertSchema(consultations).omit({ id: true, createdAt: true });
export const insertPharmacySchema = createInsertSchema(pharmacies).omit({ id: true });
export const insertMedicineSchema = createInsertSchema(medicines).omit({ id: true });
export const insertDonationSchema = createInsertSchema(donations).omit({ id: true, createdAt: true });
export const insertDonationRequestSchema = createInsertSchema(donationRequests).omit({ id: true, createdAt: true });
export const insertRatingSchema = createInsertSchema(ratings).omit({ id: true, createdAt: true });
export const insertTransportProviderSchema = createInsertSchema(transportProviders).omit({ id: true, createdAt: true });
export const insertTransportBookingSchema = createInsertSchema(transportBookings).omit({ id: true, bookingTime: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type DoctorProfile = typeof doctorProfiles.$inferSelect;
export type InsertDoctorProfile = z.infer<typeof insertDoctorProfileSchema>;
export type PatientProfile = typeof patientProfiles.$inferSelect;
export type InsertPatientProfile = z.infer<typeof insertPatientProfileSchema>;
export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Pharmacy = typeof pharmacies.$inferSelect;
export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type Medicine = typeof medicines.$inferSelect;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type PharmacyInventory = typeof pharmacyInventory.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type DonationRequest = typeof donationRequests.$inferSelect;
export type InsertDonationRequest = z.infer<typeof insertDonationRequestSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type TransportProvider = typeof transportProviders.$inferSelect;
export type InsertTransportProvider = z.infer<typeof insertTransportProviderSchema>;
export type TransportBooking = typeof transportBookings.$inferSelect;
export type InsertTransportBooking = z.infer<typeof insertTransportBookingSchema>;
