"use strict";

const sequelize = require('../domain/promoserver.prepare').sequelize;
const TABLE_DEFINE = require("../domain/table.define");
const DomainCoinEveryDay = TABLE_DEFINE.DomainCoinEveryDay;
const DomainAccountBox = TABLE_DEFINE.DomainAccountBox;
const DomainAccountBoxConnect = TABLE_DEFINE.DomainAccountBoxConnect;
const DomainBoxStatus = TABLE_DEFINE.DomainBoxStatus;
const moment = require('moment');
var ModelBoxMining = module.exports;

//每刻 挖币 产币
ModelBoxMining.addBoxMining = function addBoxMining(body) {
    return DomainAccountBoxConnect.findOne({
        where:{
            boxSN:body.boxSN,
            isBinding:true
        }
    }).then((boxaccount)=>{
        console.log(JSON.stringify(boxaccount));
        if(boxaccount == null || boxaccount == undefined){
            return {
                isSuccess:false,
                reason:"请先绑定设备"
            };
        }else{
            let today = moment(new Date()).format('YYYY-MM-DD');
            return DomainCoinEveryDay.create({
                    account: boxaccount.account,
                    boxSN: body.boxSN,
                    boxIp:body.boxIp,
                    miningCoin:body.miningCoin == null ? 0.0 : body.miningCoin,
                    today:today
            }).then((data)=>{
                if(data == null || data == undefined){
                    return {
                        isSuccess:false,
                        reason:"插入失败"
                    };
                }else{
                    return DomainAccountBox.findOne({
                        where:{
                            account:boxaccount.account
                        }
                    }).then((date)=>{
                        return date.increment({totalMiningCoin:data.miningCoin, remainMiningCoin:data.miningCoin}).then(function(user){
                            return {    
                                isSuccess:true,
                                reason:"保存成功"
                            };
                        })
                    });
                }
            });
        }
    });
};

//盒子 状态
ModelBoxMining.updateBoxStatus = function updateBoxStatus(body) {
    return DomainBoxStatus.insertOrUpdate(body).then(()=>{
        return {
            isSuccess:true,
            reason:"插入成功"
        };
    }).catch((error) => {
    })
};