import { Resend } from "resend";
import { storage } from "./storage";
import type { NotificationPreferences } from "@shared/schema";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
if (resend) {
  console.log(`[EMAIL] Using FROM_EMAIL: ${process.env.FROM_EMAIL || "notifications@resend.dev"}`);
}

const APP_NAME = "Axle";
const BRAND_COLOR = "#059669";

// Recreates the ring-and-dot mark from client/public/favicon.svg using nested
// tables instead of inline SVG, which Outlook and several other email clients
// strip or fail to render.
function emailHeaderHtml(label: string): string {
  return `
          <tr>
            <td style="background-color: ${BRAND_COLOR}; padding: 32px; text-align: center;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto; border-collapse: collapse;">
                <tr>
                  <td style="padding-right: 10px; vertical-align: middle;">
                    <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                      <tr>
                        <td width="26" height="26" style="width: 26px; height: 26px; border: 2.5px solid #ffffff; border-radius: 13px; text-align: center; vertical-align: middle;">
                          <div style="width: 8px; height: 8px; border-radius: 4px; background-color: #ffffff; margin: 0 auto; line-height: 0; font-size: 0;">&nbsp;</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="vertical-align: middle;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">${label}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

const FROM_EMAIL = process.env.FROM_EMAIL || "notifications@resend.dev";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "techmaleek@gmail.com";

// APP_BASE_URL (e.g. https://app.axlehq.app) is the real production URL.
// REPLIT_DOMAINS is only a dev-environment fallback; without either, links
// degrade to "#" rather than pointing at an unowned *.replit.app domain.
function getAppBaseUrl(): string {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL.replace(/\/$/, "");
  const replitDomain = process.env.REPLIT_DOMAINS?.split(",")[0];
  return replitDomain ? `https://${replitDomain}` : "#";
}

export interface EmailPayload {
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  actorName?: string;
  additionalDetails?: Record<string, string>;
}

import { getPreferenceCategory } from "./notificationService";

// Map prefix-derived in-app category to its email-specific column. This is what
// powers per-category email vs. in-app independence in the preferences UI.
const EMAIL_COLUMN_BY_CATEGORY: Record<string, keyof NotificationPreferences> = {
  oooNotifications: "oooEmail",
  timesheetNotifications: "timesheetEmail",
  overtimeNotifications: "overtimeEmail",
  invoiceNotifications: "invoiceEmail",
  deadlineReminders: "deadlineEmail",
  evaluationNotifications: "evaluationEmail",
  teamActionNotifications: "teamActionEmail",
};

function getEmailCategoryFromType(type: string): keyof NotificationPreferences | null {
  const cat = getPreferenceCategory(type);
  if (!cat) return null;
  return EMAIL_COLUMN_BY_CATEGORY[cat] ?? null;
}

async function shouldSendEmail(userId: string, notificationType: string): Promise<boolean> {
  const prefs = await storage.getNotificationPreferences(userId);
  // If no preferences found, default to enabled
  if (!prefs) return true;
  if (!prefs.emailEnabled) return false;

  const column = getEmailCategoryFromType(notificationType);
  if (column && prefs[column] === false) return false;

  return true;
}

function getStatusColor(type: string): string {
  if (type.includes("approved")) return "#10B981";
  if (type.includes("rejected")) return "#EF4444";
  if (type.includes("submitted") || type.includes("uploaded")) return "#F59E0B";
  if (type.includes("created")) return "#6366F1";
  if (type.includes("reminder") || type.includes("requested")) return "#8B5CF6";
  return "#6366F1";
}

function getStatusLabel(type: string): string {
  if (type.includes("approved")) return "Approved";
  if (type.includes("rejected")) return "Rejected";
  if (type.includes("submitted")) return "Pending Review";
  if (type.includes("uploaded")) return "Pending Review";
  if (type.includes("created")) return "New";
  if (type.includes("reminder")) return "Reminder";
  if (type.includes("requested")) return "Action Required";
  return "Update";
}

