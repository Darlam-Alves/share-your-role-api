const express = require("express");
const eventController = require("../controllers/event");
const { authenticate, requireRole } = require("../middlewares/auth");

const router = express.Router(); // <--- ESSA LINHA É A QUE ESTAVA FALTANDO!

router.get("/events", eventController.listEvents);
router.get("/events/:id", eventController.getEventById);

// Versão MOCKADA para teste de criação sem precisar de Token JWT
router.post("/events", (req, res, next) => {
  req.user = { 
    id: "00000000-0000-0000-0000-000000000002",
    role: "admin" 
  };
  next();
}, eventController.createEvent);

module.exports = router;