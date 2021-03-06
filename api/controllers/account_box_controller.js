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

//获取设备列表
ControllerAccountBox.getBoxLists = function getBoxLists(req, res){
    let account = res.locals.oauth.token.user;
    ModelAccountBox.getBoxLists(account).then((data) => {
        res.status(200);
        res.json(data);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
};

//搜索设备
ControllerAccountBox.searchBoxUseSn = function searchBoxUseSn(req, res){
    let account = res.locals.oauth.token.user;
    let boxSN = req.params.boxSN;
    ModelAccountBox.searchBoxUseSn(account,boxSN).then((data) => {
        res.status(200);
        res.json(data);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
};
//挖矿统计
ControllerAccountBox.getStatistics = function getStatistics(req, res){
    let account = res.locals.oauth.token.user;
    ModelAccountBox.getStatistics(account).then((data) => {
        res.status(200);
        res.json(data);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
};

//停止／开始挖矿
ControllerAccountBox.changeBoxMining = function changeBoxMining(req, res){
    let account = res.locals.oauth.token.user;
    let boxSN = req.params.boxSN;
    let isMining = req.params.isMining;
    //这里需要做 与设备的交互？
    ModelAccountBox.changeBoxMining(account,boxSN,isMining).then((data) => {
        res.status(200);
        res.json(data);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
};