import React from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useData();
  const { language } = useLanguage();

  if (!settings.announcementActive) return null;

  const announcementText = language === 'ar' ? settings.announcementAr : settings.announcementEn;
  if (!announcementText) return null;

  return (
    <div className="bg-[#153B36] text-[#F5F2EB] py-2 px-4 text-xs md:text-sm font-medium border-b border-[#70A69A]/20">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <ShieldCheck className="w-4 h-4 text-[#70A69A] shrink-0" />
        <span>{announcementText}</span>
      </div>
    </div>
  );
};
