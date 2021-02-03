const {
    v4: uuidv4
} = require('uuid');


function strToBase64(str){
    return Buffer.from(str).toString('base64');
}

function base64ToStr(base64){
    return Buffer.from(base64, 'base64').toString();
}

function getUUID() {
    return uuidv4().replace(/\-/g, '');
}


function getUUIDWithHyphen() {
    return uuidv4().replace(/\-/g, '');
}

function get28LenUUID() {
    return getUUID().substr(2, 28);;
}

function getFixedLenNumber(len) {
    return Math.floor((Math.random() + Math.floor(Math.random() * len + 1)) * Math.pow(10, len));
}

// 0-max
function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function randomFromArray(arr) {
    return arr[randomInt(arr.length)];
}


function shuffleArray(arr) {
    for (let i = 1; i < arr.length; i++) {
        const random = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[random]] = [arr[random], arr[i]];
    }
}

// 转为unicode 编码  
function encodeUnicode(str) {
    var res = [];
    for (var i = 0; i < str.length; i++) {
        res[i] = ("00" + str.charCodeAt(i).toString(16)).slice(-4);
    }
    return "\\u" + res.join("\\u");
}

// 解码  
function decodeUnicode(str) {
    str = str.replace(/\\/g, "%");
    return unescape(str);
}

// 字符串转 unicode
function str2Unicode(theString) {
    var unicodeString = '';
    for (var i = 0; i < theString.length; i++) {
        var theUnicode = theString.charCodeAt(i).toString(16).toUpperCase();
        while (theUnicode.length < 4) {
            theUnicode = '0' + theUnicode;
        }
        theUnicode = '\\u' + theUnicode;
        unicodeString += theUnicode;
    }
    return unicodeString.toLowerCase();
}

// unicode 转字符串 
function unicode2Str(theUnicode) {
    //方案一
    return eval("'" + theUnicode + "'");
    //方案二
    // return unescape(str.replace(/＼u/g, "%u")); 
}

// 从数组中删除所有指定的元素。此方法会改变原数组。
function removeAllItemFromArr(arr, item, removeFn) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if(removeFn){
            if(removeFn(arr[i])){
                 arr.splice(i, 1)
            }
        }else{
            if (arr[i] == item) {
                arr.splice(i, 1)
            }
        }
    }
}

function removeFirstItemFromArr(arr, item, removeFn) {
    for (var i = 0; i < arr.length; i++) {
        if(removeFn){
            if(removeFn(arr[i])){
                 arr.splice(i, 1);
                 break;
            }
        }else{
            if (arr[i] == item) {
                arr.splice(i, 1);
                break;
            }
        }
    }
}


function removeLastItemFromArr(arr, item, removeFn) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if(removeFn){
            if(removeFn(arr[i])){
                 arr.splice(i, 1);
                 break;
            }
        }else{
            if (arr[i] == item) {
                arr.splice(i, 1);
                break;
            }
        }
    }
}

// 从数组中删除列表所有指定的元素。此方法会改变原数组。
function removeAllItemsFromArr(arr, items, removeFn) {
   for(var item in items){
       removeAllItemFromArr(arr, item, removeFn)
   }
}

function checkExistsInArr(arr, item, checkFn){
    for (var i = arr.length - 1; i >= 0; i--) {
        if(checkFn){
            if(checkFn(arr[i])){
                 return true;
            }
        }else{
            if (arr[i] == item) {
                arr.splice(i, 1);
                return ture;
            }
        }
    }
    return false;
}

function htmlEncode(str){
    str=new String(str);
     var s = "";
      if (str.length === 0) {
        return "";
      }
      s = str.replace(/&/g, "&amp;");
      s = s.replace(/</g, "&lt;");
      s = s.replace(/>/g, "&gt;");
      s = s.replace(/ /g, "&nbsp;");
      s = s.replace(/\'/g, "&#39;");//IE下不支持实体名称
      s = s.replace(/\"/g, "&quot;");
      return s;
}

function htmlRestore(str) {
    str=new String(str);
  var s = "";
  if (str.length === 0) {
    return "";
  }
  s = str.replace(/&amp;/g, "&");
  s = s.replace(/&lt;/g, "<");
  s = s.replace(/&gt;/g, ">");
  s = s.replace(/&nbsp;/g, " ");
  s = s.replace(/&#39;/g, "\'");
  s = s.replace(/&quot;/g, "\"");
  return s;
}

module.exports = {
    name: "common",
    strToBase64: strToBase64,
    base64ToStr: base64ToStr,
    getUUID: getUUID,
    randomInt: randomInt,
    randomFromArray: randomFromArray,
    shuffleArray: shuffleArray,
    get28LenUUID: get28LenUUID,
    getFixedLenNumber: getFixedLenNumber,
    encodeUnicode: encodeUnicode,
    decodeUnicode: decodeUnicode,
    getUUIDWithHyphen: getUUIDWithHyphen,
    str2Unicode: str2Unicode,
    unicode2Str: unicode2Str,
    removeAllItemFromArr:removeAllItemFromArr,
    removeAllItemsFromArr:removeAllItemsFromArr,
    removeFirstItemFromArr:removeFirstItemFromArr,
    removeLastItemFromArr:removeLastItemFromArr,
    checkExistsInArr:checkExistsInArr,
    htmlEncode:htmlEncode,
    htmlRestore:htmlRestore

};



// console.log('o6bj64ngMmTc8zXcAMG4bfCZPL5I'.length);
// console.log(uuidv4().replace(/\-/g, ''));
// console.log(uuidv4().replace(/\-/g, '').length);
// console.log(uuidv4().replace(/\-/g, '').length);
// console.log(get28LengthID());