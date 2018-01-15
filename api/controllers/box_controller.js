"use strict";

const ModelBox = require("../models/box.model");

var ControllerBox = module.exports;
//添加设备信息
ControllerBox.addBoxMacCode = function addBoxMacCode(req, res){
    let body = req.body;
    ModelBox.addBoxMacCode(body).then((data) => {
        res.status(200);
        res.json(data);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
};
