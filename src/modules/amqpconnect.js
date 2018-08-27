var amqp = require('amqplib');

const MAX_TRIES = 60;

var i = 0;
function tryUntilConnect(uri, callback) {
  i++;
  amqp.connect(uri)
    .then(conn => {
      console.log("Connection attempt " + i + " succeeded");
      callback(undefined, conn);
    })
    .catch((err) => {
      if (i <= MAX_TRIES) {
        console.log("Connection attempt " + i + " failed, trying again in 1 second");
        setTimeout(() => tryUntilConnect(uri, callback), 1000);
      }
      else {
        var err = new Error("Connection establishment to " + uri + " still failing after " + MAX_TRIES + " tries");
        callback(err, undefined);
      }
    });
}

module.exports.tryUntilConnect = tryUntilConnect;
