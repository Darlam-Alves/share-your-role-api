const express = require("express");
const eventController = require("../controllers/event");
const { authenticate, requireRole } = require("../middlewares/auth");

const router = express.Router(); // <--- ESSA LINHA É A QUE ESTAVA FALTANDO!

router.get("/events", eventController.listEvents);

router.get("/events/:id", eventController.getEventById);
router.post("/events", authenticate, requireRole("institutional", "admin"), eventController.createEvent);
router.patch("/events/:id", authenticate, requireRole("institutional", "admin"), eventController.updateEvent);
router.delete("/events/:id", authenticate, eventController.deleteEvent);
router.post("/events/:id/resales", authenticate, eventController.createEventResale);
router.get("/events/:id/resales", eventController.getEventResales);
router.patch("/resales/:id", authenticate, eventController.updateEventResale);
router.delete("/resales/:id", authenticate, eventController.deleteEventResale);
module.exports = router;
