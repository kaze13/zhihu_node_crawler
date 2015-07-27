var Promise = require("bluebird");
var Request = Promise.promisifyAll(require('request'));
var fs = Promise.promisifyAll(require('fs'));
var cheerio = require('cheerio');

function Crawler(username, password, cookiesPath) {
  this.cookiesJar_ = null;
  this.cookiesPath_ = cookiesPath;
  this.username_ = username;
  this.password_ = password;
  this.setCookieJar();
}

Crawler.prototype.setCookieJar = function() {
  var FileCookieStore = require('tough-cookie-filestore');
  var self = this;
  var tmpCookiesPath = './cookies_tmp.json';

  self.cookiesJar_ = Request.jar(new FileCookieStore(this.cookiesPath_));

  //copyFile(this.cookiesPath_, tmpCookiesPath, function(err) {
  //  if(err) {
  //    console.log(err);
  //  } else {
  //    self.cookiesJar_ = Request.jar(new FileCookieStore(tmpCookiesPath));
  //  }
  //});
  function copyFile(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", function(err) {
      done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function(err) {
      done(err);
    });
    wr.on("close", function(ex) {
      done();
    });
    rd.pipe(wr);

    function done(err) {
      if(!cbCalled) {
        cb(err);
        cbCalled = true;
      }
    }
  }
};

Crawler.prototype.login = function() {
  Request.postAsync({jar: this.cookiesJar_, url: 'http://www.zhihu.com/login/email', form: {email: this.username_, password: this.password_}}).then(function(data) {
    var res = data[0];
    var body = data[1];
    if(res.statusCode == 403) {
      console.log('Already login.');
    }
    else if(res.statusCode !== 200) {
      console.log('login failed: ' + res.statusCode);
      console.log(body);
    }
    else if(body.indexOf('captcha')) {
      console.log('login failed, captcha required.');
    }
    else if(res.statusCode == 200) {
      console.log('login success.');
      console.log(body);
    } else {
      console.log('login failed.');
      console.log(body);
    }
  }, function(err) {
    console.log('login failed.' + err);
  }).catch(function(e) {
    console.log('Exception: ' + e);
  });
};

Crawler.prototype.logout = function() {
  return Request.getAsync({jar: this.cookiesJar_, url: 'http://www.zhihu.com/logout'}, function(data){
    var res = data[0];

  });

  Request.get({jar: this.cookiesJar_, url: 'http://www.zhihu.com/logout'}, function(err, res, body) {
    if(!err && res.statusCode == 200) {
      console.log('logout success.');
    } else {
      console.log('logout failed.');
      console.log(body);
    }
  });
};

Crawler.prototype.getUrl = function(url) {
  return Request.getAsync({jar: this.cookiesJar_, url: url});
};

Crawler.prototype.crawl = function(url) {
  return this.getUrl(url);
};

Crawler.prototype.getAllFollowess = function(username) {
  var url = 'http://www.zhihu.com/people/' + username + '/followees';

  this.crawl(url).then(function(data) {
    var res = data[0];
    var body = data[1];
    var $ = cheerio.load(body);
    var followeesNum = parseInt($('.zm-profile-side-following > .item:first > strong')[0].innerHTML);
    var dataInit = $('div.zh-general-list.clearfix').data('init');
    var data = JSON.parse(dataInit);
    var params = dataInit.params;
    var followessRemained = followeesNum;
  });
};

Crawler.prototype.getMoreFollowess = function(params, followessArray) {
  var data = {method: 'next', params: '{"offset":' + offset + ',"order_by":"created","hash_id":"428d85ec37ce11fe3804fc2c291058bd"}'};
  return this.postForm('http://www.zhihu.com/node/ProfileFolloweesListV2').then(function(data){
    var body = data[1];
    var result = JSON.parse(body);
    Array.prototype.forEach.apply(result.msg, function(item) {
      followessArray.push(item);
    })
  });
};

Crawler.prototype.postForm = function(url, data) {
  if(!this._xsrf) {
    return this.setXSRF().then(post.bind(this, url, data));
  } else {
    return post.call(this, url, data);
  }
  function post(url, data) {
    data._xsrf = this._xsrf;
    return Request.postAsync({jar: this.cookiesJar_, url: url, form: data});
  }
};

Crawler.prototype.setXSRF = function() {
  var self = this;
  return this.crawl('http://www.zhihu.com').then(function(data) {
    var body = data[1];
    var $ = cheerio.load(body);
    self._xsrf = $('input[name="_xsrf"]').val();
    return data;
  });
};

module.exports = Crawler;