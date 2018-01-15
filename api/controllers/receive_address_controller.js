"use strict";

const ModelReceiveAddress = require("../models/receive_address.model");

var ControllerReceiveAddress = module.exports;
//添加收币地址列表
ControllerReceiveAddress.addReceiveAddress = function addReceiveAddress(req, res){
    let body = req.body;
    let account = res.locals.oauth.token.user;
    ModelReceiveAddress.addReceiveAddress(account,body).then((data) => {
        res.status(200);
        res.json(data);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
};

//删除收币地址列表
ControllerReceiveAddress.delReceiveAddress = function delReceiveAddress(req, res){
    let body = req.body;
    let account = res.locals.oauth.token.user;
    ModelReceiveAddress.delReceiveAddress(account,body).then((data) => {
        res.status(200);
        res.json(data);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
};