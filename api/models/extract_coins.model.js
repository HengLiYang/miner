"use strict";

const sequelize = require('../domain/promoserver.prepare').sequelize;
const TABLE_DEFINE = require("../domain/table.define");
const DomainCoinExtract = TABLE_DEFINE.DomainCoinExtract;
const DomainAccountBox = TABLE_DEFINE.DomainAccountBox;

var ModelCoinExtract = module.exports;

// 提取币
ModelCoinExtract.addCoinExtract = function addCoinExtract(account,body) {
    let isArray = body.isArray;
    let data = body.allData;
    
    //这里验证下，可以提取的数量是否超出余额
    return DomainAccountBox.findOne({
        where:{
            account:account.id
        }
    }).then((accountData)=>{
        //这里 假定 手续费在这次提币中扣除
        if(accountData.remainMiningCoin >= (body.amount+body.minerfee)){
            return DomainCoinExtract.create({
                account:account.id,
                amount:body.amount,
                minerfee:body.minerfee,
                status:"wait",
                actualAmount:body.amount - body.minerfee,
                canReceiveAddress:body.canReceiveAddress
            }).then((data)=>{
                //更新主账户 剩余币／锁定币
                return DomainAccountBox.update(
                    {
                        remainMiningCoin:accountData.remainMiningCoin - body.amount,
                        lockingCoins: accountData.lockingCoins + body.amount
                    },{
                    where:{
                        account:account.id
                    }
                }).then((data)=>{
                    if(data>0){
                        return {
                            isSuccess:true
                        };
                    }else{
                        return {
                            isSuccess:false,
                            reason:"更新数据出现错误"
                        };
                    }
                });
            });
        }else{
            return {
                isSuccess:false,
                reason:"余额不足"
            };
        }
    });
    
};

//获取 提币 列表
ModelCoinExtract.getCoinExtractLists = function getCoinExtractLists(account) {
    return DomainCoinExtract.findAll({
        where:{
            account:account.id
        }
    }).then((dataArray)=>{
        return dataArray;
    });
};