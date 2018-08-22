var amqp = require('amqplib');

var mConnection = null;
var mChannel = null;
var mQueue = null;
var mResQueue = "responses";

module.exports = {};

module.exports.connect = function(uri) {
  return new Promise(function(resolve, reject) {
    amqp.connect(uri)
      .then(function(connection) {
        mConnection = connection;
        mConnection.createChannel()
          .then(function(channel) {
            mChannel = channel;
            mChannel.assertQueue(mResQueue,
              {durable: false, exclusive: true, autoDelete: false});
            resolve();
          })
          .catch(function(err) {
            reject("Couldn't create channel: " + err);
          });
      })
      .catch(function(err) {
        reject("Couldn't establish connection: " + err);
      });
  });
}

module.exports.request = function(msg) {
  return new Promise(function(resolve, reject) {
    mChannel.sendToQueue(mQueue, Buffer.from(msg), { replyTo: mResQueue });
    mChannel.consume(mResQueue, function(msg) {
        resolve(msg.content.toString());
        mChannel.cancel(msg.fields.consumerTag);
      }, {noAck: true});
  });
}

module.exports.setQueue = function(queue) {
  mQueue = queue;
}

module.exports.close = function() {
  mConnection.close();
}

