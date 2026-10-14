import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  verifyPayment,
  getRazorpayKey,
  getMyOrders,
  getOrderById,
} from "../controllers/order.controller.js";

const router = express.Router();

router.use(protect);

router.get("/razorpay-key", getRazorpayKey);
router.post("/verify-payment", verifyPayment);
router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);

export default router;
