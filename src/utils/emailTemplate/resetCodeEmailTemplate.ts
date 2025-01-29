
const resetCodeEmailTemplate = (name:string,email:string,resetCode:string) => {
    const subject = "Subject: Your Password Reset Code - Act Now!";
    const html = `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; max-width: 600px; margin: 20px auto; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #333333;">Password Reset Request</h1>
        <p>Dear ${name},</p>
        <p>You're just one step away from resetting your password and regaining access to your account!</p>
        <p>We've received a request to reset the password associated with your account. To ensure the security of your account, we've generated a unique reset code for you. This code is valid for the next 10 minutes.</p>
        <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
            <strong>Reset Code:</strong> ${resetCode}
        </div>
        <p>Please use this code promptly to set a new password for your account. Simply enter the reset code when prompted during the password reset process on our website.</p>
        <p>Remember, your account security is our top priority. If you didn't initiate this password reset or suspect any unauthorized activity, please reach out to our support team immediately.</p>
        <p>Thank you for choosing ${process.env.APP_NAME}!</p>
        <p>Best regards,<br>${process.env.APP_NAME} Team</p>
    </div>
    `;
  
    return {
      email,
      subject,
      html,
    };
  };

export default resetCodeEmailTemplate;