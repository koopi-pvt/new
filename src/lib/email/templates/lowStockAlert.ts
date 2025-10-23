import { createBaseTemplate } from './base';

interface LowStockEmailData {
  productName: string;
  variantName?: string;
  remainingStock: number;
  linkToProduct: string;
}

export const createLowStockAlertHtml = (data: LowStockEmailData): string => {
  const { productName, variantName, remainingStock, linkToProduct } = data;

  const content = `
    <p>This is an alert to inform you that your product, <strong>${productName}${variantName ? ` (${variantName})` : ''}</strong>, is running low on stock.</p>
    <p><strong>Remaining Stock:</strong> ${remainingStock}</p>
    <p>Please update your inventory to avoid disappointing your customers.</p>
    <a href="${linkToProduct}" class="button">View Product</a>
  `;

  return createBaseTemplate(content, 'Low Stock Alert');
};