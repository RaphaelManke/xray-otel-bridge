const AWS = require("@aws-sdk/client-sqs");

const dispatchPostUri = process.env.DISPATCH_POST_URI;
const dispatchMinBatchSize = parseInt(process.env.DISPATCH_MIN_BATCH_SIZE || 1);
const sqsQueueUrl = process.env.XRAYUDP_QUEUE_URL;

const sqsClient = new AWS.SQSClient({});

async function dispatch(queue, force) {
  if (queue.length !== 0 || force) {
    console.log(
      "[xray-dispatcher:dispatch] Dispatching",
      queue.length,
      "telemetry events"
    );

    const entries = queue.map((item, index) => ({
      Id: index.toString(),
      MessageBody: JSON.stringify(item),
    }));

    queue.splice(0);

    if (!sqsQueueUrl) {
      console.log(
        "[xray-dispatcher:dispatch] SQS_QUEUE_URL not found. Discarding log events from the queue"
      );
      return;
    }

    try {
      const command = new AWS.SendMessageBatchCommand({
        QueueUrl: sqsQueueUrl,
        Entries: entries,
      });
      const response = await sqsClient.send(command);
      console.log(
        "[xray-dispatcher:dispatch] Dispatched",
        queue.length,
        "telemetry events",
        response
      );
    } catch (error) {
      console.error(
        "[xray-dispatcher:dispatch] Error dispatching telemetry events",
        error
      );
    }
  } else {
    console.log(
      "[xray-dispatcher:dispatch] Skipping dispatch, queue length",
      queue.length
    );
  }
}

module.exports = {
  dispatch,
};
