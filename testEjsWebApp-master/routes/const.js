//47服务器
var apiurl = "http://47.94.22.221:9001/";
var client_id = "Q1q4oW527FGdq0g3XzbNa5RmxpYg5P47jJ7Z82Wu";
var client_secret = "kn5Rq9rD4x6L1LoCvjVmcMBeVoTTNQYH9Wc6shpI7BO48tUrlF3EmhhSzFKmUD7GelrpEyhdY24HRuxnVnRNLkJ6923UzbeSWdgyVUkzQTma7j3EkX6wFJeSfec084gs";

//测试服务器
// var apiurl = "http://10.17.1.108:8001/";//wifi167
// var apiurl = "http://127.0.0.1:8000/";
// var client_id = "CWrbfzmJOhtG4cF0suVf0rGYSiJDWXeQBWxnne3g";
// var client_secret = "REmyfsiy3egeWWy3JF631S2kURtz9QbvdWnhptSx6011I9e1fyttmvZ9r9PiixZvvvcWQlvPFWtKHI9i5HfEVNC6e8a1BhTlfAtzqIa1KJySln3nMbJ4ri0Jkk9PS9x3";

var scope_prj001 = "prj001";
var scope_users = "users";
var NUMER_PER_PAGE = 10;// MUST be consistent with the api definition

module.exports.apiurl = apiurl;
module.exports.client_id = client_id;
module.exports.client_secret = client_secret;
module.exports.scope_prj001 = scope_prj001;
module.exports.scope_users = scope_users;
module.exports.NUMER_PER_PAGE = NUMER_PER_PAGE;
