import express from "express";
const router= express.Router();
import {
	register,
	login,
	verifyEmail,
	resendVerificationCode,
	googleLogin,
} from "../controllers/authController.js";

//POST api/auth/register
router.post('/register',register);

//POST api/auth/login
router.post('/login',login);

//POST api/auth/verify-email
router.post('/verify-email', verifyEmail);

//POST api/auth/resend-verification
router.post('/resend-verification', resendVerificationCode);

//POST api/auth/google
router.post('/google', googleLogin);

export default router;