import React, { useState, useRef } from 'react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Palette,
  Check,
  Save,
  CheckCircle2,
  Upload,
  RefreshCw,
  Eye,
  FileCheck,
  Sun,
  Moon,
  ExternalLink,
  Layers
} from 'lucide-react';
import { OnsLogo } from '../../../components/common/OnsLogo';

export const MediaBrandingTab: React.FC = () => {
  const { settings, updateSettings } = useData();
  const { t } = useLanguage();

  // Public (Light background) logo
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '/logos/ons-logo.svg');
  // Dark background logo (Footer, Admin header/sidebar, Login)
  const [darkLogoUrl, setDarkLogoUrl] = useState(
    settings.darkLogoUrl || '/logos/ons-logo-reversed.svg'
  );

  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || '#153B36');
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor || '#F5F2EB');
  const [accentColor, setAccentColor] = useState(settings.accentColor || '#70A69A');

  const [isSaved, setIsSaved] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const publicFileInputRef = useRef<HTMLInputElement>(null);
  const darkFileInputRef = useRef<HTMLInputElement>(null);

  const isCustomPublicLogo = Boolean(
    logoUrl &&
    logoUrl !== '/logos/ons-logo.svg' &&
    logoUrl !== '/logos/ons-logo-reversed.svg'
  );

  const isCustomDarkLogo = Boolean(
    darkLogoUrl &&
    darkLogoUrl !== '/logos/ons-logo-reversed.svg' &&
    darkLogoUrl !== '/logos/ons-logo.svg'
  );

  // Upload handler for Public Site Logo
  const handlePublicFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(t('يرجى اختيار ملف صورة صالح (PNG أو WebP أو SVG).', 'Please select a valid image file (PNG, WebP, or SVG).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setLogoUrl(dataUrl);
        await updateSettings({
          logoUrl: dataUrl,
          symbolUrl: dataUrl, // Keep favicon aligned
        });
        setUploadNotice(
          t(
            'تم تحديث شعار الموقع العام بنجاح وتطبيقه على شريط التنقل والصفحات العامة!',
            'Public site logo updated and applied immediately to Navbar and public pages!'
          )
        );
        setIsSaved(true);
        setTimeout(() => {
          setIsSaved(false);
          setTimeout(() => setUploadNotice(null), 4000);
        }, 1500);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload handler for Dark Background Logo
  const handleDarkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(t('يرجى اختيار ملف صورة صالح (PNG أو WebP أو SVG).', 'Please select a valid image file (PNG, WebP, or SVG).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setDarkLogoUrl(dataUrl);
        await updateSettings({
          darkLogoUrl: dataUrl,
        });
        setUploadNotice(
          t(
            'تم تحديث شعار الخلفية الداكنة وتطبيقه على الفوتر ولوحة التحكم وشاشة الدخول فوراً!',
            'Dark background logo updated and applied to Footer, Admin panel, and Login screen!'
          )
        );
        setIsSaved(true);
        setTimeout(() => {
          setIsSaved(false);
          setTimeout(() => setUploadNotice(null), 4000);
        }, 1500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetPublicLogo = async () => {
    const defaultUrl = '/logos/ons-logo.svg';
    setLogoUrl(defaultUrl);
    await updateSettings({ logoUrl: defaultUrl, symbolUrl: defaultUrl });
    setUploadNotice(t('تمت استعادة شعار الموقع العام الافتراضي (SVG).', 'Public logo reset to default SVG.'));
    setTimeout(() => setUploadNotice(null), 3000);
  };

  const handleResetDarkLogo = async () => {
    const defaultUrl = '/logos/ons-logo-reversed.svg';
    setDarkLogoUrl(defaultUrl);
    await updateSettings({ darkLogoUrl: defaultUrl });
    setUploadNotice(t('تمت استعادة شعار الخلفية الداكنة الافتراضي (SVG المعكوس).', 'Dark logo reset to default reversed SVG.'));
    setTimeout(() => setUploadNotice(null), 3000);
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPublic = logoUrl.trim() || '/logos/ons-logo.svg';
    const finalDark = darkLogoUrl.trim() || '/logos/ons-logo-reversed.svg';
    await updateSettings({
      logoUrl: finalPublic,
      darkLogoUrl: finalDark,
      symbolUrl: finalPublic,
      primaryColor,
      secondaryColor,
      accentColor,
    });
    setIsSaved(true);
    setUploadNotice(t('تم حفظ جميع إعدادات الشعارين والهوية البصرية بنجاح!', 'All branding & dual logo settings saved successfully!'));
    setTimeout(() => {
      setIsSaved(false);
      setTimeout(() => setUploadNotice(null), 3500);
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Tab Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#153B36] text-[#70A69A]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#153B36]">
              {t('إدارة الشعار المعزول والهوية البصرية', 'Brand Logo & Visual Identity')}
            </h1>
            <p className="text-xs text-[#153B36]/70 mt-0.5">
              {t(
                'رفع وتخصيص شعاري المنظومة المعتمدين: شعار الموقع العام (على الخلفيات الفاتحة) وشعار الخلفيات الداكنة (الفوتر ولوحة التحكم).',
                'Upload and configure the two designated brand logos: Public Website Logo (Light background) and Dark Background Logo (Footer & Admin).'
              )}
            </p>
          </div>
        </div>
      </div>

      {uploadNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-fadeIn shadow-xs">
          <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* DUAL LOGO MANAGEMENT CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ======================================================== */}
        {/* 1. Public Site Logo (Light Background)                   */}
        {/* ======================================================== */}
        <div className="rounded-3xl bg-white border border-[#153B36]/15 p-6 sm:p-7 space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header of Section 1 */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#153B36]/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                    <Sun className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-[#153B36]">
                    {t('1. شعار الموقع العام', '1. Public Site Logo')}
                  </h2>
                </div>
                <p className="text-xs text-[#153B36]/70 leading-relaxed">
                  {t(
                    'يظهر على خلفية الموقع العامة الفاتحة (#F5F2EB)، وفي شريط التنقل العلوي (Navbar)، والصفحات، ولسان المتصفح (Favicon).',
                    'Appears on public ivory background (#F5F2EB), top Navbar, public pages, and browser Favicon.'
                  )}
                </p>
              </div>

              {isCustomPublicLogo && (
                <button
                  type="button"
                  onClick={handleResetPublicLogo}
                  className="px-2.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-semibold flex items-center gap-1 transition-colors shrink-0"
                  title={t('استعادة الافتراضي', 'Reset default')}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{t('استعادة الافتراضي', 'Reset')}</span>
                </button>
              )}
            </div>

            {/* Upload Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <input
                ref={publicFileInputRef}
                type="file"
                accept="image/png,image/webp,image/svg+xml,image/*"
                className="hidden"
                onChange={handlePublicFileUpload}
              />
              <button
                type="button"
                onClick={() => publicFileInputRef.current?.click()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Upload className="w-4 h-4 text-[#70A69A]" />
                <span>{t('رفع ملف الشعار العام (.PNG)', 'Upload Public Logo (.PNG)')}</span>
              </button>

              <span className="text-[11px] text-center text-[#153B36]/60 font-mono">
                {isCustomPublicLogo ? t('ملف PNG مرفوع', 'Custom PNG') : t('SVG رسمي', 'Official SVG')}
              </span>
            </div>

            {/* Isolation & Preview Boxes for Public Logo */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[#153B36] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#70A69A]" />
                {t('معاينة العزل والظهور في الموقع العام:', 'Public Logo Isolation & Context Preview:')}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Checkerboard isolation */}
                <div className="rounded-2xl border border-black/10 overflow-hidden flex flex-col">
                  <div
                    className="h-32 flex items-center justify-center p-4 relative"
                    style={{
                      backgroundImage: `
                        linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
                        linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
                        linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)
                      `,
                      backgroundSize: '14px 14px',
                      backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0px',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <OnsLogo src={logoUrl} className="h-20 w-auto max-w-full drop-shadow-none" />
                  </div>
                  <div className="p-2 bg-white border-t border-black/5 text-center">
                    <span className="text-[11px] font-bold text-[#153B36] block">
                      {t('شبكة الشفافية (عزل تام 100%)', 'Transparency Grid (100% Isolated)')}
                    </span>
                    <span className="text-[10px] text-[#153B36]/60">
                      {t('يؤكد خلو الخلفية من أي ألوان', 'No background colors')}
                    </span>
                  </div>
                </div>

                {/* On Public Site Ivory background */}
                <div className="rounded-2xl border border-[#153B36]/15 overflow-hidden flex flex-col">
                  <div className="h-32 bg-[#F5F2EB] flex items-center justify-center p-4">
                    <OnsLogo src={logoUrl} variant="color" className="h-20 w-auto max-w-full drop-shadow-none" />
                  </div>
                  <div className="p-2 bg-white border-t border-black/5 text-center">
                    <span className="text-[11px] font-bold text-[#153B36] block">
                      {t('على خلفية الموقع (#F5F2EB)', 'On Public Ivory (#F5F2EB)')}
                    </span>
                    <span className="text-[10px] text-[#153B36]/60">
                      {t('شريط التنقل والصفحات', 'Navbar & Public Pages')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Path / Data string input */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-[11px] font-bold text-[#153B36]">
                {t('مسار أو رابط الشعار العام:', 'Public Logo Path or URL:')}
              </label>
              <input
                type="text"
                dir="ltr"
                value={logoUrl.startsWith('data:') ? `[Data URL: PNG Base64 (${Math.round(logoUrl.length / 1024)} KB)]` : logoUrl}
                onChange={(e) => {
                  if (!e.target.value.startsWith('[Data URL')) {
                    setLogoUrl(e.target.value);
                  }
                }}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#153B36]"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              {t(
                'يظهر في: شريط التنقل العلوي (Navbar)، صفحات الخدمات، عن أُنس، وأيقونة المتصفح.',
                'Active on: Top Navbar, Service Pages, About Us, and Favicon.'
              )}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. Dark Background Logo (Footer, Admin Header & Login)   */}
        {/* ======================================================== */}
        <div className="rounded-3xl bg-white border border-[#153B36]/15 p-6 sm:p-7 space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header of Section 2 */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#153B36]/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#153B36] text-[#70A69A] border border-[#70A69A]/30">
                    <Moon className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-[#153B36]">
                    {t('2. الشعار على الخلفية الداكنة', '2. Dark Background Logo')}
                  </h2>
                </div>
                <p className="text-xs text-[#153B36]/70 leading-relaxed">
                  {t(
                    'يظهر على الخلفية الداكنة (#153B36)، في ذيل الموقع (Footer)، وقوائم لوحة تحكم المالك (Admin)، وشاشة تسجيل الدخول.',
                    'Appears on dark teal background (#153B36), footer, admin topbar/sidebar, and owner login.'
                  )}
                </p>
              </div>

              {isCustomDarkLogo && (
                <button
                  type="button"
                  onClick={handleResetDarkLogo}
                  className="px-2.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-semibold flex items-center gap-1 transition-colors shrink-0"
                  title={t('استعادة الافتراضي', 'Reset default')}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{t('استعادة الافتراضي', 'Reset')}</span>
                </button>
              )}
            </div>

            {/* Upload Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <input
                ref={darkFileInputRef}
                type="file"
                accept="image/png,image/webp,image/svg+xml,image/*"
                className="hidden"
                onChange={handleDarkFileUpload}
              />
              <button
                type="button"
                onClick={() => darkFileInputRef.current?.click()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Upload className="w-4 h-4 text-[#70A69A]" />
                <span>{t('رفع شعار الخلفية الداكنة (.PNG)', 'Upload Dark Logo (.PNG)')}</span>
              </button>

              <span className="text-[11px] text-center text-[#153B36]/60 font-mono">
                {isCustomDarkLogo ? t('ملف PNG مرفوع', 'Custom PNG') : t('SVG معكوس', 'Reversed SVG')}
              </span>
            </div>

            {/* Isolation & Preview Boxes for Dark Logo */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[#153B36] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#70A69A]" />
                {t('معاينة العزل والظهور في الخلفية الداكنة:', 'Dark Logo Isolation & Context Preview:')}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Checkerboard isolation */}
                <div className="rounded-2xl border border-black/10 overflow-hidden flex flex-col">
                  <div
                    className="h-32 flex items-center justify-center p-4 relative"
                    style={{
                      backgroundImage: `
                        linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
                        linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
                        linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)
                      `,
                      backgroundSize: '14px 14px',
                      backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0px',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <OnsLogo src={darkLogoUrl} className="h-20 w-auto max-w-full drop-shadow-none" />
                  </div>
                  <div className="p-2 bg-white border-t border-black/5 text-center">
                    <span className="text-[11px] font-bold text-[#153B36] block">
                      {t('شبكة الشفافية (عزل تام 100%)', 'Transparency Grid (100% Isolated)')}
                    </span>
                    <span className="text-[10px] text-[#153B36]/60">
                      {t('يؤكد خلو الخلفية من أي ألوان', 'No background colors')}
                    </span>
                  </div>
                </div>

                {/* On Dark Forest Background */}
                <div className="rounded-2xl border border-black/10 overflow-hidden flex flex-col">
                  <div className="h-32 bg-[#153B36] flex items-center justify-center p-4">
                    <OnsLogo src={darkLogoUrl} variant="reversed" className="h-20 w-auto max-w-full drop-shadow-none" />
                  </div>
                  <div className="p-2 bg-[#0D2622] text-[#F5F2EB] border-t border-white/10 text-center">
                    <span className="text-[11px] font-bold text-[#F5F2EB] block">
                      {t('على خلفية الفوتر الداكنة (#153B36)', 'On Dark Background (#153B36)')}
                    </span>
                    <span className="text-[10px] text-[#F5F2EB]/70">
                      {t('ذيل الموقع ولوحة التحكم', 'Footer & Admin Console')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Path / Data string input */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-[11px] font-bold text-[#153B36]">
                {t('مسار أو رابط شعار الخلفية الداكنة:', 'Dark Logo Path or URL:')}
              </label>
              <input
                type="text"
                dir="ltr"
                value={darkLogoUrl.startsWith('data:') ? `[Data URL: PNG Base64 (${Math.round(darkLogoUrl.length / 1024)} KB)]` : darkLogoUrl}
                onChange={(e) => {
                  if (!e.target.value.startsWith('[Data URL')) {
                    setDarkLogoUrl(e.target.value);
                  }
                }}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#153B36]"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#153B36]/10 border border-[#153B36]/20 text-[11px] text-[#153B36] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#153B36] shrink-0" />
            <span>
              {t(
                'يظهر في: ذيل الموقع (Footer)، شريط وقائمة لوحة تحكم المالك، وشاشة تسجيل دخول الإدارة.',
                'Active on: Public Footer, Admin navigation bars, and Owner login screen.'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Real-time Environment Comparison: Navbar vs Footer       */}
      {/* ======================================================== */}
      <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#153B36]/10">
          <div className="flex items-center gap-2 font-bold text-sm text-[#153B36]">
            <ExternalLink className="w-4 h-4 text-[#70A69A]" />
            <span>{t('محاكاة حية لموضعي الشعارين داخل المنظومة', 'Live Simulation of Both Logo Placements')}</span>
          </div>
          <span className="text-[11px] text-[#153B36]/60 font-medium">
            {t('تحديث فوري مع أي تعديل', 'Instant live reflection')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Simulated Navbar Banner */}
          <div className="rounded-2xl border border-[#153B36]/15 bg-[#F5F2EB] p-4 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-[#153B36]/10 pb-3">
              <div className="flex items-center gap-3">
                <OnsLogo src={logoUrl} variant="color" className="h-10 w-auto" />
                <span className="text-xs font-extrabold text-[#153B36]">أُنس للرعاية الصحية</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#153B36]/15 text-[10px] font-bold text-[#153B36]">
                Navbar (الهيدر)
              </span>
            </div>
            <p className="text-[11px] text-[#153B36]/70 leading-relaxed">
              {t('هكذا يظهر شعار الموقع العام لجميع زوار موقع أُنس في أعلى كافة الصفحات.', 'This is how the public logo appears to all visitors in the top header.')}
            </p>
          </div>

          {/* Simulated Footer Banner */}
          <div className="rounded-2xl border border-[#153B36]/15 bg-[#153B36] text-[#F5F2EB] p-4 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <OnsLogo src={darkLogoUrl} variant="reversed" className="h-10 w-auto" />
                <span className="text-xs font-extrabold text-[#F5F2EB]">أُنس للرعاية الصحية</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-[10px] font-bold text-[#F5F2EB]">
                Footer (الفوتر)
              </span>
            </div>
            <p className="text-[11px] text-[#F5F2EB]/70 leading-relaxed">
              {t('هكذا يظهر شعار الخلفية الداكنة في ذيل الموقع ولوحة التحكم بأعلى وضوح وتباين.', 'This is how the dark logo appears in the dark footer and admin bars with maximum contrast.')}
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Brand Color Tokens & Final Save Form                     */}
      {/* ======================================================== */}
      <form onSubmit={handleSaveBranding} className="space-y-6">
        <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-[#153B36] flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#70A69A]" />
            <span>{t('ألوان الهوية المعتمدة في النظام', 'Approved Brand Color Codes')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            {/* Deep Teal */}
            <div className="p-4 rounded-2xl border border-[#153B36]/10 space-y-3 bg-[#F5F2EB]/40">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#153B36]">
                  {t('اللون الأساسي (أخضر داكن)', 'Primary Dark Color')}
                </span>
                <span className="font-mono text-[11px] font-bold">{primaryColor}</span>
              </div>
              <div
                className="w-full h-12 rounded-xl border border-black/10 shadow-inner"
                style={{ backgroundColor: primaryColor }}
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-full bg-white border border-[#153B36]/20 rounded-xl px-3 py-1.5 font-mono text-xs text-[#153B36]"
              />
            </div>

            {/* Soft Teal */}
            <div className="p-4 rounded-2xl border border-[#153B36]/10 space-y-3 bg-[#F5F2EB]/40">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#153B36]">
                  {t('اللون الثانوي (أخضر مائي)', 'Accent Teal Color')}
                </span>
                <span className="font-mono text-[11px] font-bold">{accentColor}</span>
              </div>
              <div
                className="w-full h-12 rounded-xl border border-black/10 shadow-inner"
                style={{ backgroundColor: accentColor }}
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-full bg-white border border-[#153B36]/20 rounded-xl px-3 py-1.5 font-mono text-xs text-[#153B36]"
              />
            </div>

            {/* Warm Ivory */}
            <div className="p-4 rounded-2xl border border-[#153B36]/10 space-y-3 bg-[#F5F2EB]/40">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#153B36]">
                  {t('العاجي الدافئ (الخلفية)', 'Warm Ivory (Background)')}
                </span>
                <span className="font-mono text-[11px] font-bold">{secondaryColor}</span>
              </div>
              <div
                className="w-full h-12 rounded-xl border border-black/10 shadow-inner"
                style={{ backgroundColor: secondaryColor }}
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-full bg-white border border-[#153B36]/20 rounded-xl px-3 py-1.5 font-mono text-xs text-[#153B36]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#153B36]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#153B36]/70">
              {t(
                'يتم حفظ التعديلات وحفظها في التخزين المحلي وقاعدة البيانات فور الضغط على زر الحفظ.',
                'Changes are stored in local storage and synced to database upon saving.'
              )}
            </span>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-[#153B36] text-[#F5F2EB] text-xs font-bold hover:bg-[#0D2622] transition-colors flex items-center gap-2 shadow-md active:scale-98"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-[#70A69A]" />}
              <span>{isSaved ? t('تم الحفظ بنجاح', 'Saved') : t('حفظ خيارات الشعارين والهوية', 'Save Both Logos & Branding')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
