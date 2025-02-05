# Hearty Cookery
<img src="https://github.com/user-attachments/assets/5fbb249a-7acf-47d8-a9ba-c634cd4b5973" width="50" /> <img src="https://github.com/user-attachments/assets/5fbb249a-7acf-47d8-a9ba-c634cd4b5973" width="50" /> <img src="https://github.com/user-attachments/assets/5fbb249a-7acf-47d8-a9ba-c634cd4b5973" width="50" /> <img src="https://github.com/user-attachments/assets/5fbb249a-7acf-47d8-a9ba-c634cd4b5973" width="50" /> <img src="https://github.com/user-attachments/assets/5fbb249a-7acf-47d8-a9ba-c634cd4b5973" width="50" />

## About 
Hearty Cookery is a cloud-based mashup application that allows users to input their illness or combination of illnesses to receive a tailored list of food groups to avoid, recipes based on their specific condition and dietary requirements, as well as cooking tutorial videos related to these recipes as a visual reference when cooking. This application aims to serve people living with chronic and auto-immune illnesses who can have a difficult relationship with food, with many who have restrictions and precautions to consider with their diet. This mashup application integrates three different REST APIs to achieve this functionality: Nutridigm API (a specialised foodinteraction knowledge database for chronic illnesses), Edamam API (API that retrieves links to recipes based on search parameters), and YouTube API (video streaming service).

Node.js is used for the backend and routing for the application, and Handlebars was used to create HTML templates that allow for dynamic and iterative loading of content. The chosen persistence service for the page visit counter is Amazon S3 (Simple Storage Service) which allows for simple object stores called ‘Buckets’ to store objects such as JSON. Docker was used in this project to create a lightweight and portable image of the Hearty Cookery application to deploy it on VMs such as Amazon EC2, as was used in this case. Amazon EC2 is a cloud computing platform that allows users to deploy applications to a secure and scalable environment.

### APIs and Persistence 
The APIs used:
1. Nutridigm API: https://personalremedies.com/nutridigm-api/
2. Edanam API: https://developer.edamam.com/edamam-docs-recipe-api
3. YouTube API: https://developers.google.com/youtube/v3
   
Persistence Services:
* Amazon S3: https://aws.amazon.com/s3/
* Amazon EC2: https://aws.amazon.com/ec2/
* Docker Repo containing Image: https://hub.docker.com/repository/docker/lilxandra/heartycookery-final/general
* Docker Image Used in this project: https://hub.docker.com/layers/lilxandra/hearty-cookeryfinal/latest/images/sha256-0782917e0d6810872c14db3a16bc2c4cb48971e13d43e019631bd03ba635ef07?context=repo

**NOTE**: API keys are expired and so are the AWS instances used here.

## How to run
Rough steps:
* Ensure Docker running
* Navigate inside 'Hearty-Cookery' directory
* Pull Docker image
* Build Docker image: docker build -t hearty-cookery .
* Run Docker image:
  * Run command for Docker deployment on local machine (API keys and temporary AWS credentials):
    docker run -p 8000:3000 -i -e NUTRIDIGM_API_KEY=XXX -e EDAMAM_API_KEY=XXX -e EDAMAM_APP_ID=XXX -e YOUTUBE_API_KEY=XXX -e AWS_ACCESS_KEY_ID="XXX" -e AWS_SECRET_ACCESS_KEY="XXX" -e AWS_SESSION_TOKEN="XXX" hearty-cookery-final
  * Run command for Docker deployment on AWS EC2 (API keys with auto-filled AWS creds via EC2):
    docker run -p 80:80 -i -e NUTRIDIGM_API_KEY=XXX -e EDAMAM_API_KEY=XXX -e EDAMAM_APP_ID=XXX -e YOUTUBE_API_KEY=XXX lilxandra/hearty-cookery-final

## Screenshots
Instead of screenrecording a demo of how to use the app I screenrecorded myself making it :))) So here are some screenshots instead:
1. Click on a health condition to receive curated list of recipes for this condition (due to free version of Nutridigm API key, there are only food databases available for a limit of 2 health conditions, therefore others are disabled):
![image](https://github.com/user-attachments/assets/10df7b9f-3cf2-402f-aacd-7582fc56b4ed)
2. Click on the ‘Recipe from…’ link (Red) to navigate to the official source website of the recipe or click on ‘Find Related Videos’ button to recipe YouTube video searches for this recipe (Blue). This page also shows a list of foods to avoid (Green):
![image](https://github.com/user-attachments/assets/079bef7c-61a2-4f55-93eb-0fd530aff9b5)
3. Click on a card (containing thumbnail image and video title) navigate to that related video:
![image](https://github.com/user-attachments/assets/88a03f16-8488-4506-96b3-0273fc5f9474)
