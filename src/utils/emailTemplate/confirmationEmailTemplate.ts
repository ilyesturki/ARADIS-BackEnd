const confirmationEmailTemplate = (name: string, email: string) => {
  const subject = "Your Account is Now Active!";
  const html = `
      <div style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; max-width: 600px; margin: 20px auto; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #333333;">Congratulations, ${name}!</h1>
          <p>Dear ${name},</p>
          <p>Your account has been successfully activated. You can now log in and start using ${process.env.APP_NAME}.</p>
          <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL}/auth/login" style="display: inline-block; background-color: #28a745; color: #ffffff; padding: 12px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">Login Now</a>
          </div>
          <p>If the button does not work, copy and paste the following link in your browser:</p>
          <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; word-break: break-word;">
              <strong>Login Link:</strong> <a href="${process.env.FRONTEND_URL}/auth/login" target="_blank">${process.env.FRONTEND_URL}/auth/login</a>
          </div>
          <p>If you did not request this, please contact support immediately.</p>
          <p>Best regards,<br>${process.env.APP_NAME} Team</p>
      </div>
    `;

  return {
    email,
    subject,
    html,
  };
};

export default confirmationEmailTemplate;
