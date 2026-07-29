import { Resend } from "resend";
import { logger } from "./logger";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "RedGain <onboarding@resend.dev>";
const APP_URL = (process.env.APP_URL ?? "https://redgain-suite.onrender.com").replace(/\/$/, "");

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
): Promise<void> {
  const link = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Verifica tu correo</title></head>
<body style="margin:0;padding:0;background:#0E0C09;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0E0C09;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#1A1208;border:1px solid rgba(201,162,39,0.20);border-radius:20px;overflow:hidden;">

        <!-- Header gold bar -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#8B6914,#C9A227,#E8C547);"></td></tr>

        <!-- Body -->
        <tr><td style="padding:40px 40px 32px;">

          <!-- Logo -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td style="background:#C9A227;border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                <span style="color:#000;font-size:22px;font-weight:900;line-height:40px;">R</span>
              </td>
              <td style="padding-left:12px;vertical-align:middle;">
                <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">RedGain</span>
              </td>
            </tr>
          </table>

          <!-- Title -->
          <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:900;line-height:1.2;">Verifica tu correo electrónico</h1>
          <p style="margin:0 0 28px;color:rgba(255,255,255,0.55);font-size:15px;line-height:1.6;">
            Hola <strong style="color:rgba(255,255,255,0.80);">${name}</strong>, gracias por unirte a RedGain.<br>
            Haz clic en el botón para confirmar tu dirección de correo y acceder a tu cuenta.
          </p>

          <!-- CTA Button -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td style="background:linear-gradient(135deg,#8B6914,#C9A227);border-radius:12px;">
                <a href="${link}" style="display:inline-block;padding:16px 36px;color:#000;font-size:15px;font-weight:800;text-decoration:none;letter-spacing:0.2px;">
                  ✅ Verificar mi correo
                </a>
              </td>
            </tr>
          </table>

          <!-- Divider -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="height:1px;background:rgba(201,162,39,0.15);"></td></tr>
          </table>

          <!-- Link fallback -->
          <p style="margin:0 0 6px;color:rgba(255,255,255,0.35);font-size:12px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="margin:0 0 24px;word-break:break-all;">
            <a href="${link}" style="color:#C9A227;font-size:12px;text-decoration:none;">${link}</a>
          </p>

          <!-- Warning -->
          <p style="margin:0;color:rgba(255,255,255,0.30);font-size:12px;line-height:1.5;">
            Este enlace expira en <strong style="color:rgba(255,255,255,0.45);">24 horas</strong>. Si no creaste una cuenta en RedGain, ignora este correo.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(201,162,39,0.10);">
          <p style="margin:0;color:rgba(255,255,255,0.20);font-size:11px;text-align:center;">
            © 2025 RedGain · redgain-suite.onrender.com
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Verifica tu correo — RedGain",
    html,
  });

  if (error) {
    logger.error({ error }, "sendVerificationEmail: failed");
    throw new Error("No se pudo enviar el email de verificación");
  }

  logger.info({ to }, "sendVerificationEmail: sent");
}
