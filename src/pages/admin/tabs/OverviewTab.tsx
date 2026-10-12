import React from 'react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Inbox,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  TrendingUp,
  MapPin,
  Stethoscope,
  Calendar,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface OverviewTabProps {
  setActiveTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ setActiveTab }) => {
  const { requests, services, areas } = useData();
  const { language, t, isRtl } = useLanguage();

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const total = requests.length;
  const newCount = requests.filter((r) => r.status === 'new').length;
  const underReviewCount = requests.filter((r) => r.status === 'under_review').length;
  const awaitingConfCount = requests.filter((r) => r.status === 'awaiting_confirmation').length;
  const confirmedCount = requests.filter((r) => r.status === 'confirmed').length;
  const inProgressCount = requests.filter((r) => r.status === 'in_progress').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;
  const cancelledCount = requests.filter((r) => r.status === 'cancelled').length;

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            {t('جديد', 'New')}
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            {t('قيد المراجعة', 'Under Review')}
          </span>
        );
      case 'awaiting_confirmation':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            {t('بانتظار تأكيد العميل', 'Awaiting Confirmation')}
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            {t('مؤكد ومجدول', 'Confirmed')}
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
            {t('جاري التنفيذ', 'In Progress')}
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-300">
            {t('مكتمل بنجاح', 'Completed')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
            {t('ملغي', 'Cancelled')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Intro */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#153B36]">
          {t('لوحة المؤشرات التشغيلية للرعاية', 'Operational Overview & Care Metrics')}
        </h1>
        <p className="text-xs text-[#153B36]/70 mt-1">
          {t(
            'بيانات حقيقية مستمدة من قاعدة البيانات ومسار طلبات الرعاية المنزلية الواردة.',
            'Derived directly from your database and real patient requests.'
          )}
        </p>
      </div>

      {/* Primary Status Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total */}
        <div className="rounded-2xl bg-white p-5 border border-[#153B36]/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#153B36]/60">
            <span className="text-xs font-semibold">{t('إجمالي الطلبات', 'Total Requests')}</span>
            <Inbox className="w-4 h-4 text-[#70A69A]" />
          </div>
          <div className="text-3xl font-extrabold text-[#153B36]">{total}</div>
          <span className="text-[11px] text-[#153B36]/50 block">
            {t('كافة الحالات المسجلة', 'All historical cases')}
          </span>
        </div>

        {/* New / Action Needed */}
        <div className="rounded-2xl bg-white p-5 border border-amber-300/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-bold">{t('طلبات جديدة', 'New Requests')}</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-900">{newCount}</div>
          <span className="text-[11px] text-amber-700/80 block">
            {t('تتطلب اتصال أولي وتأكيد', 'Action required: call patient')}
          </span>
        </div>

        {/* Confirmed / Scheduled */}
        <div className="rounded-2xl bg-white p-5 border border-emerald-300/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold">{t('زيارات مؤكدة', 'Confirmed Visits')}</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-900">{confirmedCount}</div>
          <span className="text-[11px] text-emerald-700/80 block">
            {t('معتمدة وجاهزة للتحرك', 'Approved & dispatched')}
          </span>
        </div>

        {/* Completed */}
        <div className="rounded-2xl bg-white p-5 border border-[#153B36]/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#153B36]/60">
            <span className="text-xs font-semibold">{t('زيارات مكتملة', 'Completed')}</span>
            <TrendingUp className="w-4 h-4 text-[#70A69A]" />
          </div>
          <div className="text-3xl font-extrabold text-[#153B36]">{completedCount}</div>
          <span className="text-[11px] text-[#153B36]/50 block">
            {t('تم تقديم الرعاية وإغلاق الحالة', 'Delivered & closed')}
          </span>
        </div>
      </div>

      {/* Secondary Status Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white/70 border border-[#153B36]/10 flex items-center justify-between">
          <span className="text-[#153B36]/70">{t('قيد المراجعة السريرية:', 'Under Review:')}</span>
          <span className="font-bold text-blue-700">{underReviewCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white/70 border border-[#153B36]/10 flex items-center justify-between">
          <span className="text-[#153B36]/70">{t('بانتظار تأكيد المريض:', 'Awaiting Confirmation:')}</span>
          <span className="font-bold text-purple-700">{awaitingConfCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white/70 border border-[#153B36]/10 flex items-center justify-between">
          <span className="text-[#153B36]/70">{t('زيارات جارية الآن:', 'In Progress:')}</span>
          <span className="font-bold text-teal-700">{inProgressCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white/70 border border-[#153B36]/10 flex items-center justify-between">
          <span className="text-[#153B36]/70">{t('طلبات ملغاة:', 'Cancelled:')}</span>
          <span className="font-bold text-red-600">{cancelledCount}</span>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#153B36]">
              {t('أحدث طلبات الرعاية الواردة', 'Recent Incoming Requests')}
            </h2>
            <p className="text-xs text-[#153B36]/60">
              {t('مباشرة من استمارات المرضى بالموقع', 'Live patient submissions')}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('requests')}
            className="text-xs font-bold text-[#153B36] hover:text-[#70A69A] transition-colors inline-flex items-center gap-1"
          >
            <span>{t('إدارة كافة الطلبات', 'Manage All Requests')}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentRequests.length === 0 ? (
          <div className="text-center py-10 bg-[#F5F2EB]/50 rounded-2xl border border-dashed border-[#153B36]/20 space-y-2">
            <Inbox className="w-8 h-8 text-[#70A69A] mx-auto" />
            <p className="text-xs text-[#153B36]/70">
              {t('لا توجد طلبات مسجلة بعد. عند إرسال المرضى لطلبات ستظهر هنا فوراً.', 'No requests yet.')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-xs text-start">
              <thead>
                <tr className="border-b border-[#153B36]/10 text-[#153B36]/60">
                  <th className="pb-3 text-start font-semibold">{t('المريض / المتصل', 'Patient')}</th>
                  <th className="pb-3 text-start font-semibold">{t('الخدمة المطلوبة', 'Service')}</th>
                  <th className="pb-3 text-start font-semibold">{t('المنطقة', 'Area')}</th>
                  <th className="pb-3 text-start font-semibold">{t('الهاتف', 'Phone')}</th>
                  <th className="pb-3 text-start font-semibold">{t('الحالة', 'Status')}</th>
                  <th className="pb-3 text-start font-semibold">{t('التاريخ', 'Date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#153B36]/5">
                {recentRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => setActiveTab('requests')}
                    className="hover:bg-[#F5F2EB]/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-bold text-[#153B36]">{req.customerName}</td>
                    <td className="py-3 text-[#153B36]/80">
                      {language === 'ar' ? req.serviceNameAr : req.serviceNameEn}
                    </td>
                    <td className="py-3 text-[#153B36]/70">
                      {language === 'ar' ? req.areaNameAr : req.areaNameEn}
                    </td>
                    <td className="py-3 font-mono text-[#153B36]" dir="ltr">
                      {req.phone}
                    </td>
                    <td className="py-3">{getStatusBadge(req.status)}</td>
                    <td className="py-3 text-[#153B36]/50">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Action Shortcuts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('services')}
          className="p-5 rounded-2xl bg-white border border-[#153B36]/10 text-start hover:border-[#70A69A] transition-colors space-y-1.5 shadow-xs"
        >
          <div className="flex items-center gap-2 text-[#153B36] font-bold text-sm">
            <Stethoscope className="w-4 h-4 text-[#70A69A]" />
            <span>{t('إدارة الخدمات والتسعير', 'Services & Pricing')}</span>
          </div>
          <p className="text-xs text-[#153B36]/70">
            {t('تعديل الأسعار الاسترشادية والخدمات والتصنيفات', 'Update prices, services, and categories')}
          </p>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className="p-5 rounded-2xl bg-white border border-[#153B36]/10 text-start hover:border-[#70A69A] transition-colors space-y-1.5 shadow-xs"
        >
          <div className="flex items-center gap-2 text-[#153B36] font-bold text-sm">
            <FileText className="w-4 h-4 text-[#70A69A]" />
            <span>{t('محتوى ونصوص الموقع', 'Website Content')}</span>
          </div>
          <p className="text-xs text-[#153B36]/70">
            {t('تعديل نصوص الصفحة الرئيسية والأسئلة والسياسات', 'Edit headings, FAQs, and pages')}
          </p>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className="p-5 rounded-2xl bg-white border border-[#153B36]/10 text-start hover:border-[#70A69A] transition-colors space-y-1.5 shadow-xs"
        >
          <div className="flex items-center gap-2 text-[#153B36] font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-[#70A69A]" />
            <span>{t('دليل الإعداد والأمان', 'Firebase Setup Guide')}</span>
          </div>
          <p className="text-xs text-[#153B36]/70">
            {t('خطوات تفعيل حساب المالك وقواعد Firestore', 'Setup Firebase Auth & Firestore Rules')}
          </p>
        </button>
      </div>
    </div>
  );
};
