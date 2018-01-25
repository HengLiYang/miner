"use strict";

const sequelize = require('../domain/promoserver.prepare').sequelize;
const TABLE_DEFINE = require("../domain/table.define");
const DomainCoinExtract = TABLE_DEFINE.DomainCoinExtract;
const DomainAccountBox = TABLE_DEFINE.DomainAccountBox;

var ModelCoinExtract = module.exports;

// 提取币
ModelCoinExtract.addCoinExtract = function addCoinExtract(account,body) {
    let data = body.allData;
    
    //这里验证下，可以提取的数量是否超出余额
    return DomainAccountBox.findOne({
        where:{
            account:account.id
        }
    }).then((accountData)=>{
        //这里 假定 手续费在这次提币中扣除
        if(accountData.remainMiningCoin*1.0 >= (body.amount*1.0+body.minerfee*1.0)){
            return DomainCoinExtract.create({
                account:account.id,
                amount:body.amount,
                minerfee:body.minerfee,
                status:"wait",
                actualAmount:body.amount - body.minerfee,
                canReceiveAddress:body.canReceiveAddress
            }).then(()=>{
                //更新主账户 剩余币／锁定币
                return DomainAccountBox.findOne({
                    where:{
                        account:account.id
                    }
                }).then((boxAccount)=>{
                    return boxAccount.increment({remainMiningCoin:-body.amount,
                        lockingCoins: body.amount}).then((data)=>{
                        return {
                            isSuccess:true
                        };
                    });
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

// 取消提取币
ModelCoinExtract.delCoinExtract = function delCoinExtract(account,body){
    return DomainCoinExtract.update(
        {
            status:"fail"
        },{
        where:{
            id:body.id,
            account:account.id,
            status:"wait"
        }
    }).then((backData)=>{
        if(backData>0){
            return DomainCoinExtract.findOne({
                where:{
                    id:body.id,
                    account:account.id
                }
            }).then((data)=>{
                return DomainAccountBox.findOne({
                    where:{
                        account:account.id
                    }
                }).then((boxAccount)=>{
                    return boxAccount.increment({remainMiningCoin:data.amount,
                        lockingCoins: -data.amount}).then((data)=>{
                        return {
                            isSuccess:true
                        };
                    });
                });
            });
        }else{
            return {
                isSuccess:false,
                reason:"您已经撤销过或者不可撤销"
            };
        }
    });
};