console.log("Hello from function initalization");

const Tracer = require("@aws-lambda-powertools/tracer").Tracer;

const tracer = new Tracer({ serviceName: "serverlessAirline" });

exports.handler = async (event, context) => {
  tracer.getSegment();
  const segment = tracer.getSegment(); // This is the facade segment (the one that is created by AWS Lambda)
  let subsegment;
  if (segment) {
    // Create subsegment for the function & set it as active
    subsegment = segment.addNewSubsegment(`## ${process.env._HANDLER}`);
    tracer.setSegment(subsegment);
  }

  // Annotate the subsegment with the cold start & serviceName
  tracer.annotateColdStart();
  tracer.addServiceNameAnnotation();

  try {
    console.log("Hello from function handler", { event });

    // Add the response as metadata
    tracer.addResponseAsMetadata({}, process.env._HANDLER);
  } catch (err) {
    // Add the error as metadata
    tracer.addErrorAsMetadata(err);
    throw err;
  } finally {
    if (segment && subsegment) {
      // Close subsegment (the AWS Lambda one is closed automatically)
      subsegment.close();
      // Set back the facade segment as active again
      tracer.setSegment(segment);
    }
  }
};
