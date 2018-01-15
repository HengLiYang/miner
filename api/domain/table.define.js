const Sequelize = require('./promominer.prepare').Sequelize;
const sequelize = require('./promominer.prepare').sequelize;
const redis = require('./promominer.prepare').redis;
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

model.DomainAccountMiner = sequelize.define("t_account_miner", {
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
    accountType: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    totalMiningCoin:{//挖币的总数
        type: Sequelize.DOUBLE,
        field: "total_miningcoin"
    },
    remainMiningCoin:{//剩余币的总数
        type: Sequelize.DOUBLE,
        field: "remain_miningcoin"
    },
    wechat: {
        type: Sequelize.STRING,
        field: "wechat"
    },
    qq:{
        type:Sequelize.STRING,
        filed:'qq'
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

model.DomainBox = sequelize.define("t_box", {
    boxMac: {
        type: Sequelize.STRING,
        unique: true
    },
    boxCode: {
        type: Sequelize.STRING,
        unique: true
    },
    boxIp: {
        type: Sequelize.STRING
    },
    isOnline: { //是否在线
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    isActive: { //是否激活
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    isMining: { //是否可以挖矿
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

model.DomainAccountBox = sequelize.define("t_box_account", {
    account: {
        type: Sequelize.STRING
    },
    boxMac: {
        type: Sequelize.STRING
    },
    status: {//绑定 解绑
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    boxMac: {
        type: Sequelize.STRING
    },
    boxCode: {
        type: Sequelize.STRING
    },
    boxIp: {//今日ip
        type: Sequelize.STRING
    },
    onlineTime:{//在线时长
        type: Sequelize.DOUBLE,
        field: "online_time"
    },
    uplinkBandwidth:{//上行带宽 平均数
        type: Sequelize.DOUBLE,
        field: "uplink_band_width"
    },
    storageSize:{//存储
        type: Sequelize.DOUBLE,
        field: "box_storage_size"
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
    status:{ //状态：wait／ok
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
    model.DomainAccountMiner.findOne().then((accountInstance) => {
        if (accountInstance == undefined) {
            return model.DomainAccountMiner.create({
                account: "admin",
                password: "admin#20170829#promominer",
                accountType: "admin"
            });
        } else {
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
