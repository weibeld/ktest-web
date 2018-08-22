var express = require('express');
var bodyParser = require('body-parser');
var amqp = require('./modules/amqp.js');
var app = express();

var amqpUri = process.env.AMQP_URI;
if (amqpUri == null)
  throw new Error("Must define AMQP_URI environment variable");
var queue = process.env.QUEUE;
if (queue == null)
  throw new Error("Must define QUEUE environment variable");

amqp.connect(amqpUri)
  .then(() => {
    amqp.setQueue(queue);
    main();
  })
  .catch(err => {
    throw err;
  });

function main() {
  app.set('view engine', 'pug');
  app.set('views', __dirname + '/views');

  // Allow serving of static CSS and other files
  app.use(express.static(__dirname + '/public'));

  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/', function(req, res) {
    res.render('index');
  });

  app.post('/', function(req, res) {
    amqp.request(req.body.msg)
      .then((resMsg) => {
        res.render('done', {msg: req.body.msg, resMsg: resMsg});
      })
      .catch(err => {
        throw err;
      });
  });

  app.listen(3000)
}
