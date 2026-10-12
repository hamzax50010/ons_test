import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
  CalendarPlus,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  User,
  Phone,
  Home,
  FileText,
  AlertCircle,
  HelpCircle,
  Upload,
  MessageSquare,
  Lock,
  Building,
  Navigation,
  Check,
  X,
  Plus,
  CreditCard,
  FileCheck,
  Info,
  Calendar,
} from 'lucide-react';
import { buildWhatsAppLink, generateOwnerNotificationMessage, generateCustomerConfirmationMessage } from '../../utils/whatsappUtils';
import { SelectedServiceItem } from '../../types';

interface RequestServicePageProps {
  initialServiceId?: string;
  navigate: (route: string, params?: any) => void;
}

export const RequestServicePage: React.FC<RequestServicePageProps> = ({
  initialServiceId,
  navigate,
}) => {
  const { language, t, isRtl } = useLanguage();
  const { services, areas, settings, createCustomerRequest } = useData();

  // Strict guard: only active published services with enabled bookings
  const activeServices = services.filter(
    (s) =>
      s.active &&
      (s.serviceStatus === undefined || s.serviceStatus === 'active') &&
      (s.isPubliclyVisible === undefined || s.isPubliclyVisible === true) &&
      (s.isBookingEnabled === undefined || s.isBookingEnabled === true)
  );

  const activeAreas = areas.filter((a) => a.active);

  // Service selection: Primary service + option to add additional services
  const defaultInitialId =
    initialServiceId && activeServices.some((s) => s.id === initialServiceId)
      ? initialServiceId
      : activeServices[0]?.id || '';

  const [primaryServiceId, setPrimaryServiceId] = useState<string>(defaultInitialId);
  const [additionalServiceIds, setAdditionalServiceIds] = useState<string[]>([]);
  const [showAddServiceDropdown, setShowAddServiceDropdown] = useState<boolean>(false);
  const [selectedToAddId, setSelectedToAddId] = useState<string>('');

  // Scheduling: Date + Typed time / arrival hour
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<string>('');

  // Customer Contact
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [useSeparateWhatsApp, setUseSeparateWhatsApp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  // Location Hierarchy
  const [governorate, setGovernorate] = useState<string>('القاهرة');
  const [selectedAreaId, setSelectedAreaId] = useState<string>(
    activeAreas[0]?.id ?? ''
  );
  const [district, setDistrict] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [building, setBuilding] = useState<string>('');
  const [addressDetails, setAddressDetails] = useState<string>('');
  const [mapLocationCoords, setMapLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  // Identity document upload state
  const [idFileName, setIdFileName] = useState<string>('');
  const [idFilePreview, setIdFilePreview] = useState<string>('');
  const [idFileUploading, setIdFileUploading] = useState<boolean>(false);

  // Legal & Terms
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [acceptDepositPolicy, setAcceptDepositPolicy] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [submittedRequestPayload, setSubmittedRequestPayload] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedArea = activeAreas.find((a) => a.id === selectedAreaId);

  // Consolidated selected service IDs: primary first, followed by any additional services
  const selectedServiceIds = [
    primaryServiceId,
    ...additionalServiceIds.filter((id) => id && id !== primaryServiceId),
  ].filter(Boolean);

  const primaryService = activeServices.find((s) => s.id === primaryServiceId);
  const additionalServicesList = activeServices.filter((s) =>
    additionalServiceIds.includes(s.id) && s.id !== primaryServiceId
  );
  const availableServicesForAdd = activeServices.filter(
    (s) => !selectedServiceIds.includes(s.id)
  );

  const removeAdditionalService = (serviceId: string) => {
    setAdditionalServiceIds((prev) => prev.filter((id) => id !== serviceId));
  };

  const selectedServicesList = activeServices.filter((s) =>
    selectedServiceIds.includes(s.id)
  );

  // Pricing calculations
  const travelFee = selectedArea?.travelFee || 0;
  
  // Calculate aggregate approved price range for all chosen services
  let minServicesPrice = 0;
  let maxServicesPrice = 0;
  let hasPendingPriceQuote = false;

  selectedServicesList.forEach((srv) => {
    const isApproved =
      srv.isPubliclyPublished === true &&
      (srv.pricingStatus === 'published' || srv.pricingStatus === 'approved') &&
      srv.approvedPriceMin !== undefined;

    if (isApproved && srv.approvedPriceMin !== undefined && srv.approvedPriceMax !== undefined) {
      minServicesPrice += srv.approvedPriceMin;
      maxServicesPrice += srv.approvedPriceMax;
    } else {
      hasPendingPriceQuote = true;
    }
  });

  const totalEstimateMin = minServicesPrice + travelFee;
  const totalEstimateMax = maxServicesPrice + travelFee;

  // Map location pin finder
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t('متصفحك لا يدعم تحديد الموقع الجغرافي.', 'Geolocation is not supported by your browser.'));
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setMapLocationCoords(coords);
        setLocationSuccessMsg(
          t(
            `تم التقاط موقعك الجغرافي بنجاح (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
            `Location pinned successfully (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
          )
        );
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation notice:', error);
        // Fallback gracefully without breaking form
        if (selectedArea?.coordinates) {
          setMapLocationCoords(selectedArea.coordinates);
          setLocationSuccessMsg(
            t(
              `تم تحديد إحداثيات مركز ${language === 'ar' ? selectedArea.nameAr : selectedArea.nameEn} كنقطة مرجعية.`,
              `Using reference pin for ${language === 'ar' ? selectedArea.nameAr : selectedArea.nameEn}.`
            )
          );
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // Secure identity document handler
  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setFormError(t('حجم المستند يجب ألا يتجاوز 8 ميجابايت.', 'File size must not exceed 8MB.'));
      return;
    }

    setIdFileUploading(true);
    setIdFileName(file.name);

    // Read securely to local data URL representation
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setIdFilePreview(uploadEvent.target?.result as string);
      setIdFileUploading(false);
    };
    reader.onerror = () => {
      setIdFileUploading(false);
      setFormError(t('تعذر قراءة الملف. يرجى اختيار ملف صالح.', 'Failed to read file. Please select a valid document.'));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client-side validation
    if (selectedServiceIds.length === 0) {
      setFormError(t('يرجى اختيار خدمة طبية واحدة على الأقل.', 'Please select at least one medical service.'));
      return;
    }

    if (!preferredDate) {
      setFormError(t('يرجى اختيار التاريخ المطلوب للزيارة.', 'Please select requested appointment date.'));
      return;
    }

    if (!preferredTimeSlot.trim()) {
      setFormError(t('يرجى كتابة الساعة أو الفترة المفضلة للحضور.', 'Please specify your preferred arrival time/hour.'));
      return;
    }

    if (!customerName.trim() || customerName.trim().length < 3) {
      setFormError(t('يرجى إدخال الاسم بالكامل لمريض أو مقدم الطلب.', 'Please enter full patient or requester name.'));
      return;
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setFormError(t('يرجى إدخال رقم هاتف محمول صالح للتواصل.', 'Please enter a valid phone number.'));
      return;
    }

    if (!selectedAreaId) {
      setFormError(t('يرجى اختيار المنطقة الجغرافية في القاهرة أو الجيزة.', 'Please select service area.'));
      return;
    }

    if (!street.trim() && !addressDetails.trim()) {
      setFormError(t('يرجى كتابة تفاصيل الشارع والعنوان بالتفصيل.', 'Please enter street and detailed address.'));
      return;
    }

    if (!acceptTerms) {
      setFormError(t('يرجى قراءة شروط الحجز وسياسة الخصوصية والموافقة عليها للمتابعة.', 'Please review and accept booking terms and privacy policy.'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Build selected services payload
      const selectedItems: SelectedServiceItem[] = selectedServicesList.map((srv) => ({
        serviceId: srv.id,
        nameAr: srv.nameAr,
        nameEn: srv.nameEn,
        price: srv.approvedPriceMin,
      }));

      const primaryService = selectedServicesList[0];
      const fullAddress = [
        street.trim() ? `${t('شارع', 'Street')}: ${street.trim()}` : null,
        building.trim() ? `${t('بناية', 'Bldg')}: ${building.trim()}` : null,
        district.trim() ? `${t('حي/مجاورة', 'District')}: ${district.trim()}` : null,
        addressDetails.trim() || null,
      ]
        .filter(Boolean)
        .join(' - ');

      const effectiveWhatsApp = useSeparateWhatsApp && whatsapp.trim() ? whatsapp.trim() : cleanPhone;

      const orderData = {
        serviceId: primaryService?.id || '',
        serviceNameAr: selectedServicesList.map((s) => s.nameAr).join(' + '),
        serviceNameEn: selectedServicesList.map((s) => s.nameEn).join(' + '),
        selectedServices: selectedItems,
        areaId: selectedAreaId,
        areaNameAr: selectedArea?.nameAr || '',
        areaNameEn: selectedArea?.nameEn || '',
        governorate: governorate || selectedArea?.cityAr || 'القاهرة',
        city: selectedArea?.cityAr || 'القاهرة',
        district: district.trim() || undefined,
        street: street.trim() || undefined,
        building: building.trim() || undefined,
        addressDetails: fullAddress,
        mapCoordinates: mapLocationCoords || selectedArea?.coordinates || undefined,
        customerName: customerName.trim(),
        phone: cleanPhone,
        whatsapp: effectiveWhatsApp,
        email: email.trim() || undefined,
        preferredDate,
        preferredTimeSlot,
        notes: notes.trim() || undefined,
        identityDocumentUrl: idFilePreview || undefined,
        identityDocumentName: idFileName || undefined,
        termsAccepted: true,
        depositAcknowledged: acceptDepositPolicy,
        travelFee,
      };

      // 1. Create order in Database FIRST
      const orderId = await createCustomerRequest(orderData);

      const completeOrderPayload = {
        ...orderData,
        id: orderId,
      };

      setSubmittedRequestId(orderId);
      setSubmittedRequestPayload(completeOrderPayload);
    } catch (err: any) {
      setFormError(
        err.message ||
          t('حدث خطأ أثناء حفظ الطلب في قاعدة البيانات. يرجى المحاولة مرة أخرى.', 'Error submitting order. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Order Confirmation & WhatsApp Notification Screen
  // -------------------------------------------------------------
  if (submittedRequestId && submittedRequestPayload) {
    // Generate WhatsApp direct deep-links for immediate notification & follow-up
    const ownerNotificationText = generateOwnerNotificationMessage(
      submittedRequestPayload,
      selectedArea
    );
    const customerConfirmText = generateCustomerConfirmationMessage(submittedRequestPayload);

    const ownerWhatsAppLink = buildWhatsAppLink(
      settings.whatsapp || settings.phone || '+201000000000',
      ownerNotificationText
    );
    const customerWhatsAppLink = buildWhatsAppLink(
      submittedRequestPayload.whatsapp || submittedRequestPayload.phone,
      customerConfirmText
    );

    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-10 text-center space-y-6 shadow-xl">
          {/* Success Badge */}
          <div className="w-16 h-16 rounded-full bg-[#E7EFEA] text-[#153B36] flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-[#70A69A]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#70A69A]">
              {t('تم تسجيل طلبك في قاعدة البيانات بنجاح', 'Order Stored Successfully In Database')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#153B36]">
              {t('شكراً لثقتكم في أُنس للرعاية الصحية', 'Thank You for Trusting ONS Healthcare')}
            </h2>
            <p className="text-xs sm:text-sm text-[#153B36]/80 leading-relaxed max-w-xl mx-auto">
              {t(
                'تم حفظ طلبكم برقم مرجعي فريد. سيقوم منسق الرعاية بمطابقة أقرب كادر تمريضي معتمد والتواصل معكم هاتفياً وعبر واتساب لتأكيد الموعد.',
                'Your order has been recorded with a unique reference number. Our coordinator is matching the nearest qualified provider.'
              )}
            </p>
          </div>

          {/* Reference Card */}
          <div className="p-5 rounded-2xl bg-[#F5F2EB] border border-[#153B36]/10 text-start space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#153B36]/10 gap-2">
              <div>
                <span className="text-[11px] text-[#153B36]/60 block font-semibold">
                  {t('الرقم المرجعي الموحد للطلب:', 'Unique Order Reference Number:')}
                </span>
                <span className="text-lg font-mono font-extrabold text-[#153B36]">
                  {submittedRequestId}
                </span>
              </div>
              <div className="text-xs bg-[#153B36]/10 px-3 py-1.5 rounded-lg text-[#153B36] font-semibold self-start sm:self-auto">
                {t('الحالة: قيد المطابقة والتنسيق', 'Status: Matching & Clinical Review')}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#153B36]/60 block">{t('الخدمات المطلوبة:', 'Requested Services:')}</span>
                <span className="font-bold text-[#153B36] mt-0.5 block">
                  {submittedRequestPayload.serviceNameAr}
                </span>
              </div>
              <div>
                <span className="text-[#153B36]/60 block">{t('الموعد والفترة:', 'Appointment Date & Window:')}</span>
                <span className="font-bold text-[#153B36] mt-0.5 block">
                  {submittedRequestPayload.preferredDate} (
                  {submittedRequestPayload.preferredTimeSlot === 'morning'
                    ? t('صباحاً', 'Morning')
                    : submittedRequestPayload.preferredTimeSlot === 'afternoon'
                    ? t('ظهراً', 'Afternoon')
                    : submittedRequestPayload.preferredTimeSlot === 'evening'
                    ? t('مساءً', 'Evening')
                    : t('في أقرب وقت', 'Urgent')}
                  )
                </span>
              </div>
              <div>
                <span className="text-[#153B36]/60 block">{t('العنوان والمنطقة:', 'Area & Address:')}</span>
                <span className="font-bold text-[#153B36] mt-0.5 block">
                  {submittedRequestPayload.areaNameAr} — {submittedRequestPayload.addressDetails}
                </span>
              </div>
              <div>
                <span className="text-[#153B36]/60 block">{t('رسوم الانتقال المقررة:', 'Transit Fee:')}</span>
                <span className="font-bold text-[#153B36] mt-0.5 block">
                  {submittedRequestPayload.travelFee || 0} {settings.currency}
                </span>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Notification & Confirmation Section */}
          <div className="p-5 rounded-2xl bg-[#E7EFEA] border border-[#70A69A]/30 text-start space-y-3">
            <div className="flex items-center gap-2 text-[#153B36]">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold">
                {t('إشعار الواتساب الفوري وتأكيد الطلب', 'WhatsApp Instant Notifications & Confirmation')}
              </h3>
            </div>
            <p className="text-xs text-[#153B36]/80 leading-relaxed">
              {t(
                'تم إنشاء رسالة الإشعار التلقائية الجاهزة لإرسالها لمنسق الرعاية في أُنس وتأكيد حجزكم فورياً عبر الواتساب:',
                'Your notification message has been generated. You can also send the direct WhatsApp summary to the care desk:'
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <a
                href={ownerWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t('إرسال ملخص الطلب لمنسق أُنس عبر واتساب', 'Send Order Summary to ONS WhatsApp')}</span>
              </a>

              <a
                href={`tel:${settings.phone}`}
                className="py-3 px-4 rounded-xl border border-[#153B36]/20 bg-white hover:bg-[#F5F2EB] text-[#153B36] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#70A69A]" />
                <span dir="ltr">{settings.phone}</span>
              </a>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setSubmittedRequestId(null);
                setSubmittedRequestPayload(null);
                setPrimaryServiceId(activeServices[0]?.id || '');
                setAdditionalServiceIds([]);
                setShowAddServiceDropdown(false);
                setSelectedToAddId('');
                setPreferredDate('');
                setPreferredTimeSlot('');
                setCustomerName('');
                setPhone('');
                setWhatsapp('');
                setStreet('');
                setBuilding('');
                setDistrict('');
                setAddressDetails('');
                setNotes('');
                setIdFileName('');
                setIdFilePreview('');
                setAcceptTerms(false);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-[#153B36]/20 text-xs font-semibold text-[#153B36] hover:bg-[#153B36]/5 transition-colors"
            >
              {t('طلب خدمة رعاية أخرى', 'Submit Another Care Request')}
            </button>
            <button
              onClick={() => navigate('home')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#153B36] text-[#F5F2EB] text-xs font-bold hover:bg-[#0D2622] transition-colors"
            >
              {t('العودة للرئيسية', 'Return to Home')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Order Form Screen
  // -------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7EFEA] border border-[#70A69A]/30 text-xs font-bold text-[#153B36]">
          <ShieldCheck className="w-4 h-4 text-[#70A69A]" />
          <span>{t('نظام حجز وتنسيق الرعاية المنزلية المعتمدة', 'Accredited In-Home Care Booking System')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#153B36] tracking-tight">
          {t('حجز خدمة رعاية وتمريض منزلي', 'Order Home Healthcare Service')}
        </h1>
        <p className="text-sm sm:text-base text-[#153B36]/80 leading-relaxed">
          {t(
            'اختر الخدمات الطبية المطلوبة وسجل بيانات الموقع والمريض. نقوم بمطابقة أقرب ممارس صحي مرخص لمنطقتكم وتأكيد الموعد فورياً.',
            'Select your required services, enter appointment and location details. We match the nearest accredited nurse and confirm promptly.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white border border-[#153B36]/10 p-6 sm:p-8 space-y-8 shadow-sm"
          >
            {formError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* 1. Services Selection: Primary service + option to add another service */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-[#153B36]">
                  {t('1. اختيار الخدمة الطبية المطلوبة *', '1. Select Medical Service *')}
                </label>
                <span className="text-xs text-[#70A69A] font-semibold">
                  {selectedServicesList.length} {t('خدمة محددة للطلب', 'selected')}
                </span>
              </div>

              {/* Primary Service Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#153B36]/80">
                  {t('الخدمة الطبية الأساسية المطلوبة *', 'Primary Medical Service *')}
                </label>
                <select
                  value={primaryServiceId}
                  onChange={(e) => setPrimaryServiceId(e.target.value)}
                  className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#153B36] focus:outline-hidden focus:border-[#70A69A]"
                >
                  {activeServices.map((srv) => {
                    const priceText =
                      srv.approvedPriceMin !== undefined
                        ? `(${srv.approvedPriceMin} ${settings.currency})`
                        : `(${t('سعر معتمد عند المراجعة', 'Quoted upon review')})`;
                    return (
                      <option key={srv.id} value={srv.id}>
                        {language === 'ar' ? srv.nameAr : srv.nameEn} {priceText}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Primary Service Details Card */}
              {primaryService && (
                <div className="p-3.5 rounded-2xl bg-[#E7EFEA]/70 border border-[#70A69A]/30 flex items-start justify-between gap-3 shadow-xs">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#153B36] block">
                      {language === 'ar' ? primaryService.nameAr : primaryService.nameEn}
                    </span>
                    <p className="text-[11px] text-[#153B36]/75 leading-relaxed">
                      {language === 'ar' ? primaryService.summaryAr : primaryService.summaryEn}
                    </p>
                  </div>
                  <div className="text-end shrink-0 ps-2">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-[#153B36] text-[#F5F2EB] font-mono text-xs font-bold shadow-xs">
                      {primaryService.approvedPriceMin !== undefined
                        ? `${primaryService.approvedPriceMin} ${settings.currency}`
                        : t('تسعير معتمد', 'Standard')}
                    </span>
                  </div>
                </div>
              )}

              {/* Additional Services List (if any added) */}
              {additionalServicesList.length > 0 && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold text-[#153B36]">
                    {t('الخدمات الإضافية المضافة إلى الزيارة:', 'Additional Services Added to Visit:')}
                  </label>
                  <div className="space-y-2">
                    {additionalServicesList.map((srv) => (
                      <div
                        key={srv.id}
                        className="p-3 rounded-xl bg-white border border-[#153B36]/15 flex items-center justify-between gap-3 shadow-xs animate-fadeIn"
                      >
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#70A69A] shrink-0" />
                          <span className="text-xs font-bold text-[#153B36]">
                            {language === 'ar' ? srv.nameAr : srv.nameEn}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono font-bold text-[#153B36]">
                            {srv.approvedPriceMin !== undefined
                              ? `${srv.approvedPriceMin} ${settings.currency}`
                              : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAdditionalService(srv.id)}
                            className="p-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title={t('إلغاء الخدمة الإضافية', 'Remove additional service')}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Option to Add Another Service */}
              {availableServicesForAdd.length > 0 && (
                <div className="pt-1">
                  {!showAddServiceDropdown ? (
                    <button
                      type="button"
                      onClick={() => setShowAddServiceDropdown(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-[#153B36]/30 text-xs font-bold text-[#153B36] hover:bg-[#E7EFEA] hover:border-[#70A69A] transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#70A69A]" />
                      <span>{t('+ إضافة خدمة أخرى إلى هذا الطلب', '+ Add another service to this order')}</span>
                    </button>
                  ) : (
                    <div className="p-3.5 rounded-2xl border border-[#70A69A]/40 bg-[#F5F2EB]/80 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#153B36]">
                          {t('اختر خدمة إضافية لإضافتها:', 'Select additional service to add:')}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddServiceDropdown(false);
                            setSelectedToAddId('');
                          }}
                          className="p-1 rounded-md text-[#153B36]/60 hover:text-[#153B36]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <select
                          value={selectedToAddId}
                          onChange={(e) => setSelectedToAddId(e.target.value)}
                          className="flex-1 bg-white border border-[#153B36]/20 rounded-xl px-3 py-2 text-xs font-medium text-[#153B36] focus:outline-hidden focus:border-[#70A69A]"
                        >
                          <option value="">{t('-- اختر الخدمة الإضافية --', '-- Select an additional service --')}</option>
                          {availableServicesForAdd.map((srv) => (
                            <option key={srv.id} value={srv.id}>
                              {language === 'ar' ? srv.nameAr : srv.nameEn}
                              {srv.approvedPriceMin ? ` (${srv.approvedPriceMin} ${settings.currency})` : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!selectedToAddId}
                          onClick={() => {
                            if (selectedToAddId) {
                              setAdditionalServiceIds((prev) => [...prev, selectedToAddId]);
                              setSelectedToAddId('');
                              setShowAddServiceDropdown(false);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-[#153B36] text-[#F5F2EB] text-xs font-bold hover:bg-[#0D2622] disabled:opacity-40 transition-colors shrink-0"
                        >
                          {t('تأكيد الإضافة', 'Confirm Add')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Date and Time Slot */}
            <div className="space-y-4 pt-4 border-t border-[#153B36]/10">
              <label className="block text-sm font-bold text-[#153B36] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#70A69A]" />
                <span>{t('2. موعد وتوقيت الزيارة المفضل *', '2. Appointment Date & Preferred Time *')}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#153B36] mb-1">
                    {t('تاريخ الزيارة المطلوب *', 'Requested Date *')}
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#153B36] focus:outline-hidden focus:border-[#70A69A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#153B36] mb-1">
                    {t('الوقت / الساعة المفضلة للحضور (اكتب الوقت المطلوب) *', 'Preferred Arrival Time / Hour (Type Your Time) *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={preferredTimeSlot}
                    onChange={(e) => setPreferredTimeSlot(e.target.value)}
                    placeholder={t('اكتب الساعة، مثلاً: الساعة 5 مساءً أو 11:30 صباحاً', 'Type time/hour, e.g.: 5:00 PM or 11:30 AM')}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#153B36] focus:outline-hidden focus:border-[#70A69A]"
                  />
                  {/* Quick Preset Time Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] text-[#153B36]/60 font-semibold self-center me-1">
                      {t('خيارات سريعة:', 'Quick choices:')}
                    </span>
                    {[
                      { ar: '10:00 صباحاً', en: '10:00 AM' },
                      { ar: '01:00 ظهراً', en: '01:00 PM' },
                      { ar: '05:00 مساءً', en: '05:00 PM' },
                      { ar: '08:00 مساءً', en: '08:00 PM' },
                      { ar: 'في أقرب وقت ممكن', en: 'Earliest Available' },
                    ].map((slot) => {
                      const label = language === 'ar' ? slot.ar : slot.en;
                      const isSelected = preferredTimeSlot === label;
                      return (
                        <button
                          key={slot.en}
                          type="button"
                          onClick={() => setPreferredTimeSlot(label)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#153B36] text-[#F5F2EB] border-[#153B36] font-bold'
                              : 'bg-white text-[#153B36]/80 border-[#153B36]/20 hover:bg-[#E7EFEA]'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Customer Contact Info */}
            <div className="space-y-4 pt-4 border-t border-[#153B36]/10">
              <label className="block text-sm font-bold text-[#153B36] flex items-center gap-2">
                <User className="w-4 h-4 text-[#70A69A]" />
                <span>{t('3. بيانات المريض وجهة الاتصال *', '3. Patient & Contact Information *')}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#153B36] mb-1">
                    {t('الاسم بالكامل للمريض أو المتصل *', 'Full Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('مثال: أحمد محمود علي', 'e.g. Ahmed Mahmoud')}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#153B36] focus:outline-hidden focus:border-[#70A69A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#153B36] mb-1">
                    {t('رقم الهاتف المحمول الأساسي *', 'Primary Phone Number *')}
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="010xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#153B36] focus:outline-hidden focus:border-[#70A69A]"
                  />
                </div>
              </div>

              {/* WhatsApp number (if different) */}
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 text-xs text-[#153B36] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSeparateWhatsApp}
                    onChange={(e) => setUseSeparateWhatsApp(e.target.checked)}
                    className="rounded border-[#153B36]/30 text-[#153B36] focus:ring-[#70A69A]"
                  />
                  <span>{t('رقم الواتساب مختلف عن رقم الهاتف الأساسي', 'WhatsApp number is different from primary phone')}</span>
                </label>

                {useSeparateWhatsApp && (
                  <div>
                    <label className="block text-xs font-semibold text-[#153B36] mb-1">
                      {t('رقم الواتساب للتنسيق والإشعارات *', 'WhatsApp Coordination Number *')}
                    </label>
                    <input
                      type="tel"
                      required={useSeparateWhatsApp}
                      dir="ltr"
                      placeholder="01xxxxxxxxx"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#153B36] focus:outline-hidden focus:border-[#70A69A]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#153B36] mb-1">
                  {t('البريد الإلكتروني (اختياري)', 'Email (Optional)')}
                </label>
                <input
                  type="email"
                  dir="ltr"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#153B36] focus:outline-hidden focus:border-[#70A69A]"
                />
              </div>
            </div>

            {/* 4. Service Location (Governorate, City, District, Street, Building) */}
            <div className="space-y-4 pt-4 border-t border-[#153B36]/10">
              <label className="block text-sm font-bold text-[#153B36] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#70A69A]" />
                <span>{t('4. موقع الزيارة الجغرافي والعنوان التفصيلي *', '4. Service Location & Full Address *')}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#153B36] mb-1">
                    {t('المحافظة *', 'Governorate *')}
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#153B36] font-medium"
                  >
                    <option value="القاهرة">{t('محافظة القاهرة', 'Cairo Governorate')}</option>
                    <option value="الجيزة">{t('محافظة الجيزة', 'Giza Governorate')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#153B36] mb-1">
                    {t('المنطقة ونطاق التغطية *', 'Service Coverage Area *')}
                  </label>
                  <select
                    value={selectedAreaId}
                    onChange={(e) => setSelectedAreaId(e.target.value)}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#153B36] font-medium"
                  >
                    {activeAreas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {language === 'ar' ? area.nameAr : area.nameEn} (+{area.travelFee} {settings.currency})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#153B36] mb-1">
                    {t('الحي / المجاورة / التجمع', 'District / Quarter')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('مثال: الحي الأول، التجمع', 'e.g. 1st District')}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2 text-xs text-[#153B36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#153B36] mb-1">
                    {t('الشارع الرئيسي أو الفرعي *', 'Street Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('مثال: شارع التسعين الشمالي', 'e.g. 90th Street')}
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2 text-xs text-[#153B36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#153B36] mb-1">
                    {t('رقم العمارة / الفيلا / الدور', 'Building / Villa / Floor')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('عمارة 14، شقة 5', 'Bldg 14, Apt 5')}
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2 text-xs text-[#153B36]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#153B36] mb-1">
                  {t('تفاصيل العنوان وأقرب علامة مميزة *', 'Additional Address Details & Landmark *')}
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder={t(
                    'مثال: بجوار مسجد الحمد، أمام صيدلية العزبي، الدور الثالث أسانسير...',
                    'e.g. Next to El-Hamd Mosque, opposite pharmacy, 3rd floor...'
                  )}
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2 text-xs text-[#153B36]"
                />
              </div>

              {/* Location Pin Trigger */}
              <div className="p-3.5 rounded-xl bg-[#F5F2EB]/60 border border-[#153B36]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#70A69A]" />
                  <span className="text-xs font-semibold text-[#153B36]">
                    {locationSuccessMsg || t('تثبيت الموقع الجغرافي الدقيق على الخريطة (اختياري)', 'Provide map location pin for nearest nurse matching (Optional)')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="px-3 py-1.5 rounded-lg bg-[#153B36] text-[#F5F2EB] text-xs font-semibold hover:bg-[#0D2622] transition-colors shrink-0"
                >
                  {isLocating ? t('جاري التحديد...', 'Locating...') : t('تحديد موقعي الآن', 'Pin My Location')}
                </button>
              </div>
            </div>

            {/* 5. Secure Identity Document Upload */}
            <div className="space-y-3 pt-4 border-t border-[#153B36]/10">
              <label className="block text-sm font-bold text-[#153B36] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#70A69A]" />
                <span>{t('5. إثبات الهوية أو الروشتة الطبية (رفع آمن ومحمي)', '5. Identity Document / Prescription (Secure Upload)')}</span>
              </label>
              <p className="text-[11px] text-[#153B36]/70">
                {t(
                  'لضمان الأمان الطبي وتوثيق الحالات السريرية، يمكنك رفع صورة بطاقة الرقم القومي أو الروشتة الطبية. يتم حفظ الملفات في خادم كائنات مشفر وسري.',
                  'To ensure clinical security and verify identity, upload an image or scan of national ID or prescription.'
                )}
              </p>

              <div className="border-2 border-dashed border-[#153B36]/20 rounded-2xl p-4 text-center hover:border-[#70A69A] transition-colors bg-[#F5F2EB]/30">
                <input
                  type="file"
                  id="identity-doc-upload"
                  accept="image/*,application/pdf"
                  onChange={handleIdUpload}
                  className="hidden"
                />
                <label
                  htmlFor="identity-doc-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-6 h-6 text-[#70A69A]" />
                  {idFileName ? (
                    <div className="text-xs font-bold text-[#153B36] flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{t('تم إرفاق المستند:', 'Attached:')} {idFileName}</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-[#153B36]">
                        {idFileUploading ? t('جاري التحميل...', 'Uploading...') : t('انقر لاختيار ملف إثبات الهوية أو الروشتة', 'Click to browse identity document or prescription')}
                      </span>
                      <span className="text-[10px] text-[#153B36]/50">
                        {t('PNG, JPG, PDF حتى 8 ميجابايت', 'PNG, JPG, PDF up to 8MB')}
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* 6. Medical Notes */}
            <div className="space-y-2 pt-4 border-t border-[#153B36]/10">
              <label className="block text-xs font-semibold text-[#153B36]">
                {t('ملاحظات إضافية حول حالة المريض (اختياري)', 'Additional Patient Clinical Notes (Optional)')}
              </label>
              <textarea
                rows={2}
                placeholder={t(
                  'مثال: المريض يحتاج مساعدة في الحركة، حساسية أدوية سابقة، متوفر محلول وريدي بالمنزل...',
                  'e.g. Patient needs mobility support, drug allergies, IV fluids available at home...'
                )}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#F5F2EB]/50 border border-[#153B36]/20 rounded-xl px-3.5 py-2 text-xs text-[#153B36]"
              />
            </div>

            {/* 7. Terms, Privacy & Deposit Instructions */}
            <div className="space-y-3 pt-4 border-t border-[#153B36]/10 bg-[#F5F2EB]/50 p-4 rounded-2xl text-xs">
              <div className="flex items-center gap-2 font-bold text-[#153B36]">
                <Lock className="w-4 h-4 text-[#70A69A]" />
                <span>{t('إقرار شروط الحجز، الخصوصية وتعليمات الإيداع', 'Booking Terms, Privacy & Deposit Notice')}</span>
              </div>

              <div className="text-[11px] text-[#153B36]/80 space-y-1.5 leading-relaxed">
                <p>
                  • <strong>{t('تعليمات الإيداع والتأكيد:', 'Deposit Policy:')}</strong> {t('يتم تأكيد الطلب من خلال منسق الرعاية السريرية. قد يُطلب إيداع/عربون بسيط للزيارات التخصصية الطارئة لضمان حجز الممارس، ويُخصم بالكامل من الفاتورة النهائية.', 'Orders are verified by our coordinator. A standard confirmation deposit may apply for specialty calls, fully deducted from the final invoice.')}
                </p>
                <p>
                  • <strong>{t('حماية البيانات والسرية:', 'Privacy Notice:')}</strong> {t('تخضع كافة البيانات المسجلة لسياسة الخصوصية الصارمة، ولا يتم الاطلاع عليها إلا بواسطة الإدارة والكوادر الطبية المكلفة بالزيارة فقط.', 'All patient records are strictly governed by our privacy policy and accessible exclusively by assigned clinical staff.')}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#153B36]/10">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-[#153B36]">
                  <input
                    type="checkbox"
                    required
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="rounded border-[#153B36]/30 text-[#153B36] focus:ring-[#70A69A] mt-0.5"
                  />
                  <span>
                    {t(
                      'قرأت وأوافق على إشعار الخصوصية وشروط حجز الرعاية الصحية المنزلية في أُنس *',
                      'I have read and agree to the Privacy Notice and Home Healthcare Booking Terms *'
                    )}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-[#153B36]/80">
                  <input
                    type="checkbox"
                    checked={acceptDepositPolicy}
                    onChange={(e) => setAcceptDepositPolicy(e.target.checked)}
                    className="rounded border-[#153B36]/30 text-[#153B36] focus:ring-[#70A69A] mt-0.5"
                  />
                  <span>
                    {t(
                      'أوافق على تعليمات تسوية الرسوم وعربون تأكيد الزيارة عند تواصل المنسق',
                      'I acknowledge the visit fee settlement and coordinator dispatch guidance'
                    )}
                  </span>
                </label>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-sm sm:text-base font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
              >
                <CalendarPlus className="w-5 h-5 text-[#70A69A]" />
                <span>
                  {isSubmitting
                    ? t('جاري تأكيد وتسجيل الطلب في قاعدة البيانات...', 'Saving Order in Database...')
                    : t('إرسال الطلب واعتماد الحجز رسمياً', 'Submit Order & Request Provider')}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Real-time Order Summary Column */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="rounded-3xl bg-[#153B36] text-[#F5F2EB] p-6 sm:p-8 space-y-6 border border-[#70A69A]/30 shadow-lg">
            <h3 className="text-lg font-bold text-[#F5F2EB] pb-3 border-b border-[#70A69A]/30 flex items-center justify-between">
              <span>{t('ملخص الطلب وتقدير التكلفة', 'Order Summary & Pricing')}</span>
              <span className="text-xs bg-[#70A69A]/20 px-2.5 py-1 rounded-full text-[#70A69A] font-semibold">
                {selectedServicesList.length} {t('خدمات', 'items')}
              </span>
            </h3>

            {/* Selected Services Breakdown */}
            <div className="space-y-3 text-xs">
              <span className="text-[#70A69A] font-bold block uppercase tracking-wider">
                {t('الخدمات الطبية المحددة:', 'Selected Services:')}
              </span>

              <div className="space-y-2">
                {selectedServicesList.map((srv) => (
                  <div key={srv.id} className="flex justify-between items-start text-xs border-b border-[#70A69A]/20 pb-2">
                    <span className="text-[#F5F2EB] font-medium leading-tight">
                      {language === 'ar' ? srv.nameAr : srv.nameEn}
                    </span>
                    <span className="font-mono text-[#70A69A] font-bold shrink-0 ps-2">
                      {srv.approvedPriceMin ? `${srv.approvedPriceMin} ${settings.currency}` : t('مراجعة', 'Review')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Area travel fee */}
              <div className="flex justify-between items-center text-xs text-[#F5F2EB]/80 pt-1">
                <span>{t('رسوم انتقال المنطقة المقررة:', 'Area Travel Fee:')}</span>
                <span className="font-mono font-bold text-[#F5F2EB]">
                  +{travelFee} {settings.currency}
                </span>
              </div>

              {/* Total Summary */}
              <div className="pt-4 border-t border-[#70A69A]/30 flex justify-between items-baseline">
                <div>
                  <span className="text-[11px] text-[#70A69A] block uppercase font-bold">
                    {t('الإجمالي التقديري للزيارة:', 'Estimated Total Range:')}
                  </span>
                  <span className="text-[10px] text-[#F5F2EB]/60">
                    {t('يشمل رسوم الانتقال لمنطقتك', 'Inclusive of area travel')}
                  </span>
                </div>

                <div className="text-end">
                  {minServicesPrice > 0 ? (
                    <span className="text-xl sm:text-2xl font-extrabold text-[#70A69A] font-mono">
                      {totalEstimateMin} - {totalEstimateMax} {settings.currency}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-[#70A69A] bg-white/10 px-2.5 py-1 rounded-md">
                      {t('يُحدد بعد مراجعة الحالة السريرية', 'Quoted upon clinical review')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Immediate Notification Notice */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-[#70A69A]/20 text-[11px] text-[#F5F2EB]/80 leading-relaxed space-y-1">
              <span className="font-bold text-[#70A69A] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>{t('إشعار الواتساب التلقائي:', 'Automated WhatsApp Dispatch:')}</span>
              </span>
              <p>
                {t(
                  'عند الضغط على إرسال، يُحفظ الطلب فورياً في قاعدة البيانات ويتم إنشاء إشعار واتساب موجه للمالك لتنسيق الزيارة دون أي تأخير.',
                  'Submitting immediately stores the order in our secure database and dispatches WhatsApp notification to the owner desk.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