function getDeepLink(baseUrl: string, payload: EmailPayload): string {
  if (!baseUrl || baseUrl === '#') return '#';
  
  const { entityType, entityId, type } = payload;
  
  // Generate appropriate deep link based on entity type and notification type
  // Support both short and full entity type names (e.g., 'ooo' and 'ooo_request')
  // Routes must match actual application routes in App.tsx
  if ((entityType === 'ooo' || entityType === 'ooo_request') && entityId) {
    return `${baseUrl}/ooo-requests?highlight=${entityId}`;
  }
  if ((entityType === 'timesheet' || entityType === 'timesheet_entry') && entityId) {
    return `${baseUrl}/timesheets?highlight=${entityId}`;
  }
  if (entityType === 'invoice' && entityId) {
    return `${baseUrl}/invoices?highlight=${entityId}`;
  }
  if ((entityType === 'overtime' || entityType === 'overtime_request') && entityId) {
    return `${baseUrl}/overtime-approvals?highlight=${entityId}`;
  }
  if (entityType === 'evaluation' && entityId) {
    return `${baseUrl}/evaluations?highlight=${entityId}`;
  }
  if (entityType === 'expense' && entityId) {
    return `${baseUrl}/expenses?highlight=${entityId}`;
  }
  if (entityType === 'user' && entityId) {
    return `${baseUrl}/team/${entityId}`;
  }
  
  // Fallback based on notification type prefix
  if (type.startsWith('ooo_')) {
    return `${baseUrl}/ooo-requests`;
  }
  if (type.startsWith('timesheet_')) {
    return `${baseUrl}/timesheets`;
  }
  if (type.startsWith('invoice_')) {
    return `${baseUrl}/invoices`;
  }
  if (type.startsWith('overtime_')) {
    return `${baseUrl}/overtime-approvals`;
  }
  if (type.startsWith('expense_')) {
    return `${baseUrl}/expenses`;
  }
  if (type.startsWith('evaluation_') || type === 'feedback_requested') {
    return `${baseUrl}/evaluations`;
  }
  
  // Default to dashboard
  return baseUrl;
}

