import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { ShieldCheck, Lock, FileText } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { content } = useData();

  const privacyText = language === 'ar' ? content.privacyPolicyAr : content.privacyPolicyEn;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-bold text-[#70A69A] uppercase tracking-wider block">
          {t('السرية والأمان الطبي', 'Medical Confidentiality')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#153B36]">
          {t('سياسة الخصوصية وحماية بيانات المرضى', 'Privacy & Patient Data Protection')}
        </h1>
        <p className="text-xs text-[#153B36]/60">
          {t('آخر تحديث: أكتوبر 2026', 'Last updated: October 2026')}
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-[#153B36]/10 p-8 sm:p-10 space-y-6 shadow-sm leading-relaxed text-[#153B36]/85 text-sm sm:text-base">
        <div className="p-4 rounded-2xl bg-[#E7EFEA] border-s-4 border-[#153B36] text-[#153B36] font-medium text-sm">
          {privacyText}
        </div>

        <div className="space-y-4 pt-4 border-t border-[#153B36]/10">
          <h3 className="text-lg font-bold text-[#153B36] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#70A69A]" />
            <span>{t('1. جمع البيانات الشخصية والطبية', '1. Data Collection & Clinical Scope')}</span>
          </h3>
          <p>
            {t(
              'نقوم بجمع البيانات الضرورية فقط لتقديم خدمة الرعاية المنزلية (اسم المريض، العنوان الدقيق، رقم الهاتف للتنسيق، وتاريخ طبي موجز يتعلق بالإجراء المطلوب). لا نطلب معلومات طبية غير ذات صلة بالخدمة المجدولة.',
              'We collect only data necessary for executing in-home care: patient name, address, coordination telephone, and concise medical notes relevant to the scheduled procedure.'
            )}
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#153B36]/10">
          <h3 className="text-lg font-bold text-[#153B36] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#70A69A]" />
            <span>{t('2. حماية بيانات المرضى وسريتها', '2. Patient Confidentiality')}</span>
          </h3>
          <p>
            {t(
              'يلتزم جميع ممارسي أُنس بالقوانين واللوائح المهنية المتعلقة بالسرية الطبية. بيانات المرضى مشفرة ومحمية بقواعد أمان صارمة في قواعد البيانات، ولا يتم مشاركتها مطلقاً مع أي جهات تسويقية أو أطراف خارجية تجارية.',
              'All ONS practitioners are legally and ethically bound by medical nondisclosure. Patient records are encrypted and protected by strict database access controls.'
            )}
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#153B36]/10">
          <h3 className="text-lg font-bold text-[#153B36] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#70A69A]" />
            <span>{t('3. حقوق المريض وحذف البيانات', '3. Patient Rights & Record Requests')}</span>
          </h3>
          <p>
            {t(
              'يحق للمريض أو الوصي القانوني عليه طلب نسخة من تقارير الزيارات أو طلب تعديل بيانات الاتصال في أي وقت عبر التواصل مع منسق الرعاية.',
              'Patients or legal guardians may request clinical visit summaries or contact detail corrections at any time.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
