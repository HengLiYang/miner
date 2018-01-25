"use strict";

const ModelExtractCoins = require("../models/extract_coins.model");

var ControllerExtractCoins = module.exports;
//提交提币申请
ControllerExtractCoins.addCoinExtract = function addCoinExtract(req, res){
    let body = req.body;
    let account = res.locals.oauth.token.user;
    ModelExtractCoins.addCoinExtract(account,body).then((data) => {
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.log(error);
        res.status(500);
        res.json(error);
    });
};

//提币列表
ControllerExtractCoins.getCoinExtractLists = function getCoinExtractLists(req, res){
    let account = res.locals.oauth.token.user;
    ModelExtractCoins.getCoinExtractLists(account).then((data) => {
        res.status(200);
        res.json(data);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
};

//取消提币
ControllerExtractCoins.delCoinExtract = function delCoinExtract(req, res){
    let account = res.locals.oauth.token.user;
    let body = req.body;
    ModelExtractCoins.delCoinExtract(account,body).then((data) => {
        res.status(200);
        res.json(data);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
};