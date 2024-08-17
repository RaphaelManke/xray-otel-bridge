// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const dgram = require("dgram");

const eventsQueue = [];

function start() {
  console.log("[xray-listener:start] Starting a listener");

  const socket = dgram.createSocket("udp4");

  socket.on("listening", () => {
    let addr = socket.address();
    console.log(
      `[xray-listener:start] Listening for UDP packets at ${addr.address}:${addr.port}`
    );
  });

  socket.on("error", (err) => {
    console.error(`[xray-listener:error] UDP error: ${err.stack}`);
  });

  socket.on("message", (msg, rinfo) => {
    console.log("[xray-listener:message] Recieved UDP message", msg.toString());
    eventsQueue.push(msg.toString("base64"));
  });

  socket.bind(8082); // listen for UDP with dgram
}

module.exports = {
  start,
  eventsQueue,
};
