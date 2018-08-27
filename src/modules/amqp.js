var amqp = require('amqplib')
var amqpconnect = require('./amqpconnect.js');

const RESPONSE_QUEUE = "responses";
var connection;
var channel;

module.exports = {};

module.exports.setup = function(uri) {
  return new Promise((resolve, reject) => {
    console.log("Trying to connect to AMQP server on " + uri);
    amqpconnect.tryUntilConnect(uri, (err, conn) => {
      if (err)
        reject(err);
      else {
        connection = conn;
        connection.createChannel()
          .then(ch => {
            channel = ch;
            return channel.assertQueue(RESPONSE_QUEUE, {durable: false});
          })
          .then(_ => {
            resolve();
          })
          .catch(err => {
            reject(err);
          });; 
      }
    });
  });
}

module.exports.request = function(req, queue) {
  return new Promise((resolve, reject) => {
    channel.sendToQueue(queue, Buffer.from(req), {replyTo: RESPONSE_QUEUE});
    channel.consume(RESPONSE_QUEUE, res => {
        resolve(res.content.toString());
        channel.cancel(res.fields.consumerTag);
      }, {noAck: true});
  });
}

module.exports.close = function() {
  connection.close()
}
