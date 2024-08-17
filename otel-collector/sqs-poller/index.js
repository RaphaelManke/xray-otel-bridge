import { Consumer } from "sqs-consumer";
import dgram from "dgram";

var client = dgram.createSocket("udp4");

const app = Consumer.create({
  queueUrl: process.env.QUEUE_URL,
  handleMessage: async (message) => {
    // do some work with `message`
    const [type, msg] = message.Body.split("\n");
    console.log("Received message", type, msg);
    console.log("Received message", message.Body);
    const udpMessage = Buffer.from(message.Body, "base64");

    client.send(udpMessage, 2000, "aws-ot-collector");
  },
});

app.on("error", (err) => {
  console.error(err.message);
});

app.on("processing_error", (err) => {
  console.error(err.message);
});

app.start();
