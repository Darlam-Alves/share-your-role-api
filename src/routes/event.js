const express = require("express");
const eventController = require("../controllers/event");
const sellerController = require("../controllers/seller");
const { authenticate, requireRole } = require("../middlewares/auth");

const router = express.Router(); 

router.get("/events", eventController.listEvents);
router.get("/events/:id", eventController.getEventById);
router.post("/events", authenticate, requireRole("institutional", "admin"), eventController.createEvent);
router.delete("/events/:id", authenticate, eventController.deleteEvent);
router.get("/events/:id/sellers", sellerController.listSellers);
router.post("/events/:id/sellers", authenticate, sellerController.createSeller);

module.exports = router;