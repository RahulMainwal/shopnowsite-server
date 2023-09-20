const User = require("../models/user");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const loginUser = async (req, res) => {
  User.findOne({ email: req.body.email })
    .then(async (data) => {
      if (data === null) {
        res.send({ error: "You are not registered! Please registed first!" });
      } else {
        const verifyPassword = await bcrypt.compare(
          req.body.password,
          data.password
        );
        if (verifyPassword) {
          const SECRET = process.env.JWT_SECRET_KEY;
          const generateJwt = jwt.sign({ userId: data._id }, SECRET);

          User.findByIdAndUpdate(data._id, {
            $set: { loginToken: generateJwt },
          })
            .exec()
            .then((user) => {
              res.send({ message: user.loginToken });
            })
            .catch((err) => {
              res.send({ error: err });
            });
        } else {
          res.send({ error: "Incorrect password!" });
        }
      }
    })
    .catch((err) => {
      res.send({ err });
    });
};

const registrationUser = async (req, res) => {
  const { fName, lName, email, password } = req.body;
  const otp = Math.floor(Math.random() * 1000000 + 1);
  const emailValidator =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  if (!email || !password || !fName) {
    res.send({ error: "Please fill all fields!" });
  } else {
    if (
      emailValidator.test(email) &&
      fName.length >= 3 &&
      password.length >= 8
    ) {
      User.findOne({ email })
        .then((data) => {
          if (data === null) {
            nodemailer.createTestAccount((err, account) => {
              if (err) {
                console.error(
                  "Failed to create a testing account. " + err.message
                );
                return process.exit(1);
              }
              console.log("Credentials obtained, sending message...");
              let transporter = nodemailer.createTransport({
                host: account.smtp.host,
                port: account.smtp.port,
                secure: account.smtp.secure,
                service: "gmail",
                auth: {
                  user: `${process.env.ADMIN_EMAIL_ID}`,
                  pass: `${process.env.ADMIN_EMAIL_PASS}`,
                },
              });

              let message = {
                from: "Shopnow <shopnow@service.mail>",
                to: `${email}`,
                subject: "Shopnow OTP!",
                text: ``,
                html: `
  <body style="margin: 0; padding: 0; left: 0; top: 0;">
<div>
<div
  style="
    text-align: center;
    border: 1px solid #0084c7;
    padding: 5px 0;
    font-size: 20px;
    background-color: #0084c7;
    color: white;
    margin-bottom: 5px;
  "
>
  <b>One Time Password</b>
</div>
<div style="padding: 10px;">
  <h2>Dear,</h2>
  <p>
    Your One Time Password (OTP) is
    <u style="color: #0084c7;"><b>${otp}</b></u>
  </p>
  <p>It will be expired after 10 minutes.</p>
  <p style="color: red;">
    * Don't share your OTP to anyone else & be alert from fraudsters!
  </p>
  <div style="display: flex;">
    <div>
      <h3>Regards,</h3>
      <p style="margin-top: -15px;">Shopnow</p>
    </div>
    <div style="text-align: end; margin-top: 22px; width: 100%;">
      <img
        src="https://res.cloudinary.com/shopnow-image-cloudinary/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1672504820/logos/1672504244291_rk3w2e.jpg"
        alt="Shopnow"
        style="width: 35px;"
      />
    </div>
  </div>
</div>
</div>
</body>
`,
              };

              transporter.sendMail(message, async (err, info) => {
                if (err) {
                  res.send({ error: "Could not send the otp try again!" });
                  return process.exit(1);
                }
                const SECRET = process.env.JWT_SECRET_KEY;
                const jwtToken = await jwt.sign({ otp, email }, SECRET);
                res
                  .status(201)
                  .json({ message: "Success", otpToken: jwtToken });
              });
            });
          } else {
            res.send({ error: "This email already registered!" });
          }
        })
        .catch((error) => {
          res.send({ error: "Something went wrong & try again!" });
        });
    }
  }
};

