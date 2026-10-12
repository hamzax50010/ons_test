import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Settings, Save, Check, RotateCcw, AlertTriangle } from 'lucide-react';

export const GeneralSettingsTab: React.FC = () => {
  const { settings, updateSettings, resetToDefaults } = useData();
  const { language, t } = useLanguage();

  const [siteNameAr, setSiteNameAr] = useState(settings.siteNameAr || '');
  const [siteNameEn, setSiteNameEn] = useState(settings.siteNameEn || '');
  const [sloganAr, setSloganAr] = useState(settings.sloganAr || '');
  const [sloganEn, setSloganEn] = useState(settings.sloganEn || '');
  const [currency, setCurrency] = useState(settings.currency || 'ج.م');
  const [facebook, setFacebook] = useState(settings.socialLinks?.facebook || '');
  const [instagram, setInstagram] = useState(settings.socialLinks?.instagram || '');
  const [linkedin, setLinkedin] = useState(settings.socialLinks?.linkedin || '');

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      siteNameAr: siteNameAr.trim(),
      siteNameEn: siteNameEn.trim(),
      sloganAr: sloganAr.trim(),
      sloganEn: sloganEn.trim(),
      currency: currency.trim(),
      socialLinks: {
        facebook: facebook.trim(),
        instagram: instagram.trim(),
        linkedin: linkedin.trim(),
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('تحذير: هل أنت متأكد من إعادة ضبط الموقع للبيانات الافتراضية الأولية؟')) {
      resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#153B36]">
          {t('الإعدادات العامة والبيانات الأساسية للموقع', 'General Website Settings')}
        </h1>
        <p className="text-xs text-[#153B36]/70 mt-1">
          {t(
            'تعديل المسمى التجاري، الشعار اللفظي، روابط التواصل، والإعدادات الإقليمية.',
            'Manage brand names, verbal slogan, currency, and social media channels.'
          )}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-[#153B36] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#70A69A]" />
            <span>{t('المسمى التجاري والشعار اللفظي', 'Brand Name & Verbal Slogan')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('اسم المنشأة بالعربية *', 'Brand Name (Arabic) *')}
              </label>
              <input
                type="text"
                required
                value={siteNameAr}
                onChange={(e) => setSiteNameAr(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#153B36]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('اسم المنشأة بالإنجليزية *', 'Brand Name (English) *')}
              </label>
              <input
                type="text"
                required
                value={siteNameEn}
                onChange={(e) => setSiteNameEn(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#153B36]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('الشعار اللفظي بالعربية *', 'Verbal Slogan (Arabic) *')}
              </label>
              <input
                type="text"
                required
                value={sloganAr}
                onChange={(e) => setSloganAr(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#153B36]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('الشعار اللفظي بالإنجليزية *', 'Verbal Slogan (English) *')}
              </label>
              <input
                type="text"
                required
                value={sloganEn}
                onChange={(e) => setSloganEn(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#153B36]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#153B36]/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('رابط فيسبوك (Facebook URL)', 'Facebook URL')}
              </label>
              <input
                type="url"
                dir="ltr"
                placeholder="https://facebook.com/..."
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs text-[#153B36]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('رابط انستغرام (Instagram URL)', 'Instagram URL')}
              </label>
              <input
                type="url"
                dir="ltr"
                placeholder="https://instagram.com/..."
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs text-[#153B36]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('رابط لينكد إن (LinkedIn URL)', 'LinkedIn URL')}
              </label>
              <input
                type="url"
                dir="ltr"
                placeholder="https://linkedin.com/company/..."
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs text-[#153B36]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#153B36] text-[#F5F2EB] text-xs font-bold hover:bg-[#0D2622] transition-colors flex items-center gap-2"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-[#70A69A]" />}
              <span>{isSaved ? t('تم الحفظ بنجاح', 'Saved') : t('حفظ الإعدادات العامة', 'Save Settings')}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Danger Zone: Reset to Defaults */}
      <div className="rounded-3xl bg-red-50/60 border border-red-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <h3 className="font-bold text-red-900">
              {t('إعادة ضبط النظام إلى البذور الأولية الأصلية', 'Factory Reset to Default Seeds')}
            </h3>
            <p className="text-red-700 mt-0.5">
              {t(
                'استرجاع كافة الخدمات والأسعار والتصنيفات الافتراضية الأولية المعتمدة لـ أُنس.',
                'Reset all content and services to ONS initial baseline defaults.'
              )}
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('إعادة ضبط الآن', 'Reset Data')}</span>
        </button>
      </div>
    </div>
  );
};
