var Request = require('request');
var fs = require('fs');
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
  Request.post({jar: this.cookiesJar_, url: 'http://www.zhihu.com/login/email', form: {email: this.username_, password: this.password_}}, function(err, res, body) {
    if(res.statusCode == 403) {
      console.log('Already login.');
    }
    else if(err || res.statusCode !== 200) {
      console.log('login failed: ' + err);
      console.log(body);
    }
    else if(body.indexOf('captcha')) {
      console.log('login failed, captcha required.');
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

Crawler.prototype.crawl = function(url, callback) {
  this.getUrl(url, function(err, res, body) {
    if(!err && res.statusCode == 200) {

    } else {
      console.log('fetch failed: ' + url);
      console.log(err);
    }
    if(callback) {
      callback(err, res, body);
    }
  })
};

Crawler.prototype.getAllFollowess = function(username){
  var url = 'http://www.zhihu.com/people/'+username+'/followees';
  var self = this;
  this.crawl(url, function(err,res,body) {
    var $ = cheerio.load(body);
    var followeesNum = parseInt($('.zm-profile-side-following > .item:first > strong')[0].innerHTML);
    var dataInit = $('div.zh-general-list.clearfix').data('init');
    var data = JSON.parse(dataInit);
    var params = dataInit.params;
    var followessRemained = followeesNum;

    while(followessRemained > 0){
      self.getMoreFollowess(params, [)
    }

  });
};

Crawler.prototype.getMoreFollowess = function(params, followessArray) {
  var data = {method: 'next', params: '{"offset":'+offset+',"order_by":"created","hash_id":"428d85ec37ce11fe3804fc2c291058bd"}'};
  this.postForm('http://www.zhihu.com/node/ProfileFolloweesListV2', data, function(err, res, body){
    var data = JSON.parse(body);
    Array.prototype.forEach.apply(data.msg, function(item){
      followessArray.push(item);
    })
  });
};

Crawler.prototype.postForm = function(url, data, callback) {
  if(!this._xsrf) {
    this.setXSRF(post.bind(this, url, data, callback));
  }else{
    this.setXSRF(post.call(this, url, data, callback));
  }
  function post(url, data, callback){
    data._xsrf = this._xsrf;
    Request.post({jar: this.cookiesJar_, url: url,
      form: data}, function(err, res, body) {
      if(!err && res.statusCode == 200) {
        console.log(body)
      } else {
        console.log('post failed: ' + err);
        console.log(body);
      }
      callback(err, res, body);
    });
  }
};

Crawler.prototype.setXSRF = function(callback) {
  var self = this;
  this.crawl('http://www.zhihu.com', function(err,res,body) {
    var $ = cheerio.load(body);
    self._xsrf = $('input[name="_xsrf"]').val();
    if(callback) {
      callback(err, res, body);
    }
  });
};


module.exports = Crawler;