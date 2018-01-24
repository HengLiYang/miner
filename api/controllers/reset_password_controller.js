"use strict";

const moment = require('moment');
const Joi = require('joi');
const Chance = require('chance');
const SMSClient = require('@alicloud/sms-sdk');

const ModelAccount = require("../models/account.model");
const redis = require('../domain/promoserver.prepare').redis;

// 阿里云`KEY`
const accessKeyId = 'LTAIZz2ZirPgMdKX';
const secretAccessKey = 'mCzYRqE6yM6XtqF2UlJVSs8J74j8vV';
const smsClient = new SMSClient({accessKeyId, secretAccessKey});

// 频率限制/每天
const LIMIT_REST = 9;
const LIMIT_SEND_CODE = 3;
const LIMIT_PREFIX = "RESET:PASSWORD";
const LIMIT_BY_DAY = 86400;
const LIMIT_BY_MINUTE = 60;
const LIMIT_CODE_TTL = 60 * 15;

/**
 * 生成短信验证码
 * @return {String}
 */
function genCode() {
    return (new Chance()).string({
        length: 6,
        pool: "0123456789"
    });
}

exports.countdowning = function (req, res, next) {
    let phone = req.session && req.session.phone;
    if (phone) {
        redis.ttlAsync(`${LIMIT_PREFIX}:COUNTDOWN:${phone}`).then(ttl => {
            // 短信接口倒计时未完成
            if (ttl > 0) {
                res.status(302);
                res.json({
                    code: 11000,
                    phone: phone,
                    countdown: ttl,
                    message: "短信验证码已发送"
                });
            }
            else {
                next();
            }
        });
    }
    else {
        next();
    }
};

exports.sendSMSCode = function (req, res) {
    let schema = Joi.object().keys({
        account: Joi.string().trim().length(11).regex(/^1[35678][0-9]{9}$/).required()
    });

    let input = schema.validate(req.body);
    if (input.error) {
        res.status(500);
        res.json({
            code: 11001,
            message: "请输入正确手机号"
        });
        return;
    }

    let phone = input.value.account;
    let sid = req.session.id;
    let ip = req.ip;
    let day = moment().date();
    let prefix = `${LIMIT_PREFIX}:${day}`;

    function done(a, b) {
        if (b > a) {
            return Promise.reject({
                code: 11002,
                message: "短信发送频率超出限制"
            });
        }
    }

    function fail(err) {
        return Promise.reject({
            code: 11003,
            message: "请求出错,稍候重试"
        });
    }

    // 手机号每天发送限制
    let k1 = `${prefix}:${phone}`;
    let p1 = redis.getAsync(k1).catch(fail)
                .then(done.bind(null, LIMIT_SEND_CODE))
                .then(() => {
                    return redis.incrAsync(k1).catch(fail)
                            .then(done.bind(null, LIMIT_SEND_CODE));
                });


    // 同一个人每天发送限制
    let k2 = `${prefix}:${sid}`;
    let p2 = redis.getAsync(k2).catch(fail)
                .then(done.bind(null, LIMIT_REST))
                .then(() => {
                    return redis.incrAsync(k2).catch(fail)
                            .then(done.bind(null, LIMIT_REST));
                });

    // 同一IP地址每天发送限制
    let k3 = `${prefix}:${ip}`;
    let p3 = redis.getAsync(k3).catch(fail)
                .then(done.bind(null, LIMIT_REST))
                .then(() => {
                    return redis.incrAsync(k3).catch(fail)
                            .then(done.bind(null, LIMIT_REST));
                });

    // 设置相关`KEY`的有效期
    Promise.all([
        redis.expireAsync(k1, LIMIT_BY_DAY),
        redis.expireAsync(k2, LIMIT_BY_DAY),
        redis.expireAsync(k3, LIMIT_BY_DAY)
    ]).catch(() => {});

    Promise.all([p1, p2, p3]).then(() => {
        return ModelAccount.existUserByPhone(phone).catch(fail).then(ok => {
            if (!ok) {
                return Promise.reject({
                    code: 11001,
                    message: "手机号不存在"
                });
            }

            // 短信验证码
            let code = genCode();
            let tick = `${LIMIT_PREFIX}:COUNTDOWN:${phone}`;
            let live = `${LIMIT_PREFIX}:CODE:${phone}`;

            // 后续步骤不用传手机号了
            req.session.phone = phone;

            // 短信验证码保留15分钟
            redis.setexAsync(live, LIMIT_CODE_TTL, code).catch(() => {})

            // 请求阿里云
            // return smsClient.sendSMS({
            //     PhoneNumbers: phone,
            //     SignName: 'MobiPromo官网',
            //     TemplateCode: 'SMS_116770261',
            //     TemplateParam: '{"code": ' + code + '}'
            // })
            return Promise.resolve({
                Code: "OK",
                Message: "OK"
            }).catch(err => {
                // 短信发送失败
                // 还原限制计数
                Promise.all([
                    redis.decrAsync(k1),
                    redis.decrAsync(k2),
                    redis.decrAsync(k3)
                ]).catch(() => {});

                return Promise.reject({
                    code: 11004,
                    message: "短信发送失败,稍候重试"
                });
            }).then(sms => {
                let { Code, Message } = sms;
                if (Code !== 'OK') {
                    return Promise.reject({
                        code: 11004,
                        message: Message
                    });
                }

                // 60秒倒计时
                redis.setexAsync(tick, LIMIT_BY_MINUTE, 1).then(() => {
                    return redis.ttlAsync(tick);
                }).then(ttl => {
                    if (ttl < 0) {
                        return Promise.reject();
                    }
                    return ttl;
                }).catch(() => {
                    return LIMIT_BY_MINUTE;
                }).then(ttl => {
                    res.status(200);
                    res.json({
                        phone: phone,
                        countdown: ttl,
                        message: Message
                    });
                });
            });
        });
    }).catch(err => {
        res.status(500);
        res.json(err);
    });
};

