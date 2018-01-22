"use strict";

const express = require("express"),
    bodyParser = require("body-parser"),
    oauthserver = require("express-oauth-server");
const ControllerAccount = require("./api/controllers/account_controller");
const ControllerBox = require("./api/controllers/box_controller");
const ControllerAccountBox = require("./api/controllers/account_box_controller");
const ControllerExtractCoins = require("./api/controllers/extract_coins_controller");
const ControllerReceiveAddress = require("./api/controllers/receive_address_controller");
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next){
  let method = req.method,
      url = req.originalUrl,
      ip = req.ip;
  console.log(`\n\nStarted ${method} ${url} for ${ip} at ${new Date().toLocaleString()}`);
  next();
});

app.oauth = new oauthserver({
    model: require('./api/models/oauth2.model')
});

app.post('/promo/token', app.oauth.token());

//-- authed
// app.post("/promo/authed/account/box/connect", app.oauth.authenticate(), ControllerAccountBox.createAccountBox);//绑定设备
app.post("/promo/authed/account/box/connect", ControllerAccountBox.createAccountBox);//绑定设备
app.post("/promo/authed/account/box/disconnect", ControllerAccountBox.delAccountBox);//解绑设备
app.post("/promo/authed/account/coins/extract", ControllerExtractCoins.addCoinExtract);//提交提币申请
app.post("/promo/authed/account/coins/address/add", ControllerReceiveAddress.addReceiveAddress);//添加收币地址
app.post("/promo/authed/account/coins/address/del", ControllerReceiveAddress.delReceiveAddress);//删除收币地址
//-- authed end

//-- public
app.post('/promo/public/addbox/msg', ControllerBox.addBoxMacCode);//添加盒子的 mac/code
//-- public end
//-- manage
var port = process.env.PORT || 8108;
app.listen(port);

console.log(`listen the port: ${port}`);
// for test
module.exports = app;


var schedule = require('node-schedule');
var j = schedule.scheduleJob('11 * * * * *', function(){
  console.log('The answer to life, the universe, and everything!');
  console.log(new Date());
});