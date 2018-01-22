"use strict";

const sequelize = require('../domain/promoserver.prepare').sequelize;
const redis = require('../domain/promoserver.prepare').redis;
const KEYS = require("./oauth2.model").KEYS;
const TABLE_DEFINE = require("../domain/table.define");
const DomainAccountBox = TABLE_DEFINE.DomainAccountBox;
const DomainLibEth = TABLE_DEFINE.DomainLibEth;
const DomainLibBtc = TABLE_DEFINE.DomainLibBtc;
const DomainBank = TABLE_DEFINE.DomainBank;

var ModelAccount = module.exports;

const USED = "used";


ModelAccount.createPromoAccount = function createPromoAccount(accountData) {
    return sequelize.transaction((trans) => {
        let bankdata = {};
        return DomainAccountBox.create(accountData, {
            transaction: trans
        }).then((result) => {
            bankdata.account = result.toJSON();
            return bankdata;
        });
    });
};

ModelAccount.getUserAccount = function getUserAccount(account){
    return DomainAccountBox.findOne({
        where:{
            account: account.id
        }
    });
}

