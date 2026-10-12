import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Cpu,
  MessageSquare,
  Server,
  Save,
  Send,
  RefreshCw,
  PhoneCall,
  Info,
  Clock,
  HelpCircle,
  Check,
  X,
  Smartphone,
  Share2,
} from 'lucide-react';

interface ServerConfigState {
  enabled: boolean;
  recipientAPhone: string;
  recipientBPhone: string;
  recipientAName?: string;
  recipientBName?: string;
  defaultLanguage: 'ar' | 'en';
  templateName?: string;
  isConfigured: boolean;
  hasToken: boolean;
  hasPhoneNumberId: boolean;
  phoneNumberId: string;
  tokenMasked: string;
  businessAccountId: string;
  lastTestedAt: string | null;
  lastTestStatus: 'connected' | 'error' | 'not_configured' | 'untested';
  lastError: string | null;
  lastTestMessageId: string | null;
}

interface AuditLogItem {
  id: string;
  orderId: string;
  timestamp: string;
  type: 'order_alert' | 'test' | 'retry';
  recipientA: {
    recipientId: 'recipient_a';
    phone: string;
    status: 'sent' | 'failed' | 'not_configured' | 'pending';
    messageId?: string;
    error?: string;
    timestamp: string;
  };
  recipientB: {
    recipientId: 'recipient_b';
    phone: string;
    status: 'sent' | 'failed' | 'not_configured' | 'pending';
    messageId?: string;
    error?: string;
    timestamp: string;
  };
  overallStatus: 'sent' | 'partial' | 'failed' | 'not_configured';
  error?: string;
}

