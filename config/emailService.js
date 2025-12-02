const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),     // 👈 importante convertirlo a número
  secure: false,                            // Mailtrap usa STARTTLS, no SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendPasswordResetEmail(email, token) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Recuperación de Contraseña - MyGasolinera',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #FFE8DA; padding: 30px; border-radius: 10px;">
          <h2 style="color: #FF9350; text-align: center; margin-bottom: 20px;">
            MyGasolinera
          </h2>

          <p style="color: #492714; font-size: 16px; line-height: 1.6;">
            Has solicitado restablecer tu contraseña.
          </p>

          <p style="color: #492714; font-size: 16px; line-height: 1.6;">
            Tu código de recuperación es:
          </p>

          <div style="background-color: #FFCFB0; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <h1 style="color: #492714; margin: 0; letter-spacing: 8px; font-size: 36px;">
              ${token}
            </h1>
          </div>

          <p style="color: #492714; font-size: 14px; line-height: 1.6;">
            Este código expirará en <strong>1 hora</strong>.
          </p>

          <p style="color: #666; font-size: 13px; line-height: 1.6; margin-top: 30px;">
            Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
          </p>

          <hr style="border: none; border-top: 1px solid #FFCFB0; margin: 20px 0;">

          <p style="color: #999; font-size: 11px; text-align: center;">
            Este es un correo automático, por favor no respondas.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de recuperación enviado a:', email);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw error;
  }
}

module.exports = { sendPasswordResetEmail };
