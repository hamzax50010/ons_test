export type Language = 'ar' | 'en';

export interface SiteSettings {
  siteNameAr: string;
  siteNameEn: string;
  sloganAr: string;
  sloganEn: string;
  phone: string;
  whatsapp: string;
  email: string;
  currency: string;
  defaultLanguage: Language;
  businessHoursAr: string;
  businessHoursEn: string;
  emergencyNoteAr: string;
  emergencyNoteEn: string;
  costDisclosureAr?: string;
  costDisclosureEn?: string;
  announcementAr: string;
  announcementEn: string;
  announcementActive: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  darkLogoUrl?: string;
  symbolUrl?: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  updatedAt?: string;
}

export interface HowItWorksStep {
  step: number;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon?: string;
}

export interface FaqItem {
  id: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  order: number;
}

export interface SiteContent {
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  heroCtaAr: string;
  heroCtaEn: string;
  aboutTitleAr: string;
  aboutTitleEn: string;
  aboutBodyAr: string;
  aboutBodyEn: string;
  missionAr: string;
  missionEn: string;
  valuesAr: string;
  valuesEn: string;
  howItWorks: HowItWorksStep[];
  faqs: FaqItem[];
  contactBlurbAr: string;
  contactBlurbEn: string;
  footerTextAr: string;
  footerTextEn: string;
  privacyPolicyAr: string;
  privacyPolicyEn: string;
  updatedAt?: string;
}

export type PrimaryServiceCategory = 'nursing' | 'medical';

export interface ServiceCategory {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  categoryGroup?: PrimaryServiceCategory;
  order: number;
  active: boolean;
  updatedAt?: string;
}

export type ServiceType =
  | 'single_visit'
  | 'multi_visit_package'
  | 'procedure'
  | 'diagnostic_procedure'
  | 'test';

export type PriceBasis =
  | 'service_fee'
  | 'visit_fee'
  | 'package_fee'
  | 'per_unit_fee'
  | 'test_fee';

export type PricingStatus =
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'inactive';

export type ServiceStatus = 'draft' | 'active' | 'inactive';
export type SuppliesIncludedOption = 'yes' | 'no' | 'requires_confirmation';
export type SupplyCostVerificationStatus = 'unconfirmed' | 'verified';
export type QualificationsVerificationStatus = 'pending' | 'verified';

export type ProviderRole =
  | 'nurse'
  | 'doctor'
  | 'lab_technician'
  | 'imaging_technician'
  | 'specialist';

export type ProviderCredentialStatus = 'verified' | 'pending' | 'rejected';
export type ProviderStatus = 'active' | 'inactive' | 'unavailable' | 'under_review';

export interface ServiceProvider {
  id: string;
  name: string;
  phone: string; // internal restricted
  whatsapp?: string; // internal restricted WhatsApp
  email?: string; // internal restricted
  providerType: ProviderRole;
  specialtyAr: string;
  specialtyEn: string;
  qualifiedServiceIds: string[];
  governorate?: string;
  city?: string;
  district?: string;
  homeArea?: string;
  serviceAreaIds: string[]; // Areas willing and able to cover
  coordinates?: {
    lat: number;
    lng: number;
  };
  availabilitySchedule: string;
  unavailableDates?: string[];
  credentialStatus: ProviderCredentialStatus;
  status: ProviderStatus;
  agreedRate: number; // restricted internal provider fee
  equipmentAvailable: string[];
  internalNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationDeliveryStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'not_configured';

export interface RecipientNotificationResult {
  recipientId: 'recipient_a' | 'recipient_b';
  phone: string;
  status: NotificationDeliveryStatus;
  messageId?: string;
  error?: string;
  timestamp: string;
  attempts?: number;
}

export interface WhatsAppOrderNotificationLog {
  recipientA?: RecipientNotificationResult;
  recipientB?: RecipientNotificationResult;
  lastAttemptAt?: string;
  status: 'sent' | 'partial' | 'failed' | 'not_configured' | 'pending';
  overallError?: string;
}

export interface WhatsAppIntegrationSettings {
  enabled: boolean;
  recipientAPhone: string;
  recipientBPhone: string;
  recipientAName?: string;
  recipientBName?: string;
  defaultLanguage: 'ar' | 'en';
  templateName?: string;
  connectionStatus: 'connected' | 'not_configured' | 'error' | 'pending_setup';
  lastTestedAt?: string;
  lastError?: string;
  lastTestMessageId?: string;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'whatsapp' | 'lab_api' | 'webhook' | 'sms';
  enabled: boolean;
  environment: 'sandbox' | 'production';
  status: 'connected' | 'configured' | 'pending_setup' | 'error';
  lastTestedAt?: string;
  lastError?: string;
  config: {
    phoneNumberId?: string;
    businessAccountId?: string;
    apiEndpoint?: string;
    partnerName?: string;
    webhookUrl?: string;
    tokenMasked?: string;
  };
  whatsappSettings?: WhatsAppIntegrationSettings;
  templates?: {
    newRequestAr?: string;
    newRequestEn?: string;
    quoteAr?: string;
    quoteEn?: string;
    confirmationAr?: string;
    confirmationEn?: string;
    reviewAr?: string;
    reviewEn?: string;
  };
  updatedAt?: string;
}

export interface Service {
  id: string;
  slug: string;
  categoryId: string;
  categoryGroup: PrimaryServiceCategory; // 'nursing' | 'medical'
  subcategory?: string;
  nameAr: string;
  nameEn: string;
  summaryAr: string;
  summaryEn: string;
  descriptionAr: string;
  descriptionEn: string;
  instructionsAr: string;
  instructionsEn: string;
  requirementsAr?: string;
  requirementsEn?: string;

