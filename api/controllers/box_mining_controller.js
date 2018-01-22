"use strict";

const ModelAccountBox = require("../models/account_box.model");
const KEYS = require("../models/oauth2.model").KEYS;


var ControllerBoxMining = module.exports;
//设备 挖矿 产币
ControllerBoxMining.addBoxMining = function addBoxMining(req, res){
    let body = req.body;
    let account = res.locals.oauth.token.user;
    // ModelAccountBox.createAccountBox(account,body).then((data) => {
    //     res.status(200);
    //     res.json(data);
    // }).catch((error) => {
    //     res.status(500);
    //     res.json(error);
    // });
};
