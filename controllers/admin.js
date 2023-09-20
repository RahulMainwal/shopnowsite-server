const jwt = require("jsonwebtoken");
const Product = require("../models/product");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const config = require("config");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const addProduct = async (req, res) => {
  const {
    productsName,
    productsDescription,
    productsPrice,
    productsColor,
    productsQuantity,
    productsDeliveryCharge,
    productsDiscount,
    productsBrandName,
  } = req.body;
  if (req.method === "POST") {
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await cloudinary.uploader.upload(
        path,
        { folder: "shopnow/products" },
        (result) => {
          if (result) return result;
        }
      );
      urls.push({
        asset_id: newPath.asset_id,
        public_id: newPath.public_id,
        imageUrl: newPath.secure_url,
        timeStamp: `${new Date()}`,
      });
      fs.unlinkSync(path);
    }

    if (
      productsName === "" ||
      productsBrandName === "" ||
      productsDescription === "" ||
      productsPrice === "" ||
      productsColor === "" ||
      productsQuantity === "" ||
      productsDeliveryCharge === "" ||
      productsDiscount === "" ||
      urls.length === 0
    ) {
      res.send("Please fill all fields!");
    } else {
      const product = new Product({
        Productsimages: urls,
        productsName,
        productsBrandName,
        productsDescription,
        productsPrice,
        productsColor,
        productsQuantity,
        productsDeliveryCharge,
        productsDiscount,
        timeStamp: `${new Date()}`,
      });
      res.status(201).json(await product.save());
    }
  } else {
    res.send({ error: "error" });
  }
};

const getProducts = async (req, res) => {
    try {
      const results = await Product.find({}, { __v: 0 });
      res.send(results.map((pro) => {
        return {
         _id: pro._id,
   productsName: pro.productsName,
   productsBrandName: pro.productsBrandName,
   productsDescription: pro.productsDescription,
   productsPrice: pro.productsPrice,
   productsColor: pro.productsColor,
   productsQuantity: pro.productsQuantity,
   productsDeliveryCharge: pro.productsDeliveryCharge,
   productsDiscount: pro.productsDiscount,
   reviews: pro.reviews,
   timeStamp: pro.timeStamp,
   Productsimages: pro.Productsimages.map((x, ind) => {
   return {
   asset_id:x.asset_id,
   public_id: x.public_id,
   imageUrl: x.imageUrl.replace("shopnow-image-cloudinary", "mahatmaji-storage"),
   timeStamp: x.timeStamp
   }
        })
       }    
     })
);
    } catch {
      (error) => {
        res.send({ error });
      };
    }
};

const loginAdmin = async (req, res) => {
  const { adminId, password } = req.body;
  if (!adminId || !password) {
    res.send({
      error: "Please fill all required fields!",
    });
  } else {
    if (
      adminId === process.env.ADMIN_ID &&
      password === process.env.ADMIN_ID_PASS
    ) {
      const SECRET = process.env.JWT_SECRET_KEY;
      const payload = {
        adminId,
        password,
      };

      res.status(201).json({
        token: await jwt.sign(payload, SECRET),
      });
    } else {
      res.send({
        error: "You are not authorized admin!",
      });
    }
  }
};

const adminAuth = async (req, res) => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoic2hvcG5vd0BhZG1pbi5jb20iLCJwYXNzd29yZCI6IlNob3Bub3dAMjU0QURNSU4iLCJpYXQiOjE2NzM3ODg2OTN9.rMOpKBYdWexnDJfE9GydMP7tM94MHJwjwCO_mJ4Q2Jw";
  await jwt.verify(token, process.env.JWT_SECRET_KEY, (error, verifed) => {
    if (error) {
      res.send({
        error: "Incorrect token!",
      });
    }
    if (verifed) {
      res.send({ authorized: true });
    }
  });
};

const updateProduct = async (req, res) => {
  const id = req.body.id;
  const productData = {
    ...req.body.details,
  };
  if (id && productData) {
    Product.findById({ _id: id })
      .exec()
      .then((data) => {
        if (data) {
          Product.updateOne({ _id: id }, productData)
            .then((info) => {
              res.status(201).json(info);
            })
            .catch((err) => {
              if (err) {
                res.status(400).json({
                  error: "Data could not update!",
                });
              }
            });
        } else {
          res.status(404).json({ error: "Data not found!" });
        }
      })
      .catch((err) => {
        res.status(404).json({ error: "Data not found!" });
      });
  } else {
    res.status(400).json({
      error: "Please fill all required filleds!",
    });
  }
};

const deleteProduct = async (req, res) => {
  const productId = req.body.id;
  if (productId) {
    Product.findByIdAndDelete({ _id: productId })
      .then((data) => {
        res.status(201).json(data);
      })
      .catch((err) => {
        if (err) {
          res.status(400).json({
            error: "Could not delete & try again",
          });
        }
      });
  } else {
    res.status(400).json({
      error: "Please fill all required fields!",
    });
  }
};

module.exports = {
  loginAdmin,
  adminAuth,
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
};
