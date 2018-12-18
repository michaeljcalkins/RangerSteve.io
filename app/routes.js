"use strict";

var express = require("express");
var basicAuth = require("basicauth-middleware");
var router = express.Router();
var MainController = require("./controllers/MainController");

var auth = basicAuth("admin", "!rs(;;)");

router.get("/", MainController.home);
router.get("/game", MainController.game);
router.get("/how-to-play", MainController.howToPlay);
router.get("/create-a-room", MainController.createARoom);
router.get("/map-editor", MainController.mapEditor);
router.get("/rooms", MainController.rooms);
router.get("/credits", MainController.credits);

module.exports = router;
