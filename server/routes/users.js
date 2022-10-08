// import express router
const express = require("express")
const router = express.Router()
const client = require("../index").client

module.exports = router

router.get("/", (req, res) => {
  res.send("Users api")
})

router.get("/:id", (req, res) => {
  // client.
})