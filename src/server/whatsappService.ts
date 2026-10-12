/**
 * WhatsApp Business Platform / Meta Cloud API Integration Service
 * 
 * Secure, server-side implementation for ONS Healthcare.
 * Dispatches order alerts to Recipient A and Recipient B independently,
 * handles Meta Graph API responses, deduplication, retry logic, and connection tests.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIT_LOG_FILE = path.resolve(__dirname, '../../whatsapp-audit-logs.json');

export interface RecipientResult {
  recipientId: 'recipient_a' | 'recipient_b';
  phone: string;
  status: 'sent' | 'failed' | 'not_configured' | 'pending';
  messageId?: string;
  error?: string;
  timestamp: string;
  httpStatus?: number;
  attempts?: number;
}

export interface OrderNotificationResponse {
  success: boolean;
  orderId: string;
  deduplicated?: boolean;
  recipientA: RecipientResult;
  recipientB: RecipientResult;
  overallStatus: 'sent' | 'partial' | 'failed' | 'not_configured';
  timestamp: string;
  error?: string;
}

export interface NotificationAuditLog {
  id: string;
  orderId: string;
  timestamp: string;
  type: 'order_alert' | 'test' | 'retry';
  recipientA: RecipientResult;
  recipientB: RecipientResult;
  overallStatus: 'sent' | 'partial' | 'failed' | 'not_configured';
  error?: string;
}

// In-memory deduplication cache: orderId -> timestamp of dispatch
const dispatchedOrdersCache = new Map<string, number>();
const DEDUPLICATION_WINDOW_MS = 60 * 1000; // 60 seconds

// Audit log history in-memory + file persistence
const auditLogs: NotificationAuditLog[] = loadAuditLogsFromFile();
const MAX_LOGS = 100;

function loadAuditLogsFromFile(): NotificationAuditLog[] {
  try {
    if (fs.existsSync(AUDIT_LOG_FILE)) {
      const raw = fs.readFileSync(AUDIT_LOG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(0, MAX_LOGS);
    }
  } catch (err) {
    console.warn('[WhatsApp Service] Could not load audit logs file:', err);
  }
  return [];
}

function persistAuditLogs(): void {
  try {
    fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(auditLogs.slice(0, MAX_LOGS), null, 2), 'utf-8');
  } catch (err) {
    console.warn('[WhatsApp Service] Could not persist audit logs:', err);
  }
}

export function getAuditLogs(): NotificationAuditLog[] {
  return [...auditLogs];
}

/**
 * Normalizes any Egyptian or international phone number into E.164 digits format (without '+')
 * for WhatsApp Cloud API.
 */
export function normalizePhoneForWhatsApp(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';

  // Egyptian domestic format: 010..., 011..., 012..., 015... -> prepend 20
  if (digits.startsWith('01') && digits.length === 11) {
    return '20' + digits.substring(1);
  }
  // Already starts with 201... (12 digits)
  if (digits.startsWith('201') && digits.length === 12) {
    return digits;
  }
  return digits;
}

/**
 * Validates Egyptian and international phone numbers
 */
export function validatePhoneNumber(raw: string): { valid: boolean; normalized: string; reason?: string } {
  if (!raw || !raw.trim()) {
    return { valid: false, normalized: '', reason: 'رقم الهاتف فارغ (Phone number is empty)' };
  }
  const digits = raw.replace(/[^\d]/g, '');
  if (digits.length < 9) {
    return { valid: false, normalized: '', reason: 'رقم الهاتف قصير جداً (Number too short)' };
  }
  if (digits.length > 15) {
    return { valid: false, normalized: '', reason: 'رقم الهاتف أطول من الحد المسموح به دولياً (Number too long)' };
  }

  const normalized = normalizePhoneForWhatsApp(raw);
  return { valid: true, normalized };
}

/**
 * Masks sensitive API tokens for safe logging and error reports
 */
export function maskToken(token?: string): string {
  if (!token) return '(none)';
  if (token.length <= 8) return '••••';
  return `${token.substring(0, 4)}••••••••${token.substring(token.length - 4)}`;
}

/**
 * Sanitizes error messages by scrubbing potential authorization tokens, keys, or internal secrets
 */
export function sanitizeErrorMessage(raw?: string): string {
  if (!raw) return '';
  return raw
    .replace(/Bearer\s+[A-Za-z0-9_\-\.]+/gi, 'Bearer [TOKEN_REDACTED]')
    .replace(/EAAB[A-Za-z0-9_\-]+/gi, '[TOKEN_REDACTED]')
    .replace(/EAA[A-Za-z0-9_\-]{20,}/gi, '[TOKEN_REDACTED]')
    .replace(/access_token=[^&\s]+/gi, 'access_token=[REDACTED]')
    .trim();
}

/**
 * Formats the exact order notification content according to specifications
 */
