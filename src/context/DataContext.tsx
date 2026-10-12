import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SiteSettings,
  SiteContent,
  ServiceCategory,
  Service,
  ServiceArea,
  CustomerRequest,
  ReviewItem,
  RequestStatus,
  ServiceProvider,
  IntegrationConfig,
} from '../types';
import {
  DEFAULT_SITE_SETTINGS,
  DEFAULT_SITE_CONTENT,
  DEFAULT_SERVICE_CATEGORIES,
  DEFAULT_SERVICES,
  DEFAULT_SERVICE_AREAS,
  DEFAULT_REVIEWS,
  DEFAULT_PROVIDERS,
  DEFAULT_INTEGRATIONS,
} from '../data/defaults';
import { calculateDistanceKm } from '../utils/geoUtils';
import { db, auth, isFirebaseConfigured, handleFirestoreError, OperationType } from '../config/firebase';
import { collection, doc, setDoc, getDocs, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';

interface DataContextType {
  settings: SiteSettings;
  content: SiteContent;
  categories: ServiceCategory[];
  services: Service[];
  areas: ServiceArea[];
  requests: CustomerRequest[];
  reviews: ReviewItem[];
  isLoading: boolean;

  providers: ServiceProvider[];
  integrations: IntegrationConfig[];
  
  // Providers (Phase 6)
  addProvider: (provider: Omit<ServiceProvider, 'id' | 'createdAt'>) => Promise<string>;
  updateProvider: (id: string, updates: Partial<ServiceProvider>) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
  matchProviders: (
    serviceId: string,
    areaId?: string,
    options?: {
      targetCoords?: { lat: number; lng: number };
      date?: string;
      additionalServiceIds?: string[];
    }
  ) => (ServiceProvider & { estimatedDistanceKm?: number; distanceMatchBasis: 'coordinates' | 'area' })[];

  // Integrations (Phase 8)
  updateIntegration: (id: string, updates: Partial<IntegrationConfig>) => Promise<void>;

  // Pricing & Publication Workflow (Phase 5)
  approveServicePrice: (id: string, approvedMin: number, approvedMax: number, adminEmail?: string) => Promise<void>;
  publishService: (id: string, isPublished: boolean, isBooking?: boolean, adminEmail?: string) => Promise<void>;
  rejectServicePrice: (id: string, reason?: string, adminEmail?: string) => Promise<void>;
  assignRequestProvider: (requestId: string, providerId: string, travelFee?: number, suppliesFee?: number, labFee?: number) => Promise<void>;
  
  // Settings & Content
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  updateContent: (newContent: Partial<SiteContent>) => Promise<void>;
  
  // Categories
  addCategory: (cat: Omit<ServiceCategory, 'id'>) => Promise<string>;
  updateCategory: (id: string, updates: Partial<ServiceCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<{ success: boolean; reason?: string }>;
  
  // Services
  addService: (srv: Omit<Service, 'id'>) => Promise<string>;
  updateService: (id: string, updates: Partial<Service>, adminEmail?: string) => Promise<void>;
  approveAndPublishService: (
    id: string,
    approvedMin: number,
    approvedMax: number,
    isPublic: boolean,
    isBooking: boolean,
    adminEmail?: string
  ) => Promise<void>;
  toggleServiceActive: (id: string) => Promise<void>;
  deleteService: (id: string) => Promise<{ success: boolean; reason?: string }>;
  
  // Areas
  addArea: (area: Omit<ServiceArea, 'id'>) => Promise<string>;
  updateArea: (id: string, updates: Partial<ServiceArea>) => Promise<void>;
  deleteArea: (id: string) => Promise<void>;
  
  // Requests
  createCustomerRequest: (req: Omit<CustomerRequest, 'id' | 'createdAt' | 'status' | 'currency'>) => Promise<string>;
  retryWhatsAppNotification: (
    orderId: string,
    retryTarget?: 'both' | 'recipient_a' | 'recipient_b'
  ) => Promise<any>;
  updateRequestStatus: (
    id: string,
    newStatus: RequestStatus,
    note?: string,
    confirmedPrice?: number,
    changedBy?: string
  ) => Promise<void>;
  updateRequestAdminNotes: (id: string, notes: string) => Promise<void>;
  updateRequestQuote: (
    id: string,
    quoteUpdates: Partial<CustomerRequest['quote']>,
    confirmedPrice?: number,
    travelFee?: number,
    note?: string,
    changedBy?: string
  ) => Promise<void>;
  
  // Reviews
  addReview: (rev: Omit<ReviewItem, 'id'>) => Promise<string>;
  updateReview: (id: string, updates: Partial<ReviewItem>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;

  // Audit
  recordAuditLog: (
    action: string,
    targetCollection: string,
    targetId: string,
    details: string,
    actorEmail?: string
  ) => Promise<void>;

  // Management utility
  resetToDefaults: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'ons_data_settings_v1',
  CONTENT: 'ons_data_content_v1',
  CATEGORIES: 'ons_data_categories_v1',
  SERVICES: 'ons_data_services_v1',
  AREAS: 'ons_data_areas_v1',
  REQUESTS: 'ons_data_requests_v1',
  REVIEWS: 'ons_data_reviews_v1',
  PROVIDERS: 'ons_data_providers_v1',
  INTEGRATIONS: 'ons_data_integrations_v1',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_SITE_SETTINGS;
  });

  const [content, setContent] = useState<SiteContent>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTENT);
    return saved ? JSON.parse(saved) : DEFAULT_SITE_CONTENT;
  });

  const [categories, setCategories] = useState<ServiceCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : DEFAULT_SERVICE_CATEGORIES;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
  });

  const [areas, setAreas] = useState<ServiceArea[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AREAS);
    return saved ? JSON.parse(saved) : DEFAULT_SERVICE_AREAS;
  });

  const [requests, setRequests] = useState<CustomerRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [providers, setProviders] = useState<ServiceProvider[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
    return saved ? JSON.parse(saved) : DEFAULT_PROVIDERS;
  });

  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INTEGRATIONS);
    return saved ? JSON.parse(saved) : DEFAULT_INTEGRATIONS;
  });

  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync to local persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(areas));
  }, [areas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
  }, [providers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(integrations));
  }, [integrations]);

  // Firestore synchronization if configured
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      try {
        const unsub = onSnapshot(collection(db, 'siteSettings'), (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data() as SiteSettings;
            setSettings(prev => ({ ...prev, ...data }));
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, 'siteSettings');
        });
        return () => unsub();
      } catch (err) {
        console.warn('Firestore subscription notice:', err);
      }
    }
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings, updatedAt: new Date().toISOString() };
    setSettings(updated);
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'siteSettings', 'global'), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'siteSettings/global');
      }
    }
  };

  const updateContent = async (newContent: Partial<SiteContent>) => {
    const updated = { ...content, ...newContent, updatedAt: new Date().toISOString() };
    setContent(updated);
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'siteContent', 'global'), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'siteContent/global');
      }
    }
  };

  const addCategory = async (cat: Omit<ServiceCategory, 'id'>): Promise<string> => {
    const id = `cat-${Date.now()}`;
    const newCategory: ServiceCategory = { ...cat, id, updatedAt: new Date().toISOString() };
    setCategories(prev => [...prev, newCategory]);
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'serviceCategories', id), newCategory);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `serviceCategories/${id}`);
      }
    }
    return id;
  };

  const updateCategory = async (id: string, updates: Partial<ServiceCategory>) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, ...updates, updatedAt: new Date().toISOString() } : cat))
    );
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'serviceCategories', id), { ...updates, updatedAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `serviceCategories/${id}`);
      }
    }
  };

  const deleteCategory = async (id: string): Promise<{ success: boolean; reason?: string }> => {
    // Check if referenced by active services
    const referencedCount = services.filter(s => s.categoryId === id).length;
    if (referencedCount > 0) {
      return {
        success: false,
        reason: `لا يمكن حذف التصنيف لأنه مستخدم في ${referencedCount} من الخدمات. يمكنك إلغاء تفعيله بدلاً من حذفه. | Cannot delete category: referenced by ${referencedCount} services. Deactivate it instead.`,
      };
    }
    setCategories(prev => prev.filter(c => c.id !== id));
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'serviceCategories', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `serviceCategories/${id}`);
      }
    }
    return { success: true };
  };

  const recordAuditLog = async (
    action: string,
    targetCollection: string,
    targetId: string,
    details: string,
    actorEmail: string = 'Authorized Owner'
  ) => {
    const logId = `log-${Date.now()}`;
    const logEntry = {
      actorEmail,
      action,
      targetCollection,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'auditLogs', logId), logEntry);
      } catch (err) {
        console.warn('Audit log write error:', err);
      }
    }
  };

  const addService = async (srv: Omit<Service, 'id'>): Promise<string> => {
    const id = `srv-${Date.now()}`;
    const newService: Service = {
      ...srv,
      id,
      pricingStatus: srv.pricingStatus || 'draft',
      serviceStatus: srv.serviceStatus || 'draft',
      isPubliclyVisible: srv.isPubliclyVisible || false,
      isBookingEnabled: srv.isBookingEnabled || false,
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    setServices(prev => [...prev, newService]);
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'services', id), newService);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `services/${id}`);
      }
    }
    await recordAuditLog('create_service', 'services', id, `Created service: ${srv.nameAr}`);
    return id;
  };

  const updateService = async (id: string, updates: Partial<Service>, adminEmail?: string) => {
    const current = services.find(s => s.id === id);
    let patch = { ...updates, updatedAt: new Date().toISOString(), lastUpdated: new Date().toISOString() };

    // Critical Workflow Rule: Editing a published/approved price returns the changed price to a review state until reapproved
    const isPriceChanged =
      (updates.draftPriceMin !== undefined && updates.draftPriceMin !== current?.draftPriceMin) ||
      (updates.draftPriceMax !== undefined && updates.draftPriceMax !== current?.draftPriceMax);

    if (isPriceChanged && current?.pricingStatus === 'approved' && updates.pricingStatus === undefined) {
      patch.pricingStatus = 'under_review';
    }

    setServices(prev =>
      prev.map(s => (s.id === id ? { ...s, ...patch } : s))
    );

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'services', id), patch);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `services/${id}`);
      }
    }

    await recordAuditLog(
      'update_service',
      'services',
      id,
      `Updated service fields${isPriceChanged ? ' (Pricing returned to under_review)' : ''}`,
      adminEmail
    );
  };

  const approveAndPublishService = async (
    id: string,
    approvedMin: number,
    approvedMax: number,
    isPublic: boolean,
    isBooking: boolean,
    adminEmail?: string
  ) => {
    const patch: Partial<Service> = {
      approvedPriceMin: approvedMin,
      approvedPriceMax: approvedMax,
      pricingStatus: 'approved',
      serviceStatus: 'active',
      isPubliclyVisible: isPublic,
      isBookingEnabled: isBooking,
      responsibleAdmin: adminEmail || 'Authorized Owner',
      lastUpdated: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setServices(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'services', id), patch);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `services/${id}`);
      }
    }

    await recordAuditLog(
      'approve_publish_pricing',
      'services',
      id,
      `Approved price range ${approvedMin}-${approvedMax} EGP and set visible=${isPublic}, booking=${isBooking}`,
      adminEmail
    );
  };

  const toggleServiceActive = async (id: string) => {
    const target = services.find(s => s.id === id);
    if (target) {
      const nextActive = !target.active;
      await updateService(id, {
        active: nextActive,
        serviceStatus: nextActive ? 'active' : 'inactive',
      });
    }
  };

  const deleteService = async (id: string): Promise<{ success: boolean; reason?: string }> => {
    // Check if referenced in historical requests
    const referencedInRequests = requests.filter(r => r.serviceId === id).length;
    if (referencedInRequests > 0) {
      return {
        success: false,
        reason: `لا يمكن حذف الخدمة لوجود ${referencedInRequests} طلب مرتبط بها في سجل الحالات. تم تعطيل الخدمة لحفظ السجلات التاريخية. | Cannot delete service: referenced by ${referencedInRequests} requests. Disable it instead.`,
      };
    }
    setServices(prev => prev.filter(s => s.id !== id));
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'services', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
      }
    }
    return { success: true };
  };

  const addArea = async (area: Omit<ServiceArea, 'id'>): Promise<string> => {
    const id = `area-${Date.now()}`;
    const newArea: ServiceArea = { ...area, id, updatedAt: new Date().toISOString() };
    setAreas(prev => [...prev, newArea]);
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'serviceAreas', id), newArea);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `serviceAreas/${id}`);
      }
    }
    return id;
  };

  const updateArea = async (id: string, updates: Partial<ServiceArea>) => {
    setAreas(prev =>
      prev.map(a => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'serviceAreas', id), { ...updates, updatedAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `serviceAreas/${id}`);
      }
    }
  };

  const deleteArea = async (id: string) => {
    setAreas(prev => prev.filter(a => a.id !== id));
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'serviceAreas', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `serviceAreas/${id}`);
      }
    }
  };

  const createCustomerRequest = async (
    reqData: Omit<CustomerRequest, 'id' | 'createdAt' | 'status' | 'currency'>
  ): Promise<string> => {
    // Generate clean unique human-friendly order reference
    const timestampSuffix = Date.now().toString().slice(-6);
    const id = `ONS-${new Date().getFullYear()}-${timestampSuffix}`;
    const newRequest: CustomerRequest = {
      ...reqData,
      id,
      status: 'new',
      currency: settings.currency || 'ج.م',
      createdAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'new',
          timestamp: new Date().toISOString(),
          changedBy: 'System (Customer Web Order)',
          note: 'تم إرسال الطلب واعتماده في قاعدة البيانات عبر الموقع',
        },
      ],
    };

    // 1. First: Persist locally
    setRequests(prev => [newRequest, ...prev]);

    // 2. Persist to Firestore database BEFORE any external notification
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'customerRequests', id), newRequest);
      } catch (err) {
        // Log firestore error but keep local state intact
        console.error('Firestore save customerRequests error:', err);
      }
    }

    // 3. Trigger server-side WhatsApp notification without deleting or rolling back the order if delivery fails
    try {
      const notifyRes = await fetch('/api/whatsapp/notify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newRequest }),
      });
      const notifyData = await notifyRes.json().catch(() => ({}));

      const logEntry: CustomerRequest['whatsappNotificationLog'] = {
        status: notifyData.overallStatus || (notifyData.success ? 'sent' : 'failed'),
        lastAttemptAt: new Date().toISOString(),
        overallError: notifyData.error,
        recipientA: notifyData.recipientA
          ? {
              recipientId: 'recipient_a',
              phone: notifyData.recipientA.phone || '',
              status: notifyData.recipientA.status || 'not_configured',
              messageId: notifyData.recipientA.messageId,
              error: notifyData.recipientA.error,
              timestamp: notifyData.recipientA.timestamp || new Date().toISOString(),
              attempts: 1,
            }
          : undefined,
        recipientB: notifyData.recipientB
          ? {
              recipientId: 'recipient_b',
              phone: notifyData.recipientB.phone || '',
              status: notifyData.recipientB.status || 'not_configured',
              messageId: notifyData.recipientB.messageId,
              error: notifyData.recipientB.error,
              timestamp: notifyData.recipientB.timestamp || new Date().toISOString(),
              attempts: 1,
            }
          : undefined,
      };

      setRequests(prev =>
        prev.map(r =>
          r.id === id
            ? {
                ...r,
                whatsappNotificationSent: Boolean(notifyData.success),
                whatsappNotificationTimestamp: new Date().toISOString(),
                whatsappNotificationLog: logEntry,
              }
            : r
        )
      );

      if (isFirebaseConfigured && db) {
        try {
          await updateDoc(doc(db, 'customerRequests', id), {
            whatsappNotificationSent: Boolean(notifyData.success),
            whatsappNotificationTimestamp: new Date().toISOString(),
            whatsappNotificationLog: logEntry,
          });
        } catch (dbErr) {
          console.warn('Could not update customerRequest with whatsapp log in firestore:', dbErr);
        }
      }
    } catch (notifyErr: any) {
      console.warn('Server WhatsApp notification trigger error (order preserved):', notifyErr);
      const failedLog: CustomerRequest['whatsappNotificationLog'] = {
        status: 'failed',
        lastAttemptAt: new Date().toISOString(),
        overallError: notifyErr.message || 'Network error triggering server notification',
      };
      setRequests(prev =>
        prev.map(r => (r.id === id ? { ...r, whatsappNotificationLog: failedLog } : r))
      );
    }

    return id;
  };

  const retryWhatsAppNotification = async (
    orderId: string,
    retryTarget: 'both' | 'recipient_a' | 'recipient_b' = 'both'
  ): Promise<any> => {
    const targetOrder = requests.find(r => r.id === orderId);
    if (!targetOrder) {
      throw new Error(`Order ${orderId} not found in database.`);
    }

    const res = await fetch('/api/whatsapp/retry-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: targetOrder, retryTarget }),
    });

    const data = await res.json().catch(() => ({}));

    const logEntry: CustomerRequest['whatsappNotificationLog'] = {
      status: data.overallStatus || (data.success ? 'sent' : 'failed'),
      lastAttemptAt: new Date().toISOString(),
      overallError: data.error,
      recipientA: data.recipientA
        ? {
            recipientId: 'recipient_a',
            phone: data.recipientA.phone || '',
            status: data.recipientA.status || 'not_configured',
            messageId: data.recipientA.messageId,
            error: data.recipientA.error,
            timestamp: data.recipientA.timestamp || new Date().toISOString(),
            attempts: ((targetOrder.whatsappNotificationLog?.recipientA?.attempts || 0) + 1),
          }
        : targetOrder.whatsappNotificationLog?.recipientA,
      recipientB: data.recipientB
        ? {
            recipientId: 'recipient_b',
            phone: data.recipientB.phone || '',
            status: data.recipientB.status || 'not_configured',
            messageId: data.recipientB.messageId,
            error: data.recipientB.error,
            timestamp: data.recipientB.timestamp || new Date().toISOString(),
            attempts: ((targetOrder.whatsappNotificationLog?.recipientB?.attempts || 0) + 1),
          }
        : targetOrder.whatsappNotificationLog?.recipientB,
    };

    setRequests(prev =>
      prev.map(r =>
        r.id === orderId
          ? {
              ...r,
              whatsappNotificationSent: Boolean(data.success),
              whatsappNotificationTimestamp: new Date().toISOString(),
              whatsappNotificationLog: logEntry,
            }
          : r
      )
    );

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'customerRequests', orderId), {
          whatsappNotificationSent: Boolean(data.success),
          whatsappNotificationTimestamp: new Date().toISOString(),
          whatsappNotificationLog: logEntry,
        });
      } catch (dbErr) {
        console.warn('Could not update customerRequest with retried whatsapp log in firestore:', dbErr);
      }
    }

    await recordAuditLog(
      'retry_whatsapp_notification',
      'customerRequests',
      orderId,
      `Retried WhatsApp notification (${retryTarget}) - Status: ${logEntry.status}`
    );

    return data;
  };

  const updateRequestStatus = async (
    id: string,
    newStatus: RequestStatus,
    note?: string,
    confirmedPrice?: number,
    changedBy: string = 'المالك المعتمد (Owner)'
  ) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const historyEntry = {
          status: newStatus,
          timestamp: new Date().toISOString(),
          changedBy,
          note: note || `تعديل الحالة إلى: ${newStatus}`,
        };
        const updatedReq: CustomerRequest = {
          ...r,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          confirmedPrice: confirmedPrice !== undefined ? confirmedPrice : r.confirmedPrice,
          statusHistory: [...(r.statusHistory || []), historyEntry],
        };
        return updatedReq;
      })
    );

    if (isFirebaseConfigured && db && auth?.currentUser) {
      try {
        const patch: any = {
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
        if (confirmedPrice !== undefined) patch.confirmedPrice = confirmedPrice;
        await updateDoc(doc(db, 'customerRequests', id), patch);
      } catch (err) {
        console.warn('Firestore update customerRequests status notice:', err);
      }
    }
  };

  const updateRequestAdminNotes = async (id: string, adminNotes: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, adminNotes, updatedAt: new Date().toISOString() } : r))
    );
    if (isFirebaseConfigured && db && auth?.currentUser) {
      try {
        await updateDoc(doc(db, 'customerRequests', id), { adminNotes, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.warn('Firestore update customerRequests adminNotes notice:', err);
      }
    }
  };

  const updateRequestQuote = async (
    id: string,
    quoteUpdates: Partial<CustomerRequest['quote']>,
    confirmedPrice?: number,
    travelFee?: number,
    note?: string,
    changedBy: string = 'المالك المعتمد (Owner)'
  ) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const currentQuote = r.quote || {
          serviceFee: { amount: r.confirmedPrice, isPending: r.confirmedPrice === undefined },
          suppliesFee: { amount: 0, isPending: false },
          labThirdPartyFee: { amount: 0, isPending: false },
          transportationFee: { amount: r.travelFee, isPending: r.travelFee === undefined },
          totalConfirmedAmount: r.confirmedPrice,
          isTotalPending: r.confirmedPrice === undefined,
          customerAcceptanceStatus: 'pending',
        };

        const mergedQuote = {
          ...currentQuote,
          ...quoteUpdates,
        };

        const historyEntry = {
          status: r.status,
          timestamp: new Date().toISOString(),
          changedBy,
          note: note || `تحديث تفاصيل عرض السعر المخصص والتكاليف المنفصلة`,
        };

        return {
          ...r,
          quote: mergedQuote,
          confirmedPrice: confirmedPrice !== undefined ? confirmedPrice : r.confirmedPrice,
          travelFee: travelFee !== undefined ? travelFee : r.travelFee,
          updatedAt: new Date().toISOString(),
          statusHistory: [...(r.statusHistory || []), historyEntry],
        };
      })
    );

    if (isFirebaseConfigured && db && auth?.currentUser) {
      try {
        const patch: any = {
          quote: quoteUpdates,
          updatedAt: new Date().toISOString(),
        };
        if (confirmedPrice !== undefined) patch.confirmedPrice = confirmedPrice;
        if (travelFee !== undefined) patch.travelFee = travelFee;
        await updateDoc(doc(db, 'customerRequests', id), patch);
      } catch (err) {
        console.warn('Firestore update customerRequests quote notice:', err);
      }
    }

    await recordAuditLog('update_request_quote', 'customerRequests', id, note || 'Updated itemized quote breakdown', changedBy);
  };

  const addReview = async (rev: Omit<ReviewItem, 'id'>): Promise<string> => {
    const id = `rev-${Date.now()}`;
    const newReview: ReviewItem = { ...rev, id, updatedAt: new Date().toISOString() };
    setReviews(prev => [newReview, ...prev]);
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'reviews', id), newReview);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `reviews/${id}`);
      }
    }
    return id;
  };

  const updateReview = async (id: string, updates: Partial<ReviewItem>) => {
    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
    );
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'reviews', id), { ...updates, updatedAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `reviews/${id}`);
      }
    }
  };

  const deleteReview = async (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `reviews/${id}`);
      }
    }
  };

  // --- Provider Management Methods (Phase 6 & 7) ---
  const addProvider = async (provider: Omit<ServiceProvider, 'id' | 'createdAt'>): Promise<string> => {
    const id = `prov-${Date.now()}`;
    const newProvider: ServiceProvider = {
      ...provider,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProviders(prev => [newProvider, ...prev]);
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'serviceProviders', id), newProvider);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `serviceProviders/${id}`);
      }
    }
    await recordAuditLog('add_provider', 'serviceProviders', id, `Added provider: ${newProvider.name}`);
    return id;
  };

  const updateProvider = async (id: string, updates: Partial<ServiceProvider>) => {
    const updated = { ...updates, updatedAt: new Date().toISOString() };
    setProviders(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'serviceProviders', id), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `serviceProviders/${id}`);
      }
    }
    await recordAuditLog('update_provider', 'serviceProviders', id, `Updated provider info`);
  };

  const deleteProvider = async (id: string) => {
    setProviders(prev => prev.filter(p => p.id !== id));
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'serviceProviders', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `serviceProviders/${id}`);
      }
    }
    await recordAuditLog('delete_provider', 'serviceProviders', id, `Deleted provider`);
  };

  const matchProviders = (
    serviceId: string,
    areaId?: string,
    options?: {
      targetCoords?: { lat: number; lng: number };
      date?: string;
      additionalServiceIds?: string[];
    }
  ): (ServiceProvider & { estimatedDistanceKm?: number; distanceMatchBasis: 'coordinates' | 'area' })[] => {
    // 1. Identify target coordinate from options or area
    const area = areaId ? areas.find(a => a.id === areaId) : undefined;
    const targetCoords = options?.targetCoords || area?.coordinates;

    const allRequiredServiceIds = [serviceId, ...(options?.additionalServiceIds || [])].filter(Boolean);

    const candidates = providers.filter(p => {
      // Must be active
      if (p.status !== 'active') return false;

      // 1. First priority: Can perform requested service(s)
      const canPerformServices =
        p.qualifiedServiceIds.length === 0 ||
        allRequiredServiceIds.some(sid => p.qualifiedServiceIds.includes(sid));
      if (!canPerformServices) return false;

      // 2. Second priority: Covers requested area
      const coversArea = !areaId || p.serviceAreaIds.length === 0 || p.serviceAreaIds.includes(areaId);
      if (!coversArea) return false;

      // 3. Third priority: Check date availability if date exception specified
      if (options?.date && p.unavailableDates && p.unavailableDates.includes(options.date)) {
        return false;
      }

      return true;
    });

    // 4. Fourth priority: Rank by distance / proximity
    const ranked = candidates.map(p => {
      let estimatedDistanceKm: number | undefined = undefined;
      let distanceMatchBasis: 'coordinates' | 'area' = 'area';

      if (targetCoords && p.coordinates) {
        estimatedDistanceKm = calculateDistanceKm(targetCoords, p.coordinates);
        distanceMatchBasis = 'coordinates';
      }

      return {
        ...p,
        estimatedDistanceKm,
        distanceMatchBasis,
      };
    });

    // Sort by coordinate distance ascending if available, then by name
    ranked.sort((a, b) => {
      if (a.estimatedDistanceKm !== undefined && b.estimatedDistanceKm !== undefined) {
        return a.estimatedDistanceKm - b.estimatedDistanceKm;
      }
      if (a.estimatedDistanceKm !== undefined) return -1;
      if (b.estimatedDistanceKm !== undefined) return 1;
      return a.name.localeCompare(b.name);
    });

    return ranked;
  };

  // --- Integration Methods (Phase 8) ---
  const updateIntegration = async (id: string, updates: Partial<IntegrationConfig>) => {
    const updated = { ...updates, updatedAt: new Date().toISOString() };
    setIntegrations(prev => prev.map(i => (i.id === id ? { ...i, ...updated } : i)));
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'integrations', id), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `integrations/${id}`);
      }
    }
    await recordAuditLog('update_integration', 'integrations', id, `Updated integration config: ${id}`);
  };

  // --- Pricing Review & Publication Workflow Methods (Phase 4 & 5) ---
  const approveServicePrice = async (
    id: string,
    approvedMin: number,
    approvedMax: number,
    adminEmail: string = 'المالك المعتمد (Owner)'
  ) => {
    const updates: Partial<Service> = {
      approvedPriceMin: approvedMin,
      approvedPriceMax: approvedMax,
      pricingStatus: 'approved',
      updatedAt: new Date().toISOString(),
    };
    await updateService(id, updates, adminEmail);
    await recordAuditLog(
      'approve_service_price',
      'services',
      id,
      `Approved price range: ${approvedMin}–${approvedMax} EGP`,
      adminEmail
    );
  };

  const publishService = async (
    id: string,
    isPublished: boolean,
    isBooking: boolean = true,
    adminEmail: string = 'المالك المعتمد (Owner)'
  ) => {
    const srv = services.find(s => s.id === id);
    const updates: Partial<Service> = {
      isPubliclyPublished: isPublished,
      isBookingEnabled: isBooking,
      pricingStatus: isPublished ? 'published' : (srv?.pricingStatus === 'published' ? 'approved' : srv?.pricingStatus),
      serviceStatus: isPublished ? 'active' : 'draft',
      active: isPublished,
      updatedAt: new Date().toISOString(),
    };
    await updateService(id, updates, adminEmail);
    await recordAuditLog(
      'publish_service',
      'services',
      id,
      `Set public publication: ${isPublished}, booking: ${isBooking}`,
      adminEmail
    );
  };

  const rejectServicePrice = async (
    id: string,
    reason?: string,
    adminEmail: string = 'المالك المعتمد (Owner)'
  ) => {
    const updates: Partial<Service> = {
      pricingStatus: 'rejected',
      isPubliclyPublished: false,
      isBookingEnabled: false,
      internalNotes: reason ? `مرفوض: ${reason}` : 'تم رفض التسعير للمراجعة وإعادة التقييم',
      updatedAt: new Date().toISOString(),
    };
    await updateService(id, updates, adminEmail);
    await recordAuditLog(
      'reject_service_price',
      'services',
      id,
      `Rejected service price: ${reason || 'Returned for re-evaluation'}`,
      adminEmail
    );
  };

  const assignRequestProvider = async (
    requestId: string,
    providerId: string,
    travelFee?: number,
    suppliesFee?: number,
    labFee?: number
  ) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;

    setRequests(prev =>
      prev.map(r => {
        if (r.id !== requestId) return r;
        const currentQuote = r.quote || {
          serviceFee: { amount: r.confirmedPrice, isPending: r.confirmedPrice === undefined },
          suppliesFee: { amount: suppliesFee || 0, isPending: false },
          labThirdPartyFee: { amount: labFee || 0, isPending: false },
          transportationFee: { amount: travelFee !== undefined ? travelFee : r.travelFee, isPending: false },
          customerAcceptanceStatus: 'pending',
          isTotalPending: false,
        };

        const updatedQuote = {
          ...currentQuote,
          suppliesFee: suppliesFee !== undefined ? { amount: suppliesFee, isPending: false } : currentQuote.suppliesFee,
          labThirdPartyFee: labFee !== undefined ? { amount: labFee, isPending: false } : currentQuote.labThirdPartyFee,
          transportationFee: travelFee !== undefined ? { amount: travelFee, isPending: false } : currentQuote.transportationFee,
        };

        return {
          ...r,
          assignedProviderId: provider.id,
          assignedProviderName: provider.name,
          providerCost: provider.agreedRate,
          travelFee: travelFee !== undefined ? travelFee : r.travelFee,
          quote: updatedQuote,
          updatedAt: new Date().toISOString(),
          statusHistory: [
            ...(r.statusHistory || []),
            {
              status: r.status,
              timestamp: new Date().toISOString(),
              changedBy: 'منسق الرعاية (Coordinator)',
              note: `تعيين مقدم الرعاية: ${provider.name} وتحديث التكاليف المنفصلة`,
            },
          ],
        };
      })
    );

    if (isFirebaseConfigured && db && auth?.currentUser) {
      try {
        await updateDoc(doc(db, 'customerRequests', requestId), {
          assignedProviderId: provider.id,
          assignedProviderName: provider.name,
          providerCost: provider.agreedRate,
          ...(travelFee !== undefined ? { travelFee } : {}),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore update customerRequests assignProvider notice:', err);
      }
    }

    await recordAuditLog(
      'assign_provider',
      'customerRequests',
      requestId,
      `Assigned provider ${provider.name} (Cost: ${provider.agreedRate} EGP)`
    );
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SITE_SETTINGS);
    setContent(DEFAULT_SITE_CONTENT);
    setCategories(DEFAULT_SERVICE_CATEGORIES);
    setServices(DEFAULT_SERVICES);
    setAreas(DEFAULT_SERVICE_AREAS);
    setReviews(DEFAULT_REVIEWS);
    setRequests([]);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CONTENT);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.AREAS);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
  };

  return (
    <DataContext.Provider
      value={{
        settings,
        content,
        categories,
        services,
        areas,
        requests,
        reviews,
        providers,
        integrations,
        isLoading,
        addProvider,
        updateProvider,
        deleteProvider,
        matchProviders,
        updateIntegration,
        approveServicePrice,
        publishService,
        rejectServicePrice,
        assignRequestProvider,
        updateSettings,
        updateContent,
        addCategory,
        updateCategory,
        deleteCategory,
        addService,
        updateService,
        approveAndPublishService,
        toggleServiceActive,
        deleteService,
        addArea,
        updateArea,
        deleteArea,
        createCustomerRequest,
        retryWhatsAppNotification,
        updateRequestStatus,
        updateRequestAdminNotes,
        updateRequestQuote,
        addReview,
        updateReview,
        deleteReview,
        recordAuditLog,
        resetToDefaults,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
