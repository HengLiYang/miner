"use strict";

const sequelize = require('../domain/promominer.prepare').sequelize;
const TABLE_DEFINE = require("../domain/table.define");
const DomainCoinExtract = TABLE_DEFINE.DomainCoinExtract

var ModelCoinExtract = module.exports;

//添加设备
ModelCoinExtract.addCoinExtract = function addCoinExtract(account,body) {
    let isArray = body.isArray;
    let data = body.allData;
    
//这里是不是可以验证下，可以提取的数量是否可以？
        // remainMiningCoin
    return DomainCoinExtract.create({
        account:account.id,
        amount:body.amount,
        minerfee:body.minerfee,
        status:"wait",
        canReceiveAddress:body.canReceiveAddress
    }).then((data)=>{
        return {
            isSuccess:true
        };
    });
   
};