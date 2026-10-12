import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import {
  ShieldCheck,
  Key,
  Globe,
  Database,
  Terminal,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Copy,
} from 'lucide-react';

export const SetupGuideTab: React.FC = () => {
  const { language, t } = useLanguage();
  const { configuredOwnerEmail, isFirebaseLive } = useAuth();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(t('تم النسخ إلى الحافظة!', 'Copied to clipboard!'));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#153B36]">
          {t('دليل تفعيل بيئة الإنتاج وأمان Firebase', 'Firebase Production & Security Setup Guide')}
        </h1>
        <p className="text-xs text-[#153B36]/70 mt-1">
          {t(
            'خطوات تفصيلية لربط مشروع Firebase، تفعيل حساب Google للمالك، ونشر وتدقيق قواعد Firestore.',
            'Step-by-step instructions for Firebase setup, Google sign-in, owner email, and rules testing.'
          )}
        </p>
      </div>

      {/* Current Security & Identity Status */}
      <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[#153B36] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#70A69A]" />
          <span>{t('هوية المالك وحالة التهيئة الحالية', 'Current Identity & Configuration')}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-[#F5F2EB] border border-[#153B36]/10 space-y-1">
            <span className="text-[#153B36]/60 font-sans block">{t('البريد المعتمد للمالك:', 'Configured Owner Email:')}</span>
            <span className="font-bold text-[#153B36] text-sm truncate block">{configuredOwnerEmail}</span>
            <span className="text-[11px] text-[#70A69A] font-sans block">
              {t('يمكن تغييره عبر متغير البيئة VITE_OWNER_EMAIL', 'Configurable via VITE_OWNER_EMAIL env var')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F2EB] border border-[#153B36]/10 space-y-1">
            <span className="text-[#153B36]/60 font-sans block">{t('حالة اتصال Firebase:', 'Firebase Connection Status:')}</span>
            <span className={`font-bold text-sm block ${isFirebaseLive ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isFirebaseLive
                ? t('متصل ببيانات إنتاجية نشطة', 'Connected to Active Production')
                : t('يعمل ببيئة التحقق المحلي (Local Security Sandbox)', 'Running in Local Security Sandbox')}
            </span>
            <span className="text-[11px] text-[#153B36]/70 font-sans block">
              {t('بيانات الموقع والطلبات محفوظة محلياً وتعمل بكفاءة كاملة', 'Full persistent offline/local storage operational')}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Steps Accordion/Cards */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="rounded-2xl bg-white border border-[#153B36]/10 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#153B36] text-[#70A69A] font-bold flex items-center justify-center text-xs">
              01
            </div>
            <h3 className="text-sm font-bold text-[#153B36]">
              {t('إنشاء أو ربط مشروع Firebase', 'Step 1: Create or Connect Firebase Project')}
            </h3>
          </div>
          <p className="text-xs text-[#153B36]/80 leading-relaxed ps-11">
            {t(
              'توجه إلى Firebase Console وأنشئ مشروعاً جديداً باسم ONS-Healthcare أو اختر مشروعك الحالي. ثم أنشئ Web App واستخرج بيانات التكوين (apiKey, authDomain, projectId).',
              'Open the Firebase Console, create a new project named ONS-Healthcare, add a Web App, and copy the firebase configuration keys.'
            )}
          </p>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl bg-white border border-[#153B36]/10 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#153B36] text-[#70A69A] font-bold flex items-center justify-center text-xs">
              02
            </div>
            <h3 className="text-sm font-bold text-[#153B36]">
              {t('تفعيل تسجيل الدخول بحساب Google (Authentication)', 'Step 2: Enable Google Sign-In Provider')}
            </h3>
          </div>
          <p className="text-xs text-[#153B36]/80 leading-relaxed ps-11">
            {t(
              'في قائمة Authentication > Sign-in method، فعّل مزود "Google". تأكد من وضع بريد الدعم الفني، واحفظ التغييرات.',
              'Navigate to Authentication > Sign-in method, click Google, toggle Enable, set project support email, and save.'
            )}
          </p>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl bg-white border border-[#153B36]/10 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#153B36] text-[#70A69A] font-bold flex items-center justify-center text-xs">
              03
            </div>
            <h3 className="text-sm font-bold text-[#153B36]">
              {t('إضافة النطاقات المصرح بها (Authorized Domains)', 'Step 3: Add Authorized Domains')}
            </h3>
          </div>
          <p className="text-xs text-[#153B36]/80 leading-relaxed ps-11">
            {t(
              'في إعدادات Authentication > Settings > Authorized domains، أضف نطاق المعاينة الحالي والنطاق النهائي لموقع أُنس (مثل onshealthcare.com و *.run.app) لمنع حظر تسجيل الدخول.',
              'Add your application origin domains to Authentication > Settings > Authorized domains to permit Google popup flows.'
            )}
          </p>
        </div>

        {/* Step 4 */}
        <div className="rounded-2xl bg-white border border-[#153B36]/10 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#153B36] text-[#70A69A] font-bold flex items-center justify-center text-xs">
              04
            </div>
            <h3 className="text-sm font-bold text-[#153B36]">
              {t('تحديد بريد المالك في بيئة التطبيق (OWNER_EMAIL)', 'Step 4: Configure Owner Google Account')}
            </h3>
          </div>
          <p className="text-xs text-[#153B36]/80 leading-relaxed ps-11">
            {t(
              `تأكد من مطابقة الحساب المعتمد في ملف البيئة (.env): VITE_OWNER_EMAIL="${configuredOwnerEmail}". النظام يرفض منح صلاحيات المالك لأي حساب Google آخر تلقائياً.`,
              `Ensure your .env contains VITE_OWNER_EMAIL="${configuredOwnerEmail}". The authorization gate strictly blocks any non-matching email.`
            )}
          </p>
        </div>

        {/* Step 5 */}
        <div className="rounded-2xl bg-white border border-[#153B36]/10 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#153B36] text-[#70A69A] font-bold flex items-center justify-center text-xs">
              05
            </div>
            <h3 className="text-sm font-bold text-[#153B36]">
              {t('نشر قواعد أمان Firestore (Security Rules)', 'Step 5: Deploy Firestore Security Rules')}
            </h3>
          </div>
          <div className="ps-11 space-y-2 text-xs text-[#153B36]/80 leading-relaxed">
            <p>
              {t(
                'تم إنشاء ملف firestore.rules وفق ركائز الأمان الثمانية (Zero-Trust ABAC). لنشر القواعد إلى مشروعك، استخدم الأمر التالي:',
                'firestore.rules has been generated in accordance with the 8 Pillars of Hardened Rules. Deploy via CLI:'
              )}
            </p>
            <div className="p-3 rounded-xl bg-[#0D2622] text-[#F5F2EB] font-mono text-xs flex items-center justify-between">
              <span>firebase deploy --only firestore:rules</span>
              <button
                onClick={() => copyToClipboard('firebase deploy --only firestore:rules')}
                className="text-[#70A69A] hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Step 6 */}
        <div className="rounded-2xl bg-white border border-[#153B36]/10 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#153B36] text-[#70A69A] font-bold flex items-center justify-center text-xs">
              06
            </div>
            <h3 className="text-sm font-bold text-[#153B36]">
              {t('اختبار محاولات الوصول غير المصرح (Testing Unauthorized Access)', 'Step 6: Test Unauthorized Access Rejection')}
            </h3>
          </div>
          <p className="text-xs text-[#153B36]/80 leading-relaxed ps-11">
            {t(
              'سجل الدخول بحساب Google آخر مختلف عن بريد المالك المعتمد، وتأكد من ظهور شاشة "وصول مرفوض (403 Forbidden)" وأن قواعد Firestore تمنع قراءة أو تعديل طلبات المرضى.',
              'Sign in with any alternate Google account. Verify that the 403 Access Denied screen appears and that Firestore rules reject all administrative reads.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
