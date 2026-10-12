import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { Phone, Mail, Clock, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactPageProps {
  navigate: (route: string, params?: any) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { settings, content } = useData();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const contactBlurb = language === 'ar' ? content.contactBlurbAr : content.contactBlurbEn;
  const businessHours = language === 'ar' ? settings.businessHoursAr : settings.businessHoursEn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold text-[#70A69A] uppercase tracking-wider block">
          {t('تواصل وتنسيق الرعاية', 'Coordination Desk')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#153B36] tracking-tight">
          {t('اتصل بفريق أُنس للرعاية الصحية', 'Contact ONS Healthcare')}
        </h1>
        <p className="text-base text-[#153B36]/80 leading-relaxed font-normal">
          {contactBlurb}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Details Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-[#153B36] text-[#F5F2EB] p-8 space-y-6 border border-[#70A69A]/30 shadow-lg">
            <h2 className="text-xl font-bold pb-4 border-b border-[#70A69A]/30">
              {t('قنوات التواصل المباشر', 'Direct Channels')}
            </h2>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#70A69A]" />
                </div>
                <div>
                  <span className="text-xs text-[#70A69A] block font-semibold">
                    {t('الاتصال الهاتفي الساخن', 'Phone Coordination')}
                  </span>
                  <a
                    href={`tel:${settings.phone}`}
                    className="text-base font-bold text-[#F5F2EB] hover:text-[#70A69A] transition-colors mt-0.5 block"
                    dir="ltr"
                  >
                    {settings.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-sm font-bold text-[#70A69A]">
                  WA
                </div>
                <div>
                  <span className="text-xs text-[#70A69A] block font-semibold">
                    {t('محادثة واتساب الفورية', 'WhatsApp Desk')}
                  </span>
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-bold text-[#F5F2EB] hover:text-[#70A69A] transition-colors mt-0.5 block"
                    dir="ltr"
                  >
                    {settings.whatsapp}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#70A69A]" />
                </div>
                <div>
                  <span className="text-xs text-[#70A69A] block font-semibold">
                    {t('البريد الإلكتروني', 'Email')}
                  </span>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-sm font-bold text-[#F5F2EB] hover:text-[#70A69A] transition-colors mt-0.5 block"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#70A69A]" />
                </div>
                <div>
                  <span className="text-xs text-[#70A69A] block font-semibold">
                    {t('مواعيد استقبال الاتصالات', 'Hours of Operation')}
                  </span>
                  <p className="text-xs text-[#F5F2EB]/80 mt-0.5">{businessHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#70A69A]" />
                </div>
                <div>
                  <span className="text-xs text-[#70A69A] block font-semibold">
                    {t('نطاق الزيارات', 'Care Area')}
                  </span>
                  <p className="text-xs text-[#F5F2EB]/80 mt-0.5">
                    {t('القاهرة والجيزة، مصر', 'Cairo & Giza, Egypt')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Warning */}
          <div className="p-5 rounded-2xl bg-[#E7EFEA] border border-[#70A69A]/40 text-xs text-[#153B36]/80 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#153B36] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {language === 'ar' ? settings.emergencyNoteAr : settings.emergencyNoteEn}
            </p>
          </div>
        </div>

        {/* Quick Message Form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-white border border-[#153B36]/10 p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-[#153B36]">
              {t('إرسال استفسار أو طلب اتصال سريع', 'Send an Inquiry')}
            </h2>

            {submitted ? (
              <div className="p-8 text-center space-y-4 bg-[#E7EFEA] rounded-2xl">
                <CheckCircle2 className="w-12 h-12 text-[#70A69A] mx-auto" />
                <h3 className="text-lg font-bold text-[#153B36]">
                  {t('تم استلام رسالتك بنجاح', 'Message Received')}
                </h3>
                <p className="text-xs text-[#153B36]/80">
                  {t(
                    'سيقوم أحد مسؤولي تنسيق الرعاية بالتواصل معك هاتفياً أو عبر واتساب بأسرع وقت.',
                    'A care coordination member will contact you shortly.'
                  )}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-lg bg-[#153B36] text-[#F5F2EB] text-xs font-semibold"
                >
                  {t('إرسال رسالة أخرى', 'Send Another Message')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#153B36] mb-1">
                    {t('الاسم بالكامل *', 'Full Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('اسمك أو اسم المريض', 'Your full name')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-sm text-[#153B36] focus:outline-hidden focus:border-[#70A69A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#153B36] mb-1">
                    {t('رقم الهاتف المحمول *', 'Mobile Number *')}
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="010xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-sm text-[#153B36] focus:outline-hidden focus:border-[#70A69A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#153B36] mb-1">
                    {t('نص الرسالة أو الاستفسار *', 'Inquiry Message *')}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={t(
                      'كيف يمكننا مساعدتك أو ما هي الرعاية المطلوبة؟',
                      'How can we help or what care is needed?'
                    )}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-sm text-[#153B36] focus:outline-hidden focus:border-[#70A69A]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4 text-[#70A69A]" />
                    <span>{t('إرسال الاستفسار الآن', 'Send Inquiry')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