function generateEmailHtml(payload: EmailPayload): string {
  const statusColor = getStatusColor(payload.type);
  const statusLabel = getStatusLabel(payload.type);
  const baseUrl = getAppBaseUrl();
  const appUrl = getDeepLink(baseUrl, payload);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${payload.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          ${emailHeaderHtml(APP_NAME)}

          <!-- Status Badge -->
          <tr>
            <td style="padding: 32px 32px 0;">
              <span style="display: inline-block; background-color: ${statusColor}15; color: ${statusColor}; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                ${statusLabel}
              </span>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 24px 32px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 24px; font-weight: 600;">${payload.title}</h2>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">${payload.message}</p>
              
              ${payload.actorName ? `
              <p style="margin: 0 0 16px; color: #71717a; font-size: 14px;">
                <strong>Action by:</strong> ${payload.actorName}
              </p>
              ` : ''}
              
              ${payload.additionalDetails && Object.keys(payload.additionalDetails).length > 0 ? `
              <table style="margin: 16px 0; border-collapse: collapse;">
                ${Object.entries(payload.additionalDetails).map(([key, value]) => `
                <tr>
                  <td style="padding: 4px 16px 4px 0; color: #71717a; font-size: 14px; font-weight: 500;">${key}:</td>
                  <td style="padding: 4px 0; color: #52525b; font-size: 14px;">${value}</td>
                </tr>
                `).join('')}
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <a href="${appUrl}" 
                 style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                View in ${APP_NAME}
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 32px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 1.5;">
                You're receiving this email because you have email notifications enabled in your ${APP_NAME} account. 
                You can update your notification preferences in Settings.
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
}

function generatePlainText(payload: EmailPayload): string {
  let text = `${payload.title}\n\n${payload.message}`;
  
  if (payload.actorName) {
    text += `\n\nAction by: ${payload.actorName}`;
  }
  
  if (payload.additionalDetails && Object.keys(payload.additionalDetails).length > 0) {
    text += "\n\nDetails:";
    for (const [key, value] of Object.entries(payload.additionalDetails)) {
      text += `\n${key}: ${value}`;
    }
  }
  
  text += `\n\n---\nThis is an automated notification from ${APP_NAME}.`;
  
  return text;
}

export async function sendNotificationEmail(
  userId: string,
  payload: EmailPayload
): Promise<boolean> {
  console.log(`[EMAIL] Attempting to send email for ${payload.type} to user ${userId}`);
  
  if (!resend) {
    console.log("[EMAIL] Email service not configured (RESEND_API_KEY missing)");
    return false;
  }

  try {
    const shouldSend = await shouldSendEmail(userId, payload.type);
    console.log(`[EMAIL] shouldSendEmail result: ${shouldSend}`);
    if (!shouldSend) {
      console.log("[EMAIL] Email blocked by user preferences");
      return false;
    }

    const user = await storage.getUser(userId);
    if (!user || !user.email) {
      console.log(`[EMAIL] No email found for user ${userId}`);
      return false;
    }

    console.log(`[EMAIL] Sending email to ${user.email} with subject: [${APP_NAME}] ${payload.title}`);

    const preferencesUrl = `${getAppBaseUrl()}/profile`;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `[${APP_NAME}] ${payload.title}`,
      html: generateEmailHtml(payload),
      text: generatePlainText(payload),
      headers: {
        "List-Unsubscribe": `<${preferencesUrl}>`,
      },
    });

    if (result.error) {
      console.error("[EMAIL] Failed to send email:", result.error);
      return false;
    }

    console.log(`[EMAIL] Email sent successfully to ${user.email}: ${payload.title}`);
    return true;
  } catch (error) {
    console.error("[EMAIL] Error sending email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  tempPassword: string
): Promise<boolean> {
  if (!resend) {
    console.log("[EMAIL] Email service not configured — skipping password reset email");
    return false;
  }

  const baseUrl = getAppBaseUrl();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          ${emailHeaderHtml(APP_NAME)}
          <tr>
            <td style="padding:32px 32px 0;">
              <span style="display:inline-block;background-color:#F59E0B15;color:#F59E0B;padding:6px 12px;border-radius:4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Action Required</span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;">
              <h2 style="margin:0 0 16px;color:#18181b;font-size:24px;font-weight:600;">Your password has been reset</h2>
              <p style="margin:0 0 24px;color:#52525b;font-size:16px;line-height:1.6;">Hi ${userName}, an administrator has reset your password. Use the temporary password below to log in, then change it immediately when prompted.</p>
              <table style="margin:16px 0 24px;border-collapse:collapse;">
                <tr>
                  <td style="padding:4px 16px 4px 0;color:#71717a;font-size:14px;font-weight:500;">Temporary password:</td>
                  <td style="padding:4px 0;color:#18181b;font-size:16px;font-family:monospace;font-weight:700;letter-spacing:0.05em;">${tempPassword}</td>
                </tr>
              </table>
              <p style="margin:0;color:#71717a;font-size:14px;line-height:1.6;">You will be required to set a new password before you can access the app. If you did not expect this, please contact your administrator.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <a href="${baseUrl}/login" style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;box-shadow:0 2px 4px rgba(0,0,0,0.1);">Log in to ${APP_NAME}</a>
            </td>
          </tr>
          <tr>
            <td style="background-color:#fafafa;padding:24px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;color:#a1a1aa;font-size:12px;line-height:1.5;">This is a security notification from ${APP_NAME}. You cannot unsubscribe from security emails.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Your password has been reset\n\nHi ${userName}, an administrator has reset your password.\n\nTemporary password: ${tempPassword}\n\nUse this to log in at ${baseUrl}/login. You will be required to set a new password immediately.\n\nIf you did not expect this, contact your administrator.`;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `[${APP_NAME}] Your password has been reset`,
      html,
      text,
    });
    if (result.error) {
      console.error("[EMAIL] Failed to send password reset email:", result.error);
      return false;
    }
    console.log(`[EMAIL] Password reset email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("[EMAIL] Error sending password reset email:", error);
    return false;
  }
}

export function isEmailServiceConfigured(): boolean {
  return !!resend;
}

export async function sendSupportTicketEmail(
  fromEmail: string,
  subject: string,
  message: string,
  attachments: Array<{ filename: string; content: Buffer }>
): Promise<boolean> {
  if (!resend) {
    console.log("[EMAIL] Support ticket skipped — RESEND_API_KEY not set");
    return false;
  }

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background-color:#f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        ${emailHeaderHtml(`${APP_NAME} Support`)}
        <tr><td style="padding:32px 32px 0;">
          <span style="display:inline-block;background-color:#6366F115;color:#6366F1;padding:6px 12px;border-radius:4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">New Ticket</span>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <table style="margin:0 0 20px;border-collapse:collapse;width:100%;">
            <tr>
              <td style="padding:4px 16px 4px 0;color:#71717a;font-size:14px;font-weight:500;white-space:nowrap;">From:</td>
              <td style="padding:4px 0;color:#18181b;font-size:14px;">${fromEmail}</td>
            </tr>
            <tr>
              <td style="padding:4px 16px 4px 0;color:#71717a;font-size:14px;font-weight:500;white-space:nowrap;">Subject:</td>
              <td style="padding:4px 0;color:#18181b;font-size:14px;font-weight:600;">${subject}</td>
            </tr>
          </table>
          <div style="background-color:#f9fafb;border:1px solid #e4e4e7;border-radius:6px;padding:20px;">
            <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </div>
          ${attachments.length > 0 ? `<p style="margin:16px 0 0;color:#71717a;font-size:13px;">${attachments.length} attachment${attachments.length > 1 ? "s" : ""} included.</p>` : ""}
        </td></tr>
        <tr><td style="background-color:#fafafa;padding:24px 32px;border-top:1px solid #e4e4e7;">
          <p style="margin:0;color:#a1a1aa;font-size:12px;line-height:1.5;">Submitted via the ${APP_NAME} in-app support bubble. Reply directly to this email to respond to the user.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `New Support Ticket\n\nFrom: ${fromEmail}\nSubject: ${subject}\n\n${message}\n\n---\nSubmitted via the ${APP_NAME} in-app support bubble.`;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: SUPPORT_EMAIL,
      replyTo: fromEmail,
      subject: `[${APP_NAME} Support] ${subject}`,
      html,
      text,
      attachments: attachments.map((f) => ({
        filename: f.filename,
        content: f.content,
      })),
    });
    if (result.error) {
      console.error("[EMAIL] Support ticket email failed:", result.error);
      return false;
    }
    console.log(`[EMAIL] Support ticket sent from ${fromEmail}: ${subject}`);
    return true;
  } catch (error) {
    console.error("[EMAIL] Support ticket email error:", error);
    return false;
  }
}

// Sends a notification to the platform admin when a new onboarding request is submitted.
export async function sendOnboardingRequestEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  orgName: string;
  companySize: string;
  message?: string;
}): Promise<boolean> {
  if (!resend) {
    console.log("[EMAIL] Onboarding request email skipped — RESEND_API_KEY not set");
    return false;
  }

  // Derive recipients from PLATFORM_ADMIN_EMAILS. Falls back to the configured
  // support address when the variable is absent so requests are never silently
  // lost during initial deployment. Set PLATFORM_ADMIN_EMAILS in production to
  // route requests to the correct team member(s).
  const adminEmails = (process.env.PLATFORM_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const recipients = adminEmails.length > 0 ? adminEmails : [SUPPORT_EMAIL];
  console.log(`[EMAIL] Onboarding request recipients: ${recipients.join(", ")}`);
  const subject = `New onboarding request — ${data.orgName}`;

  const rows = [
    ["First name", data.firstName],
    ["Last name", data.lastName],
    ["Work email", data.email],
    ["Organization", data.orgName],
    ["Company size", data.companySize],
    ...(data.message ? [["Additional notes", data.message]] : []),
  ];

  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#71717a;font-size:14px;font-weight:500;white-space:nowrap;vertical-align:top;">${k}:</td><td style="padding:6px 0;color:#18181b;font-size:14px;">${String(v).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background-color:#f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background-color:${BRAND_COLOR};padding:32px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.025em;">${APP_NAME}</h1>
        </td></tr>
        <tr><td style="padding:32px 32px 0;">
          <span style="display:inline-block;background-color:#6366F115;color:#6366F1;padding:6px 12px;border-radius:4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">New Request</span>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <h2 style="margin:0 0 8px;color:#18181b;font-size:22px;font-weight:600;">New onboarding request</h2>
          <p style="margin:0 0 20px;color:#52525b;font-size:15px;line-height:1.6;">A prospective customer has requested access to ${APP_NAME}. Review the details below and provision their account when ready.</p>
          <table style="border-collapse:collapse;width:100%;">${tableRows}</table>
        </td></tr>
        <tr><td style="background-color:#fafafa;padding:24px 32px;border-top:1px solid #e4e4e7;">
          <p style="margin:0;color:#a1a1aa;font-size:12px;line-height:1.5;">Reply to this email to contact the applicant at ${data.email}.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const textRows = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const text = `New onboarding request — ${data.orgName}\n\n${textRows}\n\n---\nReply to this email to contact the applicant at ${data.email}.`;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipients,
      replyTo: data.email,
      subject,
      html,
      text,
    });
    if (result.error) {
      console.error("[EMAIL] Onboarding request email failed:", result.error);
      return false;
    }
    console.log(`[EMAIL] Onboarding request email sent for ${data.orgName} (${data.email})`);
    return true;
  } catch (error) {
    console.error("[EMAIL] Onboarding request email error:", error);
    return false;
  }
}

// Sends a transactional billing email directly to an address (no preference check —
// billing notifications are mandatory and cannot be opted out of).
export async function sendBillingEmail(
  toEmail: string,
  subject: string,
  payload: {
    title: string;
    message: string;
    details?: Record<string, string>;
    ctaUrl?: string;
    ctaLabel?: string;
  }
): Promise<boolean> {
  if (!resend) {
    console.log("[EMAIL] Billing email skipped — RESEND_API_KEY not set");
    return false;
  }

  const baseUrl = getAppBaseUrl();
  const ctaUrl = payload.ctaUrl || `${baseUrl}/billing`;
  const ctaLabel = payload.ctaLabel || "View Billing";

  const detailsHtml =
    payload.details && Object.keys(payload.details).length > 0
      ? `<table style="margin:16px 0;border-collapse:collapse;">${Object.entries(payload.details)
          .map(
            ([k, v]) =>
              `<tr><td style="padding:4px 16px 4px 0;color:#71717a;font-size:14px;font-weight:500;">${k}:</td><td style="padding:4px 0;color:#52525b;font-size:14px;">${v}</td></tr>`
          )
          .join("")}</table>`
      : "";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background-color:#f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        ${emailHeaderHtml(APP_NAME)}
        <tr><td style="padding:32px 32px 0;">
          <span style="display:inline-block;background-color:${BRAND_COLOR}15;color:${BRAND_COLOR};padding:6px 12px;border-radius:4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Billing</span>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <h2 style="margin:0 0 16px;color:#18181b;font-size:22px;font-weight:600;">${payload.title}</h2>
          <p style="margin:0 0 20px;color:#52525b;font-size:16px;line-height:1.6;">${payload.message}</p>
          ${detailsHtml}
        </td></tr>
        <tr><td style="padding:0 32px 32px;">
          <a href="${ctaUrl}" style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;box-shadow:0 2px 4px rgba(0,0,0,0.1);">${ctaLabel}</a>
        </td></tr>
        <tr><td style="background-color:#fafafa;padding:24px 32px;border-top:1px solid #e4e4e7;">
          <p style="margin:0;color:#a1a1aa;font-size:12px;line-height:1.5;">This is a billing notification from ${APP_NAME}. You cannot unsubscribe from billing emails.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const detailsText = payload.details
    ? "\n\n" + Object.entries(payload.details).map(([k, v]) => `${k}: ${v}`).join("\n")
    : "";
  const text = `${payload.title}\n\n${payload.message}${detailsText}\n\n${ctaLabel}: ${ctaUrl}\n\n---\nThis is a billing notification from ${APP_NAME}.`;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `[${APP_NAME}] ${subject}`,
      html,
      text,
    });
    if (result.error) {
      console.error("[EMAIL] Billing email failed:", result.error);
      return false;
    }
    console.log(`[EMAIL] Billing email sent to ${toEmail}: ${subject}`);
    return true;
  } catch (error) {
    console.error("[EMAIL] Billing email error:", error);
    return false;
  }
}
