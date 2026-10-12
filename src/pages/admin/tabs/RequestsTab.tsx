import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { CustomerRequest, RequestStatus } from '../../../types';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  User,
  DollarSign,
  MessageSquare,
  Shield,
  X,
  History,
  Users,
  CheckCircle2,
  Package,
  Navigation,
  ExternalLink,
  Lock,
  RefreshCw,
  Info,
} from 'lucide-react';
import { buildWhatsAppLink, generateCustomerConfirmationMessage } from '../../../utils/whatsappUtils';
import { estimateDriveMinutes } from '../../../utils/geoUtils';

export const RequestsTab: React.FC = () => {
  const {
    requests,
    areas,
    services,
    settings,
    providers,
    matchProviders,
    assignRequestProvider,
    updateRequestStatus,
    updateRequestAdminNotes,
    retryWhatsAppNotification,
  } = useData();
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null);

  // WhatsApp retry state
  const [isRetryingWhatsApp, setIsRetryingWhatsApp] = useState<boolean>(false);
  const [retryFeedback, setRetryFeedback] = useState<string | null>(null);

  // Modal edit fields
  const [newStatus, setNewStatus] = useState<RequestStatus>('new');
  const [confirmedPrice, setConfirmedPrice] = useState<string>('');
  const [transitionNote, setTransitionNote] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [quoteSuppliesFee, setQuoteSuppliesFee] = useState<number>(0);
  const [quoteLabFee, setQuoteLabFee] = useState<number>(0);
  const [quoteTravelFee, setQuoteTravelFee] = useState<number>(60);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesArea = areaFilter === 'all' || req.areaId === areaFilter;
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      !s ||
      req.customerName.toLowerCase().includes(s) ||
      req.phone.includes(s) ||
      (req.whatsapp && req.whatsapp.includes(s)) ||
      req.serviceNameAr.toLowerCase().includes(s) ||
      req.serviceNameEn.toLowerCase().includes(s) ||
      req.id.toLowerCase().includes(s);
    return matchesStatus && matchesArea && matchesSearch;
  });

  const openDetails = (req: CustomerRequest) => {
    setSelectedRequest(req);
    setNewStatus(req.status);
    setConfirmedPrice(req.confirmedPrice ? String(req.confirmedPrice) : '');
    setAdminNotes(req.adminNotes || '');
    setCancellationReason(req.cancellationReason || '');
    setTransitionNote('');
    setSelectedCandidateId(req.assignedProviderId || '');
    setQuoteTravelFee(req.travelFee || (areas.find((a) => a.id === req.areaId)?.travelFee || 60));
    setQuoteSuppliesFee(req.quote?.suppliesFee?.amount || 0);
    setQuoteLabFee(req.quote?.labThirdPartyFee?.amount || 0);
    setRetryFeedback(null);
  };

  const handleRetryWhatsAppAlert = async (target: 'both' | 'recipient_a' | 'recipient_b' = 'both') => {
    if (!selectedRequest) return;
    setIsRetryingWhatsApp(true);
    setRetryFeedback(null);
    try {
      const result = await retryWhatsAppNotification(selectedRequest.id, target);
      if (result.success) {
        setRetryFeedback(t('تم إرسال إشعار الواتساب بنجاح للمستلمين.', 'WhatsApp notification successfully dispatched.'));
      } else {
        setRetryFeedback(result.error || t('فشل إرسال إشعار الواتساب للمستلمين.', 'WhatsApp notification dispatch failed.'));
      }
      // Update selectedRequest modal state
      const updated = requests.find((r) => r.id === selectedRequest.id);
      if (updated) {
        setSelectedRequest({ ...updated });
      }
    } catch (err: any) {
      setRetryFeedback(err.message || 'Error executing retry.');
    } finally {
      setIsRetryingWhatsApp(false);
    }
  };

  const handleAssignProvider = async () => {
    if (!selectedRequest || !selectedCandidateId) return;
    setIsUpdating(true);
    try {
      await assignRequestProvider(
        selectedRequest.id,
        selectedCandidateId,
        quoteTravelFee,
        quoteSuppliesFee,
        quoteLabFee
      );
      const assigned = providers.find((p) => p.id === selectedCandidateId);
      const totalAmount = (assigned?.agreedRate || 200) + quoteTravelFee + quoteSuppliesFee + quoteLabFee;
      setConfirmedPrice(String(totalAmount));
      setSelectedRequest((prev) =>
        prev
          ? {
              ...prev,
              assignedProviderId: assigned?.id,
              assignedProviderName: assigned?.name,
              confirmedPrice: totalAmount,
              travelFee: quoteTravelFee,
            }
          : null
      );
    } catch (err: any) {
      console.warn('Assignment notice:', err?.message || err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveStatusChange = async () => {
    if (!selectedRequest) return;
    setIsUpdating(true);
    try {
      const priceNum = confirmedPrice ? parseFloat(confirmedPrice) : undefined;
      const noteToSave =
        newStatus === 'cancelled' && cancellationReason
          ? `سبب الإلغاء: ${cancellationReason}`
          : transitionNote;

      const actorName = user?.email || 'Authorized Owner';

      await updateRequestStatus(
        selectedRequest.id,
        newStatus,
        noteToSave,
        priceNum,
        actorName
      );

      if (adminNotes !== (selectedRequest.adminNotes || '')) {
        await updateRequestAdminNotes(selectedRequest.id, adminNotes);
      }

      // Update local state in view
      const updatedItem = requests.find((r) => r.id === selectedRequest.id);
      if (updatedItem) {
        setSelectedRequest({
          ...updatedItem,
          status: newStatus,
          confirmedPrice: priceNum,
          adminNotes,
        });
      }
    } catch (err: any) {
      console.warn('Status change notice:', err?.message || err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            {t('طلب جديد', 'New Order')}
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            {t('قيد المراجعة', 'Under Review')}
          </span>
        );
      case 'awaiting_confirmation':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            {t('بانتظار تأكيد العميل', 'Awaiting Confirmation')}
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            {t('مؤكد ومجدول', 'Confirmed')}
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">
            {t('جاري التنفيذ', 'In Progress')}
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
            {t('مكتمل', 'Completed')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            {t('ملغي', 'Cancelled')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#153B36]">
            {t('إدارة طلبات الرعاية ومطابقة الكوادر', 'Order Management & Provider Dispatch')}
          </h1>
          <p className="text-xs text-[#153B36]/70 mt-1">
            {t(
              'مراجعة طلبات الموقع، مطابقة أقرب ممرض مناسب، إرسال إشعارات الواتساب، واعتماد أسعار الزيارات.',
              'Review website orders, match nearest suitable nurses, dispatch WhatsApp alerts, and confirm quotes.'
            )}
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-[#153B36]/10 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#153B36] focus:outline-hidden"
          >
            <option value="all">{t('كافة الحالات', 'All Orders')} ({requests.length})</option>
            <option value="new">{t('جديد فقط', 'New Only')} ({requests.filter(r => r.status === 'new').length})</option>
            <option value="under_review">{t('قيد المراجعة', 'Under Review')}</option>
            <option value="awaiting_confirmation">{t('بانتظار التأكيد', 'Awaiting Confirmation')}</option>
            <option value="confirmed">{t('مؤكد ومجدول', 'Confirmed')}</option>
            <option value="in_progress">{t('جاري التنفيذ', 'In Progress')}</option>
            <option value="completed">{t('مكتمل', 'Completed')}</option>
            <option value="cancelled">{t('ملغي', 'Cancelled')}</option>
          </select>

          {/* Area filter */}
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#153B36] focus:outline-hidden"
          >
            <option value="all">{t('كافة المناطق', 'All Areas')}</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {language === 'ar' ? a.nameAr : a.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#153B36]/50 absolute top-1/2 -translate-y-1/2 start-3" />
          <input
            type="text"
            placeholder={t('بحث بالاسم أو الهاتف أو المرجع...', 'Search name, phone, order ID...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl ps-9 pe-3 py-2 text-xs text-[#153B36] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#153B36]/10 text-xs text-[#153B36]/60">
          <Inbox className="w-8 h-8 text-[#153B36]/30 mx-auto mb-2" />
          <p>{t('لا توجد طلبات تطابق معايير البحث المحددة.', 'No customer orders match the current criteria.')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#153B36]/10 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-[#F5F2EB] text-[#153B36] border-b border-[#153B36]/10">
                <tr>
                  <th className="py-3 px-4 font-bold text-start">{t('المرجع', 'Ref ID')}</th>
                  <th className="py-3 px-4 font-bold text-start">{t('العميل', 'Customer')}</th>
                  <th className="py-3 px-4 font-bold text-start">{t('الخدمة المطلوبة', 'Service')}</th>
                  <th className="py-3 px-4 font-bold text-start">{t('المنطقة', 'Area')}</th>
                  <th className="py-3 px-4 font-bold text-start">{t('الهاتف / واتساب', 'Phone / WA')}</th>
                  <th className="py-3 px-4 font-bold text-start">{t('إشعار الواتساب الداخلي', 'WhatsApp Alert')}</th>
                  <th className="py-3 px-4 font-bold text-start">{t('الممارس المعين', 'Assigned Provider')}</th>
                  <th className="py-3 px-4 font-bold text-start">{t('الحالة', 'Status')}</th>
                  <th className="py-3 px-4 font-bold text-start">{t('التاريخ', 'Date')}</th>
                  <th className="py-3 px-4 font-bold text-center">{t('الإجراء', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#153B36]/10">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-[#F5F2EB]/40 transition-colors cursor-pointer"
                    onClick={() => openDetails(req)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#153B36] text-[11px]">{req.id}</td>
                    <td className="py-3 px-4 font-bold text-[#153B36]">{req.customerName}</td>
                    <td className="py-3 px-4 text-[#153B36]/80 font-medium">
                      {language === 'ar' ? req.serviceNameAr : req.serviceNameEn}
                    </td>
                    <td className="py-3 px-4 text-[#153B36]/70">
                      {language === 'ar' ? req.areaNameAr : req.areaNameEn}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#153B36]" dir="ltr">
                      {req.whatsapp || req.phone}
                    </td>
                    <td className="py-3 px-4">
                      {req.whatsappNotificationLog?.status === 'sent' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{t('تم (أ + ب)', 'Sent (A+B)')}</span>
                        </span>
                      ) : req.whatsappNotificationLog?.status === 'partial' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>{t('جزئي (مستلم واحد)', 'Partial')}</span>
                        </span>
                      ) : req.whatsappNotificationLog?.status === 'failed' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>{t('فشل الإرسال', 'Failed')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <span>{t('غير مهيأ', 'Pending')}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {req.assignedProviderName ? (
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {req.assignedProviderName}
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
                          {t('غير معين', 'Unassigned')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(req.status)}</td>
                    <td className="py-3 px-4 text-[#153B36]/60">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetails(req);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#153B36] text-[#F5F2EB] text-[11px] font-semibold hover:bg-[#0D2622]"
                      >
                        {t('التفاصيل والمطابقة', 'Details & Dispatch')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Details & Matching Drawer Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-[#153B36]/10 shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#153B36]/10">
              <div>
                <span className="text-xs font-mono font-bold text-[#70A69A] block uppercase">
                  {selectedRequest.id}
                </span>
                <h2 className="text-xl font-extrabold text-[#153B36] mt-0.5">
                  {selectedRequest.customerName}
                </h2>
                <span className="text-xs text-[#153B36]/70 font-semibold block">
                  {language === 'ar' ? selectedRequest.serviceNameAr : selectedRequest.serviceNameEn}
                </span>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-xl text-[#153B36]/60 hover:text-[#153B36] hover:bg-[#F5F2EB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact & WhatsApp Confirmation Dispatch */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F5F2EB] text-xs">
              <div>
                <span className="text-[#153B36]/60 block">{t('رقم الهاتف:', 'Phone:')}</span>
                <a
                  href={`tel:${selectedRequest.phone}`}
                  className="font-bold text-[#153B36] hover:text-[#70A69A] block mt-0.5"
                  dir="ltr"
                >
                  {selectedRequest.phone}
                </a>
              </div>
              <div>
                <span className="text-[#153B36]/60 block">{t('رقم الواتساب:', 'WhatsApp:')}</span>
                <a
                  href={`https://wa.me/${(selectedRequest.whatsapp || selectedRequest.phone).replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                  dir="ltr"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{selectedRequest.whatsapp || selectedRequest.phone}</span>
                </a>
              </div>
              <div>
                <span className="text-[#153B36]/60 block">{t('رسوم انتقال المنطقة:', 'Travel Fee:')}</span>
                <span className="font-bold text-[#153B36] block mt-0.5">
                  {selectedRequest.travelFee || 0} {settings.currency}
                </span>
              </div>
            </div>

            {/* WhatsApp Direct Confirmation Button */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-900">
                <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-semibold">
                  {t('إرسال تأكيد الموعد المباشر للعميل عبر الواتساب', 'Dispatch WhatsApp confirmation directly to patient')}
                </span>
              </div>
              <a
                href={buildWhatsAppLink(
                  selectedRequest.whatsapp || selectedRequest.phone,
                  generateCustomerConfirmationMessage(selectedRequest)
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-xs flex items-center gap-1.5 shrink-0"
              >
                <span>{t('إرسال رسالة التأكيد الآن', 'Send WhatsApp Confirmation')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Internal WhatsApp Order Notification Status Card (Recipient A & B) */}
            <div className="p-4 rounded-2xl bg-white border border-[#153B36]/15 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#153B36]/10 gap-2">
                <div className="flex items-center gap-2 text-[#153B36]">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider">
                    {t('حالة إشعار الواتساب الداخلي للمستلمين (Server Notification)', 'Internal WhatsApp Notifications')}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {selectedRequest.whatsappNotificationLog?.status === 'sent' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      🟢 {t('تم الإرسال للمستلمين (أ + ب)', 'Sent to Both Recipients')}
                    </span>
                  ) : selectedRequest.whatsappNotificationLog?.status === 'partial' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      🟡 {t('إرسال جزئي (مستلم واحد فقط)', 'Partial Delivery')}
                    </span>
                  ) : selectedRequest.whatsappNotificationLog?.status === 'failed' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      🔴 {t('فشل إرسال الإشعار', 'Dispatch Failed')}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                      ⚪ {t('غير مهيأ في الخادم', 'Not Configured')}
                    </span>
                  )}
                </div>
              </div>

              {/* Recipient A & Recipient B Status Subcards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Recipient A */}
                <div className="p-3 rounded-xl bg-[#F5F2EB]/50 border border-[#153B36]/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#153B36] flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-[#153B36] text-white flex items-center justify-center text-[10px]">A</span>
                      {t('المستلم الداخلي (أ)', 'Recipient A')}
                    </span>
                    {selectedRequest.whatsappNotificationLog?.recipientA?.status === 'sent' ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {t('تم الإرسال', 'Sent')}
                      </span>
                    ) : selectedRequest.whatsappNotificationLog?.recipientA?.status === 'failed' ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                        {t('فشل', 'Failed')}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                        {t('غير مهيأ', 'Not Configured')}
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-[#153B36]" dir="ltr">
                    {selectedRequest.whatsappNotificationLog?.recipientA?.phone || t('غير محدد', 'Not set')}
                  </div>
                  {selectedRequest.whatsappNotificationLog?.recipientA?.messageId && (
                    <div className="text-[10px] text-[#153B36]/50 font-mono truncate">
                      ID: {selectedRequest.whatsappNotificationLog.recipientA.messageId}
                    </div>
                  )}
                  {selectedRequest.whatsappNotificationLog?.recipientA?.error && (
                    <div className="text-[10px] text-rose-600 truncate" title={selectedRequest.whatsappNotificationLog.recipientA.error}>
                      {selectedRequest.whatsappNotificationLog.recipientA.error}
                    </div>
                  )}
                </div>

                {/* Recipient B */}
                <div className="p-3 rounded-xl bg-[#F5F2EB]/50 border border-[#153B36]/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#153B36] flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-[#70A69A] text-white flex items-center justify-center text-[10px]">B</span>
                      {t('المستلم الداخلي (ب)', 'Recipient B')}
                    </span>
                    {selectedRequest.whatsappNotificationLog?.recipientB?.status === 'sent' ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {t('تم الإرسال', 'Sent')}
                      </span>
                    ) : selectedRequest.whatsappNotificationLog?.recipientB?.status === 'failed' ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                        {t('فشل', 'Failed')}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                        {t('غير مهيأ', 'Not Configured')}
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-[#153B36]" dir="ltr">
                    {selectedRequest.whatsappNotificationLog?.recipientB?.phone || t('غير محدد', 'Not set')}
                  </div>
                  {selectedRequest.whatsappNotificationLog?.recipientB?.messageId && (
                    <div className="text-[10px] text-[#153B36]/50 font-mono truncate">
                      ID: {selectedRequest.whatsappNotificationLog.recipientB.messageId}
                    </div>
                  )}
                  {selectedRequest.whatsappNotificationLog?.recipientB?.error && (
                    <div className="text-[10px] text-rose-600 truncate" title={selectedRequest.whatsappNotificationLog.recipientB.error}>
                      {selectedRequest.whatsappNotificationLog.recipientB.error}
                    </div>
                  )}
                </div>
              </div>

              {/* Retry Action Banner */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="text-[11px] text-[#153B36]/60">
                  {selectedRequest.whatsappNotificationLog?.lastAttemptAt
                    ? `${t('آخر محاولة إرسال:', 'Last attempt:')} ${new Date(selectedRequest.whatsappNotificationLog.lastAttemptAt).toLocaleTimeString()}`
                    : t('لم تسجل محاولة سابقة', 'No previous attempt recorded')}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRetryWhatsAppAlert('both')}
                    disabled={isRetryingWhatsApp}
                    className="px-3.5 py-1.5 rounded-xl border border-[#153B36]/20 bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRetryingWhatsApp ? 'animate-spin' : ''}`} />
                    <span>{isRetryingWhatsApp ? t('جاري الإرسال...', 'Retrying...') : t('إعادة إرسال الإشعار للمستلمين (Retry)', 'Retry WhatsApp Alert')}</span>
                  </button>
                </div>
              </div>

              {retryFeedback && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#153B36] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#70A69A]" />
                  <span>{retryFeedback}</span>
                </div>
              )}
            </div>

            {/* Full Address Details & Landmark */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border border-[#153B36]/10 bg-white">
                <span className="font-bold text-[#153B36] block mb-1">
                  {t('العنوان التفصيلي وموقع الزيارة:', 'Full Address Details & Landmark:')}
                </span>
                <p className="text-[#153B36]/80 leading-relaxed font-mono">
                  {selectedRequest.addressDetails}
                </p>
                {selectedRequest.mapCoordinates && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#70A69A] font-semibold mt-1">
                    <Navigation className="w-3 h-3" />
                    {selectedRequest.mapCoordinates.lat.toFixed(4)}, {selectedRequest.mapCoordinates.lng.toFixed(4)}
                  </span>
                )}
              </div>

              {selectedRequest.notes && (
                <div className="p-3.5 rounded-xl border border-[#153B36]/10 bg-white">
                  <span className="font-bold text-[#153B36] block mb-1">
                    {t('ملاحظات الحالة السريرية المسجلة من المريض:', 'Patient Condition Note:')}
                  </span>
                  <p className="text-[#153B36]/80 leading-relaxed italic">
                    "{selectedRequest.notes}"
                  </p>
                </div>
              )}

              {/* Uploaded Identity Document Display */}
              {selectedRequest.identityDocumentUrl && (
                <div className="p-3.5 rounded-xl border border-[#153B36]/10 bg-[#F5F2EB]/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#70A69A]" />
                    <span className="font-bold text-[#153B36]">
                      {t('مستند إثبات الهوية / الروشتة المرفوع:', 'Attached Identity Document:')}
                    </span>
                    <span className="font-mono text-[#153B36]/70 text-[11px]">
                      {selectedRequest.identityDocumentName || 'document'}
                    </span>
                  </div>
                  <a
                    href={selectedRequest.identityDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-lg bg-[#153B36] text-[#F5F2EB] text-[11px] font-semibold hover:bg-[#0D2622]"
                  >
                    {t('معاينة المستند بأمان', 'View Secure Document')}
                  </a>
                </div>
              )}
            </div>

            {/* SECTION: Nearest Suitable Providers (أقرب مقدمي الخدمة المناسبين) */}
            <div className="p-5 rounded-2xl bg-white border border-[#153B36]/15 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#153B36]/10">
                <div className="flex items-center gap-2 text-[#153B36]">
                  <Users className="w-4 h-4 text-[#70A69A]" />
                  <h3 className="text-sm font-extrabold">
                    {t('أقرب مقدمي الخدمة المناسبين (Nearest Suitable Providers)', 'Nearest Suitable Providers')}
                  </h3>
                </div>
                {selectedRequest.assignedProviderName ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    {t('الممارس المعين:', 'Assigned:')} {selectedRequest.assignedProviderName}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    {t('بانتظار تعيين ممارس', 'Unassigned')}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#153B36] block">
                  {t('المرشحون المرتبون وفقاً للأقرب جغرافياً والمؤهلين للخدمة:', 'Candidates ranked by geographic proximity and qualifications:')}
                </label>

                {/* Candidate list with proximity and travel time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {matchProviders(selectedRequest.serviceId, selectedRequest.areaId, {
                    targetCoords: selectedRequest.mapCoordinates,
                    date: selectedRequest.preferredDate,
                  }).map((candidate) => {
                    const isSelected = selectedCandidateId === candidate.id;
                    const driveTime = candidate.estimatedDistanceKm
                      ? estimateDriveMinutes(candidate.estimatedDistanceKm)
                      : null;

                    return (
                      <div
                        key={candidate.id}
                        onClick={() => setSelectedCandidateId(candidate.id)}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#153B36] text-[#F5F2EB] border-[#153B36] shadow-md'
                            : 'bg-[#F5F2EB]/50 border-[#153B36]/10 text-[#153B36] hover:bg-white hover:border-[#70A69A]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-xs">{candidate.name}</span>
                          <span className="text-[11px] text-[#70A69A]">
                            {candidate.agreedRate} EGP
                          </span>
                        </div>

                        <div className="text-[11px] opacity-80 mt-1 line-clamp-1">
                          {language === 'ar' ? candidate.specialtyAr : candidate.specialtyEn}
                        </div>

                        {/* Proximity / Distance Badge */}
                        <div className="mt-2 pt-2 border-t border-current/15 flex items-center justify-between text-[10px]">
                          <span className="flex items-center gap-1 opacity-90">
                            <Navigation className="w-3 h-3 text-[#70A69A]" />
                            {candidate.estimatedDistanceKm !== undefined ? (
                              <span>
                                {candidate.estimatedDistanceKm} كم (~{driveTime} دقيقة)
                              </span>
                            ) : (
                              <span>
                                {t('تطابق نطاق المنطقة', 'Area coverage match')}
                              </span>
                            )}
                          </span>

                          <span className="opacity-75">
                            {candidate.distanceMatchBasis === 'coordinates'
                              ? t('مسافة دقيقة', 'Exact Proximity')
                              : t('مطابقة منطقة', 'Area Match')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Itemized Quote Calculator */}
              <div className="p-3.5 rounded-xl bg-[#F5F2EB] space-y-3 text-xs">
                <span className="font-bold text-[#153B36] block">
                  {t('إعداد عرض السعر المفصل للزيارة (Itemized Quote):', 'Itemized Visit Quote:')}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-[#153B36]/70 block mb-1">
                      {t('رسوم الخدمة (ج.م)', 'Service Fee')}
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={providers.find((p) => p.id === selectedCandidateId)?.agreedRate || 200}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#153B36]/20 bg-white/70 font-mono font-bold text-[#153B36]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#153B36]/70 block mb-1">
                      {t('رسوم الانتقال (ج.م)', 'Travel Fee')}
                    </label>
                    <input
                      type="number"
                      value={quoteTravelFee}
                      onChange={(e) => setQuoteTravelFee(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#153B36]/20 bg-white font-mono font-bold text-[#153B36]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#153B36]/70 block mb-1">
                      {t('مستلزمات طبية (ج.م)', 'Supplies')}
                    </label>
                    <input
                      type="number"
                      value={quoteSuppliesFee}
                      onChange={(e) => setQuoteSuppliesFee(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#153B36]/20 bg-white font-mono font-bold text-[#153B36]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#153B36]/70 block mb-1">
                      {t('رسوم معمل (ج.م)', 'Lab Fee')}
                    </label>
                    <input
                      type="number"
                      value={quoteLabFee}
                      onChange={(e) => setQuoteLabFee(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#153B36]/20 bg-white font-mono font-bold text-[#153B36]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#153B36]/10">
                  <div className="text-xs">
                    <span className="text-[#153B36]/60">{t('إجمالي الفاتورة المتوقع:', 'Estimated Total Quote:')} </span>
                    <span className="font-extrabold text-[#153B36] text-sm font-mono">
                      {(providers.find((p) => p.id === selectedCandidateId)?.agreedRate || 200) +
                        quoteTravelFee +
                        quoteSuppliesFee +
                        quoteLabFee}{' '}
                      {settings.currency}
                    </span>
                  </div>

                  {/* Financial In/Out Breakdown for Owner */}
                  <div className="w-full p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] flex items-center justify-between gap-2">
                    <span className="text-emerald-900 font-semibold">
                      {t('أتعاب الممرض (الخارج):', 'Nurse Payout:')}{' '}
                      <strong className="font-mono text-amber-800">
                        {providers.find((p) => p.id === selectedCandidateId)?.agreedRate || 200} EGP
                      </strong>
                    </span>
                    <span className="text-emerald-950 font-bold">
                      {t('صافي أرباح المركز المقدرة:', 'Estimated Center Net:')}{' '}
                      <strong className="font-mono text-emerald-700 font-extrabold">
                        {quoteTravelFee + quoteSuppliesFee + quoteLabFee} EGP
                      </strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAssignProvider}
                    disabled={!selectedCandidateId || isUpdating}
                    className="px-4 py-2 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {t('تعيين أقرب ممارس وإعداد عرض السعر', 'Assign Nearest Provider & Set Quote')}
                  </button>
                </div>
              </div>
            </div>

            {/* Status & Rate Confirmation Section */}
            <div className="p-5 rounded-2xl bg-[#E7EFEA] border border-[#70A69A]/30 space-y-4">
              <h3 className="text-sm font-bold text-[#153B36] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#70A69A]" />
                <span>{t('تحديث حالة الرعاية وتأكيد السعر المعتمد', 'Update Order Status & Confirm Rate')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#153B36] mb-1">
                    {t('حالة الطلب *', 'Order Status *')}
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
                    className="w-full bg-white border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#153B36] focus:outline-hidden"
                  >
                    <option value="new">{t('طلب جديد (New)', 'New')}</option>
                    <option value="under_review">{t('قيد المراجعة السريرية (Under Review)', 'Under Review')}</option>
                    <option value="awaiting_confirmation">{t('بانتظار تأكيد العميل (Awaiting Confirmation)', 'Awaiting Confirmation')}</option>
                    <option value="confirmed">{t('مؤكد ومجدول (Confirmed)', 'Confirmed')}</option>
                    <option value="in_progress">{t('جاري التنفيذ الميداني (In Progress)', 'In Progress')}</option>
                    <option value="completed">{t('مكتمل بنجاح (Completed)', 'Completed')}</option>
                    <option value="cancelled">{t('ملغي (Cancelled)', 'Cancelled')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#153B36] mb-1">
                    {t('السعر المعتمد النهائي (ج.م)', 'Confirmed Rate (EGP)')}
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={confirmedPrice}
                    onChange={(e) => setConfirmedPrice(e.target.value)}
                    className="w-full bg-white border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#153B36] focus:outline-hidden"
                  />
                </div>
              </div>

              {newStatus === 'cancelled' && (
                <div>
                  <label className="block font-bold text-red-700 text-xs mb-1">
                    {t('سبب إلغاء الطلب *', 'Cancellation Reason *')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('مثال: إلغاء بناءً على رغبة المريض، عدم توفر الكادر الطبي...', 'Reason...')}
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full bg-white border border-red-300 rounded-xl px-3 py-2 text-xs text-red-900 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-[#153B36] text-xs mb-1">
                  {t('ملاحظة انتقال الحالة (تظهر في سجل التدقيق)', 'Status Transition Note')}
                </label>
                <input
                  type="text"
                  placeholder={t('مثال: تم الاتصال وتأكيد ميعاد الزيارة غداً الساعة 10 ص', 'Audit log note...')}
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                  className="w-full bg-white border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs text-[#153B36] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[#153B36] text-xs mb-1">
                  {t('ملاحظات إدارية وتشغيلية داخلية (محمية وسرية)', 'Internal Admin Notes (Restricted)')}
                </label>
                <textarea
                  rows={2}
                  placeholder={t('ملاحظات خاصة بفريق التمريض أو تاريخ الحالة...', 'Restricted internal operational notes...')}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-white border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs text-[#153B36] focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveStatusChange}
                  disabled={isUpdating}
                  className="px-6 py-2.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isUpdating ? t('جاري الحفظ...', 'Saving...') : t('حفظ التعديلات واعتماد الحالة', 'Save & Update Status')}
                </button>
              </div>
            </div>

            {/* Audit Trail History */}
            {selectedRequest.statusHistory && selectedRequest.statusHistory.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#153B36]/10 text-xs">
                <h4 className="font-bold text-[#153B36] flex items-center gap-2">
                  <History className="w-4 h-4 text-[#70A69A]" />
                  <span>{t('سجل التدقيق والتاريخ الإجرائي للحالة', 'Status History & Audit Trail')}</span>
                </h4>
                <div className="space-y-2">
                  {selectedRequest.statusHistory.map((entry, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#F5F2EB]/60 border border-[#153B36]/10 flex items-start justify-between gap-4"
                    >
                      <div>
                        <span className="font-bold text-[#153B36] block">
                          {entry.status} — {entry.note || 'تغيير الحالة'}
                        </span>
                        <span className="text-[10px] text-[#153B36]/60">
                          {t('بواسطة:', 'By:')} {entry.changedBy}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#153B36]/50 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
