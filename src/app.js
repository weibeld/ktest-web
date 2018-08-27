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

amqp.setup(amqpUri)
  .then(() => {
    console.log("AMQP server setup completed");
    main()
  })
  .catch(err => console.log(err));

function main() {
  app.set('view engine', 'pug');
  app.set('views', __dirname + '/views');

  // Allow serving of static CSS and other files
  app.use(express.static(__dirname + '/public'));

  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/', function(req, res) {
    console.log("Rendering index page");
    res.render('index');
  });

  app.post('/', function(req, res) {
    console.log("Sending message " + req.body.msg);
    amqp.request(req.body.msg, queue)
      .then((resMsg) => {
        console.log("Receiving response " + resMsg);
        res.render('done', {msg: req.body.msg, resMsg: resMsg});
      });
  });

  console.log("Starting HTTP server on port 3000");
  app.listen(3000)
}
