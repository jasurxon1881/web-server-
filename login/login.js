// 필요한 모듈들을 가져옵니다.
var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

// MySQL 데이터베이스 연결을 설정합니다.
var connection = mysql.createConnection({
   host: '127.0.0.1',
   user: 'root',
   password: 'Hanguko1!',
   database: 'webdb'
});

// Express 애플리케이션을 생성합니다.
var app = express();

// 세션 설정을 추가합니다.
app.use(session({
   secret: 'secret',
   resave: true,
   saveUninitialized: true
}));

// 정적 파일 처리와 POST 요청 본문 파싱을 위한 미들웨어를 추가합니다.
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 사용자 인증을 위한 미들웨어 함수를 정의합니다.
function restrict(req, res, next) {
   if (req.session.loggedin) {
      next();
   } else {
      req.session.error = 'Access denied!';
      res.sendFile(path.join(__dirname + '/my/login.html'));
   }
}

// 모든 경로에 대한 미들웨어를 추가합니다.
app.use('/', function (request, response, next) {
   if (request.session.loggedin == true || request.url == "/login" || request.url == "/register") {
      next();
   } else {
      response.sendFile(path.join(__dirname + '/my/login.html'));
   }
});

// 홈 페이지에 대한 라우트 핸들러를 추가합니다.
app.get('/', function (request, response) {
   response.sendFile(path.join(__dirname + '/my/home.html'));
});

// 로그인 페이지에 대한 라우트 핸들러를 추가합니다.
app.get('/login', function (request, response) {
   response.sendFile(path.join(__dirname + '/my/login.html'));
});

// 로그인 폼을 처리하는 라우트 핸들러를 추가합니다.
app.post('/login', function (request, response) {
   var username = request.body.username;
   var password = request.body.password;
   if (username && password) {
      connection.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
         if (error) throw error;
         if (results.length > 0) {
            request.session.loggedin = true;
            request.session.username = username;
            response.redirect('/home');
            response.end();
         } else {
            response.sendFile(path.join(__dirname + '/my/loginerror.html'));
         }
      });
   } else {
      response.send('Please enter Username and Password!');
      response.end();
   }
});

// 등록 페이지에 대한 라우트 핸들러를 추가합니다.
app.get('/register', function (request, response) {
   response.sendFile(path.join(__dirname + '/my/register.html'));
});

// 등록 폼을 처리하는 라우트 핸들러를 추가합니다.
app.post('/register', function (request, response) {
   var username = request.body.username;
   var password = request.body.password;
   var password2 = request.body.password2;
   var email = request.body.email;
   console.log(username, password, email);
   if (username && password && email) {
      connection.query('SELECT * FROM user WHERE username = ? AND password = ? AND email = ?', [username, password, email], function (error, results, fields) {
         if (error) throw error;
         if (results.length <= 0) {
            connection.query('INSERT INTO user (username, password, email) VALUES(?,?,?)', [username, password, email],
               function (error, data) {
                  if (error)
                     console.log(error);
                  else
                     console.log(data);
               });
            response.send(username + ' Registered Successfully!<br><a href="/home">Home</a>');
         } else {
            response.send(username + ' Already exists!<br><a href="/home">Home</a>');
         }
         response.end();
      });
   } else {
      response.send('Please enter User Information!');
      response.end();
   }
});

// 로그아웃을 처리하는 라우트 핸들러를 추가합니다.
app.get('/logout', function (request, response) {
   request.session.loggedin = false;
   response.send('<center><H1>Logged Out.</H1><H1><a href="/">Goto Home</a></H1></center>');
   response.end();
});

// 홈 페이지에 접근 권한을 확인하는 라우트 핸들러를 추가합니다.
app.get('/home', restrict, function (request, response) {
   if (request.session.loggedin) {
      response.sendFile(path.join(__dirname + '/my/home.html'));
   } else {
      response.send('Please login to view this page!');
      response.end();
   }
});

// 테스트 페이지에 접근 권한을 확인하는 라우트 핸들러를 추가합니다.
app.get('/test2', function (request, response) {
   if (request.session.loggedin) {
      response.sendFile(path.join(__dirname + '/my/test2.html'));
   } else {
      response.send('Please login to view this page!');
      response.end();
   }
});

// 서버를 3000 포트에서 시작합니다.
app.listen(3000, function () {
   console.log('Server Running at http://127.0.0.1:3000');
});
