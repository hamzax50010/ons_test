import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  FileText,
  Save,
  Check,
  Plus,
  Trash2,
  HelpCircle,
  Megaphone,
  Eye,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { FaqItem } from '../../../types';

export const ContentManagerTab: React.FC = () => {
  const { content, updateContent, settings, updateSettings } = useData();
  const { language, t } = useLanguage();

  const [activeSection, setActiveSection] = useState<'hero' | 'about' | 'how' | 'faqs' | 'announcement' | 'privacy'>('hero');

  // Form states
  const [formData, setFormData] = useState({ ...content });
  const [announcementAr, setAnnouncementAr] = useState(settings.announcementAr || '');
  const [announcementEn, setAnnouncementEn] = useState(settings.announcementEn || '');
  const [announcementActive, setAnnouncementActive] = useState(settings.announcementActive || false);

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveAllContent = async () => {
    await updateContent(formData);
    await updateSettings({
      announcementAr,
      announcementEn,
      announcementActive,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // FAQ helpers
  const handleAddFaq = () => {
    const newFaq: FaqItem = {
      id: `faq-${Date.now()}`,
      questionAr: 'سؤال طبي جديد',
      questionEn: 'New Medical FAQ Question',
      answerAr: 'إجابة السؤال الطبي هنا...',
      answerEn: 'Answer to the question here...',
      order: formData.faqs.length + 1,
    };
    setFormData({
      ...formData,
      faqs: [...formData.faqs, newFaq],
    });
  };

  const handleUpdateFaq = (id: string, updates: Partial<FaqItem>) => {
    setFormData({
      ...formData,
      faqs: formData.faqs.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    });
  };

  const handleDeleteFaq = (id: string) => {
    setFormData({
      ...formData,
      faqs: formData.faqs.filter((f) => f.id !== id),
    });
  };

  return (
    <div className="space-y-8">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#153B36]">
            {t('محرر محتوى ونصوص الموقع العام', 'Website Editorial Content Manager')}
          </h1>
          <p className="text-xs text-[#153B36]/70 mt-1">
            {t(
              'تعديل نصوص الواجهة والرسائل التعريفية والأسئلة الشائعة باللغتين العربية والإنجليزية.',
              'Edit homepage copy, about pages, FAQs, and announcements bilingually.'
            )}
          </p>
        </div>

        <button
          onClick={handleSaveAllContent}
          className="px-6 py-2.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{t('تم نشر التعديلات بنجاح!', 'Published Successfully!')}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#70A69A]" />
              <span>{t('حفظ ونشر المحتوى فوراً', 'Save & Publish Live')}</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#153B36]/10 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSection('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSection === 'hero' ? 'bg-[#153B36] text-[#F5F2EB]' : 'text-[#153B36]/70 hover:bg-[#153B36]/5'
          }`}
        >
          {t('الواجهة الرئيسية (Hero)', 'Hero Section')}
        </button>
        <button
          onClick={() => setActiveSection('about')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSection === 'about' ? 'bg-[#153B36] text-[#F5F2EB]' : 'text-[#153B36]/70 hover:bg-[#153B36]/5'
          }`}
        >
          {t('عن أُنس والرسالة والقيم', 'About & Mission')}
        </button>
        <button
          onClick={() => setActiveSection('how')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSection === 'how' ? 'bg-[#153B36] text-[#F5F2EB]' : 'text-[#153B36]/70 hover:bg-[#153B36]/5'
          }`}
        >
          {t('كيف تبدأ الرعاية (3 خطوات)', 'How Care Works')}
        </button>
        <button
          onClick={() => setActiveSection('faqs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSection === 'faqs' ? 'bg-[#153B36] text-[#F5F2EB]' : 'text-[#153B36]/70 hover:bg-[#153B36]/5'
          }`}
        >
          {t('الأسئلة الشائعة (FAQs)', 'FAQs')}
        </button>
        <button
          onClick={() => setActiveSection('announcement')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSection === 'announcement' ? 'bg-[#153B36] text-[#F5F2EB]' : 'text-[#153B36]/70 hover:bg-[#153B36]/5'
          }`}
        >
          {t('شريط الإعلانات العلوية', 'Announcement Banner')}
        </button>
        <button
          onClick={() => setActiveSection('privacy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSection === 'privacy' ? 'bg-[#153B36] text-[#F5F2EB]' : 'text-[#153B36]/70 hover:bg-[#153B36]/5'
          }`}
        >
          {t('سياسة الخصوصية والأمان', 'Privacy Policy')}
        </button>
      </div>

      {/* 1. Hero Section Form */}
      {activeSection === 'hero' && (
        <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-[#153B36]">
            {t('نصوص ومحتوى صدر الصفحة الرئيسية (Hero)', 'Homepage Hero Headlines')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-[#153B36] mb-1.5">
                {t('العنوان الرئيسي بالعربية *', 'Hero Main Title (Arabic) *')}
              </label>
              <textarea
                rows={2}
                value={formData.heroTitleAr}
                onChange={(e) => setFormData({ ...formData, heroTitleAr: e.target.value })}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-sm font-bold text-[#153B36]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#153B36] mb-1.5">
                {t('العنوان الرئيسي بالإنجليزية *', 'Hero Main Title (English) *')}
              </label>
              <textarea
                rows={2}
                value={formData.heroTitleEn}
                onChange={(e) => setFormData({ ...formData, heroTitleEn: e.target.value })}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-sm font-bold text-[#153B36]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-[#153B36] mb-1.5">
                {t('الوصف التوضيحي بالعربية *', 'Hero Subtitle (Arabic) *')}
              </label>
              <textarea
                rows={3}
                value={formData.heroSubtitleAr}
                onChange={(e) => setFormData({ ...formData, heroSubtitleAr: e.target.value })}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-xs leading-relaxed text-[#153B36]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#153B36] mb-1.5">
                {t('الوصف التوضيحي بالإنجليزية *', 'Hero Subtitle (English) *')}
              </label>
              <textarea
                rows={3}
                value={formData.heroSubtitleEn}
                onChange={(e) => setFormData({ ...formData, heroSubtitleEn: e.target.value })}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-xs leading-relaxed text-[#153B36]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-[#153B36] mb-1.5">
                {t('نص زر الدعوة للإجراء (CTA) بالعربية', 'Button CTA Label (Arabic)')}
              </label>
              <input
                type="text"
                value={formData.heroCtaAr}
                onChange={(e) => setFormData({ ...formData, heroCtaAr: e.target.value })}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#153B36]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#153B36] mb-1.5">
                {t('نص زر الدعوة للإجراء (CTA) بالإنجليزية', 'Button CTA Label (English)')}
              </label>
              <input
                type="text"
                value={formData.heroCtaEn}
                onChange={(e) => setFormData({ ...formData, heroCtaEn: e.target.value })}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#153B36]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. About ONS Form */}
      {activeSection === 'about' && (
        <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-[#153B36]">
            {t('محتوى صفحة عن أُنس والرسالة والقيم', 'About Page & Brand Mission')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-[#153B36] mb-1.5">
                {t('عنوان صفحة عن أُنس بالعربية', 'About Title (Arabic)')}
              </label>
              <input
                type="text"
                value={formData.aboutTitleAr}
                onChange={(e) => setFormData({ ...formData, aboutTitleAr: e.target.value })}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2.5 text-xs font-bold text-[#153B36]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#153B36] mb-1.5">
                {t('عنوان صفحة عن أُنس بالإنجليزية', 'About Title (English)')}
              </label>
              <input
                type="text"
                value={formData.aboutTitleEn}
                onChange={(e) => setFormData({ ...formData, aboutTitleEn: e.target.value })}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2.5 text-xs font-bold text-[#153B36]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-[#153B36] mb-1.5">
                {t('النص التعريفي والتأسيسي (عربي)', 'Body Story (Arabic)')}
              </label>
              <textarea
                rows={5}
                value={formData.aboutBodyAr}
                onChange={(e) => setFormData({ ...formData, aboutBodyAr: e.target.value })}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-xs leading-relaxed text-[#153B36]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#153B36] mb-1.5">
                {t('النص التعريفي والتأسيسي (إنجليزي)', 'Body Story (English)')}
              </label>
              <textarea
                rows={5}
                value={formData.aboutBodyEn}
                onChange={(e) => setFormData({ ...formData, aboutBodyEn: e.target.value })}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-xs leading-relaxed text-[#153B36]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-[#153B36] mb-1.5">
                {t('رسالتنا الأساسية (عربي)', 'Mission (Arabic)')}
              </label>
              <textarea
                rows={2}
                value={formData.missionAr}
                onChange={(e) => setFormData({ ...formData, missionAr: e.target.value })}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-xs text-[#153B36]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#153B36] mb-1.5">
                {t('رسالتنا الأساسية (إنجليزي)', 'Mission (English)')}
              </label>
              <textarea
                rows={2}
                value={formData.missionEn}
                onChange={(e) => setFormData({ ...formData, missionEn: e.target.value })}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-xs text-[#153B36]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. How Care Works */}
      {activeSection === 'how' && (
        <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-[#153B36]">
            {t('خطوات تقديم وتنسيق الرعاية (3 خطوات)', 'How Care Works (3-Steps Flow)')}
          </h2>

          <div className="space-y-6">
            {formData.howItWorks.map((step, idx) => (
              <div
                key={step.step}
                className="p-5 rounded-2xl bg-[#F5F2EB]/60 border border-[#153B36]/10 space-y-4 text-xs"
              >
                <span className="font-bold text-sm text-[#153B36] block">
                  {t('الخطوة', 'Step')} 0{step.step}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#153B36] mb-1">
                      {t('عنوان الخطوة بالعربية', 'Title (Arabic)')}
                    </label>
                    <input
                      type="text"
                      value={step.titleAr}
                      onChange={(e) => {
                        const updated = [...formData.howItWorks];
                        updated[idx].titleAr = e.target.value;
                        setFormData({ ...formData, howItWorks: updated });
                      }}
                      className="w-full bg-white border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#153B36]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#153B36] mb-1">
                      {t('عنوان الخطوة بالإنجليزية', 'Title (English)')}
                    </label>
                    <input
                      type="text"
                      value={step.titleEn}
                      onChange={(e) => {
                        const updated = [...formData.howItWorks];
                        updated[idx].titleEn = e.target.value;
                        setFormData({ ...formData, howItWorks: updated });
                      }}
                      className="w-full bg-white border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#153B36]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#153B36] mb-1">
                      {t('شرح الخطوة بالعربية', 'Description (Arabic)')}
                    </label>
                    <textarea
                      rows={2}
                      value={step.descAr}
                      onChange={(e) => {
                        const updated = [...formData.howItWorks];
                        updated[idx].descAr = e.target.value;
                        setFormData({ ...formData, howItWorks: updated });
                      }}
                      className="w-full bg-white border border-[#153B36]/20 rounded-xl p-2.5 text-xs text-[#153B36]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#153B36] mb-1">
                      {t('شرح الخطوة بالإنجليزية', 'Description (English)')}
                    </label>
                    <textarea
                      rows={2}
                      value={step.descEn}
                      onChange={(e) => {
                        const updated = [...formData.howItWorks];
                        updated[idx].descEn = e.target.value;
                        setFormData({ ...formData, howItWorks: updated });
                      }}
                      className="w-full bg-white border border-[#153B36]/20 rounded-xl p-2.5 text-xs text-[#153B36]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FAQs Manager */}
      {activeSection === 'faqs' && (
        <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#153B36]/10">
            <div>
              <h2 className="text-base font-bold text-[#153B36]">
                {t('إدارة الأسئلة الشائعة والأجوبة', 'Frequently Asked Questions (FAQs)')}
              </h2>
              <p className="text-xs text-[#153B36]/60">
                {t('الأسئلة المعروضة في صفحة عن أُنس والصفحة الرئيسية', 'Displayed across About & Home')}
              </p>
            </div>
            <button
              onClick={handleAddFaq}
              className="px-3.5 py-2 rounded-xl bg-[#153B36] text-[#F5F2EB] text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#70A69A]" />
              <span>{t('إضافة سؤال جديد', 'Add FAQ')}</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.faqs.map((faq) => (
              <div
                key={faq.id}
                className="p-5 rounded-2xl bg-[#F5F2EB]/60 border border-[#153B36]/10 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#153B36] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#70A69A]" />
                    <span>FAQ Item</span>
                  </span>
                  <button
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={faq.questionAr}
                    onChange={(e) => handleUpdateFaq(faq.id, { questionAr: e.target.value })}
                    placeholder="السؤال بالعربية..."
                    className="w-full bg-white border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#153B36]"
                  />
                  <input
                    type="text"
                    value={faq.questionEn}
                    onChange={(e) => handleUpdateFaq(faq.id, { questionEn: e.target.value })}
                    placeholder="Question in English..."
                    className="w-full bg-white border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#153B36]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <textarea
                    rows={2}
                    value={faq.answerAr}
                    onChange={(e) => handleUpdateFaq(faq.id, { answerAr: e.target.value })}
                    placeholder="الإجابة بالعربية..."
                    className="w-full bg-white border border-[#153B36]/20 rounded-xl p-2.5 text-xs text-[#153B36]"
                  />
                  <textarea
                    rows={2}
                    value={faq.answerEn}
                    onChange={(e) => handleUpdateFaq(faq.id, { answerEn: e.target.value })}
                    placeholder="Answer in English..."
                    className="w-full bg-white border border-[#153B36]/20 rounded-xl p-2.5 text-xs text-[#153B36]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Announcement Banner */}
      {activeSection === 'announcement' && (
        <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-[#153B36] flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#70A69A]" />
            <span>{t('شريط الإعلانات أعلى الموقع', 'Top Announcement Bar')}</span>
          </h2>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="annActiveToggle"
              checked={announcementActive}
              onChange={(e) => setAnnouncementActive(e.target.checked)}
              className="w-4 h-4 rounded-md text-[#153B36]"
            />
            <label htmlFor="annActiveToggle" className="text-xs font-bold text-[#153B36]">
              {t('تفعيل شريط الإعلانات في أعلى كافة صفحات الموقع', 'Enable Top Announcement Bar')}
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('نص الإعلان بالعربية', 'Announcement Text (Arabic)')}
              </label>
              <textarea
                rows={3}
                value={announcementAr}
                onChange={(e) => setAnnouncementAr(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-xs text-[#153B36]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('نص الإعلان بالإنجليزية', 'Announcement Text (English)')}
              </label>
              <textarea
                rows={3}
                value={announcementEn}
                onChange={(e) => setAnnouncementEn(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-xs text-[#153B36]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. Privacy Policy */}
      {activeSection === 'privacy' && (
        <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-[#153B36]">
            {t('نص سياسة الخصوصية وحماية بيانات المرضى', 'Privacy Policy Content')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('نص سياسة الخصوصية بالعربية', 'Privacy Policy Text (Arabic)')}
              </label>
              <textarea
                rows={6}
                value={formData.privacyPolicyAr}
                onChange={(e) => setFormData({ ...formData, privacyPolicyAr: e.target.value })}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-xs leading-relaxed text-[#153B36]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('نص سياسة الخصوصية بالإنجليزية', 'Privacy Policy Text (English)')}
              </label>
              <textarea
                rows={6}
                value={formData.privacyPolicyEn}
                onChange={(e) => setFormData({ ...formData, privacyPolicyEn: e.target.value })}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-xs leading-relaxed text-[#153B36]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
