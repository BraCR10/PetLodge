import { useWindowDimensions } from 'react-native';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isSmallPhone: width < 375,
    isPhone: width < 600,
    isTablet: width >= 600,
    isLandscape: width > height,
    isPortrait: height > width,
  };
};

// Responsive spacing helper
export const getResponsiveSize = (
  baseSize: number,
  tabletSize?: number
): ((responsive: ReturnType<typeof useResponsive>) => number) => {
  return (responsive) => {
    if (responsive.isTablet) {
      return tabletSize || baseSize * 1.2;
    }
    if (responsive.isSmallPhone) {
      return baseSize * 0.9;
    }
    return baseSize;
  };
};
