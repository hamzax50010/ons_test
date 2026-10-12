import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { Phone, Mail, MapPin, AlertCircle, Shield } from 'lucide-react';
import { OnsLogo } from '../common/OnsLogo';

interface FooterProps {
  navigate: (route: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { settings, content } = useData();

  const brandName = language === 'ar' ? settings.siteNameAr : settings.siteNameEn;
  const slogan = language === 'ar' ? settings.sloganAr : settings.sloganEn;
  const footerText = language === 'ar' ? content.footerTextAr : content.footerTextEn;
  const emergencyNote = language === 'ar' ? settings.emergencyNoteAr : settings.emergencyNoteEn;
  const businessHours = language === 'ar' ? settings.businessHoursAr : settings.businessHoursEn;

  return (
    <footer className="bg-[#153B36] text-[#F5F2EB] pt-14 pb-8 border-t border-[#70A69A]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#70A69A]/20">
          {/* Col 1: Brand & Clinical Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <OnsLogo
                src={settings.darkLogoUrl || settings.logoUrl}
                variant="reversed"
                fallbackVariant="reversed"
                className="h-14 w-auto max-w-[64px] shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-extrabold text-[#F5F2EB] tracking-tight">
                  {language === 'ar' ? 'أُنس للرعاية الصحية' : 'ONS Healthcare'}
                </span>
                <span className="text-xs text-[#70A69A]">
                  {language === 'ar' ? settings.sloganAr : settings.sloganEn}
                </span>
              </div>
            </div>
            <p className="text-sm text-[#F5F2EB]/80 leading-relaxed font-light">
              {footerText}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#70A69A]">
              <Shield className="w-4 h-4 shrink-0" />
              <span>{t('طواقم تمريضية وطبية معتمدة ومرخصة', 'Licensed & Certified Clinical Teams')}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-[#70A69A]">
              {t('روابط الوصول', 'Navigation')}
            </h4>
            <ul className="space-y-2 text-sm text-[#F5F2EB]/85">
              <li>
                <button
                  onClick={() => navigate('home')}
                  className="hover:text-[#70A69A] transition-colors"
                >
                  {t('الصفحة الرئيسية', 'Home')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('services')}
                  className="hover:text-[#70A69A] transition-colors"
                >
                  {t('الخدمات الطبية والتمريضية', 'All Healthcare Services')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('request')}
                  className="hover:text-[#70A69A] transition-colors font-medium text-[#70A69A]"
                >
                  {t('طلب خدمة رعاية منزلية', 'Request Care Service')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('about')}
                  className="hover:text-[#70A69A] transition-colors"
                >
                  {t('عن أُنس وفريقنا', 'About ONS & Our Team')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('reviews')}
                  className="hover:text-[#70A69A] transition-colors"
                >
                  {t('تجارب وآراء المرضى', 'Patient Testimonials')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('privacy')}
                  className="hover:text-[#70A69A] transition-colors"
                >
                  {t('سياسة الخصوصية وأمان البيانات', 'Privacy & Data Protection')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Service Coverage */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-[#70A69A]">
              {t('نطاق التغطية', 'Coverage Area')}
            </h4>
            <div className="space-y-2 text-sm text-[#F5F2EB]/85">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#70A69A] shrink-0 mt-0.5" />
                <span>
                  {t(
                    'القاهرة: التجمع الخامس، المعادي، مصر الجديدة، مدينة نصر، الزمالك',
                    'Cairo: New Cairo, Maadi, Heliopolis, Nasr City, Zamalek'
                  )}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#70A69A] shrink-0 mt-0.5" />
                <span>
                  {t(
                    'الجيزة: الشيخ زايد، 6 أكتوبر، الدقي، المهندسين، العجوزة',
                    'Giza: Sheikh Zayed, 6th of October, Dokki, Mohandessin'
                  )}
                </span>
              </div>
            </div>
            <div className="pt-2 text-xs text-[#F5F2EB]/70">
              <span className="font-semibold block text-[#F5F2EB]">{t('ساعات العمل:', 'Hours:')}</span>
              {businessHours}
            </div>
          </div>

          {/* Col 4: Contact & Inquiries */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-[#70A69A]">
              {t('تواصل وتنسيق الرعاية', 'Coordination & Care')}
            </h4>
            <div className="space-y-2.5 text-sm">
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-2.5 text-[#F5F2EB]/90 hover:text-[#70A69A] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#70A69A] shrink-0" />
                <span dir="ltr">{settings.phone}</span>
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-[#F5F2EB]/90 hover:text-[#70A69A] transition-colors"
              >
                <span className="w-4 h-4 flex items-center justify-center font-bold text-[#70A69A] shrink-0 text-xs">
                  WA
                </span>
                <span dir="ltr">{settings.whatsapp}</span>
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2.5 text-[#F5F2EB]/90 hover:text-[#70A69A] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#70A69A] shrink-0" />
                <span>{settings.email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Emergency Medical Disclaimer */}
        <div className="my-6 p-4 rounded-xl bg-[#0D2622]/60 border border-[#70A69A]/30 text-xs text-[#F5F2EB]/85 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#70A69A] shrink-0 mt-0.5" />
          <p className="leading-relaxed">{emergencyNote}</p>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#F5F2EB]/60 gap-4">
          <p>
            © {new Date().getFullYear()} {brandName}. {t('جميع الحقوق محفوظة.', 'All rights reserved.')}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('privacy')}
              className="hover:text-[#F5F2EB] transition-colors"
            >
              {t('سياسة الخصوصية', 'Privacy Policy')}
            </button>
            <span>•</span>
            <span>{t('القاهرة والجيزة، جمهورية مصر العربية', 'Cairo & Giza, Egypt')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