export function formatOrderNotificationMessage(
  order: any,
  lang: 'ar' | 'en' = 'ar'
): string {
  const orderRef = order.id || `ORD-${Date.now().toString().slice(-6)}`;
  const services = Array.isArray(order.selectedServices) && order.selectedServices.length > 0
    ? order.selectedServices.map((s: any) => s.nameAr || s.nameEn).join(' + ')
    : order.serviceNameAr || order.serviceNameEn || 'رعاية وتمريض منزلي';
  
  const requestedDate = order.preferredDate || 'في أقرب وقت';
  const requestedTime = order.preferredTimeSlot || 'مرن / غير محدد';
  const serviceArea = order.areaNameAr || order.city || order.areaId || 'القاهرة / الجيزة';
  const submittedAt = order.createdAt
    ? new Date(order.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { timeZone: 'Africa/Cairo' })
    : new Date().toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { timeZone: 'Africa/Cairo' });
  const orderStatus = order.status === 'new' ? 'طلب جديد قيد التأكيد' : (order.status || 'طلب جديد');

  if (lang === 'en') {
    return `New Care Order Received — ONS Healthcare\n\nOrder Reference: ${orderRef}\nRequested Services: ${services}\nRequested Date: ${requestedDate}\nRequested Time: ${requestedTime}\nService Area: ${serviceArea}\nReceived At: ${submittedAt}\nStatus: ${orderStatus}\n\nPlease review the order in the admin console and contact the patient to confirm visit details.`;
  }

  return `طلب أوردر جديد — ONS Healthcare\n\nرقم الطلب: ${orderRef}\nالخدمات المطلوبة: ${services}\nالتاريخ المطلوب: ${requestedDate}\nالميعاد المطلوب: ${requestedTime}\nالمنطقة: ${serviceArea}\nوقت استلام الطلب: ${submittedAt}\nحالة الطلب: ${orderStatus}\n\nيرجى مراجعة الطلب والتواصل مع العميل لتأكيد التفاصيل.`;
}

/**
 * Low-level function to dispatch a message to WhatsApp Business Platform / Meta Cloud API
 */
export async function sendMetaCloudMessage(
  recipientPhone: string,
  messageText: string,
  options?: {
    templateName?: string;
    languageCode?: string;
  }
): Promise<{
  success: boolean;
  status: 'sent' | 'failed' | 'not_configured';
  messageId?: string;
  error?: string;
  httpStatus?: number;
}> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';

  if (!token || !phoneNumberId) {
    return {
      success: false,
      status: 'not_configured',
      error: 'WhatsApp Business API is not configured on the server (missing WHATSAPP_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID in environment).',
    };
  }

  const { valid, normalized, reason } = validatePhoneNumber(recipientPhone);
  if (!valid || !normalized) {
    return {
      success: false,
      status: 'failed',
      error: reason || `Invalid recipient phone number format: "${recipientPhone}".`,
    };
  }

  const endpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  // Determine whether to use template or text message
  const templateToUse = options?.templateName;
  const payload: any = templateToUse
    ? {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalized,
        type: 'template',
        template: {
          name: templateToUse,
          language: {
            code: options?.languageCode || 'en_US',
          },
        },
      }
    : {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalized,
        type: 'text',
        text: {
          preview_url: false,
          body: messageText,
        },
      };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: any = await res.json().catch(() => ({}));

    if (!res.ok) {
      // If direct text failed because outside 24h customer window (code 131047),
      // and we haven't tried template yet, attempt template if available
      if (data?.error?.code === 131047 && !templateToUse) {
        const fallbackTemplate = process.env.WHATSAPP_TEMPLATE_NAME || 'hello_world';
        console.log(`[WhatsApp API] Text failed (outside 24h window). Attempting template fallback "${fallbackTemplate}"...`);
        const fallbackRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: normalized,
            type: 'template',
            template: {
              name: fallbackTemplate,
              language: { code: options?.languageCode || 'en_US' },
            },
          }),
        });
        const fallbackData: any = await fallbackRes.json().catch(() => ({}));
        if (fallbackRes.ok && fallbackData?.messages?.[0]?.id) {
          return {
            success: true,
            status: 'sent',
            httpStatus: fallbackRes.status,
            messageId: fallbackData.messages[0].id,
          };
        }
      }

      let errorMessage = data?.error?.message || `Meta API HTTP ${res.status}`;
      const errorCode = data?.error?.code ? `(Code ${data.error.code})` : '';
      const errorSubcode = data?.error?.error_subcode ? `(Subcode ${data.error.error_subcode})` : '';

      // Helpful context for known Meta Cloud API error codes
      if (data?.error?.code === 131047) {
        errorMessage = 'Message failed to send: More than 24 hours have elapsed without user interaction. An approved template is required by Meta.';
      } else if (data?.error?.code === 190) {
        errorMessage = 'Invalid or expired Meta Graph API access token. Please verify WHATSAPP_API_TOKEN in server configuration.';
      } else if (data?.error?.code === 131030) {
        errorMessage = 'Recipient phone number is not registered as a test recipient in Meta Developer App development mode. To fix: Open Meta Developer Dashboard > WhatsApp > API Setup > add this phone number to the "To" (Recipient) list and verify via OTP, or publish the Meta App to Live mode.';
      }
      
      const sanitized = sanitizeErrorMessage(`${errorMessage} ${errorCode} ${errorSubcode}`.trim());
      console.warn(`[WhatsApp API Error] HTTP ${res.status}: ${sanitized}`);
      
      return {
        success: false,
        status: 'failed',
        httpStatus: res.status,
        error: sanitized,
      };
    }

    const messageId = data?.messages?.[0]?.id;
    return {
      success: true,
      status: 'sent',
      httpStatus: res.status,
      messageId: messageId || 'accepted_by_meta',
    };
  } catch (networkError: any) {
    const sanitized = sanitizeErrorMessage(networkError.message || 'Network communication error connecting to Meta Graph API.');
    console.error('[WhatsApp Network Error]', sanitized);
    return {
      success: false,
      status: 'failed',
      error: sanitized,
    };
  }
}

