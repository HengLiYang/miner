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

/**
 * 通过手机号查找用户
 *
 * @param  {String} phone   手机号
 * @return {Object}         用户是否存在
 */
ModelAccount.existUserByPhone = function existUserByPhone(phone) {
    return DomainAccountBox.count({
        where: {
            phone: phone
        }
    });
};

/**
 * 通过邮箱查找用户
 *
 * @param  {String} email   邮箱
 * @return {Object}         用户是否存在
 */
ModelAccount.existUserByEmail = function existUserByEmail(email) {
    return DomainAccountBox.count({
        where: {
            email: email
        }
    });
};

/**
 * 修改用户密码
 *
 * @param  {String} user            用户标识
 * @param  {String} newPassword     新密码
 * @return {[type]}
 */
ModelAccount.resetPassword = function resetPassword(user, newPassword) {
    return DomainAccountBox.update({
        password: newPassword
    }, {
        where: {
            phone: user
        }
    });
};