exports.verifySMSCode = function (req, res) {
    res.status(500);

    if (!req.session) {
        res.json({
            code: 11000,
            message: "无效验证码"
        });
        return;
    }

    // 重复校验
    let verified = req.session.verified;
    if (verified && moment().isBefore(verified)) {
        res.status(200);
        res.json({
            message: "校验成功"
        });
        return;
    }

    let schema = Joi.object().keys({
        code: Joi.string().trim().length(6).required()
    });

    let input = schema.validate(req.body);
    if (input.error) {
        res.json({
            code: 11001,
            message: "请输入正确验证码"
        });
        return;
    }

    let code = input.value.code;
    let phone = req.session.phone;
    redis.getAsync(`${LIMIT_PREFIX}:CODE:${phone}`).then(answer => {
        if (answer !== code) {
            return Promise.reject();
        }

        // 校验成功状态保持15分钟
        req.session.verified = moment().add(15, "m");

        res.status(200);
        res.json({
            message: "校验成功"
        });
    }).catch(err => {
        res.json({
            code: 11002,
            message: "验证码错误或已失效"
        });
    });
};

exports.resetPassword = function (req, res) {
    let user = req.session && req.session.phone;
    let verified = req.session && req.session.verified;

    res.status(500);
    if (!user || !verified || moment().isAfter(verified)) {
        console.log(req.session);
        delete req.session.verified;
        console.log(req.session);
        res.json({
            code: 11000,
            message: "请输入有效用账户信息"
        });
        return;
    }

    let schema = Joi.object().keys({
        password: Joi.string().min(6).max(20).required(),
        repassword: Joi.ref('password')
    });

    let input = schema.validate(req.body);
    if (input.error) {
        res.json({
            code: 11001,
            message: "无效密码格式"
        });
        return;
    }

    ModelAccount.resetPassword(user, input.value.password).then(data => {
        let [ ret ] = data;
        if (!ret) {
            return Promise.reject();
        }

        // 清除校验成功状态
        delete req.session.verified;

        res.status(200);
        res.json({
            message: "密码修改成功"
        });
    }).catch(err => {
        res.json({
            code: 11003,
            message: "请求出错,稍候重试"
        })
    });
};
