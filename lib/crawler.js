//var Crawler = require("simplecrawler");
//
//var crawler = new Crawler("www.zhihu.com", "/people/kaze13");
//
////var crawler = Crawler.crawl("http://www.zhihu.com/people/kaze13");
//
//crawler.needsAuth = true;
//crawler.authUser = 'cml_hawke0@163.com';
//crawler.authPass = 'kaze131021';
//
//crawler.on("fetchcomplete", function(queueItem, responseBuffer, response) {
//  console.log("Completed fetching resource:", queueItem.url);
//  // Do something with the data in responseBuffer
//});
//
//crawler.start();

var request = require('request');
var FileCookieStore = require('tough-cookie-filestore');

var j = request.jar(new FileCookieStore('cookies.json'));
var cookie = request.cookie('_za=335ff046-18e8-478f-920d-4cf993ae133f; _xsrf=4ddf3f19f7257a7f40119e473540f11d; q_c1=9430bc63c93d4f7c840dcae62582fc45|1436495486000|1426751520000; cap_id="YjI1YjVmNDI0MzU1NDJkYjlhZWM5MzYyMzA5MDA3OGY=|1436495486|88b0577c491f43ff23bab331acc058d50d65a7ff"; __utmt=1; __utma=51854390.1835624686.1433818020.1436869153.1436869153.1; __utmb=51854390.22.10.1436869153; __utmc=51854390; __utmz=51854390.1436869153.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utmv=51854390.000--|3=entry_date=20150319=1; _ga=GA1.2.1835624686.1433818020; _gat=1');
var url = 'http://www.zhihu.com';
j.setCookie(cookie, url);

request.post({jar:j, url:'http://www.zhihu.com/login/email',form:{email:'cml_hawke0@163.com', password:'kaze131021'}}, callback);

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    console.log(info.stargazers_count + " Stars");
    console.log(info.forks_count + " Forks");
  }
  console.log(response);
}