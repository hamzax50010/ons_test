import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
  Star,
  CheckCircle2,
  Heart,
  ShieldCheck,
  User,
  MessageSquareQuote,
  Sparkles,
  MapPin,
  Stethoscope,
  ArrowRight,
  Send,
} from 'lucide-react';
import { OnsLogo } from '../../components/common/OnsLogo';

interface LeaveReviewPageProps {
  navigate: (route: string, params?: any) => void;
}

export const LeaveReviewPage: React.FC<LeaveReviewPageProps> = ({ navigate }) => {
  const { language, t, isRtl } = useLanguage();
  const { services, reviews, addReview, settings } = useData();

  const activeServices = services.filter((s) => s.active);

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(activeServices[0]?.id || '');
  const [customServiceName, setCustomServiceName] = useState<string>('');
  const [patientArea, setPatientArea] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const ratingDescriptions: Record<number, { ar: string; en: string }> = {
    5: { ar: 'ممتاز ورعاية استثنائية ⭐️⭐️⭐️⭐️⭐️', en: 'Exceptional & Outstanding Care ⭐️⭐️⭐️⭐️⭐️' },
    4: { ar: 'جيد جداً وخدمة راقية ⭐️⭐️⭐️⭐️', en: 'Very Good & High Standard ⭐️⭐️⭐️⭐️' },
    3: { ar: 'جيد ومقبول ⭐️⭐️⭐️', en: 'Good & Satisfactory ⭐️⭐️⭐️' },
    2: { ar: 'يحتاج إلى تحسين ⭐️⭐️', en: 'Needs Improvement ⭐️⭐️' },
    1: { ar: 'غير راضٍ عن التجربة ⭐️', en: 'Unsatisfied ⭐️' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!authorName.trim() || authorName.trim().length < 2) {
      setFormError(t('يرجى كتابة اسمك أو لقبك.', 'Please enter your name.'));
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setFormError(t('يرجى كتابة بضع كلمات عن رأيك وتجربتك مع فريق أُنس.', 'Please write a brief feedback about your experience.'));
      return;
    }

    setIsSubmitting(true);

    try {
      const chosenService = activeServices.find((s) => s.id === selectedServiceId);
      const serviceNameAr = chosenService ? chosenService.nameAr : customServiceName.trim() || 'رعاية وتمريض منزلي';
      const serviceNameEn = chosenService ? chosenService.nameEn : customServiceName.trim() || 'Home Healthcare Care';

      await addReview({
        authorNameAr: authorName.trim(),
        authorNameEn: authorName.trim(),
        serviceNameAr,
        serviceNameEn,
        commentAr: comment.trim(),
        commentEn: comment.trim(),
        rating,
        source: 'client_shared_link',
        published: true, // Visible on testimonials
        verified: true,
        date: new Date().toISOString().split('T')[0],
        order: reviews.length + 1,
        patientArea: patientArea.trim() || undefined,
      });

      setIsSubmitted(true);
    } catch (err: any) {
      setFormError(
        err.message ||
          t('حدث خطأ أثناء حفظ التقييم. يرجى المحاولة مرة أخرى.', 'Error submitting review. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="rounded-3xl bg-white border border-[#153B36]/10 p-8 sm:p-12 space-y-6 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-[#E7EFEA] text-[#153B36] flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-[#70A69A]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#153B36]">
              {t('شكراً جزيلاً لتقييمكم ورأيكم الغالي!', 'Thank you very much for your valuable review!')}
            </h2>
            <p className="text-sm text-[#153B36]/80 leading-relaxed max-w-lg mx-auto">
              {t(
                'تم تسجيل تقييمكم بنجاح ومشاركته مع فريق إدارة أُنس للرعاية الصحية. كلماتكم وملاحظاتكم هي الدافع الأكبر لتقديم أفضل معايير الأمان والاهتمام الإنساني لمرضانا.',
                'Your review has been successfully submitted to ONS Healthcare. Your feedback is our greatest motivation to provide the highest standards of clinical care.'
              )}
            </p>
          </div>

          {/* Stars display */}
          <div className="flex items-center justify-center gap-1.5 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('home')}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#153B36] text-[#F5F2EB] text-xs sm:text-sm font-bold hover:bg-[#0D2622] transition-colors shadow-xs"
            >
              {t('العودة إلى الصفحة الرئيسية', 'Return to Home')}
            </button>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setAuthorName('');
                setComment('');
                setPatientArea('');
                setRating(5);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#153B36]/20 text-[#153B36] text-xs sm:text-sm font-semibold hover:bg-[#153B36]/5 transition-colors"
            >
              {t('إرسال تقييم إضافي', 'Submit Another Feedback')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fadeIn">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7EFEA] border border-[#70A69A]/30 text-xs font-bold text-[#153B36]">
          <Heart className="w-4 h-4 text-[#70A69A] fill-[#70A69A]" />
          <span>{t('صوتك يهمنا في أُنس للرعاية الصحية', 'Your Voice Matters at ONS Healthcare')}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#153B36] tracking-tight">
          {t('شاركنا تقييمك ورأيك في الخدمة الطبية', 'Rate & Share Your Healthcare Experience')}
        </h1>

        <p className="text-xs sm:text-sm text-[#153B36]/75 max-w-xl mx-auto leading-relaxed">
          {t(
            'يسعدنا جداً استقبال رأيكم في تجربة الرعاية والتمريض المنزلي التي تلقيتموها. ملاحظاتكم تساعدنا على الارتقاء الدائم بجودة الخدمة وراحة مريضكم.',
            'We value your feedback on the home healthcare and nursing visit you received. Your honest evaluation helps us continuously elevate our patient care.'
          )}
        </p>
      </div>

      {/* Main Review Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-10 space-y-7 shadow-sm"
      >
        {formError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn">
            <span className="font-bold">•</span>
            <span>{formError}</span>
          </div>
        )}

        {/* 1. Star Rating Picker */}
        <div className="text-center space-y-3 p-4 sm:p-6 rounded-2xl bg-[#F5F2EB]/50 border border-[#153B36]/10">
          <label className="block text-sm font-bold text-[#153B36]">
            {t('كيف تقيم مستوى الخدمة والرعاية بشكل عام؟ *', 'How do you rate the overall service and care? *')}
          </label>

          <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = hoverRating ? star <= hoverRating : star <= rating;
              return (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 sm:p-1.5 transition-transform hover:scale-125 focus:outline-hidden"
                  aria-label={`${star} stars`}
                >
                  <Star
                    className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                      active
                        ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                        : 'text-gray-300 hover:text-amber-200'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="text-xs font-bold text-[#153B36] transition-all">
            {language === 'ar'
              ? ratingDescriptions[hoverRating || rating]?.ar
              : ratingDescriptions[hoverRating || rating]?.en}
          </div>
        </div>

        {/* 2. Client Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#153B36] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#70A69A]" />
            <span>{t('اسمك بالكامل أو اللقب المطلوب ظهوره *', 'Your Name or Display Title *')}</span>
          </label>
          <input
            type="text"
            required
            placeholder={t('مثال: م. أحمد عبد الرحمن، أو عائلة الأستاذ محمود...', 'e.g. Ahmed Abdelrahman, or Family of Mr. Mahmoud...')}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#153B36] focus:outline-hidden focus:border-[#70A69A]"
          />
        </div>

        {/* 3. Service Received */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#153B36] flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-[#70A69A]" />
            <span>{t('الخدمة الطبية التي تلقيتها في أُنس', 'Medical Service Received')}</span>
          </label>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#153B36] focus:outline-hidden focus:border-[#70A69A]"
          >
            {activeServices.map((srv) => (
              <option key={srv.id} value={srv.id}>
                {language === 'ar' ? srv.nameAr : srv.nameEn}
              </option>
            ))}
            <option value="other">{t('خدمة رعاية / تمريض أخرى', 'Other Healthcare Service')}</option>
          </select>
        </div>

        {selectedServiceId === 'other' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#153B36]">
              {t('حدد اسم الخدمة إذا لم تكن في القائمة:', 'Specify service name:')}
            </label>
            <input
              type="text"
              placeholder={t('مثال: تمريض حالات كبار سن، غيار جراحي...', 'e.g. Elderly Care, Wound Dressing...')}
              value={customServiceName}
              onChange={(e) => setCustomServiceName(e.target.value)}
              className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2 text-xs text-[#153B36]"
            />
          </div>
        )}

        {/* 4. Area / Governorate (Optional) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#153B36] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#70A69A]" />
            <span>{t('المنطقة أو المحافظة (اختياري)', 'Area or City (Optional)')}</span>
          </label>
          <input
            type="text"
            placeholder={t('مثال: التجمع الخامس، المعادي، الشيخ زايد، مصر الجديدة...', 'e.g. New Cairo, Maadi, Sheikh Zayed...')}
            value={patientArea}
            onChange={(e) => setPatientArea(e.target.value)}
            className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#153B36] focus:outline-hidden focus:border-[#70A69A]"
          />
        </div>

        {/* 5. Detailed Feedback / Experience */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#153B36] flex items-center gap-1.5">
            <MessageSquareQuote className="w-3.5 h-3.5 text-[#70A69A]" />
            <span>{t('اكتب رأيك وتجربتك بالتفصيل *', 'Write Your Honest Feedback & Review *')}</span>
          </label>
          <textarea
            rows={4}
            required
            placeholder={t(
              'اكتب انطباعك عن مهارة الممرض، الالتزام بالمواعيد، النظافة والتعقيم، أسلوب التعامل مع المريض وأي ملاحظات تود مشاركتها معنا...',
              'Share your impression about clinician skills, punctuality, hygiene & sterilization, patient interaction, and any feedback you have...'
            )}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl p-3.5 text-xs text-[#153B36] leading-relaxed focus:outline-hidden focus:border-[#70A69A]"
          />
        </div>

        {/* Privacy Note */}
        <div className="p-3.5 rounded-xl bg-[#E7EFEA]/60 border border-[#70A69A]/30 text-[11px] text-[#153B36]/80 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-[#70A69A] shrink-0 mt-0.5" />
          <span>
            {t(
              'تقييمكم يظهر بشفافية في قسم تجارب المرضى لدعم الأسر الأخرى في اختيار الرعاية الأنسب، ويخضع للمراجعة والإشراف الداخلي المباشر من إدارة المركز.',
              'Your testimonial will be featured to help other families choose the best home care, governed by authentic oversight from our clinical management.'
            )}
          </span>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#70A69A]" />
            <span>
              {isSubmitting
                ? t('جاري إرسال التقييم...', 'Submitting Review...')
                : t('إرسال التقييم واعتماده', 'Submit Healthcare Review')}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
