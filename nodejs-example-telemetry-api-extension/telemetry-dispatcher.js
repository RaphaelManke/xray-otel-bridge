const AWS = require("@aws-sdk/client-sqs");
const e = require("express");

const dispatchPostUri = process.env.DISPATCH_POST_URI;
const dispatchMinBatchSize = parseInt(process.env.DISPATCH_MIN_BATCH_SIZE || 1);
const sqsQueueUrl = process.env.XRAYTRACEIDS_QUEUE_URL;

const sqsClient = new AWS.SQSClient({});

async function dispatch(queue, force) {
  if (queue.length !== 0 || force) {
    console.log(
      "[telementry-dispatcher:dispatch] Dispatching",
      queue.length,
      "telemetry events"
    );

    const platformReport = queue.find(
      (item) => item.type === "platform.runtimeDone"
    );
    console.log(
      "[telementry-dispatcher:dispatch] platformReport",
      platformReport
    );
    if (platformReport) {
      const tracing = platformReport.record.tracing;
      const [root, parent, sampled] = tracing.value.split(";");
      const traceId = root.split("=")[1];
      const parentId = parent.split("=")[1];
      const sampledFlag = sampled.split("=")[1];
      console.log(
        `[telementry-dispatcher:dispatch] received traceId=${traceId} parentId=${parentId} sampled=${sampledFlag}`
      );

      const sqsMessage = new AWS.SendMessageCommand({
        QueueUrl: sqsQueueUrl,
        MessageBody: JSON.stringify({
          traceId,
        }),
      });

      try {
        const response = await sqsClient.send(sqsMessage);
        console.log(
          "[telementry-dispatcher:dispatch] Dispatched",
          queue.length,
          "telemetry events",
          response
        );
      } catch (error) {
        console.error(
          "[telementry-dispatcher:dispatch] Error dispatching telemetry events",
          error
        );
      }
    } else {
      console.log(
        "[telementry-dispatcher:dispatch] No platform.report event found",
        JSON.stringify(queue)
      );
    }

    queue.splice(0);
  } else {
    console.log(
      "[telementry-dispatcher:dispatch] Skipping dispatch, queue length",
      queue.length
    );
  }
}

module.exports = {
  dispatch,
};
