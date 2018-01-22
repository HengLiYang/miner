"use strict";

const sequelize = require('../domain/promoserver.prepare').sequelize;
const TABLE_DEFINE = require("../domain/table.define");
const DomainCoinEveryDay = TABLE_DEFINE.DomainCoinEveryDay;
const DomainAccountBox = TABLE_DEFINE.DomainAccountBox;
const moment = require('moment');
var ModelBoxMining = module.exports;

//每刻 挖币 产币
ModelBoxMining.addBoxMining = function addBoxMining(body) {
    return DomainAccountBox.findOne({
        where:{
            boxSN:body.boxSN,
            isBinding:true
        }
    }).then((boxaccount)=>{
        if(boxaccount == null || boxaccount == undefined){
            return {
                isSuccess:false,
                reason:"请先绑定设备"
            };
        }else{
            let today = moment(new Date()).format('YYYY-MM-DD');
            return DomainCoinEveryDay.create({
                where:{
                    account: boxaccount.account,
                    boxSN: body.boxSN,
                    boxIp:body.boxIp,
                    uplinkBandwidth:body.uplinkBandwidth,
                    storageSize:body.storageSize,
                    miningCoin:body.miningCoin,
                    today:today
                }
            }).then((data)=>{
                if(data == null || data == undefined){
                    return {
                        isSuccess:false,
                        reason:"插入失败"
                    };
                }else{
                    return DomainAccountBox.update(
                        {
                        totalMiningCoin:boxaccount.totalMiningCoin + body.miningCoin,
                        remainMiningCoin:boxaccount.remainMiningCoin + body.miningCoin
                        },{
                        where:{
                            account:boxaccount.account
                        }
                    }).then((date)=>{
                        return {    
                            isSuccess:true,
                            reason:"保存成功"
                        };
                    });
                }
            });
        }
    });
};