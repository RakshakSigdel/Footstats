import express from "express";
import {
  checkPaymentStatus,
  initiatePayment,
  getTransactionByProductId,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/initiate-payment", initiatePayment);

router.post("/payment-status", checkPaymentStatus);
router.get("/transaction/:productId", getTransactionByProductId);

export default router;
