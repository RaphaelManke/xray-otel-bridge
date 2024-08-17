import { XRayClient, BatchGetTracesCommand } from "@aws-sdk/client-xray"; // ES Modules import
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
// const { XRayClient, BatchGetTracesCommand } = require("@aws-sdk/client-xray"); // CommonJS import
const client = new XRayClient({});
const sqsClient = new SQSClient({});
export const handler = async (event) => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));
  // Extract traceIds from the event which is an SQS message lambda event
  const traceIds = event.Records.map(
    (record) => JSON.parse(record.body).traceId
  );

  const input = {
    // BatchGetTracesRequest
    TraceIds: traceIds,
    // NextToken: "STRING_VALUE",
  };

  const command = new BatchGetTracesCommand(input);

  const traces = await client.send(command);
  if (traces.Traces.length > 0) {
    // traces.Traces.forEach(async (trace) => {

    for (const trace of traces.Traces) {
      for (const segment of trace.Segments) {
        const segmentObj = JSON.parse(segment.Document);
        const udpMsg = `{"format": "json", "version": 1}\n${JSON.stringify(
          segmentObj
        )}`;
        const udpMsgBuffer = Buffer.from(udpMsg);
        console.log(
          JSON.stringify(
            {
              segment: segmentObj,
              udpMsg: udpMsg,
              udpMsgBuffer: udpMsgBuffer.toString(),
            },
            undefined,
            2
          )
        );
        await sqsClient.send(
          new SendMessageCommand({
            QueueUrl: process.env.XRAYUDP_QUEUE_URL,
            MessageBody: udpMsgBuffer.toString("base64"),
          })
        );
      }
    }
  } else {
    throw new Error("No traces found");
  }
  console.log(JSON.stringify(traces, undefined, 2));

  return {};
};
