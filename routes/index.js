var express = require('express');
var router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


// START OF S3 FUNCTIONALITY
const AWS = require("aws-sdk");
require("dotenv").config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: "ap-southeast-2",
});

// 1. Create an S3 client
const s3 = new AWS.S3();

// Specify the S3 bucket and object key
const bucketName = "n10494588-counter";
const objectKey = "counter.json";

async function createS3bucket() {
  try {
    await s3.createBucket( { Bucket: bucketName }).promise();
    console.log(`Created bucket: ${bucketName}`);
  } catch(err) {
    if (err.statusCode === 409) {
      console.log(`Bucket already exists: ${bucketName}`);
    } else {
      console.log(`Error creating bucket: ${err}`);
    }
  }
}

// 2. Check if the counter file exists, and create it with a count of zero if not
async function ensureCounterFileExists() {
  try {
    await s3.headObject({ Bucket: bucketName, Key: objectKey }).promise(); 
    console.log(`Counter file "${objectKey}" exists.`);
  } catch (err) {
    console.log(`Counter file "${objectKey}" does not exist. Creating...`); 
    const initialCounter = { count: 0 };
    await s3
      .putObject({
        Bucket: bucketName,
        Key: objectKey,
        Body: JSON.stringify(initialCounter),
        ContentType: 'application/json',
      })
      .promise();
    console.log(`Counter file "${objectKey}" created with count 0.`); 
  }
}

// 3. Increment the counter and update the counter file
async function incrementCounter() {
  try {
    const data = await s3.getObject({ Bucket: bucketName, Key: objectKey }).promise();
    const counter = JSON.parse(data.Body.toString());
    counter.count += 1;
    await s3
      .putObject({
        Bucket: bucketName,
        Key: objectKey,
        Body: JSON.stringify(counter),
        ContentType: 'application/json',
      })
      .promise();
    return counter.count;
  } catch (err) {
    console.error(`Error incrementing counter: ${err}`);
    return null;
  }
}

// Call the upload and get functions
(async () => {
  await createS3bucket();
  await ensureCounterFileExists();
})();
// END OF S3 FUNCTIONALITY


// Express generator has set up a route which renders a Handlebars template using the res.render method
router.get("/", async function (req, res, next) {
  let pageCount = await incrementCounter();

  const NUTRIDIGM_API_KEY = process.env.NUTRIDIGM_API_KEY;
  const availableIDs = [3, 27] // DISEASES AVAILABLE WITH FREE VERSION OF NUTRIDIGM API
  const response = await fetch(`https://5jocnrfkfb.execute-api.us-east-1.amazonaws.com/PersonalRemedies/nutridigm/api/v2/healthconditions?subscriptionID=${NUTRIDIGM_API_KEY}`);
  const data = await response.json();
  const healthConditions = data;

  const availableHealthConditions = [];
  const otherHealthConditions = [];

  for (let i = 0; i < healthConditions.length; i++) {
    if (availableIDs.includes(healthConditions[i].healthConditionID)) { // either 3 or 27
      const healthConditionID = healthConditions[i].healthConditionID;
      const conditionName = healthConditions[i].description;
      const longDescription = healthConditions[i].longDescription;
      availableHealthConditions.push({ healthConditionID, conditionName, longDescription });
    } else { 
      const healthConditionID = healthConditions[i].healthConditionID;
      const conditionName = healthConditions[i].description;
      const longDescription = healthConditions[i].longDescription;
      otherHealthConditions.push({ healthConditionID, conditionName, longDescription });
    }
  }

  res.render("index", { title: 'Hearty Cookery', availableHealthConditions, otherHealthConditions, pageCount });
});

module.exports = router;
