"use strict";

const sequelize = require('../domain/promominer.prepare').sequelize;
const TABLE_DEFINE = require("../domain/table.define");
const DomainCanReceiveAddres = TABLE_DEFINE.DomainCanReceiveAddres;

var ModelCanReceiveAddres = module.exports;

//添加收币地址
ModelCanReceiveAddres.addReceiveAddress = function addReceiveAddress(account,body) {
    
    return DomainCanReceiveAddres.create({
        account:account.id,
        addressName:body.addressName,
        canReceiveAddress:body.canReceiveAddress
    }).then((date)=>{
        return {
            isSuccess:true,
            reason:"添加成功"
        };
    });
};

//删除收币地址
ModelCanReceiveAddres.delReceiveAddress = function delReceiveAddress(account,body) {
    
    return DomainCanReceiveAddres.destroy({
        where:{
            account:account.id,
            canReceiveAddress:body.canReceiveAddress
        }
    }).then((date)=>{
        return {
            isSuccess:true,
            reason:"删除成功"
        };
    });
};