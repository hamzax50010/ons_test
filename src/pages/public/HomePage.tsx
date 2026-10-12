import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
  ShieldCheck,
  Clock,
  MapPin,
  CalendarPlus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  Activity,
  FileCheck2,
} from 'lucide-react';
import { OnsLogo } from '../../components/common/OnsLogo';

interface HomePageProps {
  navigate: (route: string, params?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { language, t, isRtl } = useLanguage();
  const { content, settings, services, categories, areas, reviews } = useData();

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const featuredServices = services.filter((s) => {
    const isVisible = s.isPubliclyVisible !== undefined ? s.isPubliclyVisible : s.active;
    const isActive = s.serviceStatus ? s.serviceStatus === 'active' : s.active;
    return isVisible && isActive && s.featured;
  });
  const activeAreas = areas.filter((a) => a.active);
  const publishedReviews = reviews.filter((r) => r.published);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#70A69A]/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#153B36]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left/Right Text Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7EFEA] border border-[#70A69A]/40 text-xs sm:text-sm font-semibold text-[#153B36]">
                <ShieldCheck className="w-4 h-4 text-[#70A69A]" />
                <span>
                  {t(
                    'رعاية تمريضية وطبية معتمدة في القاهرة والجيزة',
                    'Accredited Clinical & Nursing Care across Cairo & Giza'
                  )}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#153B36] tracking-tight leading-[1.18]">
                {language === 'ar' ? content.heroTitleAr : content.heroTitleEn}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#153B36]/80 leading-relaxed max-w-2xl font-normal">
                {language === 'ar' ? content.heroSubtitleAr : content.heroSubtitleEn}
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={() => navigate('request')}
                  className="px-7 py-3.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 active:scale-98"
                >
                  <CalendarPlus className="w-5 h-5 text-[#70A69A]" />
                  <span>{language === 'ar' ? content.heroCtaAr : content.heroCtaEn}</span>
                </button>

                <button
                  onClick={() => navigate('services')}
                  className="px-6 py-3.5 rounded-xl bg-[#E7EFEA] hover:bg-[#70A69A]/20 text-[#153B36] font-semibold text-base border border-[#153B36]/15 transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('استعراض كافة الخدمات', 'Browse All Services')}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-[#153B36]/10 text-xs text-[#153B36]/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#70A69A] shrink-0" />
                  <span>{t('كوادر تمريضية مرخصة', 'Licensed Nurses')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#70A69A] shrink-0" />
                  <span>{t('أسعار استرشادية شفافة', 'Transparent Pricing')}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <CheckCircle2 className="w-4 h-4 text-[#70A69A] shrink-0" />
                  <span>{t('متابعة سريرية دقيقة', 'Clinical Follow-up')}</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-white/70 backdrop-blur-md p-6 sm:p-8 border border-[#153B36]/10 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#153B36]/10">
                  <div className="flex items-center gap-3">
                    <OnsLogo
                      src={settings.logoUrl}
                      variant="color"
                      fallbackVariant="color"
                      className="h-14 w-auto max-w-[80px]"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-[#153B36]">
                        {language === 'ar' ? 'أُنس للرعاية الصحية' : 'ONS Healthcare'}
                      </span>
                      <span className="text-[11px] text-[#70A69A] font-medium">
                        {t('بروتوكول الأمان الطبي المعتمد', 'Certified Safety Protocols')}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E7EFEA] text-[#153B36]">
                    24/7
                  </span>
                </div>

                <div className="space-y-3.5 text-xs text-[#153B36]/90">
                  <div className="p-3 rounded-xl bg-[#F5F2EB] flex items-start gap-3">
                    <Stethoscope className="w-4 h-4 text-[#153B36] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-[#153B36]">
                        {t('تقييم طبي دقيق قبل الزيارة', 'Pre-visit Clinical Triage')}
                      </p>
                      <p className="text-[#153B36]/70 text-xs mt-0.5">
                        {t(
                          'تحديد احتياجات المريض والمستلزمات ومطابقة الممارس الأنسب.',
                          'Matching patient needs, consumables, and optimal clinical staff.'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F5F2EB] flex items-start gap-3">
                    <Activity className="w-4 h-4 text-[#153B36] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-[#153B36]">
                        {t('أدوات معقمة وحيدة الاستخدام', 'Strict Sterilization')}
                      </p>
                      <p className="text-[#153B36]/70 text-xs mt-0.5">
                        {t(
                          'التزام صارم بمعايير مكافحة العدوى والوقاية المعتمدة.',
                          'Strict infection control and certified disposable consumables.'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F5F2EB] flex items-start gap-3">
                    <FileCheck2 className="w-4 h-4 text-[#153B36] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-[#153B36]">
                        {t('تقرير زيارة ومتابعة الحالة', 'Visit Documentation')}
                      </p>
                      <p className="text-[#153B36]/70 text-xs mt-0.5">
                        {t(
                          'تسجيل العلامات الحيوية والإجراءات في تقرير رقمي للعائلة.',
                          'Digital vital signs recording and clinical summary for the family.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('request')}
                    className="w-full py-3 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <CalendarPlus className="w-4 h-4 text-[#70A69A]" />
                    <span>{t('احجز زيارة رعاية منزلية الآن', 'Book In-Home Care Now')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Healthcare Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#70A69A] tracking-wider uppercase mb-3 sm:mb-3.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('الخدمات الأكثر طلباً', 'Featured Services')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#153B36] leading-snug sm:leading-tight">
              {t('رعاية سريرية وتمريضية متخصصة في منزلك', 'Specialized Home Care Programs')}
            </h2>
          </div>
          <button
            onClick={() => navigate('services')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#153B36] hover:text-[#70A69A] transition-colors"
          >
            <span>{t('عرض جميع الخدمات', 'View All Services')}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service) => {
            const name = language === 'ar' ? service.nameAr : service.nameEn;
            const summary = language === 'ar' ? service.summaryAr : service.summaryEn;
            const priceNote = language === 'ar' ? service.priceNoteAr : service.priceNoteEn;

            return (
              <div
                key={service.id}
                className="group rounded-2xl bg-white/80 border border-[#153B36]/10 p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#70A69A]/40 transition-all duration-200"
              >
                <div className="space-y-4">
                  {/* Image banner if present */}
                  {service.imageUrl && (
                    <div className="w-full h-44 rounded-xl overflow-hidden bg-[#E7EFEA] mb-2">
                      <img
                        src={service.imageUrl}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-[#153B36] group-hover:text-[#70A69A] transition-colors leading-snug">
                      {name}
                    </h3>
                  </div>

                  <p className="text-sm text-[#153B36]/75 leading-relaxed line-clamp-3 font-normal">
                    {summary}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#153B36]/10 space-y-4">
                  {/* Price display (Strictly protects draft prices from public exposure) */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      {service.isPubliclyPublished === true &&
                      (service.pricingStatus === 'published' || service.pricingStatus === 'approved') &&
                      service.approvedPriceMin !== undefined &&
                      service.approvedPriceMax !== undefined ? (
                        <>
                          <span className="text-xs text-[#153B36]/60 block font-semibold">
                            {service.isPriceIndicative
                              ? t('سعر استرشادي يبدأ من:', 'Indicative starting rate:')
                              : t('السعر المعتمد:', 'Confirmed price:')}
                          </span>
                          <span className="text-lg font-extrabold text-[#153B36]">
                            {service.approvedPriceMin} - {service.approvedPriceMax} {settings.currency || 'ج.م'}
                          </span>
                        </>
                      ) : (
                        <div className="py-0.5">
                          <span className="text-[11px] font-semibold text-[#153B36] bg-[#E7EFEA] border border-[#70A69A]/30 px-2.5 py-1 rounded-lg inline-block">
                            {t('السعر يُحدد بعد مراجعة تفاصيل الطلب', 'Price determined upon reviewing request details')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {priceNote &&
                    service.isPubliclyPublished === true &&
                    (service.pricingStatus === 'published' || service.pricingStatus === 'approved') && (
                      <p className="text-[11px] text-[#153B36]/65 leading-tight italic">
                        *{priceNote}
                      </p>
                    )}

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate('service-detail', { id: service.id })}
                      className="py-2.5 px-2 sm:px-3 rounded-lg border border-[#153B36]/20 text-[11px] sm:text-xs font-semibold text-[#153B36] hover:bg-[#153B36]/5 text-center transition-colors truncate"
                    >
                      {t('التفاصيل والتعليمات', 'Details & Prep')}
                    </button>
                    <button
                      onClick={() => navigate('request', { serviceId: service.id })}
                      className="py-2.5 px-2 sm:px-3 rounded-lg bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-[11px] sm:text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-[#70A69A] shrink-0" />
                      <span className="truncate">{t('طلب الخدمة', 'Request')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. How It Works (The 3-Step Care Protocol) */}
      <section className="bg-[#E7EFEA] py-16 border-y border-[#70A69A]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#70A69A] uppercase tracking-wider block mb-3.5 sm:mb-4 pb-0.5">
              {t('منهجية الرعاية السهلة', 'Care Flow')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#153B36] leading-snug sm:leading-tight">
              {t('كيف تبدأ الرعاية مع أُنس في 3 خطوات؟', 'How Does Care Work in 3 Simple Steps?')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.howItWorks.map((step) => {
              const title = language === 'ar' ? step.titleAr : step.titleEn;
              const desc = language === 'ar' ? step.descAr : step.descEn;

              return (
                <div
                  key={step.step}
                  className="bg-white/90 rounded-2xl p-6 sm:p-8 border border-[#153B36]/10 relative shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#153B36] text-[#70A69A] font-bold text-xl flex items-center justify-center mb-5">
                    0{step.step}
                  </div>
                  <h3 className="text-lg font-bold text-[#153B36] mb-2">{title}</h3>
                  <p className="text-sm text-[#153B36]/80 leading-relaxed font-normal">{desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => navigate('request')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] font-bold text-sm shadow-md transition-all"
            >
              <CalendarPlus className="w-4 h-4 text-[#70A69A]" />
              <span>{t('ابدأ بطلب رعاية منزلية لمريضك', 'Begin Your Home Care Request')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Geographic Coverage (Cairo & Giza) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#153B36] text-[#F5F2EB] p-8 sm:p-12 border border-[#70A69A]/30 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#70A69A]">
                <MapPin className="w-4 h-4" />
                <span>{t('نطاق التغطية الجغرافية', 'Geographic Coverage')}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F2EB] leading-tight">
                {t(
                  'نصل إليكم في القاهرة والجيزة بفريق طبي معتمد',
                  'Reaching You Across Cairo & Giza with Licensed Staff'
                )}
              </h2>
              <p className="text-sm text-[#F5F2EB]/80 leading-relaxed">
                {t(
                  'يتم احتساب رسوم الانتقال وفقاً لكل منطقة جغرافية لضمان وصول الفريق بمعداته المعقمة في الموعد المحدد.',
                  'Transportation fees are clearly itemized per zone to ensure punctual arrival with sterile equipment.'
                )}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('request')}
                  className="px-6 py-3 rounded-xl bg-[#70A69A] hover:bg-[#70A69A]/90 text-[#153B36] font-bold text-sm transition-colors"
                >
                  {t('تحقق من توفر الخدمة في منطقتك', 'Check Your Neighborhood Availability')}
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {activeAreas.map((area) => {
                const areaName = language === 'ar' ? area.nameAr : area.nameEn;
                const areaCity = language === 'ar' ? area.cityAr : area.cityEn;
                const areaNotes = language === 'ar' ? area.notesAr : area.notesEn;

                return (
                  <div
                    key={area.id}
                    className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 hover:border-[#70A69A]/50 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold tracking-wider text-[#70A69A] uppercase px-2 py-0.5 rounded-md bg-[#70A69A]/15 inline-block">
                          {areaCity}
                        </span>
                        <span className="text-[11px] font-semibold text-[#F5F2EB]/90">
                          {t('انتقال:', 'Fee:')}{' '}
                          <span className="font-bold text-[#70A69A]">
                            {area.travelFee} {settings.currency || 'ج.م'}
                          </span>
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-[#F5F2EB] leading-snug break-words">
                        {areaName}
                      </h4>

                      {areaNotes && (
                        <p className="text-xs text-[#F5F2EB]/75 leading-relaxed font-normal break-words pt-0.5">
                          {areaNotes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Verified Patient Testimonials */}
      {publishedReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-[#70A69A] uppercase tracking-wider block mb-3 sm:mb-3.5 pb-0.5">
                {t('ثقة العائلات', 'Patient Experiences')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#153B36] leading-snug sm:leading-tight">
                {t('ماذا يقول المرضى وذووهم عن رعاية أُنس؟', 'What Families Say About ONS Care')}
              </h2>
            </div>
            <button
              onClick={() => navigate('reviews')}
              className="text-sm font-bold text-[#153B36] hover:text-[#70A69A] inline-flex items-center gap-1.5 transition-colors"
            >
              <span>{t('عرض كافة التقييمات', 'View All Reviews')}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publishedReviews.slice(0, 3).map((review) => {
              const author = language === 'ar' ? review.authorNameAr : review.authorNameEn;
              const comment = language === 'ar' ? review.commentAr : review.commentEn;
              const service = language === 'ar' ? review.serviceNameAr : review.serviceNameEn;

              return (
                <div
                  key={review.id}
                  className="rounded-2xl bg-white/80 border border-[#153B36]/10 p-6 flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: review.rating || 5 }).map((_, i) => (
                        <span key={i} className="text-sm font-bold">
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-[#153B36]/85 leading-relaxed italic">
                      "{comment}"
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#153B36]/10">
                    <span className="text-sm font-bold text-[#153B36] block">{author}</span>
                    {service && (
                      <span className="text-xs text-[#70A69A] font-medium block">{service}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Emergency Medical Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-[#E7EFEA] border border-[#70A69A]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#153B36] text-[#F5F2EB] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#70A69A]" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#153B36]">
                {t('هل تحتاج إلى استشارة أو ترتيب زيارة عاجلة؟', 'Need Immediate Care Coordination?')}
              </h4>
              <p className="text-xs text-[#153B36]/80 mt-0.5">
                {t(
                  'فريق التنسيق الطبي متاح هاتفياً وعبر واتساب للإجابة الفورية وترتيب الزيارات.',
                  'Our care coordination desk is standing by via phone and WhatsApp.'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={`tel:${settings.phone}`}
              className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-lg bg-[#153B36] text-[#F5F2EB] text-xs font-bold shadow-xs hover:bg-[#0D2622] transition-colors"
            >
              {t('اتصل الآن', 'Call Now')}
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-lg bg-[#70A69A] text-[#153B36] text-xs font-bold hover:bg-[#70A69A]/80 transition-colors"
            >
              {t('محادثة واتساب', 'WhatsApp')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
