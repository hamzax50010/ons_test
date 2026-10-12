import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Service, ServiceCategory, PrimaryServiceCategory, ServiceType, PriceBasis, ProviderRole } from '../../../types';
import {
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  FolderPlus,
  Image,
  DollarSign,
  Layers,
  Sparkles,
  Activity,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldAlert,
  Clock,
  Send,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';

export const ServicesTab: React.FC = () => {
  const {
    services,
    categories,
    areas,
    settings,
    addCategory,
    updateCategory,
    deleteCategory,
    addService,
    updateService,
    approveServicePrice,
    publishService,
    rejectServicePrice,
    toggleServiceActive,
    deleteService,
  } = useData();
  const { language, t } = useLanguage();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'nursing' | 'medical' | 'categories'>('all');

  // Service Edit / Create Modal state
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreatingService, setIsCreatingService] = useState<boolean>(false);
  const [editorTab, setEditorTab] = useState<'general' | 'clinical' | 'pricing' | 'inclusions'>('general');

  // Approval Modal state
  const [approvalModalService, setApprovalModalService] = useState<Service | null>(null);
  const [approvalMin, setApprovalMin] = useState<number>(300);
  const [approvalMax, setApprovalMax] = useState<number>(500);

  // Form State
  const [serviceFormData, setServiceFormData] = useState<Partial<Service>>({
    nameAr: '',
    nameEn: '',
    slug: '',
    categoryId: 'cat-nursing',
    categoryGroup: 'nursing',
    subcategory: '',
    summaryAr: '',
    summaryEn: '',
    descriptionAr: '',
    descriptionEn: '',
    instructionsAr: '',
    instructionsEn: '',
    requirementsAr: '',
    requirementsEn: '',
    serviceType: 'procedure',
    priceBasis: 'service_fee',
    draftPriceMin: 350,
    draftPriceMax: 600,
    approvedPriceMin: undefined,
    approvedPriceMax: undefined,
    basePriceMin: 350,
    basePriceMax: 600,
    providerCost: 200,
    labFee: 0,
    estimatedSupplyCost: 50,
    suppliesIncluded: 'requires_confirmation',
    transportationPolicyAr: 'رسوم الانتقال تُحدد بحسب المنطقة وتضاف على الفاتورة النهائية.',
    transportationPolicyEn: 'Transportation fee determined by area and itemized on quote.',
    isPriceIndicative: true,
    isPubliclyPublished: false,
    isPublicInquiryEnabled: true,
    priceNoteAr: '',
    priceNoteEn: '',
    providerType: 'nurse',
    requiredEquipment: ['طقم غيار معقم', 'قفازات طبية'],
    internalNotes: '',
    featured: false,
    active: true,
    order: 1,
    imageUrl: '',
    availableAreaIds: [],
  });

  // Category Edit / Create state
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);
  const [categoryFormData, setCategoryFormData] = useState<Partial<ServiceCategory>>({
    nameAr: '',
    nameEn: '',
    slug: '',
    categoryGroup: 'nursing',
    descriptionAr: '',
    descriptionEn: '',
    order: 1,
    active: true,
  });

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Open Create Service
  const handleOpenCreateService = (group: PrimaryServiceCategory = 'nursing') => {
    setIsCreatingService(true);
    setEditingService(null);
    setEditorTab('general');
    setServiceFormData({
      nameAr: '',
      nameEn: '',
      slug: `service-${Date.now()}`,
      categoryId: group === 'nursing' ? 'cat-nursing' : 'cat-medical',
      categoryGroup: group,
      subcategory: '',
      summaryAr: '',
      summaryEn: '',
      descriptionAr: '',
      descriptionEn: '',
      instructionsAr: '',
      instructionsEn: '',
      requirementsAr: '',
      requirementsEn: '',
      serviceType: group === 'nursing' ? 'procedure' : 'test',
      priceBasis: 'service_fee',
      draftPriceMin: 250,
      draftPriceMax: 450,
      basePriceMin: 250,
      basePriceMax: 450,
      providerCost: 150,
      nursePayout: 150,
      adminCommission: 100,
      labFee: 0,
      estimatedSupplyCost: 40,
      suppliesIncluded: 'requires_confirmation',
      transportationPolicyAr: 'رسوم الانتقال تُحدد بحسب المنطقة.',
      transportationPolicyEn: 'Travel fee calculated by neighborhood zone.',
      isPriceIndicative: true,
      isPubliclyPublished: false,
      isPublicInquiryEnabled: true,
      pricingStatus: 'draft',
      providerType: group === 'nursing' ? 'nurse' : 'lab_technician',
      requiredEquipment: [],
      internalNotes: '',
      featured: false,
      active: true,
      order: services.length + 1,
      imageUrl: '',
      availableAreaIds: areas.map((a) => a.id),
    });
  };

  // Open Edit Service
  const handleOpenEditService = (srv: Service) => {
    setEditingService(srv);
    setIsCreatingService(false);
    setEditorTab('general');
    setServiceFormData({
      ...srv,
      draftPriceMin: srv.draftPriceMin || srv.basePriceMin || 300,
      draftPriceMax: srv.draftPriceMax || srv.basePriceMax || 600,
      providerCost: srv.nursePayout ?? srv.providerCost ?? 150,
      nursePayout: srv.nursePayout ?? srv.providerCost ?? 150,
      adminCommission:
        srv.adminCommission ??
        Math.max(
          0,
          (srv.approvedPriceMin || srv.draftPriceMin || 300) -
            (srv.nursePayout ?? srv.providerCost ?? 150)
        ),
      categoryGroup: srv.categoryGroup || (srv.categoryId.includes('medical') || srv.categoryId.includes('labs') ? 'medical' : 'nursing'),
    });
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.nameAr?.trim()) {
      setFeedbackMsg({ type: 'error', text: 'يرجى إدخال اسم الخدمة بالعربية.' });
      return;
    }

    try {
      if (editingService) {
        await updateService(editingService.id, serviceFormData);
        setFeedbackMsg({ type: 'success', text: 'تم تحديث بيانات الخدمة بنجاح.' });
      } else {
        await addService(serviceFormData as Omit<Service, 'id'>);
        setFeedbackMsg({ type: 'success', text: 'تم إنشاء الخدمة الجديدة كمسودة بنجاح.' });
      }
      setEditingService(null);
      setIsCreatingService(false);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'حدث خطأ أثناء حفظ الخدمة.' });
    }
  };

  // Quick Approval Handler
  const openApprovalModal = (srv: Service) => {
    setApprovalModalService(srv);
    setApprovalMin(srv.approvedPriceMin || srv.draftPriceMin || 300);
    setApprovalMax(srv.approvedPriceMax || srv.draftPriceMax || 500);
  };

  const handleConfirmApproval = async () => {
    if (!approvalModalService) return;
    await approveServicePrice(approvalModalService.id, approvalMin, approvalMax);
    setFeedbackMsg({
      type: 'success',
      text: `تم اعتماد السعر الداخلي (${approvalMin} - ${approvalMax} ج.م) بنجاح. تظل الخدمة غير منشورة للجمهور حتى يتم النشر يدوياً.`,
    });
    setApprovalModalService(null);
  };

  const handleTogglePublish = async (srv: Service) => {
    const nextPublished = !srv.isPubliclyPublished;
    await publishService(srv.id, nextPublished, srv.isBookingEnabled ?? true);
    setFeedbackMsg({
      type: 'success',
      text: nextPublished
        ? `تم نشر السعر والخدمة (${srv.nameAr}) على الموقع للجمهور.`
        : `تم إلغاء نشر الخدمة (${srv.nameAr}) وإعادتها للعرض الداخلي فقط.`,
    });
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الخدمة نهائياً؟')) return;
    const res = await deleteService(id);
    if (!res.success) {
      setFeedbackMsg({ type: 'error', text: res.reason || 'تعذر حذف الخدمة.' });
    } else {
      setFeedbackMsg({ type: 'success', text: 'تم حذف الخدمة بنجاح.' });
    }
  };

  // Category handlers
  const handleOpenCreateCategory = () => {
    setIsCreatingCategory(true);
    setEditingCategory(null);
    setCategoryFormData({
      nameAr: '',
      nameEn: '',
      slug: `cat-${Date.now()}`,
      categoryGroup: 'nursing',
      descriptionAr: '',
      descriptionEn: '',
      order: categories.length + 1,
      active: true,
    });
  };

  const handleOpenEditCategory = (cat: ServiceCategory) => {
    setEditingCategory(cat);
    setIsCreatingCategory(false);
    setCategoryFormData(cat);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.nameAr?.trim()) {
      setFeedbackMsg({ type: 'error', text: 'يرجى كتابة اسم التصنيف بالعربية.' });
      return;
    }
    if (editingCategory) {
      await updateCategory(editingCategory.id, categoryFormData);
      setFeedbackMsg({ type: 'success', text: 'تم تحديث التصنيف بنجاح.' });
    } else {
      await addCategory(categoryFormData as Omit<ServiceCategory, 'id'>);
      setFeedbackMsg({ type: 'success', text: 'تم إنشاء التصنيف الجديد بنجاح.' });
    }
    setEditingCategory(null);
    setIsCreatingCategory(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    const res = await deleteCategory(id);
    if (!res.success) {
      setFeedbackMsg({ type: 'error', text: res.reason || 'تعذر حذف التصنيف.' });
    } else {
      setFeedbackMsg({ type: 'success', text: 'تم حذف التصنيف بنجاح.' });
    }
  };

  // Filtered Services
  const nursingServices = services.filter(
    (s) => s.categoryGroup === 'nursing' || s.categoryId.includes('nursing') || s.categoryId.includes('elderly')
  );
  const medicalServices = services.filter(
    (s) => s.categoryGroup === 'medical' || s.categoryId.includes('medical') || s.categoryId.includes('labs') || s.categoryId.includes('diagnostics') || s.categoryId.includes('doctor')
  );

  const displayedServices =
    activeCategoryFilter === 'nursing'
      ? nursingServices
      : activeCategoryFilter === 'medical'
      ? medicalServices
      : services;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#70A69A] tracking-wider uppercase mb-1">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{t('دليل الخدمات واعتماد الأسعار', 'Clinical Services & Pricing Architecture')}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#153B36]">
            {t('كتالوج الخدمات والرعاية الطبية', 'Healthcare Services & Pricing Manager')}
          </h1>
          <p className="text-xs text-[#153B36]/70 mt-1">
            {t(
              'تصنيف الخدمات إلى (خدمات تمريضية) و(خدمات طبية)، مع فصل اعتماد الأسعار عن نشرها للجمهور.',
              'Categorized into Nursing & Medical Services with strict price approval & publication separation.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCreateService('nursing')}
            className="px-3.5 py-2.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#70A69A]" />
            <span>{t('+ خدمة تمريضية', '+ Nursing Service')}</span>
          </button>
          <button
            onClick={() => handleOpenCreateService('medical')}
            className="px-3.5 py-2.5 rounded-xl bg-[#70A69A] hover:bg-[#70A69A]/90 text-[#153B36] text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#153B36]" />
            <span>{t('+ خدمة طبية / تشخيصية', '+ Medical Service')}</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Category Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#153B36]/10 pb-3">
        <button
          onClick={() => setActiveCategoryFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeCategoryFilter === 'all'
              ? 'bg-[#153B36] text-[#F5F2EB]'
              : 'text-[#153B36]/70 hover:bg-[#153B36]/5'
          }`}
        >
          {t('كافة الخدمات', 'All Services')} ({services.length})
        </button>

        <button
          onClick={() => setActiveCategoryFilter('nursing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeCategoryFilter === 'nursing'
              ? 'bg-[#153B36] text-[#F5F2EB]'
              : 'text-[#153B36]/70 hover:bg-[#153B36]/5'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-[#70A69A]" />
          <span>{t('الخدمات التمريضية (Category A)', 'Nursing Services')}</span> ({nursingServices.length})
        </button>

        <button
          onClick={() => setActiveCategoryFilter('medical')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeCategoryFilter === 'medical'
              ? 'bg-[#153B36] text-[#F5F2EB]'
              : 'text-[#153B36]/70 hover:bg-[#153B36]/5'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-[#70A69A]" />
          <span>{t('الخدمات الطبية والتشخيصية (Category B)', 'Medical Services')}</span> ({medicalServices.length})
        </button>

        <button
          onClick={() => setActiveCategoryFilter('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeCategoryFilter === 'categories'
              ? 'bg-[#153B36] text-[#F5F2EB]'
              : 'text-[#153B36]/70 hover:bg-[#153B36]/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t('إدارة التصنيفات', 'Categories Manager')}</span> ({categories.length})
        </button>
      </div>

      {/* Services Table View */}
      {activeCategoryFilter !== 'categories' && (
        <div className="bg-white rounded-3xl border border-[#153B36]/10 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-xs text-start">
              <thead>
                <tr className="bg-[#F5F2EB]/50 border-b border-[#153B36]/10 text-[#153B36]/70">
                  <th className="py-3.5 px-4 text-start font-bold">{t('الخدمة والرمز', 'Service')}</th>
                  <th className="py-3.5 px-4 text-start font-bold">{t('التصنيف الأساسي', 'Category')}</th>
                  <th className="py-3.5 px-4 text-start font-bold">{t('السعر المسودة vs المعتمد', 'Draft vs Approved')}</th>
                  <th className="py-3.5 px-4 text-center font-bold">{t('حالة الاعتماد', 'Approval')}</th>
                  <th className="py-3.5 px-4 text-center font-bold">{t('النشر للجمهور', 'Published')}</th>
                  <th className="py-3.5 px-4 text-end font-bold">{t('إجراءات التحكم', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#153B36]/5">
                {displayedServices.map((srv) => {
                  const isNursing = srv.categoryGroup === 'nursing' || srv.categoryId.includes('nursing');
                  const isApproved = srv.pricingStatus === 'approved' || srv.pricingStatus === 'published';
                  const isPublished = srv.isPubliclyPublished === true;

                  return (
                    <tr key={srv.id} className="hover:bg-[#F5F2EB]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#153B36]">{srv.nameAr}</div>
                        <div className="text-[11px] text-[#153B36]/60">{srv.nameEn}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isNursing
                              ? 'bg-teal-50 text-teal-800 border border-teal-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isNursing ? (
                            <>
                              <Activity className="w-3 h-3 text-teal-600" />
                              <span>{t('تمريضية (Nursing)', 'Nursing')}</span>
                            </>
                          ) : (
                            <>
                              <Stethoscope className="w-3 h-3 text-emerald-600" />
                              <span>{t('طبية (Medical)', 'Medical')}</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-[#153B36]">
                          {srv.approvedPriceMin && srv.approvedPriceMax ? (
                            <span className="text-emerald-700 font-extrabold">
                              {srv.approvedPriceMin} - {srv.approvedPriceMax} EGP
                            </span>
                          ) : (
                            <span className="text-amber-800">
                              {srv.draftPriceMin || srv.basePriceMin} - {srv.draftPriceMax || srv.basePriceMax} EGP
                              <span className="text-[10px] font-normal text-amber-600 block">
                                ({t('مسودة غير معتمدة', 'Draft Only')})
                              </span>
                            </span>
                          )}
                        </div>
                        {/* Internal Financial In/Out Margin */}
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold">
                          <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {t('للممرض:', 'Nurse:')} {srv.nursePayout ?? srv.providerCost ?? 0} EGP
                          </span>
                          <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                            {t('صافي ربحك:', 'Net:')}{' '}
                            {srv.adminCommission ??
                              Math.max(
                                0,
                                (srv.approvedPriceMin || srv.draftPriceMin || 0) -
                                  (srv.nursePayout ?? srv.providerCost ?? 0)
                              )}{' '}
                            EGP
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : srv.pricingStatus === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isApproved
                            ? t('معتمد داخلياً', 'Approved')
                            : srv.pricingStatus === 'rejected'
                            ? t('مرفوض', 'Rejected')
                            : t('قيد المراجعة', 'Under Review')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleTogglePublish(srv)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            isPublished
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                          }`}
                          title={
                            isPublished
                              ? t('منشور للجمهور - انقر لإخفائه', 'Published - Click to hide')
                              : t('غير منشور للجمهور - انقر للنشر', 'Unpublished - Click to publish')
                          }
                        >
                          {isPublished ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>{t('منشور', 'Live')}</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>{t('مخفي', 'Hidden')}</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve Price Button */}
                          <button
                            onClick={() => openApprovalModal(srv)}
                            className="p-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title={t('اعتماد السعر داخلياً', 'Approve Price')}
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEditService(srv)}
                            className="p-1.5 rounded-lg border border-[#153B36]/20 text-[#153B36] hover:bg-[#153B36]/5 transition-colors"
                            title={t('تعديل كامل', 'Edit')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                            title={t('حذف', 'Delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories View */}
      {activeCategoryFilter === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleOpenCreateCategory}
              className="px-4 py-2 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-xs font-bold flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4 text-[#70A69A]" />
              <span>{t('إضافة تصنيف جديد', 'Add Category')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl p-5 border border-[#153B36]/10 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#70A69A]">
                      {cat.categoryGroup === 'nursing' ? t('خدمات تمريضية', 'Nursing') : t('خدمات طبية', 'Medical')}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        cat.active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {cat.active ? t('نشط', 'Active') : t('معطل', 'Inactive')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#153B36]">
                    {language === 'ar' ? cat.nameAr : cat.nameEn}
                  </h3>
                  <p className="text-xs text-[#153B36]/70 leading-relaxed line-clamp-2">
                    {language === 'ar' ? cat.descriptionAr : cat.descriptionEn}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#153B36]/10 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditCategory(cat)}
                    className="p-1.5 rounded-lg border border-[#153B36]/20 text-[#153B36] hover:bg-[#153B36]/5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {approvalModalService && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#153B36]/10">
              <div>
                <h3 className="text-base font-bold text-[#153B36]">
                  {t('اعتماد السعر الداخلي للخدمة', 'Approve Internal Price')}
                </h3>
                <span className="text-xs text-[#70A69A] font-medium block mt-0.5">
                  {approvalModalService.nameAr}
                </span>
              </div>
              <button
                onClick={() => setApprovalModalService(null)}
                className="p-1 text-[#153B36]/50 hover:text-[#153B36]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#153B36]/80 leading-relaxed">
              {t(
                'تنبيه نظام التسعير: اعتماد السعر هو إجراء داخلي فقط، ولن يتم نشره على الموقع للجمهور إلا إذا اخترت صراحةً نشر الخدمة.',
                'Approval is internal only and will NOT expose prices to the public unless explicitly published.'
              )}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#153B36] block mb-1">
                  {t('الحد الأدنى المعتمد (ج.م) *', 'Min Approved (EGP) *')}
                </label>
                <input
                  type="number"
                  required
                  value={approvalMin}
                  onChange={(e) => setApprovalMin(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#153B36] block mb-1">
                  {t('الحد الأقصى المعتمد (ج.م) *', 'Max Approved (EGP) *')}
                </label>
                <input
                  type="number"
                  required
                  value={approvalMax}
                  onChange={(e) => setApprovalMax(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white font-bold"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#153B36]/10 flex items-center justify-end gap-2">
              <button
                onClick={() => setApprovalModalService(null)}
                className="px-4 py-2 text-xs font-semibold text-[#153B36] hover:bg-[#153B36]/5 rounded-xl"
              >
                {t('إلغاء', 'Cancel')}
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{t('تأكيد الاعتماد الداخلي', 'Confirm Approval')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Service Editor Modal */}
      {(isCreatingService || editingService) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#153B36]/10">
              <div>
                <h2 className="text-lg font-bold text-[#153B36]">
                  {editingService
                    ? t('تعديل الخدمة الطبية / التمريضية', 'Edit Healthcare Service')
                    : t('إضافة خدمة جديدة', 'Create Healthcare Service')}
                </h2>
                <span className="text-xs text-[#70A69A]">
                  {t('هيكلية الرعاية الطبية وإدارة التسعير المعتمد', 'Clinical care & pricing architecture')}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsCreatingService(false);
                  setEditingService(null);
                }}
                className="p-1.5 rounded-lg text-[#153B36]/60 hover:text-[#153B36]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Editor Tabs */}
            <div className="flex items-center gap-2 border-b border-[#153B36]/10 pb-2">
              <button
                type="button"
                onClick={() => setEditorTab('general')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  editorTab === 'general' ? 'bg-[#153B36] text-[#F5F2EB]' : 'text-[#153B36]/70'
                }`}
              >
                {t('البيانات الأساسية والتصنيف', 'General & Category')}
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('clinical')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  editorTab === 'clinical' ? 'bg-[#153B36] text-[#F5F2EB]' : 'text-[#153B36]/70'
                }`}
              >
                {t('المتطلبات والممارس والمعدات', 'Clinician & Equipment')}
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('pricing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  editorTab === 'pricing' ? 'bg-[#153B36] text-[#F5F2EB]' : 'text-[#153B36]/70'
                }`}
              >
                {t('هيكلية التسعير والمستلزمات', 'Pricing & Supplies')}
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('inclusions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  editorTab === 'inclusions' ? 'bg-[#153B36] text-[#F5F2EB]' : 'text-[#153B36]/70'
                }`}
              >
                {t('المشمول والتعليمات والملاحظات', 'Instructions & Notes')}
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              {editorTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#153B36] block mb-1">
                        {t('التصنيف الأساسي (Primary Category) *', 'Primary Category *')}
                      </label>
                      <select
                        value={serviceFormData.categoryGroup}
                        onChange={(e) =>
                          setServiceFormData({
                            ...serviceFormData,
                            categoryGroup: e.target.value as PrimaryServiceCategory,
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white font-bold"
                      >
                        <option value="nursing">{t('الخدمات التمريضية (Category A: Nursing)', 'Nursing Services')}</option>
                        <option value="medical">{t('الخدمات الطبية والتشخيصية (Category B: Medical)', 'Medical Services')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#153B36] block mb-1">
                        {t('نوع الخدمة (Service Type) *', 'Service Type *')}
                      </label>
                      <select
                        value={serviceFormData.serviceType}
                        onChange={(e) =>
                          setServiceFormData({
                            ...serviceFormData,
                            serviceType: e.target.value as ServiceType,
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                      >
                        <option value="procedure">{t('إجراء سريري محدد (Procedure)', 'Procedure')}</option>
                        <option value="single_visit">{t('زيارة واحدة (Single Visit)', 'Single Visit')}</option>
                        <option value="diagnostic_procedure">{t('فحص تشخيصي (Diagnostic)', 'Diagnostic')}</option>
                        <option value="test">{t('تحليل معملي / سحب عينات (Test)', 'Test')}</option>
                        <option value="multi_visit_package">{t('باقة زيارات متعددة (Package)', 'Package')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#153B36] block mb-1">
                        {t('اسم الخدمة (عربي) *', 'Service Name (Arabic) *')}
                      </label>
                      <input
                        type="text"
                        required
                        value={serviceFormData.nameAr}
                        onChange={(e) => setServiceFormData({ ...serviceFormData, nameAr: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#153B36] block mb-1">
                        {t('اسم الخدمة (EN) *', 'Service Name (English) *')}
                      </label>
                      <input
                        type="text"
                        required
                        value={serviceFormData.nameEn}
                        onChange={(e) => setServiceFormData({ ...serviceFormData, nameEn: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#153B36] block mb-1">
                      {t('ملخص موجز للبطاقة (عربي)', 'Brief Summary (Arabic)')}
                    </label>
                    <textarea
                      rows={2}
                      value={serviceFormData.summaryAr}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, summaryAr: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#153B36] block mb-1">
                      {t('رابط الصورة التوضيحية (اختياري)', 'Image URL (Optional)')}
                    </label>
                    <input
                      type="url"
                      value={serviceFormData.imageUrl}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                    />
                  </div>
                </div>
              )}

              {editorTab === 'clinical' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#153B36] block mb-1">
                        {t('نوع الممارس المطلوب للخدمة', 'Provider Role Required')}
                      </label>
                      <select
                        value={serviceFormData.providerType}
                        onChange={(e) =>
                          setServiceFormData({
                            ...serviceFormData,
                            providerType: e.target.value as ProviderRole,
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                      >
                        <option value="nurse">{t('أخصائي تمريض مرخص (Nurse)', 'Nurse')}</option>
                        <option value="lab_technician">{t('فني سحب عينات معملية (Lab Tech)', 'Lab Tech')}</option>
                        <option value="imaging_technician">{t('أخصائي أجهزة وتشخيص (Diagnostics)', 'Diagnostics')}</option>
                        <option value="doctor">{t('طبيب استشاري / باطنة (Doctor)', 'Doctor')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#153B36] block mb-1">
                        {t('المؤهلات والشروط المطلوبة', 'Required Qualifications')}
                      </label>
                      <input
                        type="text"
                        value={serviceFormData.requiredQualifications || ''}
                        onChange={(e) =>
                          setServiceFormData({
                            ...serviceFormData,
                            requiredQualifications: e.target.value,
                          })
                        }
                        placeholder="مثال: بكالوريوس تمريض + ترخيص مزاولة مهنة سارٍ"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#153B36] block mb-1">
                      {t('المعدات والأدوات المعقمة اللازمة للإجراء', 'Required Sterile Equipment')}
                    </label>
                    <input
                      type="text"
                      value={(serviceFormData.requiredEquipment || []).join('، ')}
                      onChange={(e) =>
                        setServiceFormData({
                          ...serviceFormData,
                          requiredEquipment: e.target.value.split(/[,،]/).map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      placeholder="افصل بفاصلة: طقم غيار معقم، شاش فازلين، محاليل تطهير"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                    />
                  </div>
                </div>
              )}

              {editorTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        {t('قاعدة الأمان: الأسعار المسودة سرية ولا تُنشر للجمهور تلقائياً', 'Draft prices are never published automatically')}
                      </span>
                      <span>
                        {t(
                          'يظل السعر غير منشور حتى يقوم المالك باعتماده وتفعيل خيار النشر صراحةً.',
                          'Prices remain hidden until explicitly approved and published by the owner.'
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#153B36] block mb-1">
                        {t('الحد الأدنى المسودة (ج.م) *', 'Draft Min Price *')}
                      </label>
                      <input
                        type="number"
                        required
                        value={serviceFormData.draftPriceMin}
                        onChange={(e) =>
                          setServiceFormData({
                            ...serviceFormData,
                            draftPriceMin: Number(e.target.value),
                            basePriceMin: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#153B36] block mb-1">
                        {t('الحد الأقصى المسودة (ج.م) *', 'Draft Max Price *')}
                      </label>
                      <input
                        type="number"
                        required
                        value={serviceFormData.draftPriceMax}
                        onChange={(e) =>
                          setServiceFormData({
                            ...serviceFormData,
                            draftPriceMax: Number(e.target.value),
                            basePriceMax: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#153B36] block mb-1">
                        {t('تكلفة الممارس (سري) *', 'Provider Cost (Secret) *')}
                      </label>
                      <input
                        type="number"
                        value={serviceFormData.providerCost}
                        onChange={(e) =>
                          setServiceFormData({
                            ...serviceFormData,
                            providerCost: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#153B36] block mb-1">
                        {t('رسوم معمل / طرف ثالث', 'Lab / Third Party Fee')}
                      </label>
                      <input
                        type="number"
                        value={serviceFormData.labFee}
                        onChange={(e) =>
                          setServiceFormData({
                            ...serviceFormData,
                            labFee: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                      />
                    </div>
                  </div>

                  {/* Financial In/Out & Margin Breakdown (Owner Only) */}
                  <div className="p-4 rounded-2xl bg-[#153B36] text-[#F5F2EB] space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#70A69A]/30 pb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#70A69A]" />
                        <span className="text-xs font-bold text-[#F5F2EB]">
                          {t('تحديد الوارد والخارج وأتعاب الممرض (سري للمالك فقط - لا يظهر للعملاء)', 'Provider Payout & Owner Margin (Secret - Not Public)')}
                        </span>
                      </div>
                      <span className="text-[10px] bg-[#70A69A]/20 text-[#70A69A] px-2 py-0.5 rounded-full font-bold">
                        {t('حسابات الأرباح', 'Financial Accounts')}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#F5F2EB]/75 leading-relaxed">
                      {t(
                        'حدد هنا المبلغ الثابت المتفق عليه للممرض، والمبلغ الصافي الذي يتبقى للمركز، لتجنب تفاوت الأسعار بين الممرضين ولمعرفة إجمالي الوارد والخارج بدقة.',
                        'Set the unified provider payout and the owner net margin to ensure unified compensation across staff.'
                      )}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-xs font-bold text-[#70A69A] block mb-1">
                          {t('أتعاب الممرض المتفق عليها (ما يستلمه الممرض) - ج.م *', 'Nurse / Provider Payout (EGP) *')}
                        </label>
                        <input
                          type="number"
                          value={serviceFormData.nursePayout ?? serviceFormData.providerCost ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const customerPrice = serviceFormData.approvedPriceMin || serviceFormData.draftPriceMin || 0;
                            const margin = customerPrice > val ? customerPrice - val : 0;
                            setServiceFormData({
                              ...serviceFormData,
                              nursePayout: val,
                              providerCost: val,
                              adminCommission: margin,
                            });
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-white/20 bg-white/10 text-white font-mono font-bold focus:outline-hidden focus:border-[#70A69A]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-[#70A69A] block mb-1">
                          {t('صافي أرباح المركز / دخل الإدارة المتبقي - ج.م *', 'Owner Net Margin (EGP) *')}
                        </label>
                        <input
                          type="number"
                          value={serviceFormData.adminCommission ?? 0}
                          onChange={(e) =>
                            setServiceFormData({
                              ...serviceFormData,
                              adminCommission: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 text-xs rounded-xl border border-white/20 bg-white/10 text-white font-mono font-bold focus:outline-hidden focus:border-[#70A69A]"
                        />
                      </div>
                    </div>

                    {/* Quick Live Profit Indicator */}
                    <div className="p-3 rounded-xl bg-white/10 flex items-center justify-between text-xs">
                      <div className="text-[11px] text-[#F5F2EB]/80">
                        <span>{t('الوارد من العميل:', 'From Client:')} </span>
                        <strong className="text-white font-mono">
                          {serviceFormData.approvedPriceMin || serviceFormData.draftPriceMin || 0} ج.م
                        </strong>
                        <span className="mx-2">|</span>
                        <span>{t('الخارج للممرض:', 'To Nurse:')} </span>
                        <strong className="text-amber-300 font-mono">
                          {serviceFormData.nursePayout ?? serviceFormData.providerCost ?? 0} ج.م
                        </strong>
                      </div>
                      <div className="text-end">
                        <span className="text-[10px] text-[#70A69A] block font-bold">{t('صافي ربحك:', 'Net Profit:')}</span>
                        <span className="font-mono font-extrabold text-emerald-400 text-sm">
                          {serviceFormData.adminCommission ??
                            Math.max(
                              0,
                              (serviceFormData.approvedPriceMin || serviceFormData.draftPriceMin || 0) -
                                (serviceFormData.nursePayout ?? serviceFormData.providerCost ?? 0)
                            )}{' '}
                          ج.م
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#153B36] block mb-1">
                        {t('هل المستلزمات الطبية مشمولة في السعر؟', 'Are Medical Supplies Included?')}
                      </label>
                      <select
                        value={serviceFormData.suppliesIncluded}
                        onChange={(e) =>
                          setServiceFormData({
                            ...serviceFormData,
                            suppliesIncluded: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                      >
                        <option value="requires_confirmation">
                          {t('تتطلب تأكيداً حسب عمق الحالة (Requires Confirmation)', 'Requires Confirmation')}
                        </option>
                        <option value="yes">{t('مشمولة بالكامل (Included)', 'Included')}</option>
                        <option value="no">{t('غير مشمولة وتُحسب منفصلة (Excluded)', 'Excluded')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#153B36] block mb-1">
                        {t('تكلفة المستلزمات التقديرية (ج.م)', 'Estimated Supply Cost')}
                      </label>
                      <input
                        type="number"
                        value={serviceFormData.estimatedSupplyCost}
                        onChange={(e) =>
                          setServiceFormData({
                            ...serviceFormData,
                            estimatedSupplyCost: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#E7EFEA] border border-[#70A69A]/30 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serviceFormData.isPublicInquiryEnabled}
                        onChange={(e) =>
                          setServiceFormData({
                            ...serviceFormData,
                            isPublicInquiryEnabled: e.target.checked,
                          })
                        }
                        className="rounded text-[#153B36]"
                      />
                      <span className="text-xs font-bold text-[#153B36]">
                        {t(
                          'تفعيل استقبال الطلبات للخدمة (يظهر للجمهور رسالة: "السعر يُحدد بعد مراجعة تفاصيل الطلب" إذا لم يُنشر السعر صراحةً)',
                          'Enable public inquiries (Displays "Price determined after order review" if unpublished)'
                        )}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {editorTab === 'inclusions' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#153B36] block mb-1">
                      {t('تعليمات وتحضيرات المريض قبل الزيارة (عربي)', 'Preparation Instructions (Arabic)')}
                    </label>
                    <textarea
                      rows={2}
                      value={serviceFormData.instructionsAr}
                      onChange={(e) =>
                        setServiceFormData({ ...serviceFormData, instructionsAr: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#153B36] block mb-1">
                      {t('ملاحظات داخلية سرية (Internal Notes - Never Public)', 'Internal Notes')}
                    </label>
                    <textarea
                      rows={2}
                      value={serviceFormData.internalNotes}
                      onChange={(e) =>
                        setServiceFormData({ ...serviceFormData, internalNotes: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#153B36]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingService(false);
                    setEditingService(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#153B36] hover:bg-[#153B36]/5 rounded-xl"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-xs font-bold shadow-xs"
                >
                  {editingService ? t('حفظ التعديلات', 'Save Changes') : t('إنشاء الخدمة', 'Create Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Create/Edit Modal */}
      {(isCreatingCategory || editingCategory) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#153B36]/10">
              <h2 className="text-base font-bold text-[#153B36]">
                {editingCategory ? t('تعديل التصنيف', 'Edit Category') : t('إضافة تصنيف جديد', 'Add Category')}
              </h2>
              <button
                onClick={() => {
                  setIsCreatingCategory(false);
                  setEditingCategory(null);
                }}
                className="p-1 text-[#153B36]/50 hover:text-[#153B36]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#153B36] block mb-1">
                  {t('المجموعة الأساسية *', 'Primary Category Group *')}
                </label>
                <select
                  value={categoryFormData.categoryGroup}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      categoryGroup: e.target.value as PrimaryServiceCategory,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white font-bold"
                >
                  <option value="nursing">{t('الخدمات التمريضية (Nursing)', 'Nursing')}</option>
                  <option value="medical">{t('الخدمات الطبية (Medical)', 'Medical')}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#153B36] block mb-1">
                  {t('اسم التصنيف (عربي) *', 'Category Name (Ar) *')}
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.nameAr}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, nameAr: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#153B36] block mb-1">
                  {t('اسم التصنيف (EN) *', 'Category Name (En) *')}
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.nameEn}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, nameEn: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#153B36] block mb-1">
                  {t('الوصف الموجز', 'Description')}
                </label>
                <textarea
                  rows={2}
                  value={categoryFormData.descriptionAr}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, descriptionAr: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#153B36]/15 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-[#153B36]/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCategory(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#153B36] hover:bg-[#153B36]/5 rounded-xl"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#153B36] hover:bg-[#0D2622] text-[#F5F2EB] text-xs font-bold shadow-xs"
                >
                  {editingCategory ? t('حفظ', 'Save') : t('إضافة', 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
