import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import { ReviewItem, ReviewSource } from '../../../types';
import {
  Star,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  ShieldCheck,
  MessageSquareQuote,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Share2,
} from 'lucide-react';

export const ReviewsTab: React.FC = () => {
  const { reviews, addReview, updateReview, deleteReview, services } = useData();
  const { language, t } = useLanguage();

  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [isCreatingReview, setIsCreatingReview] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<ReviewItem>>({
    authorNameAr: '',
    authorNameEn: '',
    serviceNameAr: '',
    serviceNameEn: '',
    commentAr: '',
    commentEn: '',
    rating: 5,
    source: 'ons_direct',
    published: true,
    verified: true,
    date: new Date().toISOString().split('T')[0],
    order: 1,
  });

  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const clientReviewUrl = typeof window !== 'undefined' ? `${window.location.origin}/?route=leave-review` : '';

  const handleCopyReviewLink = () => {
    if (clientReviewUrl) {
      navigator.clipboard.writeText(clientReviewUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  const whatsappInviteMessage = `السلام عليكم ورحمة الله،\n\nنشكرك جزيلاً لاختيارك أُنس للرعاية الصحية والتمريض المنزلي 🌿\n\nيسعدنا جداً مشاركتنا تقييمكم ورأيكم في زيارة الرعاية عبر الرابط التالي لمساعدتنا في التطوير المستمر:\n${clientReviewUrl}\n\nمع تمنياتنا لكم ولمريضكم بتمام الشفاء والعافية.`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappInviteMessage)}`;

  const handleOpenCreate = () => {
    setIsCreatingReview(true);
    setEditingReview(null);
    setFormData({
      authorNameAr: '',
      authorNameEn: '',
      serviceNameAr: services[0]?.nameAr || '',
      serviceNameEn: services[0]?.nameEn || '',
      commentAr: '',
      commentEn: '',
      rating: 5,
      source: 'ons_direct',
      published: true,
      verified: true,
      date: new Date().toISOString().split('T')[0],
      order: reviews.length + 1,
    });
  };

  const handleOpenEdit = (rev: ReviewItem) => {
    setEditingReview(rev);
    setIsCreatingReview(false);
    setFormData({ ...rev });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.authorNameAr?.trim() || !formData.commentAr?.trim()) return;

    if (editingReview) {
      await updateReview(editingReview.id, formData);
    } else {
      await addReview(formData as Omit<ReviewItem, 'id'>);
    }
    setEditingReview(null);
    setIsCreatingReview(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا التقييم نهائياً من الموقع؟' : 'Are you sure you want to permanently delete this review?')) return;
    await deleteReview(id);
  };

  const handleTogglePublish = async (rev: ReviewItem) => {
    await updateReview(rev.id, { published: !rev.published });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#153B36]">
            {t('إدارة تجارب وتقييمات المرضى', 'Patient Testimonials & Reviews Manager')}
          </h1>
          <p className="text-xs text-[#153B36]/70 mt-1">
            {t(
              'توثيق تجارب المرضى الحقيقية، وإرسال روابط التقييم للعملاء، وحذف أو اعتماد أي تقييم.',
              'Manage testimonials, share review link with clients, and moderate or delete reviews.'
            )}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#70A69A]" />
          <span>{t('إضافة تقييم موثق جديد', 'Add Verified Testimonial')}</span>
        </button>
      </div>

      {/* Shareable Client Review Link Box */}
      <div className="p-5 rounded-3xl bg-white border border-[#153B36]/15 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#E7EFEA] text-[#153B36]">
                <Share2 className="w-4 h-4 text-[#70A69A]" />
              </span>
              <h2 className="text-sm font-bold text-[#153B36]">
                {t('رابط تقييم العملاء المباشر (أرسله للعميل بعد تقديم الخدمة)', 'Shareable Client Review Link (Send to Patients After Visit)')}
              </h2>
            </div>
            <p className="text-xs text-[#153B36]/70 leading-relaxed">
              {t(
                'انسخ هذا الرابط وأرسله للعميل عبر واتساب أو رسالة ليقوم بكتابة تقييمه واختيار النجوم بنفسه. يُضاف التقييم تلقائياً هنا في لوحة التحكم وتستطيع حذفه أو إخفاءه في أي وقت.',
                'Send this link to patients via WhatsApp/SMS to rate their care. New reviews appear here immediately with full moderation & delete controls.'
              )}
            </p>
          </div>

          {copiedToast && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>{t('تم نسخ الرابط بنجاح!', 'Link Copied Successfully!')}</span>
            </div>
          )}
        </div>

        {/* Link Input & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <input
            type="text"
            readOnly
            value={clientReviewUrl}
            className="flex-1 bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#153B36] font-mono select-all focus:outline-hidden"
          />

          <button
            onClick={handleCopyReviewLink}
            className="px-4 py-2.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            {copiedToast ? <Check className="w-4 h-4 text-[#70A69A]" /> : <Copy className="w-4 h-4 text-[#70A69A]" />}
            <span>{copiedToast ? t('تم النسخ', 'Copied') : t('نسخ الرابط للعميل', 'Copy Client Link')}</span>
          </button>

          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('مشاركة عبر واتساب', 'Share via WhatsApp')}</span>
          </a>

          <a
            href={clientReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-xl border border-[#153B36]/20 text-[#153B36] text-xs font-semibold hover:bg-[#153B36]/5 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-[#70A69A]" />
            <span>{t('معاينة الصفحة', 'Preview')}</span>
          </a>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-[#153B36]/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-xs text-start">
            <thead>
              <tr className="bg-[#F5F2EB]/50 border-b border-[#153B36]/10 text-[#153B36]/70">
                <th className="py-3.5 px-4 text-start font-bold">{t('اسم العميل / المريض', 'Patient Name')}</th>
                <th className="py-3.5 px-4 text-start font-bold">{t('الخدمة الطبية', 'Service')}</th>
                <th className="py-3.5 px-4 text-start font-bold">{t('نص التقييم', 'Comment')}</th>
                <th className="py-3.5 px-4 text-center font-bold">{t('التقييم', 'Rating')}</th>
                <th className="py-3.5 px-4 text-center font-bold">{t('المصدر', 'Source')}</th>
                <th className="py-3.5 px-4 text-center font-bold">{t('النشر', 'Status')}</th>
                <th className="py-3.5 px-4 text-end font-bold">{t('إجراءات', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#153B36]/5">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-[#F5F2EB]/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#153B36]">
                    <div>{rev.authorNameAr}</div>
                    <div className="text-[11px] text-[#153B36]/60">{rev.authorNameEn}</div>
                  </td>
                  <td className="py-3 px-4 text-[#153B36]/80 font-medium">
                    {language === 'ar' ? rev.serviceNameAr : rev.serviceNameEn}
                  </td>
                  <td className="py-3 px-4 text-[#153B36]/80 max-w-sm truncate italic">
                    "{rev.commentAr}"
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-amber-600">★ {rev.rating || 5}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        rev.source === 'client_shared_link'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-[#E7EFEA] text-[#153B36]'
                      }`}
                    >
                      {rev.source === 'client_shared_link'
                        ? t('رابط عميل مباشر', 'Client Link')
                        : rev.source === 'google_external'
                        ? t('جوجل', 'Google')
                        : t('موثق', 'Verified')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleTogglePublish(rev)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        rev.published
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {rev.published ? t('منشور بالموقع', 'Published') : t('مسودة / مخفي', 'Hidden')}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-end">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(rev)}
                        className="p-1.5 rounded-lg text-[#153B36] hover:bg-[#153B36]/10"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rev.id)}
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

      {/* Review Modal */}
      {(isCreatingReview || editingReview) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-[#153B36]/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#153B36]/10">
              <h2 className="text-lg font-bold text-[#153B36]">
                {editingReview ? t('تعديل التقييم', 'Edit Testimonial') : t('إضافة تجربة مريض جديدة', 'New Testimonial')}
              </h2>
              <button
                onClick={() => {
                  setEditingReview(null);
                  setIsCreatingReview(false);
                }}
              >
                <X className="w-5 h-5 text-[#153B36]/60" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#153B36] mb-1">
                    {t('اسم المريض أو العميل (عربي) *', 'Patient Name (Arabic) *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authorNameAr}
                    onChange={(e) => setFormData({ ...formData, authorNameAr: e.target.value })}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs text-[#153B36]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#153B36] mb-1">
                    {t('الاسم بالإنجليزية', 'Patient Name (English)')}
                  </label>
                  <input
                    type="text"
                    value={formData.authorNameEn}
                    onChange={(e) => setFormData({ ...formData, authorNameEn: e.target.value })}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs text-[#153B36]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#153B36] mb-1">
                    {t('الخدمة المقدمة له', 'Related Service')}
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: غيار الجروح والقدم السكري"
                    value={formData.serviceNameAr}
                    onChange={(e) => setFormData({ ...formData, serviceNameAr: e.target.value })}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs text-[#153B36]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#153B36] mb-1">
                    {t('مصدر التقييم', 'Review Source')}
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value as ReviewSource })
                    }
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs text-[#153B36]"
                  >
                    <option value="ons_direct">أُنس مباشر (ONS Direct)</option>
                    <option value="verified_patient">مريض موثق (Verified Patient)</option>
                    <option value="google_external">منصة خارجية موثقة (External)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#153B36] mb-1">
                  {t('نص التقييم والتجربة بالعربية *', 'Comment (Arabic) *')}
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.commentAr}
                  onChange={(e) => setFormData({ ...formData, commentAr: e.target.value })}
                  className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-2.5 text-xs text-[#153B36]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#153B36] mb-1">
                  {t('نص التقييم بالإنجليزية', 'Comment (English)')}
                </label>
                <textarea
                  rows={2}
                  value={formData.commentEn}
                  onChange={(e) => setFormData({ ...formData, commentEn: e.target.value })}
                  className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-2.5 text-xs text-[#153B36]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-bold text-[#153B36] mb-1">
                    {t('التقييم بالنجوم (1 إلى 5)', 'Star Rating (1 - 5)')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })
                    }
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs text-[#153B36]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="revPublishToggle"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 rounded-md text-[#153B36]"
                  />
                  <label htmlFor="revPublishToggle" className="font-semibold text-[#153B36]">
                    {t('نشر التقييم في الموقع العام', 'Publish on Website')}
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#153B36]/10">
                <button
                  type="button"
                  onClick={() => {
                    setEditingReview(null);
                    setIsCreatingReview(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-[#153B36]/20 text-[#153B36]"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#153B36] text-[#F5F2EB] font-bold"
                >
                  {t('حفظ التقييم', 'Save Review')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
