import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Phone, Mail, Clock, MessageSquare, AlertCircle, Save, Check } from 'lucide-react';

export const CommunicationTab: React.FC = () => {
  const { settings, updateSettings } = useData();
  const { language, t } = useLanguage();

  const [phone, setPhone] = useState(
    settings.phone && !settings.phone.includes('000 0000') ? settings.phone : '01036639814'
  );
  const [whatsapp, setWhatsapp] = useState(
    settings.whatsapp && !settings.whatsapp.includes('000 0000') ? settings.whatsapp : '+201036639814'
  );
  const [email, setEmail] = useState(settings.email || '');
  const [businessHoursAr, setBusinessHoursAr] = useState(settings.businessHoursAr || '');
  const [businessHoursEn, setBusinessHoursEn] = useState(settings.businessHoursEn || '');
  const [emergencyNoteAr, setEmergencyNoteAr] = useState(settings.emergencyNoteAr || '');
  const [emergencyNoteEn, setEmergencyNoteEn] = useState(settings.emergencyNoteEn || '');

  // Pre-configured WhatsApp templates
  const [templateAr, setTemplateAr] = useState(
    'أهلاً بك أستاذ {NAME}، معكم منسق الرعاية في أُنس للرعاية الصحية. نود تأكيد تفاصيل زيارة {SERVICE} لمنزلكم في {AREA}. الموعد المقترح: {DATE} والتكلفة المعتمدة: {PRICE} ج.م شاملة الانتقال.'
  );
  const [templateEn, setTemplateEn] = useState(
    'Hello {NAME}, this is ONS Healthcare coordination desk. We would like to confirm your {SERVICE} visit in {AREA}. Scheduled date: {DATE}, confirmed rate: {PRICE} EGP inclusive of travel fee.'
  );

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      businessHoursAr,
      businessHoursEn,
      emergencyNoteAr,
      emergencyNoteEn,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#153B36]">
          {t('إعدادات الاتصال وقنوات التواصل وتنسيق الرعاية', 'Contact & Care Coordination Channels')}
        </h1>
        <p className="text-xs text-[#153B36]/70 mt-1">
          {t(
            'تحديث أرقام الهاتف والواتساب والبريد وساعات العمل وتنبيهات الطوارئ الطبية.',
            'Manage telephone numbers, WhatsApp desk, operating hours, and clinical emergency notices.'
          )}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Contact Numbers and Desk */}
        <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-[#153B36] flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#70A69A]" />
            <span>{t('أرقام الهواتف وقنوات التنسيق', 'Direct Contact Channels')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('رقم الهاتف الساخن للاتصال *', 'Phone Hot Line *')}
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#153B36]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('رقم واتساب للتنسيق والمحادثة *', 'WhatsApp Coordination Number *')}
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#153B36]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('البريد الإلكتروني للرعاية *', 'Care Email *')}
              </label>
              <input
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#153B36]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('ساعات العمل والاستقبال (عربي)', 'Operating Hours (Arabic)')}
              </label>
              <input
                type="text"
                value={businessHoursAr}
                onChange={(e) => setBusinessHoursAr(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2 text-xs text-[#153B36]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('ساعات العمل والاستقبال (إنجليزي)', 'Operating Hours (English)')}
              </label>
              <input
                type="text"
                value={businessHoursEn}
                onChange={(e) => setBusinessHoursEn(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2 text-xs text-[#153B36]"
              />
            </div>
          </div>
        </div>

        {/* Emergency Medical Disclaimer */}
        <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-[#153B36] flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span>{t('تنبيه الطوارئ الطبية والمسؤولية السريرية', 'Emergency Medical Disclaimer')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('نص التنبيه بالعربية (يظهر بأسفل الموقع)', 'Emergency Text (Arabic)')}
              </label>
              <textarea
                rows={3}
                value={emergencyNoteAr}
                onChange={(e) => setEmergencyNoteAr(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-xs text-[#153B36]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('نص التنبيه بالإنجليزية', 'Emergency Text (English)')}
              </label>
              <textarea
                rows={3}
                value={emergencyNoteEn}
                onChange={(e) => setEmergencyNoteEn(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-xs text-[#153B36]"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Notification Templates */}
        <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-[#153B36] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#70A69A]" />
            <span>{t('قوالب رسائل واتساب لتأكيد الزيارات', 'WhatsApp Visit Confirmation Templates')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('قالب التأكيد بالعربية', 'Arabic WhatsApp Template')}
              </label>
              <textarea
                rows={3}
                value={templateAr}
                onChange={(e) => setTemplateAr(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-xs font-mono text-[#153B36]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#153B36] mb-1">
                {t('قالب التأكيد بالإنجليزية', 'English WhatsApp Template')}
              </label>
              <textarea
                rows={3}
                value={templateEn}
                onChange={(e) => setTemplateEn(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3 text-xs font-mono text-[#153B36]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#153B36] text-[#F5F2EB] text-xs font-bold hover:bg-[#0D2622] transition-colors flex items-center gap-2"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-[#70A69A]" />}
            <span>{isSaved ? t('تم الحفظ بنجاح', 'Saved') : t('حفظ الإعدادات', 'Save Settings')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
