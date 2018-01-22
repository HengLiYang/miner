"use strict";

const sequelize = require('../domain/promoserver.prepare').sequelize;
const TABLE_DEFINE = require("../domain/table.define");
const DomainAccountBoxConnect = TABLE_DEFINE.DomainAccountBoxConnect;
const DomainBox = TABLE_DEFINE.DomainBox;
const DomainBoxStatus = TABLE_DEFINE.DomainBoxStatus;

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

