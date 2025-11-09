import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { calculateRentalCost, formatCurrency, getDiscountInfo } from '@/utils/pricing';
import { DollarSign, TrendingDown } from 'lucide-react';

const PricingInfoCard = ({ 
  pricePerHour, 
  estimatedHours = null, 
  showBreakdown = false,
  className = ""
}) => {
  if (!pricePerHour || pricePerHour <= 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center">
          <p className="text-gray-500">Chưa có thông tin giá</p>
        </CardContent>
      </Card>
    );
  }

  const pricingTiers = [
    { hours: 4, discount: 5 },
    { hours: 8, discount: 7.5 },
    { hours: 12, discount: 10 },
    { hours: 24, discount: 12.5 }
  ];

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Base Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium">Giá cơ bản</span>
            </div>
            <span className="font-bold text-lg text-green-700">
              {formatCurrency(pricePerHour)}/h
            </span>
          </div>

          {/* Discount Info */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <TrendingDown className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-green-800 font-medium text-sm">
                💰 Giảm giá theo thời gian thuê
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {pricingTiers.map((tier) => (
                <div 
                  key={tier.hours}
                  className={`flex justify-between px-2 py-1 rounded ${
                    estimatedHours >= tier.hours 
                      ? 'bg-green-100 text-green-800 font-medium' 
                      : 'text-green-700'
                  }`}
                >
                  <span>{tier.hours}+ giờ:</span>
                  <span>-{tier.discount}%</span>
                </div>
              ))}
            </div>
            {estimatedHours && (
              <div className="mt-2 pt-2 border-t border-green-200">
                <div className="text-xs text-green-600">
                  <strong>Dự kiến thuê {estimatedHours.toFixed(1)}h:</strong>{' '}
                  {(() => {
                    const discount = getDiscountInfo(estimatedHours);
                    return discount.discount > 0 
                      ? `Giảm ${discount.discount}% (${discount.tier})`
                      : 'Chưa đạt mức giảm giá';
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Breakdown */}
          {showBreakdown && estimatedHours && estimatedHours > 0 && (
            <div className="border-t pt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Chi tiết tính giá:</p>
              {(() => {
                const pricing = calculateRentalCost(estimatedHours, pricePerHour);
                return (
                  <div className="space-y-1">
                    {pricing.breakdown.map((tier, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-gray-600">{tier.description}</span>
                        <span className={tier.discount > 0 ? 'text-green-600 font-medium' : ''}>
                          {formatCurrency(tier.finalCost)}
                        </span>
                      </div>
                    ))}
                    {pricing.discountAmount > 0 && (
                      <div className="flex justify-between text-xs font-medium text-green-600 pt-1 border-t">
                        <span>Tiết kiệm:</span>
                        <span>-{formatCurrency(pricing.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-sm pt-1 border-t">
                      <span>Tổng cộng:</span>
                      <span className="text-green-600">{formatCurrency(pricing.totalCost)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <p className="text-xs text-gray-500 text-center">
            * Áp dụng tự động khi đặt xe
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingInfoCard;