const express = require("express");
const sellerController = require("../controllers/seller");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.post("/events/:id/sellers", authenticate, sellerController.createSeller);

module.exports = router;
