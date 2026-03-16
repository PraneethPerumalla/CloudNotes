# AWS Serverless Notes App Deployment Guide

This guide will walk you through the manual setup of the AWS infrastructure for your Notes App.

## 1. Create DynamoDB Table
1. Log in to the **AWS Management Console**.
2. Navigate to **DynamoDB**.
3. Click **Create table**.
4. **Table name**: `NotesTable`
5. **Partition key**: `id` (String)
6. Leave other settings as default and click **Create table**.

## 2. Create IAM Role for Lambda
1. Navigate to **IAM** -> **Roles**.
2. Click **Create role**.
3. Select **AWS service** and choose **Lambda**.
4. Search for and attach the policy: `AmazonDynamoDBFullAccess`.
5. Name the role: `NotesAppLambdaRole`.
6. Click **Create role**.

## 3. Create Lambda Function
1. Navigate to **Lambda**.
2. Click **Create function**.
3. **Function name**: `NotesAppBackend`
4. **Runtime**: `Node.js 18.x` or later.
5. Under **Change default execution role**, select **Use an existing role** and pick `NotesAppLambdaRole`.
6. Click **Create function**.
7. In the **Code** tab, replace the default code with the contents of `backend/lambda_function.js`.
8. Click **Deploy**.

## 4. Set Up API Gateway
1. Navigate to **API Gateway**.
2. Click **Create API** -> **REST API** (Public).
3. **API name**: `NotesAPI`
4. Create a **Resource**:
   - Click **Actions** -> **Create Resource**.
   - Resource Name: `notes`
   - **Enable API Gateway CORS**: Check this box.
5. Create a **Method**:
   - With `/notes` selected, click **Actions** -> **Create Method**.
   - Select **ANY** and click the checkmark.
   - Integration type: `Lambda Function`.
   - **Use Lambda Proxy integration**: Check this box (Important!).
   - Lambda Function: `NotesAppBackend`.
   - Click **Save**.
6. **Deploy API**:
   - Click **Actions** -> **Deploy API**.
   - Deployment stage: `[New Stage]` -> `prod`.
   - Copy the **Invoke URL**.

## 5. Update Frontend
1. Open `frontend/app.js` in your editor.
2. Replace `YOUR_API_GATEWAY_ENDPOINT_URL` with your **Invoke URL** + `/notes`.
   - Example: `https://xyz123.execute-api.us-east-1.amazonaws.com/prod/notes`

## 6. Host on S3 (Optional for Local Testing)
1. Navigate to **S3**.
2. Click **Create bucket**.
3. **Bucket name**: `your-unique-notes-app-bucket`
4. Uncheck **Block all public access** (and acknowledge the warning).
5. Click **Create bucket**.
6. **Upload** all files from the `frontend/` folder.
7. Go to **Properties** -> **Static website hosting** -> **Edit**.
8. Select **Enable**, set Index document to `index.html`, and Save.
9. Go to **Permissions** -> **Bucket policy** and paste:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-unique-notes-app-bucket/*"
        }
    ]
}
```
10. Your app is now live at the S3 Website Endpoint!
