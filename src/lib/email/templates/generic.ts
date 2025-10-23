import { createBaseTemplate } from './base';

interface GenericEmailData {
  title: string;
  name: string;
  message: string;
  storeName: string;
}

export const createGenericEmailHtml = (data: GenericEmailData) => {
  const content = `
    <p>Hi ${data.name},</p>
    <p>${data.message.replace(/\n/g, '<br />')}</p>
    <p>If you have any questions, please reply to this email.</p>
    <p>Best regards,<br />The ${data.storeName} Team</p>
  `;

  return createBaseTemplate(content, data.title);
};