import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { Star, ShieldCheck, CheckCircle2, MessageSquareQuote, CalendarPlus } from 'lucide-react';

interface ReviewsPageProps {
  navigate: (route: string, params?: any) => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { reviews } = useData();

  const publishedReviews = reviews.filter((r) => r.published);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold text-[#70A69A] uppercase tracking-wider block">
          {t('شفافية الرعاية والآراء', 'Authentic Feedback')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#153B36] tracking-tight">
          {t('تجارب وآراء مرضى وعائلات أُنس', 'Patient & Family Testimonials')}
        </h1>
        <p className="text-base text-[#153B36]/80 leading-relaxed font-normal">
          {t(
            'جميع الآراء المعروضة هنا هي تجارب حقيقية موثقة لمرضى تلقوا خدمات التمريض والزيارات المنزلية من فريق أُنس بموافقتهم الصريحة.',
            'All testimonials shown here reflect verified patient experiences with home nursing and physician visits, published with consent.'
          )}
        </p>
      </div>

      {publishedReviews.length === 0 ? (
        <div className="p-12 text-center bg-white/60 rounded-3xl border border-[#153B36]/10">
          <p className="text-sm text-[#153B36]/70">
            {t('لا توجد تقييمات منشورة حالياً.', 'No testimonials currently published.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedReviews.map((rev) => {
            const author = language === 'ar' ? rev.authorNameAr : rev.authorNameEn;
            const comment = language === 'ar' ? rev.commentAr : rev.commentEn;
            const service = language === 'ar' ? rev.serviceNameAr : rev.serviceNameEn;

            return (
              <div
                key={rev.id}
                className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-7 flex flex-col justify-between shadow-xs space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#70A69A] bg-[#E7EFEA] px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('رعاية موثقة', 'Verified Patient')}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[#153B36]/85 leading-relaxed font-normal italic">
                    "{comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#153B36]/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#153B36]">{author}</h4>
                    {service && (
                      <span className="text-xs text-[#70A69A] font-medium block">{service}</span>
                    )}
                  </div>
                  {rev.date && (
                    <span className="text-[11px] text-[#153B36]/50" dir="ltr">
                      {rev.date}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Distinction explanation */}
      <div className="rounded-2xl bg-[#E7EFEA] p-6 border border-[#70A69A]/30 flex items-start gap-3 text-xs text-[#153B36]/80 leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-[#153B36] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm text-[#153B36] mb-1">
            {t('ميثاق النزاهة في التقييمات لدى أُنس', 'ONS Integrity in Reviews')}
          </p>
          <p>
            {t(
              'لا نختلق تقييمات وهمية ولا ننسب تقييمات الموقع الداخلي إلى منصات أخرى. كل شهادة تعبر عن مريض أو أسرة حقيقية تلقت رعاية فعلية وخضعت للمتابعة والتدقيق.',
              'We never fabricate reviews or conflate internal testimonials with third-party platforms. Every review reflects verified patient care.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
