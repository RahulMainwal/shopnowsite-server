const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  fisrtName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  avatar: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  loginToken: {
    type: String,
  },
  orders: [
    {
      response: {
        razorpay_payment_id: {
          type: String,
        },
        razorpay_order_id: {
          type: String,
        },
        razorpay_signature: {
          type: String,
        },
      },
      products: [
        {
          product: {
            productsName: {
              type: String,
            },
            productsBrandName: {
              type: String,
            },
            productsDescription: {
              type: String,
            },
            productsPrice: {
              type: Number,
            },
            productsColor: {
              type: String,
            },
            Productsimages: [
              {
                asset_id: {
                  type: String,
                },
                public_id: {
                  type: String,
                },
                imageUrl: {
                  type: String,
                },
                timeStamp: {
                  type: String,
                },
              },
            ],
            productsQuantity: {
              type: Number,
            },
            productsDeliveryCharge: {
              type: Number,
            },
            productsDiscount: {
              type: Number,
            },
            productsRatings: {
              type: Number,
            },
            reviews: [
              {
                userName: {
                  type: String,
                },
                location: {
                  type: String,
                },
                description: {
                  type: String,
                },
                images: [
                  {
                    image: {
                      type: String,
                    },
                  },
                ],
                timeStamp: {
                  type: String,
                },
              },
            ],
            timeStamp: {
              type: String,
            },
          },
          cartQuantity: {
            type: Number,
          },
        },
      ],
    },
  ],
  address: [
    {
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      phone: {
        type: Number,
      },
      pincode: {
        type: Number,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      house: {
        type: String,
      },
      address: {
        type: String,
      },
    },
  ],
  timeStamp: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("users", UserSchema);

module.exports = User;