export interface NotifyOrderOptions {
  recipientAPhone?: string;
  recipientBPhone?: string;
  language?: 'ar' | 'en';
  forceRetry?: boolean;
  retryTarget?: 'both' | 'recipient_a' | 'recipient_b';
}

/**
 * Server-side order notification trigger:
 * Dispatches to Recipient A and Recipient B independently,
 * records each status separately, and prevents duplicate alerts.
 */
export async function notifyNewOrder(
  order: any,
  config?: NotifyOrderOptions
): Promise<OrderNotificationResponse> {
  const orderId = order.id || `ORD-${Date.now()}`;
  const now = Date.now();
  const timestampStr = new Date().toISOString();

  // Deduplication check: if order was successfully notified within the window, skip duplicate calls
  // unless explicitly requested with forceRetry
  const lastDispatched = dispatchedOrdersCache.get(orderId);
  if (!config?.forceRetry && lastDispatched && now - lastDispatched < DEDUPLICATION_WINDOW_MS) {
    return {
      success: true,
      orderId,
      deduplicated: true,
      overallStatus: 'sent',
      timestamp: timestampStr,
      recipientA: {
        recipientId: 'recipient_a',
        phone: config?.recipientAPhone || '',
        status: 'sent',
        timestamp: timestampStr,
      },
      recipientB: {
        recipientId: 'recipient_b',
        phone: config?.recipientBPhone || '',
        status: 'sent',
        timestamp: timestampStr,
      },
    };
  }

  // Determine recipient numbers: passed config -> environment variables -> fallback
  const phoneA = config?.recipientAPhone || process.env.WHATSAPP_RECIPIENT_A || '';
  const phoneB = config?.recipientBPhone || process.env.WHATSAPP_RECIPIENT_B || '';
  const lang = config?.language || 'ar';
  const retryTarget = config?.retryTarget || 'both';

  const messageText = formatOrderNotificationMessage(order, lang);

  // Send to Recipient A independently
  let resultA: RecipientResult;
  if (retryTarget === 'recipient_b' && order.whatsappNotificationLog?.recipientA) {
    // Preserve existing status for Recipient A if retrying only Recipient B
    resultA = { ...order.whatsappNotificationLog.recipientA };
  } else if (!phoneA) {
    resultA = {
      recipientId: 'recipient_a',
      phone: '',
      status: 'not_configured',
      error: 'Recipient A phone number is not configured in settings.',
      timestamp: timestampStr,
      attempts: 0,
    };
  } else {
    const apiResA = await sendMetaCloudMessage(phoneA, messageText);
    resultA = {
      recipientId: 'recipient_a',
      phone: phoneA,
      status: apiResA.status,
      messageId: apiResA.messageId,
      error: apiResA.error,
      httpStatus: apiResA.httpStatus,
      timestamp: timestampStr,
      attempts: ((order.whatsappNotificationLog?.recipientA?.attempts || 0) + 1),
    };
  }

  // Send to Recipient B independently
  let resultB: RecipientResult;
  if (retryTarget === 'recipient_a' && order.whatsappNotificationLog?.recipientB) {
    // Preserve existing status for Recipient B if retrying only Recipient A
    resultB = { ...order.whatsappNotificationLog.recipientB };
  } else if (!phoneB) {
    resultB = {
      recipientId: 'recipient_b',
      phone: '',
      status: 'not_configured',
      error: 'Recipient B phone number is not configured in settings.',
      timestamp: timestampStr,
      attempts: 0,
    };
  } else {
    const apiResB = await sendMetaCloudMessage(phoneB, messageText);
    resultB = {
      recipientId: 'recipient_b',
      phone: phoneB,
      status: apiResB.status,
      messageId: apiResB.messageId,
      error: apiResB.error,
      httpStatus: apiResB.httpStatus,
      timestamp: timestampStr,
      attempts: ((order.whatsappNotificationLog?.recipientB?.attempts || 0) + 1),
    };
  }

  // Calculate overall status
  let overallStatus: 'sent' | 'partial' | 'failed' | 'not_configured' = 'failed';
  if (resultA.status === 'sent' && resultB.status === 'sent') {
    overallStatus = 'sent';
  } else if (resultA.status === 'sent' || resultB.status === 'sent') {
    overallStatus = 'partial';
  } else if (resultA.status === 'not_configured' && resultB.status === 'not_configured') {
    overallStatus = 'not_configured';
  } else {
    overallStatus = 'failed';
  }

  // Record in deduplication cache if at least one was sent
  if (overallStatus === 'sent' || overallStatus === 'partial') {
    dispatchedOrdersCache.set(orderId, now);
  }

  const logEntry: NotificationAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    orderId,
    timestamp: timestampStr,
    type: config?.forceRetry ? 'retry' : 'order_alert',
    recipientA: resultA,
    recipientB: resultB,
    overallStatus,
    error: resultA.error || resultB.error,
  };
  auditLogs.unshift(logEntry);
  if (auditLogs.length > MAX_LOGS) auditLogs.pop();
  persistAuditLogs();

  return {
    success: overallStatus === 'sent' || overallStatus === 'partial',
    orderId,
    recipientA: resultA,
    recipientB: resultB,
    overallStatus,
    timestamp: timestampStr,
    error: resultA.error || resultB.error,
  };
}

