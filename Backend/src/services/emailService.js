import nodemailer from "nodemailer";
import { config } from "../config/env.js";

class EmailService {
  static transporter = null;

  static getTransporter() {
    if (EmailService.transporter) {
      return EmailService.transporter;
    }

    if (!config.emailUser || !config.emailPassword) {
      return null;
    }

    EmailService.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    return EmailService.transporter;
  }

  static async sendEmail({ to, subject, text, html }) {
    const transporter = EmailService.getTransporter();
    if (!transporter) {
      throw new Error("Email transporter is not configured");
    }

    return transporter.sendMail({
      from: `Footstat Team <${config.emailUser}>`,
      to,
      subject,
      text,
      html,
    });
  }

  static async sendVerificationCodeEmail({ to, firstName, code }) {
    const subject = "Verify your Footstat account";
    const text = `Hi ${firstName || "Player"}, your Footstat verification code is ${code}. This code expires in 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.5; color:#111;">
        <h2 style="margin-bottom: 8px;">Footstat email verification</h2>
        <p>Hi ${firstName || "Player"},</p>
        <p>Your verification code is:</p>
        <p style="font-size:28px; font-weight:700; letter-spacing:4px; margin:12px 0;">${code}</p>
        <p>This code expires in <b>10 minutes</b>.</p>
        <p>If you did not create this account, please ignore this message.</p>
      </div>
    `;

    return EmailService.sendEmail({ to, subject, text, html });
  }

  static async sendWelcomeEmail({ to, firstName }) {
    const subject = "Welcome to Footstat";
    const text = `Hi ${firstName || "Player"}, welcome to Footstat. Your account is now active.`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.5; color:#111;">
        <h2 style="margin-bottom: 8px;">Welcome to Footstat</h2>
        <p>Hi ${firstName || "Player"},</p>
        <p>Your account has been verified and is now active.</p>
        <p>You can start exploring clubs, tournaments, and schedules right away.</p>
      </div>
    `;

    return EmailService.sendEmail({ to, subject, text, html });
  }

  static async sendScheduleCreatedEmail({
    to,
    recipientName,
    teamOneName,
    teamTwoName,
    date,
    location,
    scheduleType,
  }) {
    const prettyDate = new Date(date).toLocaleString();
    const subject = `New schedule: ${teamOneName} vs ${teamTwoName}`;
    const text = `Hi ${recipientName || "Player"}, a new ${scheduleType || "match"} schedule was created: ${teamOneName} vs ${teamTwoName} at ${location} on ${prettyDate}.`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.5; color:#111;">
        <h2 style="margin-bottom: 8px;">New schedule created</h2>
        <p>Hi ${recipientName || "Player"},</p>
        <p>A new schedule has been created.</p>
        <ul>
          <li><b>Match:</b> ${teamOneName} vs ${teamTwoName}</li>
          <li><b>Type:</b> ${scheduleType || "Match"}</li>
          <li><b>Location:</b> ${location}</li>
          <li><b>Date:</b> ${prettyDate}</li>
        </ul>
      </div>
    `;

    return EmailService.sendEmail({ to, subject, text, html });
  }

  static async sendScheduleChallengeEmail({
    to,
    recipientName,
    challengerClubName,
    challengedClubName,
    date,
    location,
    scheduleType,
  }) {
    const prettyDate = new Date(date).toLocaleString();
    const subject = `${challengerClubName} has challenged your club`;
    const text = `Hi ${recipientName || "Admin"}, ${challengerClubName} has challenged ${challengedClubName} for a ${scheduleType || "match"}. Proposed date: ${prettyDate}. Location: ${location}. Please review and respond from your schedule requests.`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.5; color:#111;">
        <h2 style="margin-bottom: 8px;">New match challenge received</h2>
        <p>Hi ${recipientName || "Admin"},</p>
        <p><b>${challengerClubName}</b> has challenged your club <b>${challengedClubName}</b>.</p>
        <ul>
          <li><b>Type:</b> ${scheduleType || "Match"}</li>
          <li><b>Location:</b> ${location}</li>
          <li><b>Proposed Date:</b> ${prettyDate}</li>
        </ul>
        <p>Please open Footstat and review the schedule request.</p>
      </div>
    `;

    return EmailService.sendEmail({ to, subject, text, html });
  }
}

export default EmailService;
