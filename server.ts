import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import {
  notifyNewOrder,
  testConnection,
  getAuditLogs,
  maskToken,
  validatePhoneNumber,
  sanitizeErrorMessage,
  NotifyOrderOptions,
} from './src/server/whatsappService.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// Persistent server-side WhatsApp configuration file
const CONFIG_FILE = path.resolve(__dirname, 'whatsapp-config.json');

export interface StoredWhatsAppConfig {
  enabled: boolean;
  recipientAPhone: string;
  recipientBPhone: string;
  recipientAName?: string;
  recipientBName?: string;
  defaultLanguage: 'ar' | 'en';
  lastTestedAt?: string;
  lastTestStatus?: 'connected' | 'error' | 'not_configured';
  lastError?: string;
  lastTestMessageId?: string;
}

function loadStoredConfig(): StoredWhatsAppConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Server] Could not read whatsapp-config.json:', err);
  }
  return {
    enabled: true,
    recipientAPhone: process.env.WHATSAPP_RECIPIENT_A || '',
    recipientBPhone: process.env.WHATSAPP_RECIPIENT_B || '',
    defaultLanguage: 'ar',
  };
}

function saveStoredConfig(cfg: Partial<StoredWhatsAppConfig>): StoredWhatsAppConfig {
  const current = loadStoredConfig();
  const updated: StoredWhatsAppConfig = { ...current, ...cfg };
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Could not save whatsapp-config.json:', err);
  }
  return updated;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // -------------------------------------------------------------
  // WhatsApp Business Cloud API Endpoints
  // -------------------------------------------------------------

  /**
   * GET /api/whatsapp/config
   * Returns current server configuration state (with credentials securely masked)
   */
  app.get('/api/whatsapp/config', (_req: Request, res: Response) => {
    const stored = loadStoredConfig();
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'ons_new_order_alert';

    const isConfigured = Boolean(token && phoneId);

    res.json({
      success: true,
      enabled: stored.enabled,
      recipientAPhone: stored.recipientAPhone,
      recipientBPhone: stored.recipientBPhone,
      recipientAName: stored.recipientAName || '',
      recipientBName: stored.recipientBName || '',
      defaultLanguage: stored.defaultLanguage || 'ar',
      templateName,
      isConfigured,
      hasToken: Boolean(token),
      hasPhoneNumberId: Boolean(phoneId),
      phoneNumberId: phoneId ? `${phoneId.substring(0, 4)}••••` : '',
      tokenMasked: maskToken(token),
      businessAccountId: accountId || '',
      lastTestedAt: stored.lastTestedAt || null,
      lastTestStatus: stored.lastTestStatus || (isConfigured ? 'untested' : 'not_configured'),
      lastError: stored.lastError || null,
      lastTestMessageId: stored.lastTestMessageId || null,
    });
  });

  /**
   * POST /api/whatsapp/config
   * Updates admin-configured Recipient A and Recipient B phone numbers & toggles
   */
  app.post('/api/whatsapp/config', (req: Request, res: Response) => {
    const {
      recipientAPhone,
      recipientBPhone,
      recipientAName,
      recipientBName,
      enabled,
      defaultLanguage,
    } = req.body;

    // Validate Recipient A phone if provided
    if (recipientAPhone && typeof recipientAPhone === 'string' && recipientAPhone.trim()) {
      const vA = validatePhoneNumber(recipientAPhone);
      if (!vA.valid) {
        return res.status(400).json({
          success: false,
          error: `رقم المستلم أ غير صالح: ${vA.reason} | Invalid Recipient A phone number.`,
        });
      }
    }

    // Validate Recipient B phone if provided
    if (recipientBPhone && typeof recipientBPhone === 'string' && recipientBPhone.trim()) {
      const vB = validatePhoneNumber(recipientBPhone);
      if (!vB.valid) {
        return res.status(400).json({
          success: false,
          error: `رقم المستلم ب غير صالح: ${vB.reason} | Invalid Recipient B phone number.`,
        });
      }
    }

    const updated = saveStoredConfig({
      recipientAPhone: typeof recipientAPhone === 'string' ? recipientAPhone.trim() : undefined,
      recipientBPhone: typeof recipientBPhone === 'string' ? recipientBPhone.trim() : undefined,
      recipientAName: typeof recipientAName === 'string' ? recipientAName.trim() : undefined,
      recipientBName: typeof recipientBName === 'string' ? recipientBName.trim() : undefined,
      enabled: typeof enabled === 'boolean' ? enabled : undefined,
      defaultLanguage: defaultLanguage === 'en' ? 'en' : 'ar',
    });

    res.json({
      success: true,
      message: 'تم حفظ وتحديث إعدادات واتساب للأعمال بنجاح في الخادم | WhatsApp settings updated.',
      config: updated,
    });
  });

  /**
   * POST /api/whatsapp/notify-order
   * Triggered when an order is created or when an alert is retried
   */
  app.post('/api/whatsapp/notify-order', async (req: Request, res: Response) => {
    const { order, config, forceRetry, retryTarget } = req.body;

    if (!order || !order.id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order payload: missing order object or order.id.',
      });
    }

    const stored = loadStoredConfig();
    if (!stored.enabled) {
      return res.json({
        success: false,
        orderId: order.id,
        overallStatus: 'not_configured',
        message: 'إشعارات الواتساب معطلة حالياً في إعدادات الربط | WhatsApp notifications disabled.',
        recipientA: { recipientId: 'recipient_a', phone: stored.recipientAPhone, status: 'not_configured', timestamp: new Date().toISOString() },
        recipientB: { recipientId: 'recipient_b', phone: stored.recipientBPhone, status: 'not_configured', timestamp: new Date().toISOString() },
      });
    }

    // Merge stored recipient configuration with any overrides
    const effectiveConfig: NotifyOrderOptions = {
      recipientAPhone: config?.recipientAPhone || stored.recipientAPhone,
      recipientBPhone: config?.recipientBPhone || stored.recipientBPhone,
      language: config?.language || stored.defaultLanguage || 'ar',
      forceRetry: Boolean(forceRetry || config?.forceRetry),
      retryTarget: retryTarget || config?.retryTarget || 'both',
    };

    try {
      const result = await notifyNewOrder(order, effectiveConfig);
      res.json(result);
    } catch (err: any) {
      const sanitized = sanitizeErrorMessage(err.message || 'Internal server error processing notification.');
      console.error('[WhatsApp Route Error]', sanitized);
      res.status(500).json({
        success: false,
        orderId: order.id,
        overallStatus: 'failed',
        error: sanitized,
      });
    }
  });

  /**
   * POST /api/whatsapp/retry-order
   * Explicit endpoint for retrying an order notification
   */
  app.post('/api/whatsapp/retry-order', async (req: Request, res: Response) => {
    const { order, retryTarget } = req.body;

    if (!order || !order.id) {
      return res.status(400).json({
        success: false,
        error: 'Missing order data for retry.',
      });
    }

    const stored = loadStoredConfig();
    const effectiveConfig: NotifyOrderOptions = {
      recipientAPhone: stored.recipientAPhone,
      recipientBPhone: stored.recipientBPhone,
      language: stored.defaultLanguage || 'ar',
      forceRetry: true,
      retryTarget: retryTarget || 'both',
    };

    try {
      const result = await notifyNewOrder(order, effectiveConfig);
      res.json(result);
    } catch (err: any) {
      const sanitized = sanitizeErrorMessage(err.message || 'Internal server error during retry.');
      res.status(500).json({
        success: false,
        orderId: order.id,
        overallStatus: 'failed',
        error: sanitized,
      });
    }
  });

  /**
   * POST /api/whatsapp/test
   * Runs a genuine live connection test with Meta Graph API
   */
  app.post('/api/whatsapp/test', async (req: Request, res: Response) => {
    const { testPhone } = req.body;
    // Only dispatch test message if a specific recipient was explicitly provided in the request
    const phoneToTest = typeof testPhone === 'string' && testPhone.trim() ? testPhone.trim() : undefined;

    const result = await testConnection(phoneToTest);

    // Save test result in stored configuration
    saveStoredConfig({
      lastTestedAt: new Date().toISOString(),
      lastTestStatus: result.status,
      lastError: result.error ? sanitizeErrorMessage(result.error) : undefined,
      lastTestMessageId: result.messageId || undefined,
    });

    res.json(result);
  });

  /**
   * GET /api/whatsapp/logs
   * Retrieves recent notification audit records
   */
  app.get('/api/whatsapp/logs', (_req: Request, res: Response) => {
    const logs = getAuditLogs();
    res.json({
      success: true,
      logs,
    });
  });

  // -------------------------------------------------------------
  // Vite Middleware / Static Asset Mounting
  // -------------------------------------------------------------
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ONS Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[ONS Server] Fatal error starting server:', err);
  process.exit(1);
});
