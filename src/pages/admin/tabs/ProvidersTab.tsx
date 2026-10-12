import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Stethoscope,
  Activity,
  Phone,
  Mail,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck2,
  DollarSign,
  Package,
  Calendar,
  MessageSquare,
  Lock,
  Compass,
} from 'lucide-react';
import { ServiceProvider, ProviderRole, ProviderCredentialStatus, ProviderStatus } from '../../../types';

export const ProvidersTab: React.FC = () => {
  const { providers, services, areas, addProvider, updateProvider, deleteProvider } = useData();
  const { language, t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWhatsApp, setFormWhatsApp] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formType, setFormType] = useState<ProviderRole>('nurse');
  const [formSpecialtyAr, setFormSpecialtyAr] = useState('');
  const [formSpecialtyEn, setFormSpecialtyEn] = useState('');
  const [formQualifiedServices, setFormQualifiedServices] = useState<string[]>([]);
  
  // Location and coverage
  const [formGovernorate, setFormGovernorate] = useState('القاهرة');
  const [formCity, setFormCity] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formHomeArea, setFormHomeArea] = useState('');
  const [formServiceAreas, setFormServiceAreas] = useState<string[]>([]);
  const [formLat, setFormLat] = useState<string>('');
  const [formLng, setFormLng] = useState<string>('');

  // Schedule and credentials
  const [formSchedule, setFormSchedule] = useState('');
  const [formUnavailableDates, setFormUnavailableDates] = useState('');
  const [formCredentialStatus, setFormCredentialStatus] = useState<ProviderCredentialStatus>('verified');
  const [formStatus, setFormStatus] = useState<ProviderStatus>('active');
  const [formAgreedRate, setFormAgreedRate] = useState<number>(200);
  const [formEquipment, setFormEquipment] = useState<string>('');
  const [formInternalNotes, setFormInternalNotes] = useState('');

  const openAddModal = () => {
    setEditingProvider(null);
    setFormName('');
    setFormPhone('');
    setFormWhatsApp('');
    setFormEmail('');
    setFormType('nurse');
    setFormSpecialtyAr('');
    setFormSpecialtyEn('');
    setFormQualifiedServices(services.slice(0, 2).map((s) => s.id));
    setFormGovernorate('القاهرة');
    setFormCity('القاهرة');
    setFormDistrict('');
    setFormHomeArea('');
    setFormServiceAreas(areas.slice(0, 3).map((a) => a.id));
    setFormLat('');
    setFormLng('');
    setFormSchedule('يومياً (09:00 ص - 08:00 م)');
    setFormUnavailableDates('');
    setFormCredentialStatus('verified');
    setFormStatus('active');
    setFormAgreedRate(200);
    setFormEquipment('طقم فحص معقم، جهاز قياس الضغط والسكر');
    setFormInternalNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: ServiceProvider) => {
    setEditingProvider(p);
    setFormName(p.name);
    setFormPhone(p.phone);
    setFormWhatsApp(p.whatsapp || p.phone);
    setFormEmail(p.email || '');
    setFormType(p.providerType);
    setFormSpecialtyAr(p.specialtyAr);
    setFormSpecialtyEn(p.specialtyEn);
    setFormQualifiedServices(p.qualifiedServiceIds || []);
    setFormGovernorate(p.governorate || 'القاهرة');
    setFormCity(p.city || '');
    setFormDistrict(p.district || '');
    setFormHomeArea(p.homeArea || '');
    setFormServiceAreas(p.serviceAreaIds || []);
    setFormLat(p.coordinates ? String(p.coordinates.lat) : '');
    setFormLng(p.coordinates ? String(p.coordinates.lng) : '');
    setFormSchedule(p.availabilitySchedule);
    setFormUnavailableDates(p.unavailableDates ? p.unavailableDates.join(', ') : '');
    setFormCredentialStatus(p.credentialStatus);
    setFormStatus(p.status);
    setFormAgreedRate(p.agreedRate || 200);
    setFormEquipment((p.equipmentAvailable || []).join('، '));
    setFormInternalNotes(p.internalNotes || '');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const equipmentArr = formEquipment
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const unavailableDatesArr = formUnavailableDates
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);

    let parsedCoords: { lat: number; lng: number } | undefined = undefined;
    if (formLat && formLng && !isNaN(Number(formLat)) && !isNaN(Number(formLng))) {
      parsedCoords = {
        lat: Number(formLat),
        lng: Number(formLng),
      };
    }

    const providerData = {
      name: formName.trim(),
      phone: formPhone.trim(),
      whatsapp: formWhatsApp.trim() || formPhone.trim(),
      email: formEmail.trim() || undefined,
      providerType: formType,
      specialtyAr: formSpecialtyAr.trim(),
      specialtyEn: formSpecialtyEn.trim() || formSpecialtyAr.trim(),
      qualifiedServiceIds: formQualifiedServices,
      governorate: formGovernorate.trim() || undefined,
      city: formCity.trim() || undefined,
      district: formDistrict.trim() || undefined,
      homeArea: formHomeArea.trim() || undefined,
      serviceAreaIds: formServiceAreas,
      coordinates: parsedCoords,
      availabilitySchedule: formSchedule.trim(),
      unavailableDates: unavailableDatesArr.length > 0 ? unavailableDatesArr : undefined,
      credentialStatus: formCredentialStatus,
      status: formStatus,
      agreedRate: Number(formAgreedRate) || 0,
      equipmentAvailable: equipmentArr,
      internalNotes: formInternalNotes.trim() || undefined,
    };

    if (editingProvider) {
      await updateProvider(editingProvider.id, providerData);
    } else {
      await addProvider(providerData);
    }
    setIsAddModalOpen(false);
  };

  const toggleServiceSelection = (srvId: string) => {
    setFormQualifiedServices((prev) =>
      prev.includes(srvId) ? prev.filter((id) => id !== srvId) : [...prev, srvId]
    );
  };

  const toggleAreaSelection = (areaId: string) => {
    setFormServiceAreas((prev) =>
      prev.includes(areaId) ? prev.filter((id) => id !== areaId) : [...prev, areaId]
    );
  };

  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specialtyAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      (p.district && p.district.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.homeArea && p.homeArea.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || p.providerType === roleFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const nurseCount = providers.filter((p) => p.providerType === 'nurse').length;
  const labCount = providers.filter((p) => p.providerType === 'lab_technician' || p.providerType === 'imaging_technician').length;
  const activeCount = providers.filter((p) => p.status === 'active').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#70A69A] tracking-wider uppercase mb-1">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-amber-700 font-bold">{t('وحدة سرية خاصة بالإدارة فقط (Private & Restricted)', 'Restricted Owner Module')}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#153B36]">
            {t('الممرضون ومقدمو الخدمات (Nurses & Providers)', 'Nurses & Healthcare Providers')}
          </h1>
          <p className="text-xs text-[#153B36]/70 mt-1">
            {t(
              'إدارة ملفات الكادر التمريضي ومقدمي الخدمات، مؤهلات الخدمة، نطاق التغطية، والإحداثيات الجغرافية لمطابقة أقرب ممارس.',
              'Manage registered nurse roster, coverage zones, credentials, and geographic pins for nearest matching.'
            )}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-[#70A69A]" />
          <span>{t('إضافة ممرض / مقدم خدمة جديد', 'Add New Provider')}</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#153B36]/10 shadow-xs">
          <span className="text-xs text-[#153B36]/60 font-medium block">
            {t('إجمالي مقدمي الخدمات', 'Total Providers')}
          </span>
          <span className="text-2xl font-extrabold text-[#153B36] mt-1 block">
            {providers.length}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#153B36]/10 shadow-xs">
          <span className="text-xs text-[#153B36]/60 font-medium block">
            {t('كوادر التمريض المرخصة', 'Licensed Nurses')}
          </span>
          <span className="text-2xl font-extrabold text-[#153B36] mt-1 block">
            {nurseCount}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#153B36]/10 shadow-xs">
          <span className="text-xs text-[#153B36]/60 font-medium block">
            {t('فنيو المعامل والتشخيص', 'Lab & Diagnostics')}
          </span>
          <span className="text-2xl font-extrabold text-[#153B36] mt-1 block">
            {labCount}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#153B36]/10 shadow-xs">
          <span className="text-xs text-[#153B36]/60 font-medium block">
            {t('المتاحون للخدمة حالياً', 'Active Available')}
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
            {activeCount}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#153B36]/10 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute start-3 top-3 text-[#153B36]/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('البحث بالاسم أو التخصص أو الحي أو الهاتف...', 'Search name, specialty, district, phone...')}
            className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-[#F5F2EB]/40 focus:outline-hidden focus:ring-2 focus:ring-[#70A69A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-[#153B36]/50 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-[#153B36]/15 bg-white text-[#153B36]"
          >
            <option value="all">{t('كافة التخصصات', 'All Roles')}</option>
            <option value="nurse">{t('تمريض (Nurses)', 'Nurses')}</option>
            <option value="lab_technician">{t('فني معامل (Lab)', 'Lab Technicians')}</option>
            <option value="imaging_technician">{t('تخطيط قلب وفحوصات (ECG)', 'Diagnostics/ECG')}</option>
            <option value="doctor">{t('أطباء كشف منزلي (Doctors)', 'Doctors')}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-[#153B36]/15 bg-white text-[#153B36]"
          >
            <option value="all">{t('كافة الحالات', 'All Statuses')}</option>
            <option value="active">{t('نشط وجاهز للخدمة (Active)', 'Active')}</option>
            <option value="unavailable">{t('غير متاح مؤقتاً', 'Unavailable')}</option>
            <option value="under_review">{t('قيد المراجعة', 'Under Review')}</option>
            <option value="inactive">{t('معطل (Inactive)', 'Inactive')}</option>
          </select>
        </div>
      </div>

      {/* Provider Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.map((p) => {
          const areaNames = areas
            .filter((a) => p.serviceAreaIds.includes(a.id))
            .map((a) => (language === 'ar' ? a.nameAr : a.nameEn));

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-[#153B36]/10 p-5 shadow-xs space-y-4 hover:border-[#70A69A]/50 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-[#153B36]/50 block uppercase">
                      ID: {p.id}
                    </span>
                    <h3 className="text-base font-extrabold text-[#153B36]">{p.name}</h3>
                    <span className="text-xs text-[#70A69A] font-semibold block mt-0.5">
                      {language === 'ar' ? p.specialtyAr : p.specialtyEn}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                      p.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'unavailable'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {p.status === 'active'
                      ? t('نشط', 'Active')
                      : p.status === 'unavailable'
                      ? t('غير متاح', 'Unavailable')
                      : t('تحت المراجعة', 'Under Review')}
                  </span>
                </div>

                {/* Base Area & Coordinates */}
                <div className="p-2.5 rounded-xl bg-[#F5F2EB]/50 border border-[#153B36]/10 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#153B36] font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#70A69A] shrink-0" />
                    <span>{t('منطقة السكن / القاعدة:', 'Base Area:')} {p.homeArea || p.district || p.city || t('غير محدد', 'Not specified')}</span>
                  </div>
                  {p.coordinates && (
                    <div className="text-[10px] text-[#153B36]/60 font-mono ps-5">
                      {t('إحداثيات موثقة:', 'Verified Pin:')} {p.coordinates.lat.toFixed(4)}, {p.coordinates.lng.toFixed(4)}
                    </div>
                  )}
                </div>

                {/* Contact & Confidential Rate */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="text-[#153B36]/70">
                    <span className="block text-[10px] text-[#153B36]/50">{t('هاتف التواصل:', 'Contact Phone:')}</span>
                    <span className="font-mono font-bold text-[#153B36]" dir="ltr">{p.phone}</span>
                  </div>
                  <div className="text-[#153B36]/70">
                    <span className="block text-[10px] text-[#153B36]/50">{t('التكلفة المتفق عليها:', 'Internal Cost:')}</span>
                    <span className="font-mono font-bold text-emerald-700">{p.agreedRate} EGP</span>
                  </div>
                </div>

                {/* Coverage areas tags */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-[#153B36]/60 block">
                    {t('نطاق تغطية الزيارات:', 'Coverage Areas:')}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {areaNames.slice(0, 3).map((name, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#E7EFEA] text-[#153B36] font-medium"
                      >
                        {name}
                      </span>
                    ))}
                    {areaNames.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                        +{areaNames.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Schedule */}
                <div className="flex items-center gap-1.5 text-[11px] text-[#153B36]/70 pt-1">
                  <Clock className="w-3.5 h-3.5 text-[#70A69A] shrink-0" />
                  <span className="truncate">{p.availabilitySchedule}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-[#153B36]/10 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(p)}
                  className="px-3 py-1.5 rounded-lg border border-[#153B36]/15 hover:bg-[#153B36]/5 text-[#153B36] text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{t('تعديل', 'Edit')}</span>
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm(t('هل أنت متأكد من حذف هذا الممارس؟', 'Delete provider?'))) {
                      await deleteProvider(p.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                  title={t('حذف', 'Delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Provider Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-[#153B36]/10 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#153B36]/10">
              <h2 className="text-lg font-extrabold text-[#153B36]">
                {editingProvider
                  ? t('تعديل بيانات الممارس الصحي', 'Edit Provider Record')
                  : t('إضافة ممرض / مقدم خدمة جديد', 'Add New Provider')}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-[#153B36]/60 hover:text-[#153B36]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#153B36] block mb-1">
                    {t('اسم الممارس الكامل *', 'Full Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#153B36]/15 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#153B36] block mb-1">
                    {t('نوع الممارس *', 'Provider Type *')}
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ProviderRole)}
                    className="w-full px-3 py-2 rounded-xl border border-[#153B36]/15 bg-white font-medium"
                  >
                    <option value="nurse">{t('تمريض مرخص (Registered Nurse)', 'Nurse')}</option>
                    <option value="lab_technician">{t('فني سحب عينات معملية (Phlebotomist)', 'Lab Tech')}</option>
                    <option value="imaging_technician">{t('فني تخطيط قلب وفحوصات (ECG)', 'Diagnostics/ECG')}</option>
                    <option value="doctor">{t('طبيب زيارة منزلية (Doctor)', 'Doctor')}</option>
                    <option value="specialist">{t('أخصائي علاج طبيعي / استشاري', 'Specialist')}</option>
                  </select>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#153B36] block mb-1">
                    {t('رقم الهاتف الأساسي *', 'Phone *')}
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+20 100 000 0000"
                    className="w-full px-3 py-2 rounded-xl border border-[#153B36]/15 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#153B36] block mb-1">
                    {t('رقم الواتساب للتنسيق *', 'WhatsApp *')}
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={formWhatsApp}
                    onChange={(e) => setFormWhatsApp(e.target.value)}
                    placeholder="+20 100 000 0000"
                    className="w-full px-3 py-2 rounded-xl border border-[#153B36]/15 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#153B36] block mb-1">
                    {t('البريد الإلكتروني (اختياري)', 'Email')}
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#153B36]/15 bg-white"
                  />
                </div>
              </div>

              {/* Specialty & Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#153B36] block mb-1">
                    {t('التخصص الدقيق والمؤهلات السريرية *', 'Specialty (Ar) *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formSpecialtyAr}
                    onChange={(e) => setFormSpecialtyAr(e.target.value)}
                    placeholder="مثال: تمريض عناية جراحية، غيار قرح فراش، تركيب محاليل"
                    className="w-full px-3 py-2 rounded-xl border border-[#153B36]/15 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#153B36] block mb-1">
                    {t('التكلفة المتفق عليها داخلياً (ج.م) *', 'Agreed Rate (EGP) *')}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formAgreedRate}
                    onChange={(e) => setFormAgreedRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#153B36]/15 bg-white font-bold text-[#153B36]"
                  />
                </div>
              </div>

              {/* Location & Home Base (Governorate, City, District, Coordinates) */}
              <div className="p-3.5 rounded-2xl bg-[#F5F2EB]/60 border border-[#153B36]/10 space-y-3">
                <span className="font-bold text-[#153B36] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#70A69A]" />
                  <span>{t('موقع سكن الممارس وقاعدته الجغرافية', 'Provider Base Location & Coordinates')}</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-[#153B36] block mb-1">
                      {t('المحافظة', 'Governorate')}
                    </label>
                    <select
                      value={formGovernorate}
                      onChange={(e) => setFormGovernorate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#153B36]/15 bg-white"
                    >
                      <option value="القاهرة">القاهرة</option>
                      <option value="الجيزة">الجيزة</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-[#153B36] block mb-1">
                      {t('المدينة / المنطقة السكنية', 'City / District')}
                    </label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="مثال: المعادي، الشيخ زايد"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#153B36]/15 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#153B36] block mb-1">
                      {t('الحي / القاعدة المرجعية', 'District / Base Area')}
                    </label>
                    <input
                      type="text"
                      value={formHomeArea}
                      onChange={(e) => setFormHomeArea(e.target.value)}
                      placeholder="مثال: دجلة، الحي الثاني"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#153B36]/15 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#153B36] block mb-1">
                      {t('إحداثيات خط العرض (Latitude)', 'Latitude')}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                      placeholder="e.g. 29.9602"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#153B36]/15 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#153B36] block mb-1">
                      {t('إحداثيات خط الطول (Longitude)', 'Longitude')}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formLng}
                      onChange={(e) => setFormLng(e.target.value)}
                      placeholder="e.g. 31.2569"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#153B36]/15 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Credential Verification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#153B36] block mb-1">
                    {t('حالة التراخيص والتدقيق السريري', 'Credential Verification')}
                  </label>
                  <select
                    value={formCredentialStatus}
                    onChange={(e) => setFormCredentialStatus(e.target.value as ProviderCredentialStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-[#153B36]/15 bg-white"
                  >
                    <option value="verified">{t('مُدقق ومرخص رسمياً من وزارة الصحة (Verified)', 'Verified')}</option>
                    <option value="pending">{t('قيد المراجعة والتدقيق (Pending Review)', 'Pending Review')}</option>
                    <option value="rejected">{t('مرفوض أو غير مستوفٍ (Rejected)', 'Rejected')}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#153B36] block mb-1">
                    {t('حالة التوفر والنشاط للزيارات', 'Activity Status')}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ProviderStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-[#153B36]/15 bg-white"
                  >
                    <option value="active">{t('نشط وجاهز للزيارات (Active)', 'Active')}</option>
                    <option value="unavailable">{t('غير متاح مؤقتاً (Unavailable)', 'Unavailable')}</option>
                    <option value="under_review">{t('تحت التقييم والتدريب (Under Review)', 'Under Review')}</option>
                    <option value="inactive">{t('معطل (Inactive)', 'Inactive')}</option>
                  </select>
                </div>
              </div>

              {/* Qualified Services */}
              <div>
                <label className="font-bold text-[#153B36] block mb-1.5">
                  {t('الخدمات المرخص والمؤهل لتقديمها (Qualified Services)', 'Qualified Services')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 border border-[#153B36]/10 rounded-xl bg-[#F5F2EB]/30">
                  {services.map((srv) => (
                    <button
                      type="button"
                      key={srv.id}
                      onClick={() => toggleServiceSelection(srv.id)}
                      className={`text-[11px] p-2 rounded-lg text-start flex items-center gap-1.5 transition-colors ${
                        formQualifiedServices.includes(srv.id)
                          ? 'bg-[#153B36] text-[#F5F2EB] font-bold'
                          : 'bg-white text-[#153B36] border border-[#153B36]/10'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 ${
                          formQualifiedServices.includes(srv.id) ? 'text-[#70A69A]' : 'opacity-20'
                        }`}
                      />
                      <span className="truncate">{language === 'ar' ? srv.nameAr : srv.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Areas (Willing and able to cover) */}
              <div>
                <label className="font-bold text-[#153B36] block mb-1.5">
                  {t('المناطق المستعد والقادر على تغطيتها (Coverage Areas)', 'Coverage Areas')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-28 overflow-y-auto p-2 border border-[#153B36]/10 rounded-xl bg-[#F5F2EB]/30">
                  {areas.map((area) => (
                    <button
                      type="button"
                      key={area.id}
                      onClick={() => toggleAreaSelection(area.id)}
                      className={`text-[11px] p-2 rounded-lg text-start flex items-center gap-1.5 transition-colors ${
                        formServiceAreas.includes(area.id)
                          ? 'bg-[#153B36] text-[#F5F2EB] font-bold'
                          : 'bg-white text-[#153B36] border border-[#153B36]/10'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 ${
                          formServiceAreas.includes(area.id) ? 'text-[#70A69A]' : 'opacity-20'
                        }`}
                      />
                      <span className="truncate">{language === 'ar' ? area.nameAr : area.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule and Exceptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#153B36] block mb-1">
                    {t('جدول التوفر باليوم والوقت', 'Day & Time Availability')}
                  </label>
                  <input
                    type="text"
                    value={formSchedule}
                    onChange={(e) => setFormSchedule(e.target.value)}
                    placeholder="مثال: السبت إلى الخميس (08:00 ص - 08:00 م)"
                    className="w-full px-3 py-2 rounded-xl border border-[#153B36]/15 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#153B36] block mb-1">
                    {t('تواريخ الإجازات والاستثناءات غير المتاحة', 'Unavailable Dates / Exceptions')}
                  </label>
                  <input
                    type="text"
                    value={formUnavailableDates}
                    onChange={(e) => setFormUnavailableDates(e.target.value)}
                    placeholder="YYYY-MM-DD مفصولة بفاصلة"
                    className="w-full px-3 py-2 rounded-xl border border-[#153B36]/15 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Sterile equipment */}
              <div>
                <label className="font-bold text-[#153B36] block mb-1">
                  {t('المعدات والأدوات المعقمة المتوفرة بحوزته', 'Sterile Equipment Available')}
                </label>
                <input
                  type="text"
                  value={formEquipment}
                  onChange={(e) => setFormEquipment(e.target.value)}
                  placeholder="افصل بفاصلة: جهاز قياس ضغط، طقم غيار معقم، صندوق حفظ عينات حراري"
                  className="w-full px-3 py-2 rounded-xl border border-[#153B36]/15 bg-white"
                />
              </div>

              {/* Internal Notes */}
              <div>
                <label className="font-bold text-[#153B36] block mb-1">
                  {t('ملاحظات سرية للإدارة (Internal Restricted Notes)', 'Internal Restricted Notes')}
                </label>
                <textarea
                  rows={2}
                  value={formInternalNotes}
                  onChange={(e) => setFormInternalNotes(e.target.value)}
                  placeholder="ملاحظات سرية للمالك حول التقييمات، السجلات الطبية السابقة، والمتابعة..."
                  className="w-full px-3 py-2 rounded-xl border border-[#153B36]/15 bg-white"
                />
              </div>

              <div className="pt-4 border-t border-[#153B36]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-[#153B36] hover:bg-[#153B36]/5"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] font-bold shadow-xs"
                >
                  {editingProvider ? t('حفظ التعديلات', 'Save Changes') : t('إضافة الممارس', 'Add Provider')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
