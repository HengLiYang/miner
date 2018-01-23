"use strict";

const sequelize = require('../domain/promoserver.prepare').sequelize;
const TABLE_DEFINE = require("../domain/table.define");
const DomainAccountBox = TABLE_DEFINE.DomainAccountBox;
const DomainAccountBoxConnect = TABLE_DEFINE.DomainAccountBoxConnect;
const DomainBox = TABLE_DEFINE.DomainBox;
const DomainBoxStatus = TABLE_DEFINE.DomainBoxStatus;
const DomainCoinEveryDay = TABLE_DEFINE.DomainCoinEveryDay;
const moment = require('moment');
var ModelAccountBox = module.exports;

//绑定设备
ModelAccountBox.createAccountBox = function createAccountBox(account,body) {
    let boxSN = body.boxSN;
    //绑定设备之前是不是先查看是否有这个设备
    return DomainBox.findOne({
        where:{
            boxSN:boxSN
        }
    }).then((oneBox)=>{
        if(oneBox == null || oneBox == undefined){
            return {
                isSuccess:false,
                reason:"没有此设备"
            };
        }else{
            return DomainAccountBoxConnect.findAll({
                where:{
                    boxSN:oneBox.boxSN,
                    isBinding:true
                }
            }).then((array) => {
                if(array.length>0){
                    return {
                        isSuccess:false,
                        reason:"已被其他账户绑定"
                    };
                }else{
                    return DomainAccountBoxConnect.create({
                        account:account.id,
                        boxSN:oneBox.boxSN,
                        isBinding:true
                    }).then((date)=>{
                        return {
                            isSuccess:true,
                            reason:"绑定成功"
                        };
                    });
                }
            });
        }
    });
};

//解除绑定设备
ModelAccountBox.delAccountBox = function delAccountBox(account,body) {
    let boxSN = body.boxSN;
    return DomainAccountBoxConnect.findAll({
        where:{
            account:account.id,
            boxSN:boxSN,
            isBinding:true
        }
    }).then((array) => {
        if(array.length>0){
            return DomainAccountBoxConnect.update({
                account:account.id,
                boxSN:boxSN,
                isBinding:false
            }).then((date)=>{
                return {
                    isSuccess:true,
                    reason:"解绑成功"
                };
            });
        }else{
            return {
                isSuccess:false,
                reason:"没有绑定信息"
            };
        }
    });
};

//获取设备列表
ModelAccountBox.getBoxLists = function getBoxLists(account) {
    return DomainAccountBoxConnect.findAll({
        where:{
            account:account.id,
            isBinding:true
        }
    }).then((array) => {
        if(array.length>0){
            let boxArray = array.map((box)=>{
                return DomainBoxStatus.findOne({
                    where:{
                        boxSN:box.boxSN
                    }
                });
            });
            return Promise.all(boxArray).then((bxarray)=>{
                return bxarray;
            });
        }else{
            return [];
        }
    });
};

function getBoxCoins(domainCoinEveryDay){
    var allcoins = 0;
    domainCoinEveryDay.forEach(element => {
        allcoins += element.miningCoin;
    });
    return allcoins;
};
//挖矿统计
ModelAccountBox.getStatistics = function getStatistics(account) {
    return DomainAccountBoxConnect.findAll({
        where:{
            account:account.id,
            isBinding:true
        }
    }).then((array) => {
        let boxArray = array.map((box)=>{
            return DomainBoxStatus.findOne({
                where:{
                    '$or':[
                        {
                            boxSN:box.boxSN,
                            status:1
                        },
                        {
                            boxSN:box.boxSN,
                            status:2
                        }
                    ]
                }
            });
        });
        return Promise.all(boxArray).then((bxarray)=>{
            let todayStr = moment().format('YYYY-MM-DD');
            let yesterdayStr = moment().subtract(1, 'days').format('YYYY-MM-DD');
            return Promise.all([
                DomainCoinEveryDay.findAll({
                    where: {
                        account:account.id,
                        today: todayStr
                    }
                }),
                DomainCoinEveryDay.findAll({
                    where: {
                        account:account.id,
                        today: yesterdayStr
                    }
                })
            ]).then((arrayCoin)=>{
                let allTodayCoins = getBoxCoins(arrayCoin[0]);
                let allYesterdayCoins = getBoxCoins(arrayCoin[1]);
                return DomainAccountBox.findOne({
                    where: {
                        account:account.id
                    }
                }).then((accountbox)=>{
                    return {
                        onLineBox:bxarray.length,
                        allBox:array.length,
                        allYesterdayCoins:allYesterdayCoins,
                        allTodayCoins:allTodayCoins,
                        totalMiningCoin:accountbox.totalMiningCoin
                    };
                });
            });
        });
    });
};

//停止/开始挖矿
function changeBoxMining(account,boxSN,isMining){
    return DomainBoxStatus.update(
        {
            isMining:isMining
        },{
            where:{
                boxSN:boxSN
        }
    }).then((data)=>{
        return {
            isSuccess:true
        };
    });
};