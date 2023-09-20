const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  productsName: {
    type: String,
    required: true,
  },
  productsBrandName: {
    type: String,
    required: true,
  },
  productsDescription: {
    type: String,
    required: true,
  },
  productsPrice: {
    type: Number,
    required: true,
  },
  productsColor: {
    type: String,
    required: true,
  },
  Productsimages: [
    {
      asset_id: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
      imageUrl: {
        type: String,
        required: true,
      },
      timeStamp: {
        type: String,
        required: true,
      },
    },
  ],
  productsQuantity: {
    type: Number,
    required: true,
  },
  productsDeliveryCharge: {
    type: Number,
    required: true,
  },
  productsDiscount: {
    type: Number,
    required: true,
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
});

const Product = mongoose.model("products", productSchema);

module.exports = Product;
