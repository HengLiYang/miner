"use strict";

const sequelize = require('../domain/promominer.prepare').sequelize;
const TABLE_DEFINE = require("../domain/table.define");
const DomainAccountBox = TABLE_DEFINE.DomainAccountBox;
const DomainBox = TABLE_DEFINE.DomainBox;

var ModelAccountBox = module.exports;

//绑定设备
ModelAccountBox.createAccountBox = function createAccountBox(account,body) {
    let boxCode = body.boxCode;
    //绑定设备之前是不是先查看是否有这个设备
    return DomainBox.findOne({
        where:{
            boxCode:boxCode
        }
    }).then((oneBox)=>{
        if(oneBox == null || oneBox == undefined){
            return {
                isSuccess:false,
                reason:"没有此设备"
            };
        }else{
            return DomainAccountBox.findAll({
                where:{
                    boxMac:oneBox.boxMac,
                    status:true
                }
            }).then((array) => {
                if(array.length>0){
                    return {
                        isSuccess:false,
                        reason:"已被其他账户绑定"
                    };
                }else{
                    return DomainAccountBox.create({
                        account:account.id,
                        boxMac:oneBox.boxMac,
                        boxCode:oneBox.boxCode,
                        status:true
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
    let boxMac = body.boxMac;
    return DomainAccountBox.findAll({
        where:{
            account:account.id,
            boxMac:boxMac,
            status:true
        }
    }).then((array) => {
        if(array.length>0){
            return DomainAccountBox.update({
                account:account.id,
                boxMac:boxMac,
                status:false
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


