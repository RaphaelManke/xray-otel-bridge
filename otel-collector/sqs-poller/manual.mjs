// {"format":"json","version":1}
import dgram from "dgram";
import { exit } from "process";

var client = dgram.createSocket("udp4");
// const message = JSON.parse(
//   '{"id":"7e0e6d81ae4a5aa2","name":"nodejs-example-telemetry-api-demo-function","start_time":1.723848013128E9,"trace_id":"1-66bfd54d-6b379b8727b6273f7675338c","end_time":1.723848013791E9,"http":{"response":{"status":200}},"aws":{"request_id":"39b1de95-dc45-4108-a9af-c6e2ec0a25a7"},"origin":"AWS::Lambda","resource_arn":"arn:aws:lambda:eu-central-1:906407660701:function:nodejs-example-telemetry-api-demo-function"}'
// );
const message = JSON.parse(
  '{"id":"e6a9e00f59b508c8","name":"nodejs-example-telemetry-api-demo-function","start_time":1.723848013136204E9,"trace_id":"1-66bfd54d-6b379b8727b6273f7675338c","end_time":1.723848013789384E9,"parent_id":"7e0e6d81ae4a5aa2","aws":{"cloudwatch_logs":[{"log_group":"/aws/lambda/nodejs-example-telemetry-api-demo-function"}]},"annotations":{"aws:responseLatency":264.19,"aws:runtimeOverhead":58.198,"aws:extensionOverhead":330.277,"aws:responseDuration":0.074},"origin":"AWS::Lambda::Function","subsegments":[{"id":"4fe597356c183c04","name":"Overhead","start_time":1.7238480133990002E9,"end_time":1.723848013787277E9}]}'
);
const msg = Buffer.from(
  `{"format":"json","version":1}\n${JSON.stringify(message)}`
);

// const udpMessage = Buffer.from(message.Body, "base64");
client.send(msg, 2000, "localhost");
// exit(0);
