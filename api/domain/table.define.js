const Sequelize = require('./promoserver.prepare').Sequelize;
const sequelize = require('./promoserver.prepare').sequelize;
const redis = require('./promoserver.prepare').redis;
const moment = require('moment');

const KEYS = require("../models/oauth2.model").KEYS;

const createdAt = {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: "created_at",
    get() {
        return getDate.call(this, 'createdAt');
    }
}

const updatedAt = {
    type: Sequelize.DATE,
    field: "updated_at",
    get() {
        return getDate.call(this, 'updatedAt');
    }
}

function getDate(field) {
    let value = this.getDataValue(field);
    if(value == null) {
        return '';
    }
    return moment(this.getDataValue(field)).format('YYYY-MM-DD HH:mm:ss')
}

var model = module.exports;

model.DomainAccountBox = sequelize.define("t_account_canbox", {
    account: {
        type: Sequelize.STRING,
        unique: true
    },
    accountName: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING,
        unique: true
    },
    phone: {
        type: Sequelize.STRING,
        unique: true
    },
    gender: {
        type: Sequelize.INTEGER
    },
    avatar: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    status: {
        type: Sequelize.STRING
    },
    accountType: {
        type: Sequelize.STRING,
        field: "account_type"
    },
    country:{
        type:Sequelize.STRING,
        filed:'country'
    },
    firstName:{
        type:Sequelize.STRING,
        field:'first_name'
    },
    lastName:{
        type:Sequelize.STRING,
        field:'last_name'
    },
    idCardNumber:{
        type:Sequelize.STRING,
        field:'id_card_number'
    },
    receiveCanAddress:{//众筹接受地址
        type:Sequelize.STRING,
        field:'receive_can_address'
    },
    canAmount: {//众筹时候数量
        type: Sequelize.BIGINT,
        field: "can_amount"
    },
    totalMiningCoin:{//挖币的总数
        type: Sequelize.DOUBLE,
        field: "total_miningcoin",
        defaultValue: 0
    },
    remainMiningCoin:{//剩余币的总数
        type: Sequelize.DOUBLE,
        field: "remain_miningcoin",
        defaultValue: 0
    },
    lockingCoins:{//提币时候锁定币
        type: Sequelize.DOUBLE,
        field: "locking_coins",
        defaultValue: 0
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

model.DomainBox = sequelize.define("t_box", {
    boxSN: {
        type: Sequelize.STRING,
        unique: true
    },
    boxMac: {
        type: Sequelize.STRING,
        unique: true
    },
    boxIp: {
        type: Sequelize.STRING
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

model.DomainAccountBoxConnect = sequelize.define("t_box_account", {
    account: {
        type: Sequelize.STRING
    },
    boxSN: {
        type: Sequelize.STRING
    },
    isBinding: {//绑定 解绑
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

model.DomainBoxStatus = sequelize.define("t_box_status", {//盒子状态
    boxSN: {
        type: Sequelize.STRING,
        unique: true
    },
    status: { //状态：0:未连接  1:挖矿中  2:待机中 3:异常
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    isMining: { //是否可以挖矿
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    boxIp: {//ip
        type: Sequelize.STRING
    },
    uplinkBandwidth:{//上行带宽
        type: Sequelize.DOUBLE,
        field: "uplink_band_width",
        defaultValue: 0
    },
    storageSize:{//存储
        type: Sequelize.DOUBLE,
        field: "box_storage_size",
        defaultValue: 0
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

model.DomainCanReceiveAddres = sequelize.define("t_can_receive_address", {//收币地址
    account: {
        type: Sequelize.STRING
    },
    addressName: {
        type: Sequelize.STRING
    },
    canReceiveAddress: {
        type: Sequelize.STRING,
        field: "can_receive_address"
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

model.DomainCoinEveryDay = sequelize.define("t_coin_everyday", {
    account: {
        type: Sequelize.STRING
    },
    boxSN: {
        type: Sequelize.STRING
    },
    boxIp: {//今日ip
        type: Sequelize.STRING
    },
    miningCoin:{//挖币总数
        type: Sequelize.DOUBLE,
        field: "mining_coin"
    },
    today:{
        type: Sequelize.STRING,
        field: "date_today"//2018-10-01
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

model.DomainCoinExtract = sequelize.define("t_coin_extract", {//提取币
    account: {
        type: Sequelize.STRING
    },
    amount:{//提取数量
        type: Sequelize.DOUBLE,
        field: "extract_amount"
    },
    minerfee:{//手续费
        type: Sequelize.DOUBLE,
        field: "miner_fee"
    },
    actualAmount:{//实际到账
        type: Sequelize.DOUBLE,
        field: "actual_amount"
    },
    status:{ //状态：wait等待／ok成功/fail失败或者取消/processing处理中
        type: Sequelize.STRING,
        field: "extract_status"
    },
    canReceiveAddress:{
        type: Sequelize.STRING,
        field: "can_receive_address"
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

sequelize.sync({ force: false }).then(() => {
    model.DomainAccountBox.findOne().then((accountInstance) => {
        if (accountInstance == undefined) {
            return model.DomainAccountBox.create({
                account: "admin",
                appellation: "admin",
                password: "admin#20170829#ubc",
                accountType: "admin"
            });
        }else {
            return accountInstance;
        }
    }).then((accountInstance) => {
        let account = accountInstance.toJSON();
        let ar = {
            username: account.account,
            password: account.password,
            accountId: account.id
        };
        console.log('==================================PARAMETER=====================================');
        console.log(ar);
        let adminkey = `${KEYS.user}${account.account}`;
        console.log(adminkey);
        console.log('==================================   END   =====================================');
        return redis.hmsetAsync(adminkey, ar);
    }).catch((error) => {
        console.log(`init redis error:${error}`);
    });
});
