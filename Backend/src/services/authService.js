import '../config/env.js';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import EmailService from "./emailService.js";

const sanitizeEnvValue = (value) =>
  String(value || "")
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1");

const normalizedGoogleClientId = sanitizeEnvValue(process.env.GOOGLE_CLIENT_ID);
const googleClient = new OAuth2Client(normalizedGoogleClientId || undefined);

const generateVerificationCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const isEmailAuthError = (error) => {
  const message = String(error?.message || "");
  return /Invalid login|BadCredentials|Username and Password not accepted|EAUTH/i.test(message);
};

const getEmailFailureMessage = (error) => {
  if (isEmailAuthError(error)) {
    return "Unable to send verification email. Server email credentials are invalid. Please configure a valid Gmail App Password in Backend/.env and try again.";
  }
  return "Unable to send verification email right now. Please try again.";
};

class AuthService {
  static async register({ firstName, lastName, email, password }) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    //check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      if (existingUser.emailVerified) {
        throw { status: 409, message: "User with this email already exist!!" };
      }

      const hashedPassword = await hashPassword(password);
      const verificationCode = generateVerificationCode();
      const verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const updatedUser = await prisma.user.update({
        where: { userId: existingUser.userId },
        data: {
          firstName,
          lastName,
          password: hashedPassword,
          authProvider: "LOCAL",
          emailVerificationCode: verificationCode,
          emailVerificationExpiresAt: verificationExpiresAt,
        },
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      try {
        await EmailService.sendVerificationCodeEmail({
          to: updatedUser.email,
          firstName: updatedUser.firstName,
          code: verificationCode,
        });
      } catch (error) {
        console.warn("Verification email send failed during register retry:", error?.message || error);
      }

      return updatedUser;
    }

    //hash password
    const hashedPassword = await hashPassword(password);
    const verificationCode = generateVerificationCode();
    const verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: normalizedEmail,
        password: hashedPassword,
        authProvider: "LOCAL",
        emailVerified: false,
        emailVerificationCode: verificationCode,
        emailVerificationExpiresAt: verificationExpiresAt,
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    try {
      await EmailService.sendVerificationCodeEmail({
        to: user.email,
        firstName: user.firstName,
        code: verificationCode,
      });
    } catch (error) {
      console.warn("Verification email send failed during register:", error?.message || error);
    }

    return user;
  }

  static async verifyEmail({ email, code }) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedCode = String(code || "").trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    if (user.emailVerified) {
      return { alreadyVerified: true };
    }

    if (!user.emailVerificationCode || !user.emailVerificationExpiresAt) {
      throw { status: 400, message: "No verification code found. Please request a new one." };
    }

    if (user.emailVerificationCode !== normalizedCode) {
      throw { status: 400, message: "Invalid verification code" };
    }

    if (user.emailVerificationExpiresAt < new Date()) {
      throw { status: 400, message: "Verification code expired. Please request a new one." };
    }

    const updated = await prisma.user.update({
      where: { userId: user.userId },
      data: {
        emailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpiresAt: null,
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    });

    try {
      await EmailService.sendWelcomeEmail({
        to: updated.email,
        firstName: updated.firstName,
      });
    } catch (error) {
      console.warn("Welcome email failed:", error?.message || error);
    }

    return updated;
  }

  static async resendVerificationCode({ email }) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    if (user.emailVerified) {
      return { alreadyVerified: true };
    }

    const verificationCode = generateVerificationCode();
    const verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationExpiresAt: verificationExpiresAt,
      },
    });

    try {
      await EmailService.sendVerificationCodeEmail({
        to: user.email,
        firstName: user.firstName,
        code: verificationCode,
      });
    } catch (error) {
      throw { status: 502, message: getEmailFailureMessage(error) };
    }

    return { sent: true };
  }

  static async login({ email, password }) {
    const JWT_SECRET = process.env.JWT_SECRET;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    
    //search for user
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw { status: 404, message: "User with this email does not exist!!" };
    }

    if (user.authProvider === "GOOGLE" && !user.password) {
      throw {
        status: 400,
        message: "This account uses Google sign-in. Please continue with Google.",
      };
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw { status: 400, message: "Invalid password!!" };
    }
    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "12h" },
    );
    return {
      token,
      user: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  static async loginWithGoogle({ idToken }) {
    if (!normalizedGoogleClientId) {
      throw {
        status: 500,
        message: "GOOGLE_CLIENT_ID is not configured on the server.",
      };
    }

    if (!idToken) {
      throw { status: 400, message: "Google token is required" };
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: normalizedGoogleClientId,
    });

    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase();
    const googleId = payload?.sub;
    const firstName = payload?.given_name || "Google";
    const lastName = payload?.family_name || "User";

    if (!email || !googleId) {
      throw { status: 400, message: "Invalid Google token payload" };
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          authProvider: "GOOGLE",
          googleId,
          emailVerified: true,
        },
      });

      try {
        await EmailService.sendWelcomeEmail({ to: email, firstName });
      } catch (error) {
        console.warn("Welcome email failed for Google signup:", error?.message || error);
      }
    } else {
      user = await prisma.user.update({
        where: { userId: user.userId },
        data: {
          authProvider: "GOOGLE",
          googleId,
          emailVerified: true,
          firstName: user.firstName || firstName,
          lastName: user.lastName || lastName,
        },
      });
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );

    return {
      token,
      user: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }
}
export default AuthService;