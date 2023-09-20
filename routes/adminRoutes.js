const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  adminAuth,
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
} = require("../controllers/admin");
const {
  loginUser,
  registrationUser,
  otpVerify,
  userAuth,
  profileUpdate,
} = require("../controllers/user");
const {
  addAddress,
  updateAddress,
  deleteAddress,
  deleteAllAddress,
} = require("../controllers/address");
const { saveOrders } = require("../controllers/order");
const { createOrder, paymentVerifyer } = require("../controllers/payment");

const upload = require("../middlewares/upload");

// Admin section
router.post("/login", loginAdmin);
router.post("/auth", adminAuth);
router.post("/product/add", upload.array("productsImages"), addProduct);
router.put("/product/update", updateProduct);
router.delete("/product/delete", deleteProduct);
router.get("/products", getProducts);

// User section
router.put("/user/login", loginUser);
router.post("/user/sign-up", registrationUser);
router.post("/user/otp-verify", otpVerify);
router.post("/user/auth", userAuth);
router.put("/user/profile/update", profileUpdate);

// User Address section

router.post("/user/address/add", addAddress);
router.put("/user/address/update", updateAddress);
router.put("/user/address/delete", deleteAddress);
router.put("/user/address/delete-all", deleteAllAddress);

// Payment section

router.post("/user/create-order", createOrder);
router.post("/user/payment-verify", paymentVerifyer);

// Oders section

router.post("/user/orders/save", saveOrders);

module.exports = router;
