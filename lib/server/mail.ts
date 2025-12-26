import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

type EmailOrderItem = {
  productName: string;
  quantity: number;
  lineTotal: number;
};

type EmailOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  seedCount: number;
  items: EmailOrderItem[];
  subtotal: number;
  shippingCost?: number | null;
  extraSupportAmount?: number | null;
  total: number;
};

/**
 * Sends a confirmation email to the customer after a successful order.
 * This includes order details and the "Seeds of Kindness" sown.
 */
export async function sendOrderConfirmationEmail(order: EmailOrder) {
  if (!process.env.RESEND_API_KEY) {
    console.log('📝 [MOCK EMAIL] To:', order.customerEmail);
    console.log('Subject: Your 4050 Garden Harvest Confirmation');
    console.log('Body: Thank you for your kindness! Your order has been placed.');
    return { success: true, mock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: '4050 Harvest <orders@4050.fyi>', // Replace with your verified domain
      to: [order.customerEmail],
      subject: 'Your 4050 Garden Harvest Confirmation',
      html: `
        <div style="font-family: serif; color: #5C4A3D; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FDF8F3;">
          <h1 style="color: #4A7C59; border-bottom: 1px solid #E5DDD3; padding-bottom: 10px;">Thank you for your kindness!</h1>
          
          <p style="font-size: 18px; line-height: 1.6;">Hi ${order.customerName},</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Your order from the heritage trees at 4050 has been placed. Every jar represents a piece of our garden shared with the community.
          </p>

          <div style="background-color: #E8F0EA; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #4A7C591A;">
            <h2 style="color: #4A7C59; margin-top: 0; font-size: 20px;">Seeds Sown 🌱</h2>
            <p style="margin-bottom: 0;">
              Your purchase has sown <strong>${order.seedCount} Seeds of Kindness</strong> toward our community causes. 
              Thank you for helping the garden flourish beyond our backyard.
            </p>
          </div>

          <h3 style="border-bottom: 1px solid #E5DDD3; padding-bottom: 8px;">Order Summary (#${order.id.slice(-6).toUpperCase()})</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
              <tr style="text-align: left; border-bottom: 1px solid #E5DDD3;">
                <th style="padding: 8px 0;">Item</th>
                <th style="padding: 8px 0; text-align: center;">Qty</th>
                <th style="padding: 8px 0; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item) => `
                <tr style="border-bottom: 1px solid #F0E6D2;">
                  <td style="padding: 12px 0;">${item.productName}</td>
                  <td style="padding: 12px 0; text-align: center;">${item.quantity}</td>
                  <td style="padding: 12px 0; text-align: right;">$${(item.lineTotal / 100).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 0 4px; text-align: right; font-weight: bold;">Subtotal:</td>
                <td style="padding: 12px 0 4px; text-align: right;">$${(order.subtotal / 100).toFixed(2)}</td>
              </tr>
              ${order.shippingCost ? `
              <tr>
                <td colspan="2" style="padding: 4px 0; text-align: right; font-weight: bold;">Shipping:</td>
                <td style="padding: 4px 0; text-align: right;">$${(order.shippingCost / 100).toFixed(2)}</td>
              </tr>
              ` : ''}
              ${order.extraSupportAmount ? `
              <tr>
                <td colspan="2" style="padding: 4px 0; text-align: right; font-weight: bold; color: #4A7C59;">Extra Support:</td>
                <td style="padding: 4px 0; text-align: right; color: #4A7C59;">$${(order.extraSupportAmount / 100).toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr>
                <td colspan="2" style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold;">Total:</td>
                <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold;">$${(order.total / 100).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 30px; border-top: 1px solid #E5DDD3; pt: 20px;">
            <p style="font-style: italic; color: #8B7355;">
              "Homegrown with love for a purpose."
            </p>
            <p style="font-size: 14px; color: #95A5A6;">
              4050 HQ | Pacific Northwest Backyard Heritage
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: unknown) {
    console.error('Email send exception:', err);
    const message = err instanceof Error ? err.message : err;
    return { success: false, error: message };
  }
}

