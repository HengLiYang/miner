"use strict";

let utils = module.exports;

utils.genereData = function genereData(){
    function fix2number(n) {  
        return [0,n].join('').slice(-2);  
    }  
    function getTime(format) {  
        var curdate = new Date();  
        if (format == undefined) return curdate;  
        format = format.replace(/yyyy/i, curdate.getFullYear());  
        format = format.replace(/mm/i, fix2number(curdate.getMonth() + 1));  
        format = format.replace(/dd/i, fix2number(curdate.getDate()));  
        format = format.replace(/hh/i, fix2number(curdate.getHours()));  
        format = format.replace(/mm/i, fix2number(curdate.getMinutes()));  
        format = format.replace(/ss/i, fix2number(curdate.getSeconds()));  
        return format;  
    }  
    return getTime("yyyymmddhhmmss")+Date.now();
};

utils.getCurrentDate = function getCurrentDate(){
    function fix2number(n) {  
        return [0,n].join('').slice(-2);  
    }  
    function getTime(format) {  
        var curdate = new Date();  
        if (format == undefined) return curdate;  
        format = format.replace(/yyyy/i, curdate.getFullYear());  
        format = format.replace(/MM/i, fix2number(curdate.getMonth() + 1));  
        format = format.replace(/dd/i, fix2number(curdate.getDate()));  
        format = format.replace(/HH/i, fix2number(curdate.getHours()));  
        format = format.replace(/mm/i, fix2number(curdate.getMinutes()));  
        format = format.replace(/ss/i, fix2number(curdate.getSeconds()));  
        return format;  
    }  
    return getTime("yyyy-MM-dd HH:mm:ss")+Date.now();
}