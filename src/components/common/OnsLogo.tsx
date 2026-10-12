import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export type OnsLogoVariant =
  | 'color'          // Official Color on light background
  | 'reversed'       // Official Reversed on dark background
  | 'symbol'         // Official Standalone mark / icon
  | 'symbol-reversed'
  | 'horizontal'
  | 'horizontal-reversed';

export interface OnsLogoProps {
  variant?: OnsLogoVariant | string;
  src?: string;
  className?: string;
  height?: number | string;
  width?: number | string;
  alt?: string;
  fallbackVariant?: OnsLogoVariant;
}

export const OnsLogo: React.FC<OnsLogoProps> = ({
  variant = 'color',
  src,
  className = '',
  height,
  width,
  alt = 'أُنس للرعاية الصحية | ONS Healthcare',
  fallbackVariant,
}) => {
  const [customSrcFailed, setCustomSrcFailed] = useState(false);

  // Retrieve site logos from global data context
  let contextLogoUrl: string | undefined;
  let contextDarkLogoUrl: string | undefined;
  try {
    const data = useData();
    contextLogoUrl = data.settings?.logoUrl;
    contextDarkLogoUrl = data.settings?.darkLogoUrl;
  } catch {
    // If rendered outside DataProvider context, graceful fallback
  }

  const isDarkVariant =
    variant === 'reversed' ||
    variant === 'symbol-reversed' ||
    variant === 'horizontal-reversed' ||
    fallbackVariant === 'reversed' ||
    fallbackVariant === 'symbol-reversed' ||
    fallbackVariant === 'horizontal-reversed';

  const defaultPublicAsset = '/logos/ons-logo.svg';
  const defaultDarkAsset = '/logos/ons-logo-reversed.svg';

  // If explicit src passed, prioritize it.
  // Otherwise pick based on whether this instance is on a dark or public/light background
  const chosenContextAsset = isDarkVariant
    ? (contextDarkLogoUrl || contextLogoUrl || defaultDarkAsset)
    : (contextLogoUrl || defaultPublicAsset);

  const defaultFallbackAsset = isDarkVariant ? defaultDarkAsset : defaultPublicAsset;
  const targetSource = src || chosenContextAsset || defaultFallbackAsset;

  const effectiveSrc = (!customSrcFailed && targetSource) ? targetSource : defaultFallbackAsset;

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={`object-contain max-h-full max-w-full select-none bg-transparent ${className}`}
      style={{ height, width }}
      loading="eager"
      decoding="async"
      onError={() => {
        if (!customSrcFailed && targetSource !== defaultFallbackAsset) {
          setCustomSrcFailed(true);
        }
      }}
    />
  );
};

