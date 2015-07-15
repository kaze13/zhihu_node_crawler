var Request = require('request');
var fs = require('fs');

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
  copyFile(this.cookiesPath_, tmpCookiesPath, function(err) {
    if(err) {
      console.log(err);
    } else {
      self.cookiesJar_ = Request.jar(new FileCookieStore(tmpCookiesPath));
    }
  });
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
  Request.post({jar: this.cookiesJar_, url: 'http://www.zhihu.com/login/email', form: {email: this.username_, password: this.password_}}, function(err, res, body) {
    if(res.statusCode == 403) {
      console.log('Already login');
    }
    else if(!err && res.statusCode == 200) {
      console.log('login success.');
      console.log(body);
    } else {
      console.log('login failed.');
      console.log(body);
    }
  });
};

Crawler.prototype.logout = function() {
  Request.get({jar: this.cookiesJar_, url: 'http://www.zhihu.com/logout'}, function(err, res, body) {
    if(!err && res.statusCode == 200) {
      console.log('logout success.');
    } else {
      console.log('logout failed.');
      console.log(body);
    }
  });
};

Crawler.prototype.getUrl = function(url, callback) {
  Request.get({jar: this.cookiesJar_, url: url}, function(err, res, body) {
    callback(err, res, body);
  })
};

Crawler.prototype.crawl = function(url) {
  this.getUrl(url, function(err, res, body) {
    if(!err && res.statusCode == 200) {
      console.log(body);
    } else {
      console.log('fetch failed: ' + url);
      console.log(err);
    }
  })
};

Crawler.prototype.getMoreFollowess = function() {
  Request.post({jar: this.cookiesJar_, url: 'http://www.zhihu.com/node/ProfileFolloweesListV2',
    form: {method: 'next', params: '{"offset":20,"order_by":"created","hash_id":"428d85ec37ce11fe3804fc2c291058bd"}'}}, function(err, res, body) {
    if(!err && res.statusCode == 200) {
      console.log(body);
    } else {
      console.log('request failed.');
      console.log(err);
    }
  });
};

module.exports = Crawler;