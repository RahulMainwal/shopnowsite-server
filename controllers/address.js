const User = require("../models/user");
const jwt = require("jsonwebtoken");

const addAddress = async (req, res) => {
  const {
    name,
    email,
    phone,
    pincode,
    city,
    state,
    house,
    address,
    loginToken,
  } = req.body;
  if (
    name !== "" &&
    phone !== "" &&
    pincode !== "" &&
    city !== "" &&
    state !== "" &&
    house !== "" &&
    address !== ""
  ) {
    if (pincode.length === 6 && phone.length === 10) {
      jwt.verify(
        loginToken,
        process.env.JWT_SECRET_KEY,
        async (error, verified) => {
          if (error) {
            res.send({ error: "Invalid token!" });
          }
          if (verified) {
            const { userId } = verified;
            User.findById(userId)
              .then(async (data) => {
                User.findByIdAndUpdate(data._id, {
                  $push: {
                    address: [
                      {
                        name,
                        email,
                        phone,
                        pincode,
                        city,
                        state,
                        house,
                        address,
                      },
                    ],
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
                res.send({ error: "User not found!" });
              });
          }
        }
      );
    } else {
      res.send({
        error: "Please fill 6 digits pincode & 10 digits phone number!",
      });
    }
  } else {
    res.send({ error: "Please fill all fields!" });
  }
};

const updateAddress = async (req, res) => {
  const {
    name,
    email,
    phone,
    pincode,
    city,
    address,
    house,
    state,
    addressId,
    loginToken,
  } = req.body;
  if (
    name !== "" &&
    phone !== "" &&
    pincode !== "" &&
    city !== "" &&
    state !== "" &&
    house !== "" &&
    address !== ""
  ) {
    if (pincode.toString().length === 6 && phone.toString().length === 10) {
      jwt.verify(
        loginToken,
        process.env.JWT_SECRET_KEY,
        async (error, verified) => {
          if (error) {
            res.send({ error: "Invalid token!" });
          }
          if (verified) {
            const { userId } = verified;
            User.findById(userId)
              .then(async (data) => {
                User.updateMany(
                  { _id: data._id, "address._id": addressId },
                  {
                    $set: {
                      "address.$.name": name,
                      "address.$.email": email,
                      "address.$.phone": phone,
                      "address.$.pincode": pincode,
                      "address.$.city": city,
                      "address.$.state": state,
                      "address.$.house": house,
                      "address.$.address": address,
                    },
                  }
                )
                  .exec()
                  .then((user) => {
                    res.send({ message: user.acknowledged });
                  })
                  .catch((err) => {
                    res.send({ error: "Something went wrong!" });
                  });
              })
              .catch({ error: "Something went wrong & try again!" });
          }
        }
      );
    } else {
      res.send({
        error: "Please fill 6 digits pincode & 10 digits phone number!",
      });
    }
  } else {
    res.send({ error: "Please fill all required fields!" });
  }
};

const deleteAddress = async (req, res) => {
  const { addressId, loginToken } = req.body;
  jwt.verify(
    loginToken,
    process.env.JWT_SECRET_KEY,
    async (error, verified) => {
      if (error) {
        res.send({ error: "Invalid token!" });
      }
      if (verified) {
        const { userId } = verified;
        User.findById(userId)
          .then(async (data) => {
            User.updateMany(
              { _id: data._id },
              {
                $pull: { address: { _id: addressId } },
              }
            )
              .exec()
              .then((user) => {
                res.send({ message: user.acknowledged });
              })
              .catch((err) => {
                res.send({ error: "Something went wrong!" });
              });
          })
          .catch((err) => {
            res.send({ error: "Something went wrong & try again!" });
          });
      }
    }
  );
};

const deleteAllAddress = async (req, res) => {
  const { loginToken } = req.body;
  jwt.verify(
    loginToken,
    process.env.JWT_SECRET_KEY,
    async (error, verified) => {
      if (error) {
        res.send({ error: "Invalid token!" });
      }
      if (verified) {
        const { userId } = verified;
        User.findById(userId)
          .then(async (data) => {
            User.updateMany(
              { _id: data._id },
              {
                $set: {
                  address: [],
                },
              }
            )
              .exec()
              .then((user) => {
                res.send({ message: user });
              })
              .catch((err) => {
                res.send({ error: "Something went wrong!" });
              });
          })
          .catch((err) => {
            res.send({ error: "Something went wrong & try again!" });
          });
      }
    }
  );
};

module.exports = {
  addAddress,
  updateAddress,
  deleteAddress,
  deleteAllAddress,
};
