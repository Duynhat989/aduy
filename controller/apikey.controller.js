const apikey = require("../models/apikey.model");

let debug = true;
exports.register = async (req, res) => {
  try {
    const { keygemini } = req.body;
    var newStore = await apikey.register(keygemini);
    if (newStore != null) {
      res.send({
        status: true
      });
    } else {
      res.status(500).send({
        status: false,
      });
    }
  } catch (error) {
    res.status(500).send({
      status: false
    });
  }
};
exports.list = async (req, res) => {
  try {
    var props = await apikey.list()
    res.send({
      status: true,
      datas: props,
    });
  } catch (error) {
    res.send({
      status: false,
      error: error,
    });
  }
};
exports.destroy = async (req, res) => {
  try {
    const { keygemini } = req.body;
    const apikeys = await apikey.findOne(keygemini); // Adjust this line based on your ORM/database client
    if (apikeys) {
      await apikey.destroys(keygemini); // Adjust this line based on your ORM/database client
      res.send({
        status: true,
        message: "API key deleted successfully."
      });
    } else {
      res.send({
        status: false,
        message: "API key not found."
      });
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "An error occurred.",
      error: error.message
    });
  }
};