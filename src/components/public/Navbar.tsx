import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { Phone, CalendarPlus, Menu, X, Globe } from 'lucide-react';
import { OnsLogo } from '../common/OnsLogo';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { settings } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', labelAr: 'الرئيسية', labelEn: 'Home' },
    { id: 'services', labelAr: 'الخدمات الطبية', labelEn: 'Services' },
    { id: 'about', labelAr: 'عن أُنس', labelEn: 'About ONS' },
    { id: 'reviews', labelAr: 'تجارب المرضى', labelEn: 'Testimonials' },
    { id: 'contact', labelAr: 'اتصل بنا', labelEn: 'Contact' },
  ];

  const handleNav = (routeId: string) => {
    navigate(routeId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F5F2EB]/95 backdrop-blur-md border-b border-[#153B36]/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Container - Single row on all laptops and desktops */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center cursor-pointer group select-none py-1 shrink-0"
            title={language === 'ar' ? 'أُنس للرعاية الصحية' : 'ONS Healthcare'}
          >
            <OnsLogo
              src={settings.logoUrl}
              variant="color"
              fallbackVariant="color"
              className="h-9 sm:h-11 xl:h-12 w-auto max-h-12 object-contain group-hover:scale-102 transition-transform"
            />
          </div>

          {/* Laptop & Desktop Navigation Links (lg: 1024px+) - Centered in navbar */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-2 xl:mx-6 gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#153B36] text-[#F5F2EB] shadow-xs'
                      : 'text-[#153B36]/85 hover:text-[#153B36] hover:bg-[#153B36]/5'
                  }`}
                >
                  {t(link.labelAr, link.labelEn)}
                </button>
              );
            })}
          </nav>

          {/* Desktop & Laptop Action CTAs (lg: 1024px+) */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-3 shrink-0">
            {/* Phone quick link */}
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-1 xl:gap-1.5 text-xs font-semibold text-[#153B36] bg-[#E7EFEA] hover:bg-[#70A69A]/20 px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-lg transition-colors whitespace-nowrap"
              title="Call ONS"
            >
              <Phone className="w-3.5 h-3.5 text-[#153B36] shrink-0" />
              <span dir="ltr" className="font-mono">{settings.phone}</span>
            </a>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-lg text-xs font-semibold text-[#153B36] border border-[#153B36]/15 hover:bg-[#153B36]/5 transition-colors whitespace-nowrap"
              title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe className="w-3.5 h-3.5 text-[#70A69A] shrink-0" />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Request CTA Button */}
            <button
              onClick={() => handleNav('request')}
              className="flex items-center gap-1.5 px-3 xl:px-4 py-2 xl:py-2.5 rounded-lg bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-xs xl:text-sm font-semibold shadow-xs transition-all active:scale-98 whitespace-nowrap"
            >
              <CalendarPlus className="w-4 h-4 text-[#70A69A] shrink-0" />
              <span>{t('طلب رعاية', 'Request Care')}</span>
            </button>
          </div>

          {/* Tablet & Mobile Menu Toggle Bar (<1024px) */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => handleNav('request')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#153B36] text-[#F5F2EB] text-xs font-semibold shadow-xs active:scale-98 transition-transform"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-[#70A69A]" />
              <span className="whitespace-nowrap">{t('طلب رعاية', 'Request')}</span>
            </button>
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#153B36] border border-[#153B36]/15 hover:bg-[#153B36]/5 transition-colors"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#153B36] hover:bg-[#153B36]/5 transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#153B36]/20"
              aria-label={mobileMenuOpen ? t('إغلاق القائمة', 'Close menu') : t('فتح القائمة', 'Open menu')}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Dropdown: Strictly 1 Item Per Row (No Side-by-Side) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#153B36]/10 bg-[#F5F2EB] px-4 sm:px-6 pt-3 pb-6 space-y-3 shadow-xl animate-fadeIn">
          {/* Vertical Single Column - Every link on its own line */}
          <div className="flex flex-col space-y-2 w-full">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`w-full text-start px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#153B36] text-[#F5F2EB] shadow-xs'
                      : 'text-[#153B36] hover:bg-[#153B36]/5 bg-white/70 border border-[#153B36]/10'
                  }`}
                >
                  {t(link.labelAr, link.labelEn)}
                </button>
              );
            })}
          </div>

          {/* Action Buttons - Each on its own full-width line */}
          <div className="pt-3 border-t border-[#153B36]/10 flex flex-col space-y-2 w-full">
            <button
              onClick={() => handleNav('request')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#153B36] text-[#F5F2EB] text-sm font-semibold flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-transform"
            >
              <CalendarPlus className="w-4 h-4 text-[#70A69A]" />
              <span>{t('طلب رعاية منزلية الآن', 'Request Home Care Now')}</span>
            </button>
            <a
              href={`tel:${settings.phone}`}
              className="w-full py-3 px-4 rounded-xl bg-[#E7EFEA] text-[#153B36] text-sm font-semibold flex items-center justify-center gap-2 border border-[#153B36]/10"
            >
              <Phone className="w-4 h-4 text-[#153B36]" />
              <span dir="ltr" className="font-mono">{settings.phone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
