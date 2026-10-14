import express from "express";
import {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
} from "../controllers/customer.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

router.get("/me", protect, getProfile);

router.post("/logout", protect, logoutCustomer);

export default router;