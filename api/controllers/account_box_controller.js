"use strict";

const ModelAccountBox = require("../models/account_box.model");
const redis = require('../domain/promoserver.prepare').redis;
const KEYS = require("../models/oauth2.model").KEYS;


var ControllerAccountBox = module.exports;
//绑定设备
ControllerAccountBox.createAccountBox = function createAccountBox(req, res){
    let body = req.body;
    let account = res.locals.oauth.token.user;
    ModelAccountBox.createAccountBox(account,body).then((data) => {
        res.status(200);
        res.json(data);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
};

//解除绑定设备
ControllerAccountBox.delAccountBox = function delAccountBox(req, res){
    let body = req.body;
    let account = res.locals.oauth.token.user;
    ModelAccountBox.delAccountBox(account,body).then((data) => {
        res.status(200);
        res.json(data);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
};
