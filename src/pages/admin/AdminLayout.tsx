import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
  Inbox,
  LayoutDashboard,
  Stethoscope,
  MapPin,
  FileText,
  Image,
  Star,
  Phone,
  Settings,
  Cpu,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Globe,
  Menu,
  X,
  UserCheck,
  Users,
} from 'lucide-react';
import { OnsLogo } from '../../components/common/OnsLogo';
import { OverviewTab } from './tabs/OverviewTab';
import { RequestsTab } from './tabs/RequestsTab';
import { ServicesTab } from './tabs/ServicesTab';
import { ProvidersTab } from './tabs/ProvidersTab';
import { PricingAreasTab } from './tabs/PricingAreasTab';
import { ContentManagerTab } from './tabs/ContentManagerTab';
import { MediaBrandingTab } from './tabs/MediaBrandingTab';
import { ReviewsTab } from './tabs/ReviewsTab';
import { CommunicationTab } from './tabs/CommunicationTab';
import { GeneralSettingsTab } from './tabs/GeneralSettingsTab';
import { IntegrationsTab } from './tabs/IntegrationsTab';
import { SetupGuideTab } from './tabs/SetupGuideTab';

interface AdminLayoutProps {
  onBackToPublic: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToPublic }) => {
  const { user, signOut, configuredOwnerEmail, isFirebaseLive } = useAuth();
  const { language, toggleLanguage, t, isRtl } = useLanguage();
  const { requests, settings } = useData();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const newRequestsCount = requests.filter((r) => r.status === 'new').length;

  // Handle escape key and lock body scroll when mobile drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSidebarOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [sidebarOpen]);

  const navItems = [
    { id: 'overview', labelAr: 'المؤشرات التشغيلية', labelEn: 'Overview', icon: LayoutDashboard },
    {
      id: 'requests',
      labelAr: 'طلبات الرعاية والزيارات',
      labelEn: 'Customer Requests',
      icon: Inbox,
      badge: newRequestsCount > 0 ? newRequestsCount : undefined,
    },
    { id: 'services', labelAr: 'الخدمات والتصنيفات', labelEn: 'Services & Catalog', icon: Stethoscope },
    { id: 'providers', labelAr: 'الممرضون ومقدمو الخدمات', labelEn: 'Nurses & Providers', icon: Users },
    { id: 'pricing', labelAr: 'التسعير ومناطق التغطية', labelEn: 'Pricing & Areas', icon: MapPin },
    { id: 'content', labelAr: 'محرر محتوى الموقع', labelEn: 'Website Content', icon: FileText },
    { id: 'branding', labelAr: 'الهوية البصرية والوسائط', labelEn: 'Branding & Media', icon: Image },
    { id: 'reviews', labelAr: 'تجارب وآراء المرضى', labelEn: 'Patient Reviews', icon: Star },
    { id: 'communication', labelAr: 'قنوات التواصل والواتساب', labelEn: 'Communication', icon: Phone },
    { id: 'settings', labelAr: 'الإعدادات العامة', labelEn: 'General Settings', icon: Settings },
    { id: 'integrations', labelAr: 'التكاملات والبنية', labelEn: 'Integrations', icon: Cpu },
    { id: 'guide', labelAr: 'دليل الأمان وFirebase', labelEn: 'Firebase & Security', icon: ShieldAlert },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab setActiveTab={setActiveTab} />;
      case 'requests':
        return <RequestsTab />;
      case 'services':
        return <ServicesTab />;
      case 'providers':
        return <ProvidersTab />;
      case 'pricing':
        return <PricingAreasTab />;
      case 'content':
        return <ContentManagerTab />;
      case 'branding':
        return <MediaBrandingTab />;
      case 'reviews':
        return <ReviewsTab />;
      case 'communication':
        return <CommunicationTab />;
      case 'settings':
        return <GeneralSettingsTab />;
      case 'integrations':
        return <IntegrationsTab />;
      case 'guide':
        return <SetupGuideTab />;
      default:
        return <OverviewTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col antialiased overflow-x-hidden">
      {/* Top Administrative Bar */}
      <header className="sticky top-0 z-40 bg-[#153B36] text-[#F5F2EB] border-b border-[#70A69A]/30 shadow-md">
        {/* Main Header Row */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Left: Mobile Menu Toggle & Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-[#F5F2EB] bg-white/5 hover:bg-white/10 transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#70A69A]"
              aria-label={sidebarOpen ? t('إغلاق القائمة', 'Close navigation') : t('فتح القائمة', 'Open navigation')}
            >
              {sidebarOpen ? <X className="w-5 h-5 text-[#70A69A]" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5 select-none">
              <OnsLogo
                src={settings.darkLogoUrl || settings.logoUrl}
                variant="reversed"
                fallbackVariant="reversed"
                className="h-8 sm:h-9 w-auto max-h-9"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-xs sm:text-sm text-[#F5F2EB] leading-tight truncate max-w-[150px] sm:max-w-none">
                  {language === 'ar' ? settings.siteNameAr : settings.siteNameEn}
                </span>
                <span className="text-[10px] text-[#70A69A] font-semibold hidden xs:block">
                  {t('لوحة تحكم المالك المعتمد', 'Authorized Owner Console')}
                </span>
              </div>
            </div>
          </div>

          {/* Right on Desktop (lg:flex) - Full actions bar */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 text-xs">
            {/* Owner Email identity badge (Desktop) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-[#70A69A] shrink-0" />
              <span className="font-mono text-[#F5F2EB] font-semibold truncate max-w-[130px] xl:max-w-xs">
                {user?.email || configuredOwnerEmail}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#70A69A]/30 text-[#70A69A] uppercase font-bold shrink-0">
                Owner
              </span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#F5F2EB] transition-colors"
              title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe className="w-3.5 h-3.5 text-[#70A69A]" />
              <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Quick Logo Upload Link to Branding Tab */}
            <button
              onClick={() => {
                setActiveTab('branding');
                setSidebarOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#70A69A]/20 hover:bg-[#70A69A]/30 text-[#F5F2EB] font-bold text-xs transition-colors"
              title={t('رفع وتعيين اللوجو المعزول (PNG)', 'Upload Logo PNG')}
            >
              <Image className="w-3.5 h-3.5 text-[#70A69A]" />
              <span>{t('رفع اللوجو المعزول', 'Upload Logo')}</span>
            </button>

            {/* View Public Website Link */}
            <button
              onClick={onBackToPublic}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#70A69A]/20 hover:bg-[#70A69A]/30 text-[#F5F2EB] font-medium transition-colors"
              title={t('عرض الموقع العام للعملاء', 'View Public Site')}
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#70A69A]" />
              <span>{t('الموقع العام', 'Public Site')}</span>
            </button>

            {/* Secure Sign Out */}
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-600/85 hover:bg-red-700 text-white font-bold transition-colors"
              title={t('تسجيل الخروج الآمن', 'Sign Out')}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('خروج', 'Sign Out')}</span>
            </button>
          </div>

          {/* Right on Tablet & Mobile (<lg) - Compact Quick Controls */}
          <div className="flex lg:hidden items-center gap-1.5 text-xs">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#F5F2EB] transition-colors"
              title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe className="w-3.5 h-3.5 text-[#70A69A]" />
              <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Secure Sign Out */}
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-600/85 hover:bg-red-700 text-white font-bold transition-colors"
              title={t('تسجيل الخروج الآمن', 'Sign Out')}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('خروج', 'Sign Out')}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Tablet & Mobile Sub-toolbar (Drops buttons to next line smoothly!) */}
        <div className="lg:hidden border-t border-[#70A69A]/20 bg-[#0E2824]/90 px-3 sm:px-6 py-2 flex items-center justify-between gap-2 text-xs flex-wrap sm:flex-nowrap">
          {/* Owner Identity Badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs shrink-0">
            <UserCheck className="w-3.5 h-3.5 text-[#70A69A] shrink-0" />
            <span className="font-mono text-[#F5F2EB] text-[11px] truncate max-w-[140px] sm:max-w-xs">
              {user?.email || configuredOwnerEmail}
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-[#70A69A]/30 text-[#70A69A] font-bold shrink-0 uppercase">
              Owner
            </span>
          </div>

          {/* Action buttons (Dropped to second line on tablet as requested) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveTab('branding');
                setSidebarOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#70A69A]/20 hover:bg-[#70A69A]/30 text-[#F5F2EB] font-bold text-[11px] transition-colors"
              title={t('رفع وتعيين اللوجو المعزول (PNG)', 'Upload Logo PNG')}
            >
              <Image className="w-3.5 h-3.5 text-[#70A69A]" />
              <span>{t('رفع اللوجو المعزول', 'Upload Logo')}</span>
            </button>

            <button
              onClick={onBackToPublic}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#70A69A]/20 hover:bg-[#70A69A]/30 text-[#F5F2EB] font-medium text-[11px] transition-colors"
              title={t('عرض الموقع العام للعملاء', 'View Public Site')}
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#70A69A]" />
              <span>{t('الموقع العام', 'Public Site')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop Overlay for Mobile / Tablet Drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Body with Sidebar + Tab Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 gap-6 items-start">
        {/* Responsive Sidebar (Mobile Drawer + Desktop Fixed Panel) */}
        <aside
          className={`fixed inset-y-0 z-50 w-72 sm:w-80 bg-[#153B36] text-[#F5F2EB] p-5 flex flex-col justify-between border-e border-[#70A69A]/30 shadow-2xl overflow-y-auto transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-64 lg:bg-transparent lg:text-[#153B36] lg:border-none lg:p-0 lg:shadow-none lg:overflow-visible shrink-0 ${
            isRtl
              ? sidebarOpen
                ? 'right-0 translate-x-0'
                : 'right-0 translate-x-full lg:translate-x-0'
              : sidebarOpen
              ? 'left-0 translate-x-0'
              : 'left-0 -translate-x-full lg:translate-x-0'
          }`}
          aria-label={t('قائمة لوحة التحكم', 'Dashboard Navigation')}
        >
          <div className="space-y-4">
            {/* Mobile Drawer Top Header (Visible on Mobile/Tablet only) */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 lg:hidden">
              <div className="flex items-center gap-2.5">
                <OnsLogo
                  src={settings.darkLogoUrl || settings.logoUrl}
                  variant="reversed"
                  fallbackVariant="reversed"
                  className="h-8 w-auto max-h-8"
                />
                <span className="font-bold text-xs text-[#F5F2EB]">
                  {t('لوحة المالك', 'Owner Console')}
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-[#F5F2EB]/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={t('إغلاق', 'Close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Owner Email Preview inside Drawer for Mobile */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1 lg:hidden">
              <span className="text-[10px] text-[#70A69A] uppercase tracking-wider block font-semibold">
                {t('المالك المعتمد المصرح:', 'Authorized Owner Identity:')}
              </span>
              <p className="font-mono text-white text-[11px] truncate font-bold">
                {user?.email || configuredOwnerEmail}
              </p>
            </div>

            {/* Navigation Items List */}
            <nav className="space-y-1">
              <span className="text-[10px] font-bold text-[#70A69A] uppercase tracking-wider px-3 mb-2 block">
                {t('أقسام الإدارة والتحكم', 'Management Navigation')}
              </span>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-start group ${
                      isActive
                        ? 'bg-[#70A69A] text-[#153B36] font-bold shadow-xs lg:bg-[#153B36] lg:text-[#F5F2EB]'
                        : 'text-[#F5F2EB]/85 hover:bg-white/10 hover:text-white lg:text-[#153B36]/80 lg:hover:bg-white/70 lg:hover:text-[#153B36]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#153B36] lg:text-[#70A69A]'
                            : 'text-[#70A69A] group-hover:text-white lg:text-[#153B36]/60 lg:group-hover:text-[#153B36]'
                        }`}
                      />
                      <span className="truncate">{t(item.labelAr, item.labelEn)}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shrink-0 ms-2">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-3.5 rounded-2xl bg-white/10 lg:bg-white/70 border border-white/10 lg:border-[#153B36]/10 text-[11px] text-[#F5F2EB]/80 lg:text-[#153B36]/70 space-y-1 mt-6">
            <span className="font-bold block text-white lg:text-[#153B36]">
              {t('إصدار منظومة أُنس 1.0', 'ONS Core v1.0')}
            </span>
            <p className="leading-tight">
              {isFirebaseLive
                ? t('متصل بقاعدة Firebase الحية', 'Connected to Firebase Live')
                : t('يعمل بنمط التحقق الآمن', 'Verified Security Runtime')}
            </p>
          </div>
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-1 min-w-0 w-full bg-transparent">{renderActiveTab()}</main>
      </div>
    </div>
  );
};
