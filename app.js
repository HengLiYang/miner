"use strict";

const express = require("express"),
    bodyParser = require("body-parser"),
    oauthserver = require("express-oauth-server");
const ControllerAccount = require("./api/controllers/account_controller");
const ControllerBox = require("./api/controllers/box_controller");
const ControllerAccountBox = require("./api/controllers/account_box_controller");
const ControllerExtractCoins = require("./api/controllers/extract_coins_controller");
const ControllerReceiveAddress = require("./api/controllers/receive_address_controller");
const ControllerBoxMining = require("./api/controllers/box_mining_controller");
const ControllerResetPassword = require('./api/controllers/reset_password_controller');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * enable session
 * 用于`找回密码`相关逻辑
 * 假设找回密码时还没有`access token`
 */
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const prepare = require('./api/domain/promoserver.prepare');

app.use(session({
    store: new RedisStore({
        client: prepare.redis
    }),
    secret: ["zwJqA$#NU*F7", "S@#^k3ScmP23"],
    resave: false,
    cookie: {
        maxAge: 7 * 86400 * 1000
    }
}));

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

/**
 * 找回密码
 * step 1: 发送短信验证码
 */
app.post('/promo/resetpassword/sendcode', ControllerResetPassword.countdowning, ControllerResetPassword.sendSMSCode);

/**
 * 找回密码
 * step 2: 校验短信验证码
 */
app.post('/promo/resetpassword/verifycode', ControllerResetPassword.verifySMSCode);

/**
 * 找回密码
 * step 3: 重置密码
 */
app.post('/promo/resetpassword', ControllerResetPassword.resetPassword);

app.post('/promo/token', app.oauth.token());

//-- authed
app.post("/promo/authed/account/box/connect",app.oauth.authenticate(),  ControllerAccountBox.createAccountBox);//绑定设备
app.get("/promo/authed/account/box/lists",app.oauth.authenticate(),  ControllerAccountBox.getBoxLists);//获取设备列表
app.post("/promo/authed/account/box/disconnect",app.oauth.authenticate(),  ControllerAccountBox.delAccountBox);//解绑设备
app.post("/promo/authed/account/coins/extract", app.oauth.authenticate(), ControllerExtractCoins.addCoinExtract);//提交提币申请
app.get("/promo/authed/account/coins/extract/lists", app.oauth.authenticate(), ControllerExtractCoins.getCoinExtractLists);//获取提币列表
app.post("/promo/authed/account/coins/address/add", app.oauth.authenticate(), ControllerReceiveAddress.addReceiveAddress);//添加收币地址
app.post("/promo/authed/account/coins/address/del", app.oauth.authenticate(), ControllerReceiveAddress.delReceiveAddress);//删除收币地址
//-- authed end

//-- public
app.post('/promo/public/addbox/msg', ControllerBox.addBoxMacCode);//添加盒子的 mac/code
app.post("/promo/public/box/everytime/mining/coins", ControllerBoxMining.addBoxMining);//设备每刻的产币
app.post("/promo/public/box/status/update", ControllerBoxMining.updateBoxStatus);//设备状态
//设备信息开机传输
//-- public end
//-- manage
var port = process.env.PORT || 8108;
app.listen(port);

console.log(`listen the port: ${port}`);
// for test
module.exports = app;


// var schedule = require('node-schedule');
// var j = schedule.scheduleJob('11 * * * * *', function(){
//   console.log('The answer to life, the universe, and everything!');
//   console.log(new Date());
// });

// 1.矿机列表／设备信息开机传输
// 2.挖矿统计（在线设备／总设备，今日出币(所有矿机)，昨日出币(所有矿机)，累计出币）
// 3.停止挖矿
// 4.提币列表（今日出币）
// 5.找回密码
// 6.修改密码
// 7.绑定邮箱／手机
