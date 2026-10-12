import { CustomerRequest, ServiceArea } from '../types';

/**
 * Builds standard WhatsApp deep links and handles message dispatch
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  // Normalize Egyptian or international numbers
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('01')) {
    cleaned = '20' + cleaned;
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates immediate notification message for the business owner
 */
export function generateOwnerNotificationMessage(order: CustomerRequest, area?: ServiceArea): string {
  const serviceList = order.selectedServices && order.selectedServices.length > 0
    ? order.selectedServices.map(s => s.nameAr).join(' + ')
    : order.serviceNameAr;

  return `🔔 *إشعار طلب رعاية جديد في أُنس (ONS)*
-----------------------------------
📋 *رقم الطلب:* #${order.id}
👤 *العميل / المريض:* ${order.customerName}
📞 *هاتف الاتصال:* ${order.phone}
💬 *رقم الواتساب:* ${order.whatsapp || order.phone}
🩺 *الخدمات المطلوبة:* ${serviceList}
📍 *المنطقة:* ${order.areaNameAr}
🏢 *العنوان:* ${order.addressDetails}
📅 *الموعد المطلوب:* ${order.preferredDate || 'في أقرب وقت'} (${order.preferredTimeSlot || 'مرن'})
💳 *رسوم الانتقال:* ${order.travelFee || 0} ج.م
📝 *ملاحظات:* ${order.notes || 'لا يوجد'}
🔒 *الموافقة على الشروط:* نعم
${order.identityDocumentUrl ? `📎 *مرفق إثبات الهوية:* متوفر ومحفوظ بأمان` : ''}
-----------------------------------
يرجى فتح لوحة التحكم لترشيح أقرب ممارس صحي واعتماد عرض السعر.`;
}

/**
 * Generates subsequent confirmation message for the customer
 */
export function generateCustomerConfirmationMessage(order: CustomerRequest): string {
  return `أهلاً بك أستاذ/ة ${order.customerName}،
معكم منسق الرعاية في أُنس للرعاية الصحية (ONS Healthcare).

تم استلام طلبكم برقم: *#${order.id}*
الخدمة المطلوبة: *${order.serviceNameAr}*
العنوان المسجل: ${order.addressDetails} (${order.areaNameAr})

فريقنا السريري يقوم بمراجعة الطلب الآن وتعيين أقرب كادر تمريضي معتمد لموقعكم.
سيتم الاتصال بكم خلال دقائق لتأكيد الميعاد النهائي وإرشادات الزيارة.

لأي استفسار طارئ، نحن دائماً في خدمتكم على مدار الساعة.
نتمنى لكم وافر الصحة والعافية.`;
}
