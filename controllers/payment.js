const Razorpay = require("razorpay");
const crypto = require("crypto");

const createOrder = async (req, res) => {
  try {
    var instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET_KEY,
    });

    instance.orders.create(
      {
        amount: req.body.amount * 100,
        currency: "INR",
        receipt: "receipt#1",
        notes: {
          key1: "value3",
          key2: "value2",
        },
      },
      (err, order) => {
        if (err) {
          res.send(err);
        }
        if (order) {
          res.send(order);
        }
      }
    );
  } catch (error) {
    console.log("catchError" + error);
  }
};

const paymentVerifyer = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ razorpay_order_id, razorpay_payment_id });
    } else {
      return res.status(400).json({
        message: "Invalid signature sent!",
      });
    }
  } catch (error) {
    console.log("catchError" + error);
  }
};

module.exports = {
  createOrder,
  paymentVerifyer,
};
