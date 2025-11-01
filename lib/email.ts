import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// Template para email de reset de contraseña
export function getPasswordResetEmailTemplate(url: string, userName?: string) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - tckt_</title>
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; color: #333333;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px; background-color: #000000; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                tckt_
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #a0a0a0;">
                Tu plataforma de eventos y entradas
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 40px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 0 0 24px 0;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #000000; line-height: 1.3;">
                      Solicitud de restablecimiento de contraseña
                    </h2>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 0 20px 0;">
                    <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333333;">
                      ${userName ? `Hola <strong>${userName}</strong>,` : "Hola,"}
                    </p>
                    <p style="margin: 12px 0 0 0; font-size: 16px; line-height: 1.6; color: #333333;">
                      Recibimos una solicitud para restablecer la contraseña de tu cuenta en tckt_. Si fuiste tu quien lo solicitó, puedes restablecer tu contraseña haciendo clic en el botón de abajo.
                    </p>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding: 0 0 32px 0;" align="center">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td align="center" style="border-radius: 6px; background-color: #000000;">
                          <a href="${url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
                            Restablecer mi contraseña
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 0 16px 0;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #666666;">
                      Si el botón no funciona, copia y pega este enlace en tu navegador:
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 0 32px 0;">
                    <div style="margin: 0; font-size: 13px; line-height: 1.5; color: #0066cc; word-break: break-all; background-color: #f5f5f5; padding: 12px; border-radius: 4px; border: 1px solid #e0e0e0;">
                      <a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">${url}</a>
                    </div>
                  </td>
                </tr>

                <!-- Security Notice -->
                <tr>
                  <td style="padding: 24px 0 0 0; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.5; color: #333333;">
                      <strong>Información importante de seguridad:</strong>
                    </p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: #666666;">
                      <li style="margin-bottom: 8px;">Este enlace es válido por 1 hora desde el momento de la solicitud</li>
                      <li style="margin-bottom: 8px;">Si no solicitaste restablecer tu contraseña, ignora este correo</li>
                      <li style="margin-bottom: 8px;">Tu contraseña actual seguirá siendo válida hasta que completes el proceso</li>
                      <li>Nunca compartas este enlace con otras personas</li>
                    </ul>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 24px 0 0 0;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #666666;">
                      Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos respondiendo a este correo.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #e0e0e0; background-color: #f9f9f9;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #999999; text-align: center;">
                © ${new Date().getFullYear()} tckt_. Todos los derechos reservados.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; line-height: 1.5; color: #999999; text-align: center;">
                Este es un correo electrónico automático, por favor no respondas a esta dirección.
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer text outside card -->
        <table role="presentation" style="width: 100%; max-width: 600px; margin-top: 20px;">
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #999999;">
                Has recibido este correo porque se solicitó un restablecimiento de contraseña para tu cuenta en tckt_.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Solicitud de restablecimiento de contraseña - tckt_

${userName ? `Hola ${userName},` : "Hola,"}

Recibimos una solicitud para restablecer la contraseña de tu cuenta en tckt_. Si fuiste tu quien lo solicitó, puedes restablecer tu contraseña usando el siguiente enlace:

${url}

INFORMACIÓN IMPORTANTE DE SEGURIDAD:
- Este enlace es válido por 1 hora desde el momento de la solicitud
- Si no solicitaste restablecer tu contraseña, ignora este correo
- Tu contraseña actual seguirá siendo válida hasta que completes el proceso
- Nunca compartas este enlace con otras personas

Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos respondiendo a este correo.

© ${new Date().getFullYear()} tckt_. Todos los derechos reservados.

Has recibido este correo porque se solicitó un restablecimiento de contraseña para tu cuenta en tckt_.
  `;

  return { html, text };
}