/**
 * Real connection test endpoint: tests the Meta Graph API connection and optionally sends a test alert.
 * Never simulates success; verifies against live Meta endpoints.
 */
export async function testConnection(testPhone?: string): Promise<{
  success: boolean;
  status: 'connected' | 'error' | 'not_configured';
  details: any;
  messageId?: string;
  error?: string;
}> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';

  if (!token || !phoneNumberId) {
    return {
      success: false,
      status: 'not_configured',
      details: {
        hasToken: Boolean(token),
        hasPhoneNumberId: Boolean(phoneNumberId),
      },
      error: 'Cannot test WhatsApp connection: WHATSAPP_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID is missing from server environment.',
    };
  }

  // Step 1: Verify the phone number endpoint with Meta Graph API
  try {
    const metaVerifyRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}?fields=verified_name,code_verification_status,display_phone_number,quality_rating`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const verifyData: any = await metaVerifyRes.json().catch(() => ({}));

    if (!metaVerifyRes.ok) {
      const errMsg = verifyData?.error?.message || `Meta Graph API returned HTTP ${metaVerifyRes.status}`;
      const sanitized = sanitizeErrorMessage(errMsg);
      return {
        success: false,
        status: 'error',
        details: {
          httpStatus: metaVerifyRes.status,
          code: verifyData?.error?.code,
          subcode: verifyData?.error?.error_subcode,
        },
        error: `Meta API verification failed: ${sanitized}`,
      };
    }

    // Step 2: If a test recipient phone was provided, try sending an actual test message
    let testMessageResult: any = null;
    if (testPhone && testPhone.trim()) {
      const testMsg = `🧪 فحص اتصال واتساب الرسمي — ONS Healthcare\n\nتم الاتصال بـ Meta Cloud API بنجاح.\nالتاريخ والوقت: ${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}\nرقم الهاتف المعرف: ${verifyData.display_phone_number || phoneNumberId}`;
      testMessageResult = await sendMetaCloudMessage(testPhone, testMsg);
      if (!testMessageResult.success) {
        return {
          success: false,
          status: 'error',
          details: {
            phoneVerified: true,
            verifiedName: verifyData.verified_name,
            displayPhoneNumber: verifyData.display_phone_number,
            qualityRating: verifyData.quality_rating,
            testSendResult: testMessageResult,
          },
          error: `Phone number is valid on Meta, but test message dispatch failed: ${testMessageResult.error}`,
        };
      }
    }

    return {
      success: true,
      status: 'connected',
      details: {
        verifiedName: verifyData.verified_name,
        displayPhoneNumber: verifyData.display_phone_number,
        qualityRating: verifyData.quality_rating,
        testMessage: testMessageResult,
      },
      messageId: testMessageResult?.messageId,
    };
  } catch (networkErr: any) {
    const sanitized = sanitizeErrorMessage(networkErr.message || 'Unknown network error');
    return {
      success: false,
      status: 'error',
      details: null,
      error: `Network error verifying Meta credentials: ${sanitized}`,
    };
  }
}
