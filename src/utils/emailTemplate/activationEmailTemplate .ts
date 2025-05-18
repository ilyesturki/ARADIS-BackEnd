const activationEmailTemplate = (
  name: string,
  email: string,
  activationLink: string
) => {
  const subject = "Activate Your Account - Action Required!";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Activation</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                background-color: #f7f9fc;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                overflow: hidden;
            }
            .header {
                background-color: #2c3e50;
                padding: 25px 30px;
                color: white;
            }
            .content {
                padding: 30px;
            }
            .button {
                display: inline-block;
                background-color: #3498db;
                color: white !important;
                text-decoration: none;
                font-weight: 600;
                padding: 12px 24px;
                border-radius: 4px;
                margin: 20px 0;
            }
            .link-box {
                background-color: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 4px;
                padding: 12px;
                word-break: break-all;
                font-size: 14px;
                margin: 20px 0;
            }
            .footer {
                padding: 20px 30px;
                background-color: #f8f9fa;
                font-size: 12px;
                color: #6c757d;
                text-align: center;
            }
            h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }
            .text-muted {
                color: #6c757d;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to ${process.env.APP_NAME}</h1>
            </div>
            
            <div class="content">
                <p>Dear ${name},</p>
                
                <p>Your account has been successfully created by the administrator. To complete your registration and activate your account, please click the button below:</p>
                
                <div style="text-align: center;">
                    <a href="${activationLink}" class="button">Activate My Account</a>
                </div>
                
                <p class="text-muted" style="text-align: center;">This link expires in ${
                  process.env.ACTIVATION_TOKEN_EXPIRY || "1 hour"
                }</p>
                
                <p>If the button above doesn't work, please copy and paste the following URL into your web browser:</p>
                
                <div class="link-box">
                    ${activationLink}
                </div>
                
                <p>If you didn't request this account, please ignore this email or contact our support team.</p>
                
                <p>Thank you for joining ${process.env.APP_NAME}!</p>
                
                <p>Best regards,<br>
                <strong>The ${process.env.APP_NAME} Team</strong></p>
            </div>
            
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${
    process.env.APP_NAME
  }. All rights reserved.</p>
                <p>If you need assistance, please contact our support team.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return {
    email,
    subject,
    html,
  };
};

export default activationEmailTemplate;
