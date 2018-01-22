"use strict";

const sequelize = require('../domain/promominer.prepare').sequelize;
const TABLE_DEFINE = require("../domain/table.define");
const DomainBox = TABLE_DEFINE.DomainBox;

var ModelAccountBox = module.exports;

//添加设备
ModelAccountBox.addBoxMacCode = function addBoxMacCode(body) {
    let isArray = body.isArray;
    let data = body.allData;
    if(isArray){
        return DomainBox.bulkCreate(data).then((allData)=>{
            return {
                isSuccess:true,
                reason:"添加成功"
            };
        });
    }else{
        return DomainBox.findAll({
            where:{
                boxMac:data.boxMac,
                boxSN:data.boxSN
            }
        }).then((array) => {
            if(array.length>0){
                return {
                    isSuccess:false,
                    reason:"已添加过"
                };
            }else{
                return DomainBox.create({
                    boxMac:data.boxMac,
                    boxSN:data.boxSN
                }).then((date)=>{
                    return {
                        isSuccess:true,
                        reason:"添加成功"
                    };
                });
            }
        });
    }
   
};