import { Resend } from 'resend';

// Initialize Resend only if API key is available
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

export interface TicketEmailData {
  userEmail: string;
  userName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  tickets: {
    id: number;
    type: string;
    code: string;
    qrCode: string; // base64 QR code
  }[];
  totalAmount: number;
  orderReference: string;
}

/**
 * Sends ticket confirmation email with QR codes
 */
export async function sendTicketConfirmationEmail(data: TicketEmailData) {
  try {
    if (!resend) {
      console.warn('Resend not configured, skipping email sending');
      return {
        success: false,
        error: 'Email service not configured'
      };
    }

    // Create email HTML template
    const emailHtml = createTicketEmailTemplate(data);
    
    const emailData = {
      from: 'NoTrip <noreply@notrip.com>', // Update with your domain
      to: [data.userEmail],
      subject: `🎫 Tus tickets para ${data.eventName}`,
      html: emailHtml,
      // Attach QR codes as images if needed
      attachments: data.tickets.map(ticket => ({
        filename: `ticket-${ticket.id}.png`,
        content: ticket.qrCode.split(',')[1], // Remove data:image/png;base64,
        type: 'image/png',
        disposition: 'inline',
        content_id: `qr-${ticket.id}`,
      })),
    };

    const result = await resend.emails.send(emailData);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
}

/**
 * Creates HTML template for ticket confirmation email
 */
function createTicketEmailTemplate(data: TicketEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de tickets - NoTrip</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #000000, #333333); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .ticket { border: 2px dashed #ddd; border-radius: 10px; padding: 20px; margin: 20px 0; background: #f9f9f9; }
        .qr-code { text-align: center; margin: 15px 0; }
        .qr-code img { border-radius: 8px; }
        .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .total { background: #000; color: white; padding: 15px; border-radius: 8px; text-align: center; font-weight: bold; font-size: 18px; }
        .event-info { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .ticket-type { font-weight: bold; font-size: 16px; color: #000; margin-bottom: 10px; }
        .ticket-code { font-family: monospace; background: #eee; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎫 ¡Tickets confirmados!</h1>
          <p>Tu compra se ha procesado exitosamente</p>
        </div>
        
        <div class="content">
          <p>Hola <strong>${data.userName}</strong>,</p>
          
          <p>¡Excelente! Tu compra se ha confirmado. Ya tienes tus tickets para el evento.</p>
          
          <div class="event-info">
            <h2>📅 Detalles del evento</h2>
            <p><strong>Evento:</strong> ${data.eventName}</p>
            <p><strong>Fecha:</strong> ${data.eventDate}</p>
            <p><strong>Lugar:</strong> ${data.eventLocation}</p>
            <p><strong>Referencia:</strong> ${data.orderReference}</p>
          </div>
          
          <div class="total">
            Total pagado: $${data.totalAmount.toLocaleString()}
          </div>
          
          <h2>🎟️ Tus tickets</h2>
          <p>Presenta estos códigos QR en la entrada del evento:</p>
          
          ${data.tickets.map(ticket => `
            <div class="ticket">
              <div class="ticket-type">Ticket ${ticket.type.toUpperCase()}</div>
              <div class="qr-code">
                <img src="cid:qr-${ticket.id}" alt="QR Code" width="150" height="150">
              </div>
              <div class="ticket-code">Código: ${ticket.code}</div>
            </div>
          `).join('')}
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>📱 Instrucciones importantes:</h3>
            <ul>
              <li>Guarda este email y/o descarga la imagen del QR</li>
              <li>Presenta el QR en tu celular o impreso en la entrada</li>
              <li>Llega con tiempo para evitar colas</li>
              <li>Cada ticket solo puede usarse una vez</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>¡Que disfrutes el evento! 🎉</p>
          <p>Este email fue enviado por NoTrip • <a href="mailto:support@notrip.com">Soporte</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Sends payment failure notification email
 */
export async function sendPaymentFailureEmail(userEmail: string, userName: string, eventName: string, orderReference: string) {
  try {
    if (!resend) {
      console.warn('Resend not configured, skipping failure email sending');
      return {
        success: false,
        error: 'Email service not configured'
      };
    }

    const emailData = {
      from: 'NoTrip <noreply@notrip.com>',
      to: [userEmail],
      subject: `❌ Problema con tu pago - ${eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px;">
            <h2>❌ Pago no procesado</h2>
            <p>Hola <strong>${userName}</strong>,</p>
            <p>No pudimos procesar tu pago para <strong>${eventName}</strong>.</p>
            <p><strong>Referencia:</strong> ${orderReference}</p>
            <p>Tus tickets han sido liberados y puedes intentar comprar nuevamente.</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/events" style="background: #000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
              Intentar nuevamente
            </a>
          </div>
        </div>
      `,
    };

    const result = await resend.emails.send(emailData);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
}