const User = require("../models/user");
const jwt = require("jsonwebtoken");

const saveOrders = async (req, res) => {
  const { response, products, loginToken } = req.body;

  if (response === "" && products === "" && loginToken === "") {
    res.send({ error: "Could not fetch details!" });
  } else {
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
                $push: {
                  orders: [
                    {
                      response,
                      products,
                    },
                  ],
                },
              })
                .exec()
                .then((user) => {
                  res.send({ message: response });
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
  }
};

module.exports = {
  saveOrders,
};