export const IntegrationsTab: React.FC = () => {
  const { language, t } = useLanguage();
  const { user, isOwner } = useAuth();
  const { retryWhatsAppNotification } = useData();

  const [activeIntegrationTab, setActiveIntegrationTab] = useState<'whatsapp' | 'labs' | 'security'>('whatsapp');
  
  // WhatsApp Integration Server State
  const [serverConfig, setServerConfig] = useState<ServerConfigState | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // Form Fields
  const [enabled, setEnabled] = useState<boolean>(true);
  const [recipientAPhone, setRecipientAPhone] = useState<string>('');
  const [recipientBPhone, setRecipientBPhone] = useState<string>('');
  const [recipientAName, setRecipientAName] = useState<string>('منسق الرعاية الميداني (Coordinator A)');
  const [recipientBName, setRecipientBName] = useState<string>('مدير العمليات السريرية (Operations Lead B)');
  const [defaultLanguage, setDefaultLanguage] = useState<'ar' | 'en'>('ar');

  // Actions State
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [testPhone, setTestPhone] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status: 'connected' | 'error' | 'not_configured';
    message?: string;
    error?: string;
    details?: any;
    messageId?: string;
  } | null>(null);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

  // Load configuration and logs on mount
  const fetchConfig = async () => {
    setIsLoadingConfig(true);
    setConfigError(null);
    try {
      const res = await fetch('/api/whatsapp/config');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ServerConfigState = await res.json();
      setServerConfig(data);
      setEnabled(data.enabled);
      setRecipientAPhone(data.recipientAPhone || '');
      setRecipientBPhone(data.recipientBPhone || '');
      setRecipientAName(data.recipientAName || 'منسق الرعاية الميداني (Coordinator A)');
      setRecipientBName(data.recipientBName || 'مدير العمليات السريرية (Operations Lead B)');
      setDefaultLanguage(data.defaultLanguage || 'ar');
      if (!testPhone && data.recipientAPhone) {
        setTestPhone(data.recipientAPhone);
      }
    } catch (err: any) {
      setConfigError(err.message || 'Could not load WhatsApp server configuration.');
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/whatsapp/logs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.logs)) {
          setAuditLogs(data.logs);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch WhatsApp logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchLogs();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          recipientAPhone: recipientAPhone.trim(),
          recipientBPhone: recipientBPhone.trim(),
          recipientAName: recipientAName.trim(),
          recipientBName: recipientBName.trim(),
          defaultLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings.');
      }

      setSaveSuccess(true);
      fetchConfig();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Error updating WhatsApp config.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunConnectionTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testPhone: testPhone.trim() || undefined }),
      });

      const data = await res.json();
      setTestResult(data);
      // Refresh config to update lastTestedAt and lastTestStatus
      fetchConfig();
      fetchLogs();
    } catch (err: any) {
      setTestResult({
        success: false,
        status: 'error',
        error: err.message || 'Network error running connection test.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRetryOrderNotification = async (orderId: string, orderData?: any) => {
    setRetryingOrderId(orderId);
    try {
      await retryWhatsAppNotification(orderId);
      await fetchLogs();
    } catch (err: any) {
      console.error('Error retrying notification:', err);
    } finally {
      setRetryingOrderId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#70A69A] tracking-wider uppercase mb-1">
          <Cpu className="w-3.5 h-3.5" />
          <span>{t('إدارة الأنظمة والربط الخارجي المعتمد', 'Accredited External APIs & Automated Pipelines')}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#153B36]">
          {t('التكاملات والبنية التحتية — منصة واتساب للأعمال', 'Integrations & Infrastructure — WhatsApp Business Platform')}
        </h1>
        <p className="text-xs text-[#153B36]/70 mt-1">
          {t(
            'إدارة إشعارات الطلبات الفورية عبر Meta Cloud API، وتحديد أرقام المستلمين المستقلين، وفحص الاتصال الحي.',
            'Manage real-time order alerts via official Meta Cloud API, configure independent recipients, and monitor live connection health.'
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#153B36]/10 pb-2">
        <button
          onClick={() => setActiveIntegrationTab('whatsapp')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeIntegrationTab === 'whatsapp'
              ? 'bg-[#153B36] text-[#F5F2EB]'
              : 'text-[#153B36]/70 hover:bg-[#153B36]/5'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('إشعارات واتساب للأعمال (Cloud API)', 'WhatsApp Business Cloud API')}</span>
        </button>
        <button
          onClick={() => setActiveIntegrationTab('labs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeIntegrationTab === 'labs'
              ? 'bg-[#153B36] text-[#F5F2EB]'
              : 'text-[#153B36]/70 hover:bg-[#153B36]/5'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-[#70A69A]" />
          <span>{t('بوابات المعامل الطبية (Lab APIs)', 'Lab Partner APIs')}</span>
        </button>
        <button
          onClick={() => setActiveIntegrationTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeIntegrationTab === 'security'
              ? 'bg-[#153B36] text-[#F5F2EB]'
              : 'text-[#153B36]/70 hover:bg-[#153B36]/5'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('سياسة الأمان وحماية الأسرار', 'Zero-Secrets Security')}</span>
        </button>
      </div>

      {/* WhatsApp Platform Tab */}
      {activeIntegrationTab === 'whatsapp' && (
        <div className="space-y-6">
          {/* Connection Status Banner */}
          <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#153B36]/10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                    serverConfig?.lastTestStatus === 'connected'
                      ? 'bg-emerald-100 text-emerald-800'
                      : serverConfig?.isConfigured
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#153B36]">
                      {t('حالة الاتصال بمنصة Meta Graph API', 'Meta Graph API Connection Status')}
                    </h2>
                    {serverConfig?.lastTestStatus === 'connected' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        🟢 {t('متصل ونشط (Connected)', 'Connected')}
                      </span>
                    ) : serverConfig?.lastTestStatus === 'error' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                        🔴 {t('خطأ في الاتصال (Error)', 'Connection Error')}
                      </span>
                    ) : serverConfig?.isConfigured ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                        🟡 {t('بانتظار الفحص (Untested)', 'Untested')}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300">
                        ⚪ {t('غير مهيأ في الخادم (Not Configured)', 'Not Configured')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#153B36]/70 mt-0.5">
                    {t(
                      'يتم إرسال إشعارات الطلبات الجديدة في أُنس عبر السيرفر الخلفي الرسمي المعتمد من Meta بدون أي برامج غير رسمية.',
                      'Order notifications are dispatched via official Meta Cloud API directly from the backend server without unofficial scrapers.'
                    )}
                  </p>
                </div>
              </div>

              {/* Status Action */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchConfig}
                  disabled={isLoadingConfig}
                  className="p-2.5 rounded-xl border border-[#153B36]/15 hover:bg-[#153B36]/5 text-[#153B36] transition-colors"
                  title={t('تحديث الحالة', 'Refresh Status')}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingConfig ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Connection Diagnostics Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F5F2EB]/60 border border-[#153B36]/10">
                <span className="text-[#153B36]/60 block text-[11px] font-semibold">
                  {t('بيانات الاعتماد بالخادم (.env):', 'Server Credentials (.env):')}
                </span>
                <span className="font-bold text-[#153B36] mt-0.5 block font-mono">
                  {serverConfig?.isConfigured
                    ? `Token: ${serverConfig.tokenMasked} | ID: ${serverConfig.phoneNumberId}`
                    : t('غير محددة (Missing WHATSAPP_API_TOKEN / ID)', 'Missing in .env')}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F5F2EB]/60 border border-[#153B36]/10">
                <span className="text-[#153B36]/60 block text-[11px] font-semibold">
                  {t('آخر فحص اتصال ناجح:', 'Last Successful Test:')}
                </span>
                <span className="font-bold text-[#153B36] mt-0.5 block">
                  {serverConfig?.lastTestedAt
                    ? new Date(serverConfig.lastTestedAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { timeZone: 'Africa/Cairo' })
                    : t('لم يتم الفحص بعد', 'Not tested yet')}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F5F2EB]/60 border border-[#153B36]/10">
                <span className="text-[#153B36]/60 block text-[11px] font-semibold">
                  {t('آخر خطأ مسجل (مع حجب الأسرار):', 'Last Recorded Error (Sanitized):')}
                </span>
                <span className="font-semibold text-rose-700 mt-0.5 block truncate" title={serverConfig?.lastError || 'None'}>
                  {serverConfig?.lastError || t('لا يوجد أخطاء', 'None')}
                </span>
              </div>
            </div>

            {/* If Not Configured, Show Setup Checklist */}
            {!serverConfig?.isConfigured && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{t('متطلبات الربط بالخادم (Server Setup Required):', 'What the business owner must provide:')}</span>
                </div>
                <p className="leading-relaxed">
                  {t(
                    'لتفعيل الإشعارات الرسمية الحية، يجب إضافة المتغيرات التالية في إعدادات بيئة الخادم (ملف .env في السيرفر أو لوحة Cloud Run Secrets):',
                    'To enable live WhatsApp notifications, the following variables must be configured in server environment (.env or Cloud Run Secrets):'
                  )}
                </p>
                <div className="bg-amber-100/70 p-3 rounded-xl font-mono text-[11px] text-amber-950 space-y-1" dir="ltr">
                  <div>WHATSAPP_PHONE_NUMBER_ID="123456789012345"</div>
                  <div>WHATSAPP_API_TOKEN="EAAB..."</div>
                  <div>WHATSAPP_BUSINESS_ACCOUNT_ID="123456789012345"</div>
                  <div>WHATSAPP_API_VERSION="v21.0"</div>
                </div>
                <span className="block text-[11px] text-amber-800">
                  {t(
                    'تأتي هذه المعلمات من حساب مطوري فيسبوك (Meta for Developers) > تطبيق WhatsApp Business > System User Token الدائم بصلاحية whatsapp_business_messaging.',
                    'Obtained from Meta for Developers > WhatsApp Business App > Permanent System User Access Token with whatsapp_business_messaging permission.'
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Form: Recipients & Integration Controls */}
          <form onSubmit={handleSaveConfig} className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#153B36]/10 gap-3">
              <div>
                <h2 className="text-base font-bold text-[#153B36] flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-[#70A69A]" />
                  <span>{t('أرقام مستلمي الإشعارات الفورية (Recipient A & B)', 'Internal Recipient Configuration')}</span>
                </h2>
                <span className="text-xs text-[#153B36]/70">
                  {t('إرسال إشعار مستقل لكل رقم مع تسجيل حالة التسليم منفصلة تماماً', 'Independent delivery records for each internal recipient')}
                </span>
              </div>

              {/* Master Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#153B36]">
                  {enabled ? t('الإشعارات مفعلة', 'Notifications Enabled') : t('الإشعارات معطلة', 'Notifications Disabled')}
                </span>
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-hidden ${
                    enabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                      enabled ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0.5 rtl:-translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Recipient A Card */}
            <div className="p-5 rounded-2xl bg-[#F5F2EB]/50 border border-[#153B36]/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#153B36] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#153B36] text-white flex items-center justify-center text-[11px]">A</span>
                  {t('المستلم الداخلي الأول (Recipient A)', 'Internal Recipient A')}
                </span>
                <span className="text-[11px] text-[#70A69A] font-semibold">
                  {t('منسق الرعاية / هاتف الطوارئ والمناوبة', 'Care Coordinator / On-duty Mobile')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-[#153B36] block mb-1">
                    {t('رقم هاتف واتساب للمستلم (أ) *', 'Recipient A WhatsApp Phone *')}
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={recipientAPhone}
                    onChange={(e) => setRecipientAPhone(e.target.value)}
                    placeholder="+20 103 663 9814 أو 01036639814"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#153B36]/20 bg-white font-mono text-[#153B36]"
                  />
                  <span className="text-[11px] text-[#153B36]/60 mt-1 block">
                    {t('يقبل التنسيق المصري 010... أو الدولي +20...', 'Egyptian local 010... or international format +20...')}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-[#153B36] block mb-1">
                    {t('وصف أو صفة المستلم (أ)', 'Recipient A Role/Name')}
                  </label>
                  <input
                    type="text"
                    value={recipientAName}
                    onChange={(e) => setRecipientAName(e.target.value)}
                    placeholder="مثال: منسق الرعاية السريرية"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#153B36]/20 bg-white text-[#153B36]"
                  />
                </div>
              </div>
            </div>

            {/* Recipient B Card */}
            <div className="p-5 rounded-2xl bg-[#F5F2EB]/50 border border-[#153B36]/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#153B36] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#70A69A] text-white flex items-center justify-center text-[11px]">B</span>
                  {t('المستلم الداخلي الثاني (Recipient B)', 'Internal Recipient B')}
                </span>
                <span className="text-[11px] text-[#70A69A] font-semibold">
                  {t('إدارة العمليات / المالك / خط النسخ الاحتياطي', 'Operations Lead / Backup Alert')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-[#153B36] block mb-1">
                    {t('رقم هاتف واتساب للمستلم (ب) *', 'Recipient B WhatsApp Phone *')}
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={recipientBPhone}
                    onChange={(e) => setRecipientBPhone(e.target.value)}
                    placeholder="+20 100 123 4567 أو 01001234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#153B36]/20 bg-white font-mono text-[#153B36]"
                  />
                  <span className="text-[11px] text-[#153B36]/60 mt-1 block">
                    {t('يستلم التنبيه مستقلاً تماماً عن المستلم (أ)', 'Receives notification completely independent of A')}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-[#153B36] block mb-1">
                    {t('وصف أو صفة المستلم (ب)', 'Recipient B Role/Name')}
                  </label>
                  <input
                    type="text"
                    value={recipientBName}
                    onChange={(e) => setRecipientBName(e.target.value)}
                    placeholder="مثال: مدير العمليات السريرية"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#153B36]/20 bg-white text-[#153B36]"
                  />
                </div>
              </div>
            </div>

            {/* Language & Template Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-[#153B36] block mb-1">
                  {t('لغة الإشعار الافتراضية (Default Notification Language)', 'Default Language')}
                </label>
                <select
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value as 'ar' | 'en')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#153B36]/20 bg-white text-[#153B36] font-semibold"
                >
                  <option value="ar">العربية (Arabic — الافتراضية)</option>
                  <option value="en">English (الإنجليزية)</option>
                </select>
                <span className="text-[11px] text-[#153B36]/60 mt-1 block">
                  {t('نص الإشعار محدد ومصاغ بدقة طبية بدون بيانات حساسة غير ضرورية.', 'Formatted with clinical clarity without unnecessary sensitive data.')}
                </span>
              </div>

              <div>
                <label className="font-bold text-[#153B36] block mb-1">
                  {t('قالب Meta المعتمد (Pre-approved Template Name)', 'Meta Template Name')}
                </label>
                <input
                  type="text"
                  readOnly
                  value={serverConfig?.templateName || 'ons_new_order_alert'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#153B36]/20 bg-[#F5F2EB]/50 font-mono text-[#153B36]/70 cursor-not-allowed"
                />
                <span className="text-[11px] text-[#153B36]/60 mt-1 block">
                  {t('محدد عبر إعدادات الخادم وفق لوائح واتساب لرسائل الأعمال الخارجية.', 'Configured via server environment according to Meta messaging policies.')}
                </span>
              </div>
            </div>

            {/* Save Action Banner */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{t('تم حفظ وتحديث أرقام المستلمين في الخادم بنجاح.', 'Recipient configuration successfully saved on server.')}</span>
                  </span>
                )}
                {saveError && (
                  <span className="text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>{saveError}</span>
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-[#70A69A]" />
                <span>{isSaving ? t('جاري الحفظ...', 'Saving...') : t('حفظ إعدادات المستلمين', 'Save Recipient Settings')}</span>
              </button>
            </div>
          </form>

          {/* Real Live Connection Test Card */}
          <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-[#153B36]/10">
              <RefreshCw className="w-5 h-5 text-[#70A69A]" />
              <h2 className="text-base font-bold text-[#153B36]">
                {t('فحص الاتصال الفعلي وإرسال رسالة تجريبية (Real Connection Test)', 'Live Connection Test & Dispatch')}
              </h2>
            </div>

            <p className="text-xs text-[#153B36]/80 leading-relaxed">
              {t(
                'يقوم هذا الفحص بإجراء اتصال مباشر مع سيرفرات Meta Graph API للتحقق من صلاحية معرّف الهاتف ورمز الوصول، ويمكن إرسال رسالة تجريبية حقيقية لأحد الأرقام المحددة.',
                'Performs a real-time HTTP handshake with Meta Graph API to verify phone ID and token validity, with optional test message dispatch.'
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-[#153B36] block mb-1">
                  {t('رقم الهاتف المراد إرسال رسالة الفحص إليه:', 'Phone number to receive test alert:')}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="مثال: 01036639814 أو اترك فارغاً للتحقق من الـ API فقط"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#153B36]/20 bg-white font-mono text-[#153B36]"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleRunConnectionTest}
                  disabled={isTesting}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? t('جاري الفحص المباشر...', 'Testing Live API...') : t('بدء فحص الاتصال الحي', 'Run Live Test')}</span>
                </button>
              </div>
            </div>

            {/* Test Results Display */}
            {testResult && (
              <div
                className={`p-4 rounded-2xl text-xs space-y-2 border ${
                  testResult.status === 'connected'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : testResult.status === 'not_configured'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {testResult.status === 'connected' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{t('نجح فحص الاتصال بـ Meta Graph API!', 'Meta Graph API handshake succeeded!')}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>{t('نتيجة الفحص: غير متصل أو فشل الاتصال', 'Connection check failed')}</span>
                    </>
                  )}
                </div>

                {testResult.error && (
                  <p className="font-mono text-[11px] bg-white/70 p-2.5 rounded-xl border border-current/20 leading-relaxed">
                    {testResult.error}
                  </p>
                )}

                {testResult.details && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    {testResult.details.verifiedName && (
                      <div>
                        <span className="opacity-70">{t('الاسم المعتمد في Meta:', 'Verified Name:')}</span>{' '}
                        <span className="font-bold">{testResult.details.verifiedName}</span>
                      </div>
                    )}
                    {testResult.details.displayPhoneNumber && (
                      <div>
                        <span className="opacity-70">{t('رقم الهاتف المعروض:', 'Display Phone:')}</span>{' '}
                        <span className="font-bold font-mono">{testResult.details.displayPhoneNumber}</span>
                      </div>
                    )}
                    {testResult.details.qualityRating && (
                      <div>
                        <span className="opacity-70">{t('تقييم الجودة (Quality):', 'Quality Rating:')}</span>{' '}
                        <span className="font-bold">{testResult.details.qualityRating}</span>
                      </div>
                    )}
                    {testResult.messageId && (
                      <div>
                        <span className="opacity-70">{t('معرّف الرسالة المستلم من Meta:', 'Message ID:')}</span>{' '}
                        <span className="font-mono font-bold">{testResult.messageId}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notification Audit Log & History Table */}
          <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#153B36]/10 gap-3">
              <div>
                <h2 className="text-base font-bold text-[#153B36] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#70A69A]" />
                  <span>{t('سجل إرسال الإشعارات وتأكيد التسليم (Notification History)', 'Notification History & Audit Log')}</span>
                </h2>
                <span className="text-xs text-[#153B36]/70">
                  {t('حالة كل إشعار لكل مستلم على حدة مع معرّف Meta ورسائل الخطأ المستقلة', 'Per-recipient delivery status, Meta IDs, and retry actions')}
                </span>
              </div>

              <button
                type="button"
                onClick={fetchLogs}
                disabled={isLoadingLogs}
                className="px-3.5 py-1.5 rounded-xl border border-[#153B36]/20 text-[#153B36] hover:bg-[#153B36]/5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                <span>{t('تحديث السجل', 'Refresh Logs')}</span>
              </button>
            </div>

            {auditLogs.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#153B36]/60">
                {t('لا توجد إشعارات مسجلة حتى الآن. ستظهر هنا بمجرد وصول طلب جديد عبر الموقع.', 'No notification logs yet. Real alerts will appear here upon customer order submission.')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#153B36]/10 bg-[#F5F2EB]/50 text-[#153B36]">
                      <th className="py-2.5 px-3 font-bold text-start">{t('الطلب / النوع', 'Order / Type')}</th>
                      <th className="py-2.5 px-3 font-bold text-start">{t('التاريخ والوقت', 'Timestamp')}</th>
                      <th className="py-2.5 px-3 font-bold text-start">{t('المستلم (أ) — Recipient A', 'Recipient A')}</th>
                      <th className="py-2.5 px-3 font-bold text-start">{t('المستلم (ب) — Recipient B', 'Recipient B')}</th>
                      <th className="py-2.5 px-3 font-bold text-start">{t('الحالة الإجمالية', 'Overall Status')}</th>
                      <th className="py-2.5 px-3 font-bold text-center">{t('إجراء', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#153B36]/10">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F5F2EB]/30 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-[#153B36] block">{log.orderId}</span>
                          <span className="text-[10px] text-[#153B36]/60 uppercase">{log.type}</span>
                        </td>
                        <td className="py-3 px-3 text-[#153B36]/80 text-[11px] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { timeZone: 'Africa/Cairo' })}
                        </td>
                        {/* Recipient A Cell */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className="font-mono text-[11px] text-[#153B36] block">{log.recipientA?.phone || '—'}</span>
                            {log.recipientA?.status === 'sent' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3 text-emerald-600" />
                                {t('تم الإرسال', 'Sent')}
                              </span>
                            ) : log.recipientA?.status === 'failed' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-rose-800 font-bold bg-rose-100 px-2 py-0.5 rounded-full" title={log.recipientA.error}>
                                <X className="w-3 h-3 text-rose-600" />
                                {t('فشل', 'Failed')}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                                {t('غير مهيأ', 'Not Configured')}
                              </span>
                            )}
                            {log.recipientA?.messageId && (
                              <span className="text-[9px] text-[#153B36]/50 font-mono block truncate max-w-[120px]">
                                ID: {log.recipientA.messageId}
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Recipient B Cell */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className="font-mono text-[11px] text-[#153B36] block">{log.recipientB?.phone || '—'}</span>
                            {log.recipientB?.status === 'sent' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3 text-emerald-600" />
                                {t('تم الإرسال', 'Sent')}
                              </span>
                            ) : log.recipientB?.status === 'failed' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-rose-800 font-bold bg-rose-100 px-2 py-0.5 rounded-full" title={log.recipientB.error}>
                                <X className="w-3 h-3 text-rose-600" />
                                {t('فشل', 'Failed')}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                                {t('غير مهيأ', 'Not Configured')}
                              </span>
                            )}
                            {log.recipientB?.messageId && (
                              <span className="text-[9px] text-[#153B36]/50 font-mono block truncate max-w-[120px]">
                                ID: {log.recipientB.messageId}
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Overall Status */}
                        <td className="py-3 px-3">
                          {log.overallStatus === 'sent' ? (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              {t('ناجح (المستلمين)', 'Sent Both')}
                            </span>
                          ) : log.overallStatus === 'partial' ? (
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              {t('جزئي (مستلم واحد)', 'Partial')}
                            </span>
                          ) : log.overallStatus === 'not_configured' ? (
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              {t('غير مفعل', 'Disabled')}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                              {t('فشل الإرسال', 'Failed')}
                            </span>
                          )}
                        </td>
                        {/* Action Column */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRetryOrderNotification(log.orderId)}
                            disabled={retryingOrderId === log.orderId}
                            className="px-2.5 py-1 rounded-lg border border-[#153B36]/20 hover:bg-[#153B36]/10 text-[#153B36] text-[11px] font-semibold transition-colors disabled:opacity-50"
                          >
                            {retryingOrderId === log.orderId ? t('جاري الإعادة...', 'Retrying...') : t('إعادة الإرسال', 'Retry')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Educational / Shared Access Architecture Guide (Requirement 7) */}
          <div className="rounded-3xl bg-[#E7EFEA] border border-[#70A69A]/30 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5 text-[#153B36]">
              <Smartphone className="w-5 h-5 text-emerald-700" />
              <h3 className="text-sm font-bold">
                {t('دليل الوصول المشترك لرقم واتساب للأعمال (Shared WhatsApp Devices Architecture)', 'Shared WhatsApp Business Access & Multi-Device Setup')}
              </h3>
            </div>
            <p className="text-xs text-[#153B36]/80 leading-relaxed">
              {t(
                'الربط البرمجي للموقع مع WhatsApp Cloud API لإرسال إشعارات الطلبات الجديدة يعمل كقناة إشعار آلية موثوقة بالخادم. أما المحادثات المباشرة مع العملاء واستقبال استفساراتهم فيمكن إدارتها على نفس رقم الهاتف عبر ميزة الأجهزة المرتبطة الرسمية (Linked Devices) في تطبيق WhatsApp Business:',
                'Website notification integration via WhatsApp Cloud API acts as an authoritative automated notification channel. Meanwhile, direct customer conversations can be simultaneously managed across multiple staff devices using official WhatsApp Business linked devices:'
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-4 rounded-2xl bg-white border border-[#153B36]/10 space-y-1.5">
                <span className="font-bold text-[#153B36] block">
                  1. {t('ميزة الأجهزة المرتبطة الرسمية (Official Multi-Device)', 'Official Multi-Device Support')}
                </span>
                <p className="text-[11px] text-[#153B36]/70 leading-relaxed">
                  {t(
                    'يتيح تطبيق WhatsApp Business ربط حتى 4 أجهزة كمبيوتر أو متصفحات (WhatsApp Web / Desktop) بهاتف رئيسي واحد، مما يسمح لمنسق الرعاية ومدير العمليات والتمريض بالرد على المرضى في وقت واحد بدون أي برامج غير رسمية.',
                    'WhatsApp Business supports up to 4 companion devices (Web / Desktop) linked to one primary phone, allowing coordinators and clinicians to converse with patients concurrently without unofficial bots.'
                  )}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#153B36]/10 space-y-1.5">
                <span className="font-bold text-[#153B36] block">
                  2. {t('فصل الإشعارات الآلية عن المحادثات اليدوية', 'Decoupled Architecture')}
                </span>
                <p className="text-[11px] text-[#153B36]/70 leading-relaxed">
                  {t(
                    'إرسال إشعارات الموقع عبر خادم Cloud API يحمي أرقام المستلمين من التوقف، ولا يتعارض مع استخدام نفس الرقم التجاري للتحدث مع المرضى والتنسيق معهم.',
                    'Server-side Cloud API dispatch guarantees notifications reach designated recipients regardless of whether individual phones are online or on battery saver.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Labs Tab */}
      {activeIntegrationTab === 'labs' && (
        <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <Server className="w-5 h-5 text-[#70A69A]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#153B36]">
                {t('بوابة الربط مع المعامل المعتمدة (Laboratory Partner API)', 'Accredited Labs Partner API')}
              </h2>
              <span className="text-xs text-[#70A69A]">
                {t('إرسال أوامر سحب العينات واستقبال النتائج الطبية رقمياً', 'Dispatches sample orders and ingests digital results')}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F2EB] text-xs text-[#153B36]/80 space-y-2">
            <span className="font-bold text-[#153B36] block">
              {t('حالة الربط والبيئة التجريبية (Sandbox Prepared):', 'API Integration Status:')}
            </span>
            <p className="leading-relaxed">
              {t(
                'البنية التحتية جاهزة ومعدة لاستقبال بيانات الاعتماد (API Key & Webhook Secret) عند توقيع بروتوكول الربط البرمجي مع شبكة المعامل الشريكة. تظل الخدمة حالياً تعمل بنظام التنسيق المباشر لضمان انسيابية العمليات.',
                'The architectural pipeline is prepared to ingest laboratory API credentials upon contract execution. Sample collection currently operates via direct phlebotomist coordination.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#153B36] block mb-1">
                {t('عنوان الخادم (API Endpoint)', 'Endpoint')}
              </label>
              <input
                type="text"
                readOnly
                value="https://api.labpartner.com/v1"
                className="w-full px-3 py-2 rounded-xl border border-[#153B36]/15 bg-[#F5F2EB]/50 font-mono text-[#153B36]/70"
              />
            </div>
            <div>
              <label className="font-bold text-[#153B36] block mb-1">
                {t('اسم الشريك المعملي', 'Partner Network')}
              </label>
              <input
                type="text"
                readOnly
                value="شبكة معامل التحاليل المعتمدة (Al-Mokhtabar / Al-Borg)"
                className="w-full px-3 py-2 rounded-xl border border-[#153B36]/15 bg-[#F5F2EB]/50 text-[#153B36]/70"
              />
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeIntegrationTab === 'security' && (
        <div className="rounded-3xl bg-[#0D2622] text-[#F5F2EB] p-6 sm:p-8 space-y-4 border border-[#70A69A]/30 shadow-lg">
          <div className="flex items-center gap-3 text-[#70A69A]">
            <Lock className="w-5 h-5" />
            <h2 className="text-base font-bold text-[#F5F2EB]">
              {t('مبدأ الأمان وحظر المفاتيح السرية في المتصفح', 'Zero-Trust Secrets Architecture')}
            </h2>
          </div>
          <p className="text-xs text-[#F5F2EB]/80 leading-relaxed">
            {t(
              'وفقاً لمعايير الأمان المعتمدة في هذا المشروع، لا يتم تخزين أي مفاتيح API سرية أو بيانات اعتماد خوادم (مثل Meta Token أو SendGrid Secret) داخل قاعدة بيانات المتصفح أو Firestore العامة. أي تكامل يتطلب مفاتيح خاصة يُربط عبر مسارات خادم خلفية محمية (Server-Side Proxy Routes) أو أسرار بيئة Cloud Run المعزولة.',
              'Per rigorous security standards, private API keys or webhook secrets are never stored in client code or Firestore documents. All external integrations are mediated strictly through protected backend proxy routes and isolated Cloud Run secret manager environments.'
            )}
          </p>
        </div>
      )}
    </div>
  );
};
