import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { Search, CalendarPlus, ArrowRight, ArrowLeft, Info, ShieldCheck, Phone } from 'lucide-react';

interface ServicesPageProps {
  navigate: (route: string, params?: any) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ navigate }) => {
  const { language, t, isRtl } = useLanguage();
  const { services, categories, settings } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // CRITICAL: Only services explicitly set as publicly visible and active are shown to the public
  const activeServices = services.filter((s) => {
    const isVisible = s.isPubliclyVisible !== undefined ? s.isPubliclyVisible : s.active;
    const isActive = s.serviceStatus ? s.serviceStatus === 'active' : s.active;
    return isVisible && isActive;
  });

  const activeCategories = categories.filter((c) => c.active);

  const filteredServices = activeServices.filter((service) => {
    const matchesCategory =
      selectedCategory === 'all' || service.categoryId === selectedCategory;
    const name = language === 'ar' ? service.nameAr : service.nameEn;
    const summary = language === 'ar' ? service.summaryAr : service.summaryEn;
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const costDisclosure =
    language === 'ar'
      ? settings.costDisclosureAr ||
        'الأسعار المعروضة تخص الخدمة وفق تفاصيلها، ولا تشمل تكلفة التحاليل أو الأدوات والمستلزمات الطبية الإضافية إلا إذا ذُكر صراحةً أنها مشمولة. قد تُضاف مصاريف انتقال حسب العنوان. سيتم توضيح جميع التكاليف الإضافية قبل تأكيد الطلب.'
      : settings.costDisclosureEn ||
        'Displayed prices cover the service as described and exclude laboratory fees, additional medical equipment, and supplies unless explicitly stated as included. Transportation charges may apply depending on the address. All additional costs will be disclosed before the booking is confirmed.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold text-[#70A69A] uppercase tracking-wider block">
          {t('الدليل الطبي والتمريضي', 'Clinical & Nursing Catalog')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#153B36] tracking-tight">
          {t('خدمات الرعاية الصحية المنزلية في أُنس', 'ONS In-Home Healthcare Services')}
        </h1>
        <p className="text-base text-[#153B36]/80 leading-relaxed font-normal">
          {t(
            'جميع الخدمات تُقدم بواسطة أطباء وممرضين وأخصائيي علاج طبيعي مرخصين ومجهزين بأحدث المستلزمات الطبية المعقمة في القاهرة والجيزة.',
            'All medical and nursing procedures are delivered by licensed healthcare practitioners equipped with sterile supplies across Cairo & Giza.'
          )}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-4 border-b border-[#153B36]/10">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#153B36] text-[#F5F2EB] shadow-xs'
                : 'bg-white/60 text-[#153B36] hover:bg-white'
            }`}
          >
            {t('كافة الخدمات', 'All Services')} ({activeServices.length})
          </button>
          {activeCategories.map((category) => {
            const count = activeServices.filter((s) => s.categoryId === category.id).length;
            const catName = language === 'ar' ? category.nameAr : category.nameEn;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#153B36] text-[#F5F2EB] shadow-xs'
                    : 'bg-white/60 text-[#153B36] hover:bg-white'
                }`}
              >
                {catName} ({count})
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#153B36]/50 absolute top-1/2 -translate-y-1/2 start-3" />
          <input
            type="text"
            placeholder={t('ابحث بالاسم أو الإجراء...', 'Search services...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/80 border border-[#153B36]/15 rounded-xl ps-9 pe-4 py-2 text-sm text-[#153B36] focus:outline-hidden focus:border-[#70A69A] transition-colors"
          />
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-white/40 rounded-2xl border border-[#153B36]/10 p-8 space-y-3">
          <Info className="w-8 h-8 text-[#70A69A] mx-auto" />
          <h3 className="text-lg font-bold text-[#153B36]">
            {t('لم نجد خدمات مطابقة لبحثك', 'No services found matching your criteria')}
          </h3>
          <p className="text-xs text-[#153B36]/70">
            {t('يرجى تجربة كلمات بحث أخرى أو اختيار تصنيف مختلف.', 'Try different keywords or select another category.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const name = language === 'ar' ? service.nameAr : service.nameEn;
            const summary = language === 'ar' ? service.summaryAr : service.summaryEn;
            const priceNote = language === 'ar' ? service.priceNoteAr : service.priceNoteEn;
            const category = categories.find((c) => c.id === service.categoryId);
            const catName = category
              ? language === 'ar'
                ? category.nameAr
                : category.nameEn
              : '';

            // CRITICAL: A service price is only shown publicly if approved by an authorized owner AND explicitly published
            const isPriceApproved =
              service.isPubliclyPublished === true &&
              (service.pricingStatus === 'published' || service.pricingStatus === 'approved') &&
              service.approvedPriceMin !== undefined &&
              service.approvedPriceMax !== undefined;

            const isBookingEnabled = service.isBookingEnabled !== false;

            return (
              <div
                key={service.id}
                className="group rounded-2xl bg-white/90 border border-[#153B36]/10 p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#70A69A]/40 transition-all duration-200"
              >
                <div className="space-y-3.5">
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

                  {catName && (
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#70A69A]">
                      {catName}
                    </span>
                  )}

                  <h2 className="text-lg font-bold text-[#153B36] group-hover:text-[#70A69A] transition-colors leading-snug">
                    {name}
                  </h2>

                  <p className="text-sm text-[#153B36]/75 leading-relaxed line-clamp-3">
                    {summary}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-[#153B36]/10 space-y-4">
                  {/* Pricing info - strictly enforced */}
                  <div className="min-h-[48px] flex flex-col justify-center">
                    {isPriceApproved ? (
                      <div>
                        <span className="text-[11px] text-[#153B36]/60 block font-semibold">
                          {t('السعر المعتمد للخدمة:', 'Approved Service Rate:')}
                        </span>
                        <span className="text-lg font-extrabold text-[#153B36]">
                          {service.approvedPriceMin} - {service.approvedPriceMax} {settings.currency || 'ج.م'}
                        </span>
                      </div>
                    ) : (
                      <div className="py-1">
                        <span className="text-xs font-bold text-[#153B36] bg-[#F5F2EB] px-2.5 py-1.5 rounded-lg border border-[#153B36]/15 inline-block">
                          {t('السعر يُحدد بعد مراجعة تفاصيل الطلب', 'Price determined upon reviewing request details')}
                        </span>
                        <span className="text-[10px] text-[#70A69A] block mt-1 font-semibold">
                          {t('عرض سعر مخصص وفق الحالة والمستلزمات', 'Custom quote based on clinical needs & supplies')}
                        </span>
                      </div>
                    )}
                  </div>

                  {priceNote && isPriceApproved && (
                    <p className="text-[11px] text-[#153B36]/65 italic">
                      *{priceNote}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate('service-detail', { id: service.id })}
                      className="py-2.5 px-2 sm:px-3 rounded-lg border border-[#153B36]/20 text-[11px] sm:text-xs font-semibold text-[#153B36] hover:bg-[#153B36]/5 text-center transition-colors flex items-center justify-center gap-1 truncate"
                    >
                      <span className="truncate">{t('تفاصيل الخدمة', 'Full Details')}</span>
                      <ArrowIcon className="w-3.5 h-3.5 shrink-0" />
                    </button>
                    {isBookingEnabled ? (
                      <button
                        onClick={() => navigate('request', { serviceId: service.id })}
                        className="py-2.5 px-2 sm:px-3 rounded-lg bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-[11px] sm:text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-[#70A69A] shrink-0" />
                        <span className="truncate">{t('طلب الخدمة', 'Request')}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('contact')}
                        className="py-2.5 px-2 sm:px-3 rounded-lg bg-[#E7EFEA] hover:bg-[#70A69A]/20 text-[#153B36] text-[11px] sm:text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#153B36] shrink-0" />
                        <span className="truncate">{t('استفسار', 'Inquire')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer-Facing Cost Disclosure Banner */}
      <div className="rounded-2xl bg-[#E7EFEA] border border-[#70A69A]/40 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <ShieldCheck className="w-6 h-6 text-[#153B36] shrink-0 mt-0.5" />
          <div className="text-xs text-[#153B36]/90 space-y-1.5 leading-relaxed">
            <p className="font-extrabold text-sm text-[#153B36]">
              {t('إفصاح الشفافية في التكاليف والأسعار لدى أُنس', 'ONS Cost Disclosure & Transparency Commitment')}
            </p>
            <p className="font-normal text-xs text-[#153B36]/80">
              {costDisclosure}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('request')}
          className="whitespace-nowrap px-6 py-2.5 rounded-xl bg-[#153B36] text-[#F5F2EB] text-xs font-bold hover:bg-[#0D2622] transition-colors shrink-0"
        >
          {t('طلب رعاية الآن', 'Request Care')}
        </button>
      </div>
    </div>
  );
};
