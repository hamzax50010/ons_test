import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
  CalendarPlus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Shield,
  FileText,
  Phone,
  ShieldCheck,
  Package,
} from 'lucide-react';

interface ServiceDetailPageProps {
  serviceId: string;
  navigate: (route: string, params?: any) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  serviceId,
  navigate,
}) => {
  const { language, t, isRtl } = useLanguage();
  const { services, categories, areas, settings } = useData();

  const BackArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  const service = services.find((s) => s.id === serviceId) || services[0];

  // If service does not exist or is an internal unapproved draft not visible publicly
  if (!service || (service.isPubliclyVisible === false && service.serviceStatus === 'draft')) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#153B36]">
          {t('الخدمة قيد المراجعة الداخلية', 'Service Under Clinical Review')}
        </h2>
        <p className="text-sm text-[#153B36]/75 max-w-md mx-auto">
          {t(
            'هذه الخدمة قيد المراجعة الإدارية والسريرية والتحقق من التجهيزات ولم تُعتمد للعرض العام بعد.',
            'This service record is currently under internal review and not yet approved for public display.'
          )}
        </p>
        <button
          onClick={() => navigate('services')}
          className="mt-2 px-6 py-2.5 rounded-xl bg-[#153B36] text-[#F5F2EB] text-sm font-semibold hover:bg-[#0D2622] transition-colors"
        >
          {t('العودة لدليل الخدمات', 'Return to Services Catalog')}
        </button>
      </div>
    );
  }

  const category = categories.find((c) => c.id === service.categoryId);
  const catName = category
    ? language === 'ar'
      ? category.nameAr
      : category.nameEn
    : '';

  const name = language === 'ar' ? service.nameAr : service.nameEn;
  const summary = language === 'ar' ? service.summaryAr : service.summaryEn;
  const description = language === 'ar' ? service.descriptionAr : service.descriptionEn;
  const instructions = language === 'ar' ? service.instructionsAr : service.instructionsEn;
  const requirements = language === 'ar' ? service.requirementsAr : service.requirementsEn;
  const priceNote = language === 'ar' ? service.priceNoteAr : service.priceNoteEn;
  const suppliesReqs =
    language === 'ar'
      ? service.suppliesEquipmentRequirementsAr
      : service.suppliesEquipmentRequirementsEn;
  const labNotes =
    language === 'ar' ? service.labOrThirdPartyFeesNoteAr : service.labOrThirdPartyFeesNoteEn;
  const transportPolicy =
    language === 'ar' ? service.transportationPolicyAr : service.transportationPolicyEn;

  const includedItems =
    language === 'ar' ? service.includedItemsAr || [] : service.includedItemsEn || [];
  const excludedItems =
    language === 'ar' ? service.excludedItemsAr || [] : service.excludedItemsEn || [];

  const coveredAreas = areas.filter(
    (a) => a.active && service.availableAreaIds.includes(a.id)
  );

  // CRITICAL: Check if price has been approved by the owner AND explicitly published
  const isPriceApproved =
    service.isPubliclyPublished === true &&
    (service.pricingStatus === 'published' || service.pricingStatus === 'approved') &&
    service.approvedPriceMin !== undefined &&
    service.approvedPriceMax !== undefined;

  const isBookingEnabled = service.isBookingEnabled !== false;

  const costDisclosure =
    language === 'ar'
      ? settings.costDisclosureAr ||
        'الأسعار المعروضة تخص الخدمة وفق تفاصيلها، ولا تشمل تكلفة التحاليل أو الأدوات والمستلزمات الطبية الإضافية إلا إذا ذُكر صراحةً أنها مشمولة. قد تُضاف مصاريف انتقال حسب العنوان. سيتم توضيح جميع التكاليف الإضافية قبل تأكيد الطلب.'
      : settings.costDisclosureEn ||
        'Displayed prices cover the service as described and exclude laboratory fees, additional medical equipment, and supplies unless explicitly stated as included. Transportation charges may apply depending on the address. All additional costs will be disclosed before the booking is confirmed.';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('services')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#153B36] hover:text-[#70A69A] transition-colors"
        >
          <BackArrowIcon className="w-4 h-4" />
          <span>{t('العودة لكافة الخدمات', 'Back to Services Catalog')}</span>
        </button>
      </div>

      {/* Main Service Container */}
      <div className="rounded-3xl bg-white border border-[#153B36]/10 overflow-hidden shadow-sm">
        {/* Banner image */}
        {service.imageUrl && (
          <div className="w-full h-64 sm:h-80 relative overflow-hidden bg-[#E7EFEA]">
            <img
              src={service.imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 sm:p-10">
              <div className="text-white space-y-1">
                {catName && (
                  <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#70A69A] bg-[#153B36]/80 px-2.5 py-1 rounded-md backdrop-blur-xs">
                    {catName}
                  </span>
                )}
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-md">
                  {name}
                </h1>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-10 space-y-8">
          {!service.imageUrl && (
            <div>
              {catName && (
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#70A69A] mb-2">
                  {catName}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#153B36]">{name}</h1>
            </div>
          )}

          {/* Clinical summary quote */}
          <div className="p-4 rounded-2xl bg-[#E7EFEA] border-s-4 border-[#153B36] text-[#153B36] text-base font-medium leading-relaxed">
            {summary}
          </div>

          {/* Pricing & Booking Action Banner - strictly adheres to approved vs unapproved workflow */}
          <div className="rounded-2xl bg-[#F5F2EB] p-6 border border-[#153B36]/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              {isPriceApproved ? (
                <>
                  <span className="text-xs text-[#153B36]/60 font-semibold block uppercase tracking-wider">
                    {t('السعر المعتمد للخدمة:', 'Approved Service Price:')}
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#153B36] mt-1">
                    {service.approvedPriceMin} - {service.approvedPriceMax} {settings.currency || 'ج.م'}
                  </div>
                  {priceNote && (
                    <p className="text-xs text-[#153B36]/70 mt-1 max-w-md italic">
                      *{priceNote}
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-1.5">
                  <span className="text-xs text-[#70A69A] font-bold block uppercase tracking-wider">
                    {t('تسعير مخصص بعد المراجعة السريرية', 'Custom Quote upon Clinical Review')}
                  </span>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#153B36]">
                    {t('السعر يُحدد بعد مراجعة تفاصيل الطلب', 'Price determined upon reviewing request details')}
                  </div>
                  <p className="text-xs text-[#153B36]/70 max-w-md">
                    {t(
                      'يتم تأكيد السعر النهائي ومستلزمات الحالة ورسوم الانتقال الخاصة بعنوانك قبل تحرك الفريق الطبي.',
                      'Final price, required consumables, and area transit fee are confirmed prior to dispatch.'
                    )}
                  </p>
                </div>
              )}
            </div>

            {isBookingEnabled ? (
              <button
                onClick={() => navigate('request', { serviceId: service.id })}
                className="px-8 py-3.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-base font-bold shadow-md flex items-center justify-center gap-2.5 transition-all shrink-0 active:scale-98"
              >
                <CalendarPlus className="w-5 h-5 text-[#70A69A]" />
                <span>{t('طلب هذه الخدمة لمريضك', 'Request This Service')}</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('contact')}
                className="px-8 py-3.5 rounded-xl bg-[#E7EFEA] hover:bg-[#70A69A]/20 text-[#153B36] text-base font-bold flex items-center justify-center gap-2.5 transition-all shrink-0"
              >
                <Phone className="w-5 h-5 text-[#153B36]" />
                <span>{t('استفسار عن توفر الخدمة', 'Inquire About Availability')}</span>
              </button>
            )}
          </div>

          {/* Included vs Excluded Components (if specified) */}
          {(includedItems.length > 0 || excludedItems.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-white border border-[#153B36]/10">
              {includedItems.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('ما تشمله الخدمة', 'What Is Included')}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#153B36]/85">
                    {includedItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {excludedItems.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-amber-600" />
                    <span>{t('ما لا تشمله الخدمة', 'What Is Excluded')}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#153B36]/85">
                    {excludedItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Detailed Clinical Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#153B36] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#70A69A]" />
              <span>{t('الوصف الإجرائي والسريري للخدمة', 'Clinical Procedure Overview')}</span>
            </h3>
            <p className="text-base text-[#153B36]/80 leading-relaxed font-normal whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Supplies & Third-Party Notes if applicable */}
          {(suppliesReqs || labNotes || transportPolicy) && (
            <div className="p-5 rounded-2xl bg-[#E7EFEA]/60 border border-[#70A69A]/30 space-y-3 text-xs text-[#153B36]/85">
              <h4 className="font-bold text-sm text-[#153B36] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#70A69A]" />
                <span>{t('متطلبات التجهيز ورسوم الانتقال والمختبرات', 'Equipment, Laboratory & Transit Details')}</span>
              </h4>
              {suppliesReqs && (
                <p>
                  <strong className="text-[#153B36]">{t('المستلزمات والأجهزة:', 'Supplies & Devices:')} </strong>
                  {suppliesReqs}
                </p>
              )}
              {labNotes && (
                <p>
                  <strong className="text-[#153B36]">{t('رسوم المعامل:', 'Laboratory Fees:')} </strong>
                  {labNotes}
                </p>
              )}
              {transportPolicy && (
                <p>
                  <strong className="text-[#153B36]">{t('سياسة الانتقال:', 'Transportation Policy:')} </strong>
                  {transportPolicy}
                </p>
              )}
            </div>
          )}

          {/* Instructions and Requirements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#153B36]/10">
            {/* Instructions */}
            <div className="p-5 rounded-2xl bg-[#F5F2EB] border border-[#153B36]/10 space-y-3">
              <h4 className="text-sm font-bold text-[#153B36] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#70A69A]" />
                <span>{t('تعليمات وتحضيرات المريض والأسرة', 'Patient & Family Instructions')}</span>
              </h4>
              <p className="text-xs sm:text-sm text-[#153B36]/80 leading-relaxed">
                {instructions ||
                  t(
                    'يرجى تجهيز الروشتات الطبية السابقة، وتقارير المستشفى، وقائمة الأدوية الحالية للمريض قبل موعد الزيارة.',
                    'Please keep prior prescriptions, discharge summaries, and current medication list available.'
                  )}
              </p>
            </div>

            {/* Requirements / Prerequisites */}
            <div className="p-5 rounded-2xl bg-[#F5F2EB] border border-[#153B36]/10 space-y-3">
              <h4 className="text-sm font-bold text-[#153B36] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#70A69A]" />
                <span>{t('متطلبات الأمان والتجهيز المنزلي', 'Safety & Domestic Requirements')}</span>
              </h4>
              <p className="text-xs sm:text-sm text-[#153B36]/80 leading-relaxed">
                {requirements ||
                  t(
                    'توفير غرفة نظيفة ذات إضاءة كافية وتهوية جيدة، ومصدر ماء وصابون لتعقيم الأيدي قبل الإجراء.',
                    'Provide a clean, well-lit space with handwashing facilities to uphold sterile environment standards.'
                  )}
              </p>
            </div>
          </div>

          {/* Customer-Facing Cost Disclosure Callout */}
          <div className="p-5 rounded-2xl bg-[#E7EFEA] border border-[#70A69A]/30 flex items-start gap-3 text-xs text-[#153B36]/85">
            <ShieldCheck className="w-5 h-5 text-[#153B36] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-sm text-[#153B36]">{t('إفصاح التكاليف والشفافية:', 'Cost Disclosure:')}</strong>
              <p className="leading-relaxed">{costDisclosure}</p>
            </div>
          </div>

          {/* Geographic Coverage for this service */}
          <div className="pt-4 border-t border-[#153B36]/10 space-y-3">
            <h4 className="text-sm font-bold text-[#153B36] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#70A69A]" />
              <span>{t('المناطق المتاحة لتنفيذ الخدمة', 'Geographic Availability')}</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {coveredAreas.map((area) => (
                <span
                  key={area.id}
                  className="px-3 py-1.5 rounded-lg bg-[#E7EFEA] text-[#153B36] text-xs font-semibold"
                >
                  {language === 'ar' ? area.nameAr : area.nameEn}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
