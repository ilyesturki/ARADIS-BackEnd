const activationEmailTemplate = (
  name: string,
  email: string,
  activationLink: string
) => {
  const subject = "Activate Your Account - Action Required!";
  const html = `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; max-width: 600px; margin: 20px auto; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #333333;">Welcome to ${
          process.env.APP_NAME
        }, ${name}!</h1>
        <p>Dear ${name},</p>
        <p>Your account has been created by the administrator. To activate your account, please click the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
            <a href="${activationLink}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">Activate Account</a>
        </div>
        <p>If the button does not work, you can copy and paste the following link in your browser:</p>
        <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; word-break: break-word;">
            <strong>Activation Link:</strong> <a href="${activationLink}" target="_blank">${activationLink}</a>
        </div>
        <p>This activation link is valid for the next ${
          process.env.ACTIVATION_TOKEN_EXPIRY || "1 hour"
        }. If you did not request this, please ignore this email.</p>
        <p>Thank you for joining ${process.env.APP_NAME}!</p>
        <p>Best regards,<br>${process.env.APP_NAME} Team</p>
    </div>
  `;

  return {
    email,
    subject,
    html,
  };
};

export default activationEmailTemplate;
