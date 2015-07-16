var Crawler = require('./lib/crawler.js');

var crawler = new Crawler('', '', './cookies.json');
crawler.login();
//crawler.crawl('http://www.zhihu.com/people/kaze13/followees');
crawler.getMoreFollowess();