  // Service Classification & Workflow
  serviceType?: ServiceType;
  priceBasis?: PriceBasis;
  pricingStatus?: PricingStatus;
  serviceStatus?: ServiceStatus;
  isPubliclyVisible?: boolean;
  isBookingEnabled?: boolean;

  // Pricing Fields
  draftPriceMin: number;
  draftPriceMax: number;
  approvedPriceMin?: number;
  approvedPriceMax?: number;
  basePriceMin?: number; // legacy compatibility fallback
  basePriceMax?: number; // legacy compatibility fallback
  currency?: string;
  isPriceIndicative?: boolean;
  isPubliclyPublished?: boolean; // Separate publication state
  isPublicInquiryEnabled?: boolean; // When true and price not published, shows neutral note
  priceNoteAr?: string;
  priceNoteEn?: string;

  // Inclusions & Exclusions
  includedItemsAr?: string[];
  includedItemsEn?: string[];
  excludedItemsAr?: string[];
  excludedItemsEn?: string[];

  // Supplies & Diagnostics
  requiredEquipment?: string[];
  suppliesEquipmentRequirementsAr?: string;
  suppliesEquipmentRequirementsEn?: string;
  suppliesIncluded?: SuppliesIncludedOption;
  estimatedSupplyCost?: number;
  supplyCostVerificationStatus?: SupplyCostVerificationStatus;
  labOrThirdPartyFeesNoteAr?: string;
  labOrThirdPartyFeesNoteEn?: string;
  labFee?: number;
  transportationPolicyAr?: string;
  transportationPolicyEn?: string;
  transportationRequirement?: string;

  // Internal Cost & Notes (Restricted to Admins)
  providerCost?: number;
  nursePayout?: number; // أتعاب الممرض المتفق عليها (خاص بالإدارة - لا يظهر للعملاء)
  adminCommission?: number; // صافي دخل المركز المتبقي للمالك (خاص بالإدارة - لا يظهر للعملاء)
  internalNotes?: string;

  // Provider Requirements
  providerType?: ProviderRole;
  requiredQualifications?: string;
  qualificationsVerificationStatus?: QualificationsVerificationStatus;

  // General presentation
  featured: boolean;
  active: boolean; // synced with serviceStatus === 'active'
  order: number;
  imageUrl?: string;
  availableAreaIds: string[];
  responsibleAdmin?: string;
  lastUpdated?: string;
  updatedAt?: string;
}

export interface ServiceArea {
  id: string;
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
  active: boolean;
  travelFee: number;
  notesAr: string;
  notesEn: string;
  order: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  updatedAt?: string;
}

export type RequestStatus =
  | 'new'
  | 'under_review'
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface StatusHistoryEntry {
  status: RequestStatus;
  timestamp: string;
  changedBy: string;
  note?: string;
}

export interface ItemizedQuoteComponent {
  amount?: number;
  isPending: boolean;
  notes?: string;
}

export interface CustomerRequestQuote {
  serviceFee: ItemizedQuoteComponent;
  suppliesFee: ItemizedQuoteComponent;
  labThirdPartyFee: ItemizedQuoteComponent;
  transportationFee: ItemizedQuoteComponent;
  additionalCharges?: ItemizedQuoteComponent;
  totalConfirmedAmount?: number;
  isTotalPending: boolean;
  customerAcceptanceStatus: 'pending' | 'accepted' | 'declined';
  customerAcceptedAt?: string;
}

export interface SelectedServiceItem {
  serviceId: string;
  nameAr: string;
  nameEn: string;
  price?: number;
}

export interface CustomerRequest {
  id: string;
  serviceId: string; // primary service ID
  serviceNameAr: string;
  serviceNameEn: string;
  selectedServices?: SelectedServiceItem[]; // One or more selected services
  
  areaId: string;
  areaNameAr: string;
  areaNameEn: string;
  
  // Location details
  governorate?: string;
  city?: string;
  district?: string;
  street?: string;
  building?: string;
  addressDetails: string;
  mapCoordinates?: {
    lat: number;
    lng: number;
  };

  // Customer contact
  customerName: string;
  phone: string;
  whatsapp?: string; // Contact phone and WhatsApp if different
  email?: string;
  
  // Appointment
  preferredDate?: string;
  preferredTimeSlot?: string;
  notes?: string;
  
  // Identity document (Secure upload reference)
  identityDocumentUrl?: string;
  identityDocumentName?: string;
  
  // Policy & deposit
  termsAccepted: boolean;
  depositAcknowledged?: boolean;

  // Status & Assignment
  status: RequestStatus;
  assignedProviderId?: string;
  assignedProviderName?: string;
  providerCost?: number;

  // WhatsApp notification log
  whatsappNotificationSent?: boolean;
  whatsappNotificationTimestamp?: string;
  whatsappNotificationLog?: WhatsAppOrderNotificationLog;

  // Itemized Quote & Transportation breakdown
  quote?: CustomerRequestQuote;
  confirmedPrice?: number;
  travelFee?: number;
  currency: string;
  adminNotes?: string;
  cancellationReason?: string;
  statusHistory?: StatusHistoryEntry[];
  createdAt: string;
  updatedAt?: string;
}

export type ReviewSource = 'ons_direct' | 'google_external' | 'verified_patient' | 'client_shared_link';

export interface ReviewItem {
  id: string;
  authorNameAr: string;
  authorNameEn: string;
  serviceNameAr?: string;
  serviceNameEn?: string;
  commentAr: string;
  commentEn: string;
  rating: number; // 1 to 5
  source: ReviewSource;
  published: boolean;
  verified: boolean;
  date?: string;
  order: number;
  patientArea?: string;
  externalLink?: string;
  moderationNotes?: string;
  updatedAt?: string;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'owner' | 'admin' | 'none';
  isConfiguredOwner: boolean;
}
