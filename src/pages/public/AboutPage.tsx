import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { ShieldCheck, Award, Users, CheckCircle, CalendarPlus } from 'lucide-react';
import { OnsLogo } from '../../components/common/OnsLogo';

interface AboutPageProps {
  navigate: (route: string, params?: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { content, settings } = useData();

  const brandName = language === 'ar' ? settings.siteNameAr : settings.siteNameEn;
  const slogan = language === 'ar' ? settings.sloganAr : settings.sloganEn;
  const aboutTitle = language === 'ar' ? content.aboutTitleAr : content.aboutTitleEn;
  const aboutBody = language === 'ar' ? content.aboutBodyAr : content.aboutBodyEn;
  const mission = language === 'ar' ? content.missionAr : content.missionEn;
  const values = language === 'ar' ? content.valuesAr : content.valuesEn;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#70A69A] uppercase tracking-wider block">
          {t('رؤيتنا ورسالتنا السريرية', 'Our Philosophy & Mission')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#153B36] tracking-tight">
          {aboutTitle}
        </h1>
        <p className="text-sm sm:text-base text-[#70A69A] font-medium">{slogan}</p>
      </div>

      {/* Main Philosophy Card */}
      <div className="rounded-3xl bg-white border border-[#153B36]/10 p-8 sm:p-12 shadow-sm space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-[#153B36]/10">
          <div className="flex items-center gap-4">
            <OnsLogo
              src={settings.logoUrl}
              variant="color"
              fallbackVariant="color"
              className="h-16 w-auto max-w-[90px]"
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold text-[#153B36]">
                {language === 'ar' ? 'أُنس للرعاية الصحية' : 'ONS Healthcare'}
              </span>
              <span className="text-xs text-[#70A69A] font-semibold">
                {language === 'ar' ? settings.sloganAr : settings.sloganEn}
              </span>
            </div>
          </div>
          <span className="text-xs text-[#153B36]/60 hidden sm:inline-block">
            {t('رعاية صحية منزلية ترتقي بكرامة وراحة مريضك', 'Elevated home health anchored in clinical rigor')}
          </span>
        </div>

        <div className="prose max-w-none text-[#153B36]/85 text-base sm:text-lg leading-relaxed font-normal whitespace-pre-line">
          {aboutBody}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="p-6 rounded-2xl bg-[#E7EFEA] border border-[#70A69A]/30 space-y-2">
            <h3 className="text-base font-bold text-[#153B36] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#70A69A]" />
              <span>{t('رسالتنا الأساسية', 'Our Core Mission')}</span>
            </h3>
            <p className="text-sm text-[#153B36]/80 leading-relaxed">{mission}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#E7EFEA] border border-[#70A69A]/30 space-y-2">
            <h3 className="text-base font-bold text-[#153B36] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#70A69A]" />
              <span>{t('قيمنا المهنية والإنسانية', 'Our Professional Values')}</span>
            </h3>
            <p className="text-sm text-[#153B36]/80 leading-relaxed">{values}</p>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#70A69A] uppercase tracking-wider block mb-3 sm:mb-3.5 pb-0.5">
            {t('تساؤلات شائعة', 'Frequently Asked Questions')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#153B36] leading-snug sm:leading-tight">
            {t('كل ما تود معرفته عن خدمات الرعاية في أُنس', 'Everything You Need to Know')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.faqs.map((faq) => {
            const q = language === 'ar' ? faq.questionAr : faq.questionEn;
            const a = language === 'ar' ? faq.answerAr : faq.answerEn;
            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-white/90 border border-[#153B36]/10 p-6 space-y-2.5 shadow-xs"
              >
                <h4 className="text-base font-bold text-[#153B36] leading-snug">{q}</h4>
                <p className="text-sm text-[#153B36]/80 leading-relaxed font-normal">{a}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Banner */}
      <div className="text-center pt-8">
        <button
          onClick={() => navigate('request')}
          className="px-8 py-3.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
        >
          <CalendarPlus className="w-4 h-4 text-[#70A69A]" />
          <span>{t('طلب زيارة رعاية منزلية لمريضك', 'Request In-Home Healthcare')}</span>
        </button>
      </div>
    </div>
  );
};
