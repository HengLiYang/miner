"use strict";

const ModelBoxMining = require("../models/box.mining.model");
const KEYS = require("../models/oauth2.model").KEYS;


var ControllerBoxMining = module.exports;
//设备 挖矿 产币
ControllerBoxMining.addBoxMining = function addBoxMining(req, res){
    let body = req.body;
    ModelBoxMining.addBoxMining(body).then((data) => {
        res.status(200);
        res.json(data);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
};


//设备 状态
ControllerBoxMining.updateBoxStatus = function updateBoxStatus(req, res){
    let body = req.body;
    ModelBoxMining.updateBoxStatus(body).then((data) => {
        res.status(200);
        res.json(data);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
};
