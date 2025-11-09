// Pricing utility functions for rental calculations

/**
 * Tính tổng chi phí thuê xe theo bậc thang giảm giá
 * @param {number} totalHours - Tổng số giờ thuê
 * @param {number} pricePerHour - Giá gốc mỗi giờ
 * @returns {Object} - { totalCost, breakdown, discountAmount, originalCost }
 */
export const calculateRentalCost = (totalHours, pricePerHour) => {
  if (!totalHours || !pricePerHour || totalHours <= 0 || pricePerHour <= 0) {
    return {
      totalCost: 0,
      breakdown: [],
      discountAmount: 0,
      originalCost: 0
    };
  }

  // Định nghĩa các bậc giảm giá (từ cao xuống thấp để tính đúng)
  const priceTiers = [
    { hours: 24, discount: 0.125 }, // 24h: giảm 12.5%
    { hours: 12, discount: 0.10 },  // 12h: giảm 10%
    { hours: 8, discount: 0.075 },  // 8h: giảm 7.5%
    { hours: 4, discount: 0.05 }    // 4h: giảm 5%
  ];

  let remainingHours = Math.ceil(totalHours); // Làm tròn lên
  let totalCost = 0;
  const breakdown = [];

  // Tính theo từng bậc từ cao xuống thấp
  for (const tier of priceTiers) {
    if (remainingHours >= tier.hours) {
      // Tính số lượng bậc này có thể áp dụng
      const tierCount = Math.floor(remainingHours / tier.hours);
      const tierHours = tierCount * tier.hours;
      const tierOriginalCost = tierHours * pricePerHour;
      const tierDiscountAmount = tierOriginalCost * tier.discount;
      const tierFinalCost = tierOriginalCost - tierDiscountAmount;

      totalCost += tierFinalCost;
      remainingHours -= tierHours;

      breakdown.push({
        hours: tierHours,
        pricePerHour: pricePerHour,
        originalCost: tierOriginalCost,
        discount: tier.discount,
        discountAmount: tierDiscountAmount,
        finalCost: tierFinalCost,
        description: `${tierHours}h (giảm ${(tier.discount * 100).toFixed(1)}%)`
      });
    }
  }

  // Tính phần giờ lẻ không được giảm giá
  if (remainingHours > 0) {
    const regularCost = remainingHours * pricePerHour;
    totalCost += regularCost;
    
    breakdown.push({
      hours: remainingHours,
      pricePerHour: pricePerHour,
      originalCost: regularCost,
      discount: 0,
      discountAmount: 0,
      finalCost: regularCost,
      description: `${remainingHours}h (giá thường)`
    });
  }

  const originalCost = Math.ceil(totalHours) * pricePerHour;
  const discountAmount = originalCost - totalCost;

  return {
    totalCost: Math.round(totalCost),
    breakdown,
    discountAmount: Math.round(discountAmount),
    originalCost: Math.round(originalCost),
    totalHours: Math.ceil(totalHours)
  };
};

/**
 * Format currency theo định dạng Việt Nam
 * @param {number} amount - Số tiền
 * @returns {string} - Chuỗi định dạng tiền tệ
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Tính phần trăm tiết kiệm
 * @param {number} originalCost - Chi phí gốc
 * @param {number} finalCost - Chi phí cuối cùng
 * @returns {number} - Phần trăm tiết kiệm
 */
export const calculateSavingsPercent = (originalCost, finalCost) => {
  if (!originalCost || originalCost === 0) return 0;
  return ((originalCost - finalCost) / originalCost) * 100;
};

/**
 * Lấy thông tin giảm giá cho số giờ cụ thể
 * @param {number} hours - Số giờ
 * @returns {Object} - Thông tin về giảm giá
 */
export const getDiscountInfo = (hours) => {
  if (hours >= 24) return { discount: 12.5, tier: '24h+' };
  if (hours >= 12) return { discount: 10, tier: '12h+' };
  if (hours >= 8) return { discount: 7.5, tier: '8h+' };
  if (hours >= 4) return { discount: 5, tier: '4h+' };
  return { discount: 0, tier: 'Không có' };
};