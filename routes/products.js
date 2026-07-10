const express = require("express");
const router = express.Router();
const Product = require("../models/Product"); // Ensure aapka model path sahi hai

// 1. GET ALL PRODUCTS (Catalog Fetch)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    console.error("❌ GET PRODUCTS ERROR:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
});

// 2. CREATE PRODUCT (Publish to DB)
router.post("/", async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !price) {
      return res
        .status(400)
        .json({ message: "Product Name and Price are strictly required." });
    }

    const newProduct = new Product({
      name,
      description: description || "",
      price: Number(price),
      category: category || "General",
      stock: stock ? Number(stock) : 0,
    });

    const savedProduct = await newProduct.save();
    console.log(`✅ Product [${name}] published smoothly to Cloud Atlas!`);
    return res.status(201).json(savedProduct);
  } catch (error) {
    console.error("❌ POST PRODUCT ERROR:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to create product", error: error.message });
  }
});

// 3. DELETE PRODUCT (The complete wipe function)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Incoming delete request for Product ID: ${id}`);

    // Mongoose query executing live over your 'ecommerce_v2' cluster
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      console.log(`⚠️ Product with ID ${id} not found in database.`);
      return res
        .status(404)
        .json({ message: "Product already deleted or does not exist." });
    }

    console.log(
      `✅ Product [${deletedProduct.name}] successfully erased from database.`,
    );
    return res
      .status(200)
      .json({ message: "Product wiped cleanly from cloud database!" });
  } catch (error) {
    console.error("❌ BACKEND DELETE EXECUTION ERROR:", error.message);
    return res
      .status(500)
      .json({
        message: "Internal Server Error during deletion",
        error: error.message,
      });
  }
});

module.exports = router;
