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


router.get('/', async function(req, res, next) {
    let pageCount = await incrementCounter();

    const NUTRIDIGM_API_KEY = process.env.NUTRIDIGM_API_KEY;
    const EDAMAM_API_KEY = process.env.EDAMAM_API_KEY;
    const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
    const chosenCondition = req.query.id;

    // turn this into a dictionary (can add additional labels)
    const healthLabels = [
        "alcohol",
        "celery",
        "crustacean",
        "dairy",
        "egg",
        "fish",
        "gluten",
        "sugar",
        "lupine",
        "mollusk",
        "mustard",
        "oil",
        "peanut",
        "pork",
        "meat",
        "sesame",
        "shellfish",
        "soy",
        "sulfite",
        "nut",
        "wheat",
    ];

    // regex health labels
    // var healthLabelsRegex = new RegExp("/alcohol|celery|crustacean|dairy|egg|fish|gluten|sugar|lupine|mollusk|mustard|oil|peanut|pork|meat|sesame|shellfish|soy|sulfite|nut|wheat/");

    // turn this into a dictionary (can add additional labels)
    const healthLabelsMap = {
        alcohol: "alcohol-free",
        celery: "celery-free",
        crustacean: "crustacean-free",
        dairy: "dairy-free",
        egg: "egg-free",
        fish: "fish-free",
        gluten: "gluten-free",
        sugar: "low-sugar",
        lupine: "lupine-free",
        mollusk: "mollusk-free",
        mustard: "mustard-free",
        oil: "no-oil-added",
        peanut: "peanut-free",
        pork: "pork-free",
        meat: "red-meat-free",
        sesame: "sesame-free",
        shellfish: "shellfish-free",
        soy: "soy-free",
        sulfite: "sulfite-free",
        nut: "tree-nut-free",
        wheat: "wheat-free",
    };

    const condition_response = await fetch(`https://5jocnrfkfb.execute-api.us-east-1.amazonaws.com/PersonalRemedies/nutridigm/api/v2/healthconditions?subscriptionID=${NUTRIDIGM_API_KEY}`);
    const condition_data = await condition_response.json();
    var conditionName = "";
    var longDescription = "";
  
    for (let i = 0; i < condition_data.length; i++) {
        if (parseInt(condition_data[i].healthConditionID) == parseInt(chosenCondition)) {
            conditionName = condition_data[i].description;
            longDescription = condition_data[i].longDescription;
            break;
        }
    }

    // NUTRIDIGM FUNCTIONALITY
    const avoid_response = await fetch(`https://5jocnrfkfb.execute-api.us-east-1.amazonaws.com/PersonalRemedies/nutridigm/api/v2/topdoordonts?subscriptionID=${NUTRIDIGM_API_KEY}&healthConditionID=${chosenCondition}&consumeOrAvoid=avoid`);
    const avoid_data = await avoid_response.json();
    const avoid_array = [];
    const new_avoid_array = [];
    let healthFilters = "";

    for (let i = 0; i < avoid_data.length; i++) {
        const displayName = avoid_data[i].displayAs.toLowerCase();
        avoid_array.push(displayName);
    }

    // OLD MATCHING
    for (let i = 0; i < avoid_array.length; i++) {
        if (healthLabels.some(word=>avoid_array[i].includes(word))) {
            var index = healthLabels.findIndex(word=>avoid_array[i].includes(word)) 
            new_avoid_array.push(healthLabels[index]);
        }
    }

    // console.log(new_avoid_array)
    let unique = [...new Set(new_avoid_array)];

    // read from the dictionary to create healthFilters string
    for (let i = 0; i < unique.length; i++) {
        healthFilters += "&health=" + healthLabelsMap[unique[i]];
    }
    // console.log(healthFilters);

    // EDAMAM FUNCTIONALITY
    const recipe_response = await fetch(`https://api.edamam.com/api/recipes/v2?type=public&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_API_KEY}${healthFilters}`);
    const recipe_data = await recipe_response.json();
    const recipes = recipe_data.hits;
    const recipe_array = [];

    // console.log(recipes);

    if (recipes.length !== 0) {
      for (let i = 0; i < recipes.length; i++) {
        const label = recipes[i].recipe.label;
        const image = recipes[i].recipe.image;
        const source = recipes[i].recipe.source;
        const url = recipes[i].recipe.url;
        recipe_array.push({ label, image, source, url });
      }
    } else {
      let message = "No recipes returned";
      let error = {status:"No recipes available for this condition (Invalid search term or API key does not have access to the food database for this condition.)"};
      res.render('error', { message, error });
    }


    // console.log(recipe_data);
    // console.log(recipe_array);
  
    res.render("recipe_selection", { title: 'Hearty Cookery', conditionName, longDescription, unique, recipe_array, pageCount });
});

module.exports = router;