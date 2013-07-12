var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  var helloBuff = fs.readFileSync('./index.html');
  var hello = helloBuff.toString();
  response.send(hello);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
