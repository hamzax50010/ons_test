import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
  ShieldAlert,
  Lock,
  AlertTriangle,
  LogOut,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
} from 'lucide-react';
import { OnsLogo } from '../../components/common/OnsLogo';

interface AdminLoginProps {
  onBackToPublic: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToPublic }) => {
  const {
    user,
    loading,
    isOwner,
    configuredOwnerEmail,
    isFirebaseLive,
    loginWithGoogle,
    simulateLoginAsOwner,
    simulateLoginAsUnauthorized,
    signOut,
    authError,
  } = useAuth();
  const { language, t, isRtl } = useLanguage();
  const { settings } = useData();

  const ArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  // Case 1: Authenticated but NOT an authorized owner (Access Denied Screen)
  if (user && !isOwner) {
    return (
      <div className="min-h-screen bg-[#0D2622] flex items-center justify-center p-4 text-[#F5F2EB]">
        <div className="max-w-md w-full bg-[#153B36] rounded-3xl p-8 border border-red-500/40 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-950 text-red-300 border border-red-800">
              {t('وصول مرفوض (403 Forbidden)', 'Access Denied (403 Forbidden)')}
            </span>
            <h1 className="text-2xl font-extrabold text-[#F5F2EB] mt-2">
              {t('هذا الحساب غير مصرح له كمالك للنظام', 'Account Not Authorized as Owner')}
            </h1>
            <p className="text-xs text-[#F5F2EB]/70 leading-relaxed">
              {t(
                'لقد سجلت الدخول بحساب Google بنجاح، ولكن هذا البريد الإلكتروني ليس هو الحساب المعتمد لمالك الموقع ولا يمتلك صلاحيات الإدارة.',
                'You authenticated successfully, but this Google account is not configured as the site owner and lacks administrative privileges.'
              )}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D2622] border border-white/10 text-xs text-start font-mono space-y-1">
            <div className="text-[#F5F2EB]/60">{t('الحساب الحالي:', 'Logged-in Account:')}</div>
            <div className="text-red-300 font-bold truncate">{user.email || 'Unknown'}</div>
            <div className="text-[#F5F2EB]/60 pt-1 border-t border-white/10">
              {t('الحساب المعتمد للمالك:', 'Configured Owner Identity:')}
            </div>
            <div className="text-[#70A69A] font-bold truncate">{configuredOwnerEmail}</div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => signOut()}
              className="w-full py-3 rounded-xl bg-red-600/80 hover:bg-red-700 text-[#F5F2EB] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('تسجيل الخروج من هذا الحساب', 'Sign Out of This Account')}</span>
            </button>
            <button
              onClick={onBackToPublic}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#F5F2EB] text-xs font-medium transition-colors"
            >
              {t('العودة للموقع العام', 'Return to Public Site')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Unauthenticated Visitor Sign-in Screen
  return (
    <div className="min-h-screen bg-[#0D2622] flex items-center justify-center p-4 text-[#F5F2EB]">
      <div className="max-w-md w-full bg-[#153B36] rounded-3xl p-8 border border-[#70A69A]/30 shadow-2xl space-y-7">
        {/* Top brand header */}
        <div className="text-center space-y-2">
          <OnsLogo
            src={settings.darkLogoUrl || settings.logoUrl}
            variant="reversed"
            fallbackVariant="reversed"
            className="h-20 w-auto mx-auto mb-2"
          />
          <h1 className="text-xl font-extrabold text-[#F5F2EB]">
            {t('بوابة مالك المنظومة | ONS', 'ONS Owner Management Portal')}
          </h1>
          <p className="text-xs text-[#F5F2EB]/70">
            {t(
              'الوصول محصور حصرياً على الحساب المعتمد لمالك أُنس للرعاية الصحية.',
              'Restricted strictly to the authorized owner Google identity.'
            )}
          </p>
        </div>

        {/* Configured Owner Reference Indicator */}
        <div className="p-3 rounded-xl bg-[#0D2622] border border-white/10 text-xs space-y-1">
          <div className="flex items-center justify-between text-[#70A69A]">
            <span className="font-semibold">{t('هوية المالك المعتمد:', 'Target Owner Email:')}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#70A69A]/20">
              {isFirebaseLive ? 'Firebase Live' : 'Verified Security Mode'}
            </span>
          </div>
          <p className="font-mono text-xs text-[#F5F2EB] font-bold truncate">
            {configuredOwnerEmail}
          </p>
        </div>

        {authError && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{authError}</span>
          </div>
        )}

        {/* Sign In Actions */}
        <div className="space-y-3">
          {/* Real Google Auth Button */}
          <button
            onClick={loginWithGoogle}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#F5F2EB] hover:bg-white text-[#153B36] text-sm font-bold shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-98 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t('تسجيل الدخول بحساب Google المعتمد', 'Sign in with Google Account')}</span>
          </button>

          {/* Test Sandbox & Role Verification Controls */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <span className="text-[11px] text-[#70A69A] font-bold uppercase tracking-wider block text-center">
              {t('اختبار سياسة الأمان والتحقق من الصلاحيات', 'Security & Authorization Tests')}
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={simulateLoginAsOwner}
                className="p-2.5 rounded-xl bg-[#70A69A]/20 hover:bg-[#70A69A]/30 border border-[#70A69A]/40 text-[#F5F2EB] font-bold text-center transition-colors"
                title="Log in as verified configured owner"
              >
                {t('دخول كالمالك المعتمد', 'Enter as Owner')}
              </button>

              <button
                onClick={simulateLoginAsUnauthorized}
                className="p-2.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-800 text-red-200 font-bold text-center transition-colors"
                title="Test access denied for unauthorized email"
              >
                {t('اختبار حساب غير مصرح', 'Test Unauthorized')}
              </button>
            </div>
          </div>
        </div>

        {/* Return to Public site link */}
        <div className="pt-2 text-center">
          <button
            onClick={onBackToPublic}
            className="text-xs text-[#F5F2EB]/60 hover:text-[#F5F2EB] transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowIcon className="w-3.5 h-3.5" />
            <span>{t('العودة للموقع العام', 'Return to Public Website')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