const otpVerify = async (req, res) => {
  const passwordHash = await bcrypt.hash(req.body.password, 10);
  // res.send(req.body.otpToken);
  jwt.verify(
    req.body.otpToken,
    process.env.JWT_SECRET_KEY,
    (error, verifed) => {
      if (error) {
        res.send({
          error: "Something went wrong try again!",
        });
      }
      if (verifed) {
        const { otp, email } = verifed;
        if (req.body.otp.length !== 6) {
          res.send({ error: "Please enter 6 digit OTP!" });
        } else {
          if (otp === parseInt(req.body.otp, 10) && email === req.body.email) {
            const user = new User({
              fisrtName: req.body.fName,
              lastName: req.body.lName,
              email: req.body.email,
              password: passwordHash,
              loginToken: "",
              address: [],
              orders: [],
              avatar: "",
              timeStamp: new Date(),
            });
            user
              .save()
              .then((data) => {
                res.send({ message: "Success" });
              })
              .catch((err) => {
                res.send({ error: "Could not save data & try again!" });
              });
          } else {
            res.send({ error: "Incorrect OTP!" });
          }
        }
      }
    }
  );
};

const userAuth = async (req, res) => {
  const { loginToken } = req.body;
  await jwt.verify(loginToken, process.env.JWT_SECRET_KEY, (error, verifed) => {
    if (error) {
      res.send({
        error: "Incorrect token!",
      });
    }
    if (verifed) {
      User.findById(verifed.userId)
        .then((data) => {
          res.send({ message: {address: data.address, 
            avatar: data.avatar,
            email: data.email,
            fisrtName: data.fisrtName,
            lastName: data.lastName,
            loginToken: data.loginToken,
            password: data.password,
            timeStamp: data.timeStamp,
            _id: data._data,
            orders: data.orders.map((elem) => {
              return{
                products: elem.products.map((product) => {
                  return{
                    product: {
                      productsBrandName: product.product.productsBrandName,
                      productsColor: product.product.productsColor,
                      productsDeliveryCharge:product.product.productsDeliveryCharge,
                      productsDescription:product.product.productsDescription,
                      productsDiscount:product.product.productsDiscount,
                      productsName:product.product.productsName,
                      productsPrice:product.product.productsPrice,
                      productsQuantity:product.product.productsQuantity,
                      reviews:product.product.reviews,
                      timeStamp:product.product.timeStamp,
                      Productsimages: [ {imageUrl: product.product.Productsimages.map((img) => img.imageUrl.replace("shopnow-image-cloudinary", "mahatmaji-storage"))[0]}],
                      _id: product.product._id
                    },
                    _id:product._id
                  }
                }),
response: elem.response,
_id:elem._id
              }
            })
            } 
          });
        })
        .catch((err) => {
          res.send({ error: "Something went wrong!" });
        });
    }
  });
};

const profileUpdate = async (req, res) => {
  const { fisrtName, lastName, email, password, avatar, loginToken } = req.body;
  if (fisrtName === "" || lastName === "" || email === "") {
    res.send({ error: "You cannot add empty fields Please Fill them!" });
  } else {
    if (password === "") {
      await jwt.verify(
        loginToken,
        process.env.JWT_SECRET_KEY,
        (error, verifed) => {
          if (error) {
            res.send({
              error: "Incorrect token!",
            });
          }
          if (verifed) {
            User.findById(verifed.userId)
              .then((data) => {
                User.findByIdAndUpdate(data._id, {
                  $set: { fisrtName, lastName, email, avatar },
                })
                  .exec()
                  .then((user) => {
                    res.send({ message: "Success" });
                  })
                  .catch((err) => {
                    res.send({ error: "Something went wrong!" });
                  });
              })
              .catch((err) => {
                res.send({ error: "Something went wrong!" });
              });
          }
        }
      );
    } else {
      if (password.length >= 8) {
        await jwt.verify(
          loginToken,
          process.env.JWT_SECRET_KEY,
          (error, verifed) => {
            if (error) {
              res.send({
                error: "Incorrect token!",
              });
            }
            if (verifed) {
              User.findById(verifed.userId)
                .then(async (data) => {
                  const passwordHash = await bcrypt.hash(password, 10);
                  User.findByIdAndUpdate(data._id, {
                    $set: {
                      fisrtName,
                      lastName,
                      email,
                      avatar,
                      password: passwordHash,
                    },
                  })
                    .exec()
                    .then((user) => {
                      res.send({ message: "Success" });
                    })
                    .catch((err) => {
                      res.send({ error: "Something went wrong!" });
                    });
                })
                .catch((err) => {
                  res.send({ error: "Something went wrong!" });
                });
            }
          }
        );
      } else {
        res.send({ error: "Please enter minimum 8 characters!" });
      }
    }
  }
};

module.exports = {
  loginUser,
  registrationUser,
  otpVerify,
  userAuth,
  profileUpdate,
};
