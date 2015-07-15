var Crawler = require('./lib/crawler.js');

var crawler = new Crawler('cml_hawke0@163.com', 'kaze131021', './cookies.json');
crawler.login();
//crawler.crawl('http://www.zhihu.com/people/kaze13/followees');
crawler.getMoreFollowess();