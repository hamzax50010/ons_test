import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import { ServiceArea } from '../../../types';
import {
  MapPin,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ShieldCheck,
  Building,
  Info,
} from 'lucide-react';

export const PricingAreasTab: React.FC = () => {
  const { areas, settings, updateSettings, addArea, updateArea, deleteArea } = useData();
  const { language, t } = useLanguage();

  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);
  const [isCreatingArea, setIsCreatingArea] = useState<boolean>(false);
  const [areaFormData, setAreaFormData] = useState<Partial<ServiceArea>>({
    nameAr: '',
    nameEn: '',
    cityAr: 'القاهرة',
    cityEn: 'Cairo',
    travelFee: 80,
    notesAr: '',
    notesEn: '',
    active: true,
    order: 1,
  });

  const [currencyVal, setCurrencyVal] = useState<string>(settings.currency || 'ج.م');
  const [costDisclosureAr, setCostDisclosureAr] = useState<string>(
    settings.costDisclosureAr ||
      'الأسعار المعروضة تخص الخدمة وفق تفاصيلها، ولا تشمل تكلفة التحاليل أو الأدوات والمستلزمات الطبية الإضافية إلا إذا ذُكر صراحةً أنها مشمولة. قد تُضاف مصاريف انتقال حسب العنوان. سيتم توضيح جميع التكاليف الإضافية قبل تأكيد الطلب.'
  );
  const [costDisclosureEn, setCostDisclosureEn] = useState<string>(
    settings.costDisclosureEn ||
      'Displayed prices cover the service as described and exclude laboratory fees, additional medical equipment, and supplies unless explicitly stated as included. Transportation charges may apply depending on the address. All additional costs will be disclosed before the booking is confirmed.'
  );
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState<boolean>(false);

  const handleSavePricingSettings = async () => {
    await updateSettings({
      currency: currencyVal,
      costDisclosureAr,
      costDisclosureEn,
    });
    setSaveSettingsSuccess(true);
    setTimeout(() => setSaveSettingsSuccess(false), 2500);
  };

  const handleOpenCreateArea = () => {
    setIsCreatingArea(true);
    setEditingArea(null);
    setAreaFormData({
      nameAr: '',
      nameEn: '',
      cityAr: 'القاهرة',
      cityEn: 'Cairo',
      travelFee: 80,
      notesAr: '',
      notesEn: '',
      active: true,
      order: areas.length + 1,
    });
  };

  const handleOpenEditArea = (area: ServiceArea) => {
    setEditingArea(area);
    setIsCreatingArea(false);
    setAreaFormData({ ...area });
  };

  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaFormData.nameAr?.trim()) return;

    if (editingArea) {
      await updateArea(editingArea.id, areaFormData);
    } else {
      await addArea(areaFormData as Omit<ServiceArea, 'id'>);
    }
    setEditingArea(null);
    setIsCreatingArea(false);
  };

  const handleDeleteArea = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المنطقة؟')) return;
    await deleteArea(id);
  };

  return (
    <div className="space-y-8">
      {/* Tab Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#153B36]">
          {t('إدارة التسعير ومناطق التغطية (القاهرة والجيزة)', 'Pricing Rules & Service Coverage Areas')}
        </h1>
        <p className="text-xs text-[#153B36]/70 mt-1">
          {t(
            'تحديد العملة ورسوم الانتقال الجغرافية حسب كل حي مع الحفاظ على الشفافية التامة.',
            'Manage currency, zone dispatch travel fees, and neighborhood availability.'
          )}
        </p>
      </div>

      {/* 1. Global Pricing Configuration Card */}
      <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-5 shadow-xs">
        <h2 className="text-base font-bold text-[#153B36] flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#70A69A]" />
          <span>{t('إعدادات العملة وسياسة التسعير', 'Currency & Pricing Transparency')}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs items-end">
          <div>
            <label className="block font-bold text-[#153B36] mb-1">
              {t('رمز العملة الأساسية (الافتراضي: ج.م / EGP)', 'Base Currency Symbol')}
            </label>
            <input
              type="text"
              value={currencyVal}
              onChange={(e) => setCurrencyVal(e.target.value)}
              className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2.5 text-xs font-bold text-[#153B36]"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-end">
            <button
              onClick={handleSavePricingSettings}
              className="px-5 py-2.5 rounded-xl bg-[#153B36] text-[#F5F2EB] font-bold hover:bg-[#0D2622] transition-colors text-xs"
            >
              {t('حفظ إعدادات وسياسات التسعير', 'Save Pricing & Disclosures')}
            </button>
            {saveSettingsSuccess && (
              <span className="ms-3 text-xs text-emerald-700 font-bold">
                ✓ {t('تم الحفظ بنجاح', 'Saved Successfully')}
              </span>
            )}
          </div>
        </div>

        {/* Standard Disclosures */}
        <div className="pt-3 border-t border-[#153B36]/10 space-y-3 text-xs">
          <span className="font-bold text-[#153B36] block">
            {t('إقرار الشفافية وتوضيح التكاليف الإضافية (Standard Pricing Disclosures):', 'Standard Pricing Disclosures:')}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#153B36]/70 mb-1">
                {t('صيغة الإقرار بالعربية (تظهر في صفحة التفاصيل ونموذج الحجز)', 'Arabic Disclosure')}
              </label>
              <textarea
                rows={3}
                value={costDisclosureAr}
                onChange={(e) => setCostDisclosureAr(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#153B36]/15 bg-white text-xs leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#153B36]/70 mb-1">
                {t('صيغة الإقرار بالإنجليزية', 'English Disclosure')}
              </label>
              <textarea
                rows={3}
                value={costDisclosureEn}
                onChange={(e) => setCostDisclosureEn(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#153B36]/15 bg-white text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#E7EFEA] text-xs text-[#153B36]/80 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#153B36] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t(
              'ميثاق الشفافية: الموقع لا يضيف أي رسوم خفية ولا يعرض سعراً استرشادياً باعتباره سعراً نهائياً ملزماً قبل التواصل المباشر وتأكيد الفريق الطبي ومستلزمات الحالة.',
              'Transparency Rule: The system never applies hidden fees and marks indicative ranges clearly until clinical telephonic confirmation.'
            )}
          </p>
        </div>
      </div>

      {/* 2. Coverage Areas Manager */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#153B36] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#70A69A]" />
              <span>{t('أحياء ومناطق القاهرة والجيزة', 'Cairo & Giza Neighborhoods')}</span>
            </h2>
            <p className="text-xs text-[#153B36]/60">
              {t('تحديد رسوم الانتقال والملاحظات التشغيلية لكل منطقة', 'Set travel fee and notes per zone')}
            </p>
          </div>

          <button
            onClick={handleOpenCreateArea}
            className="px-4 py-2.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-xs font-bold flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#70A69A]" />
            <span>{t('إضافة منطقة جديدة', 'Add New Area')}</span>
          </button>
        </div>

        {/* Areas Table */}
        <div className="bg-white rounded-3xl border border-[#153B36]/10 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-xs text-start">
              <thead>
                <tr className="bg-[#F5F2EB]/50 border-b border-[#153B36]/10 text-[#153B36]/70">
                  <th className="py-3.5 px-4 text-start font-bold">{t('المنطقة (عربي / EN)', 'Area Name')}</th>
                  <th className="py-3.5 px-4 text-start font-bold">{t('المحافظة / المدينة', 'City')}</th>
                  <th className="py-3.5 px-4 text-start font-bold">{t('رسوم الانتقال', 'Travel Fee')}</th>
                  <th className="py-3.5 px-4 text-start font-bold">{t('ملاحظات التغطية', 'Coverage Notes')}</th>
                  <th className="py-3.5 px-4 text-center font-bold">{t('الحالة', 'Status')}</th>
                  <th className="py-3.5 px-4 text-end font-bold">{t('إجراءات', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#153B36]/5">
                {areas.map((area) => (
                  <tr key={area.id} className="hover:bg-[#F5F2EB]/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#153B36]">
                      <div>{area.nameAr}</div>
                      <div className="text-[11px] text-[#153B36]/60">{area.nameEn}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#153B36]/80">
                      {language === 'ar' ? area.cityAr : area.cityEn}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#153B36]">
                      {area.travelFee} {settings.currency}
                    </td>
                    <td className="py-3 px-4 text-[#153B36]/70 text-[11px] max-w-xs truncate">
                      {language === 'ar' ? area.notesAr : area.notesEn}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          area.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {area.active ? t('مغطاة', 'Active') : t('غير متاحة', 'Inactive')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditArea(area)}
                          className="p-1.5 rounded-lg text-[#153B36] hover:bg-[#153B36]/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArea(area.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Area Modal */}
      {(isCreatingArea || editingArea) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#153B36]/10 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#153B36]/10">
              <h2 className="text-lg font-bold text-[#153B36]">
                {editingArea ? t('تعديل المنطقة الجغرافية', 'Edit Service Area') : t('إضافة منطقة جغرافية جديدة', 'Add New Area')}
              </h2>
              <button
                onClick={() => {
                  setEditingArea(null);
                  setIsCreatingArea(false);
                }}
              >
                <X className="w-5 h-5 text-[#153B36]/60" />
              </button>
            </div>

            <form onSubmit={handleSaveArea} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#153B36] mb-1">
                    {t('المدينة / المحافظة *', 'City / Governorate *')}
                  </label>
                  <select
                    value={areaFormData.cityAr}
                    onChange={(e) => {
                      const cityAr = e.target.value;
                      const cityEn = cityAr === 'القاهرة' ? 'Cairo' : 'Giza';
                      setAreaFormData({ ...areaFormData, cityAr, cityEn });
                    }}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#153B36]"
                  >
                    <option value="القاهرة">القاهرة (Cairo)</option>
                    <option value="الجيزة">الجيزة (Giza)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#153B36] mb-1">
                    {t('رسوم الانتقال (ج.م) *', 'Travel Fee (EGP) *')}
                  </label>
                  <input
                    type="number"
                    required
                    value={areaFormData.travelFee}
                    onChange={(e) =>
                      setAreaFormData({
                        ...areaFormData,
                        travelFee: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs text-[#153B36]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#153B36] mb-1">
                  {t('اسم الحي أو المنطقة بالعربية *', 'Area Name (Arabic) *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: المعادي ودجلة"
                  value={areaFormData.nameAr}
                  onChange={(e) =>
                    setAreaFormData({ ...areaFormData, nameAr: e.target.value })
                  }
                  className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs text-[#153B36]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#153B36] mb-1">
                  {t('اسم الحي أو المنطقة بالإنجليزية *', 'Area Name (English) *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maadi & Degla"
                  value={areaFormData.nameEn}
                  onChange={(e) =>
                    setAreaFormData({ ...areaFormData, nameEn: e.target.value })
                  }
                  className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs text-[#153B36]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#153B36] mb-1">
                  {t('ملاحظات جغرافية بالعربية (المناطق المشمولة)', 'Notes (Arabic)')}
                </label>
                <input
                  type="text"
                  placeholder="مثال: تشمل الرحاب ومدينتي والتجمع الأول والثالث"
                  value={areaFormData.notesAr}
                  onChange={(e) =>
                    setAreaFormData({ ...areaFormData, notesAr: e.target.value })
                  }
                  className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs text-[#153B36]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="areaActive"
                  checked={areaFormData.active}
                  onChange={(e) =>
                    setAreaFormData({ ...areaFormData, active: e.target.checked })
                  }
                  className="w-4 h-4 rounded-md text-[#153B36]"
                />
                <label htmlFor="areaActive" className="font-semibold text-[#153B36]">
                  {t('المنطقة مفعلة ومتاحة لاستقبال الطلبات', 'Area is active for requests')}
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#153B36]/10">
                <button
                  type="button"
                  onClick={() => {
                    setEditingArea(null);
                    setIsCreatingArea(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-[#153B36]/20 text-[#153B36]"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#153B36] text-[#F5F2EB] font-bold"
                >
                  {t('حفظ المنطقة', 'Save Area')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
