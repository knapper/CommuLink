import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Buffer } from "buffer";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const s3Client = new S3Client({});

// Environment variables set in AWS Lambda Configuration
const TABLE_NAME = process.env.TABLE_NAME || "CommuLinkData";
const BUCKET_NAME = process.env.BUCKET_NAME || "commulink-images-storage";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT"
};

export const handler = async (event) => {
  try {
    const { routeKey } = event;
    const httpMethod = event.requestContext?.http?.method || event.httpMethod;
    const path = event.requestContext?.http?.path || event.path;
    
    // CORS Preflight
    if (httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    const getBody = () => {
        if (!event.body) return {};
        return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    }

    // 1. LOGIN (Get or Create User)
    // Route: POST /login
    if (path.endsWith('/login') && httpMethod === 'POST') {
      const { communityId, username } = getBody();
      const pk = `COMMUNITY#${communityId}`;
      const sk = `USER#${username}`;
      
      const getRes = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: pk, SK: sk } }));
      
      let user = getRes.Item;
      const community = { 
          id: communityId, 
          name: communityId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), 
          type: 'Neighborhood' 
      };
      
      if (!user) {
        // Auto-register
        user = {
            id: `u-${Date.now()}`,
            username,
            fullName: username,
            communityId,
            avatarUrl: "",
            profession: "New Member",
            bloodType: "Unknown",
            allowContact: false,
            isDonor: false,
            isBloodDonor: false,
            gender: "Prefer not to say",
            dateOfBirth: "",
            email: "",
            phone: "",
            address: ""
        };
        await docClient.send(new PutCommand({
          TableName: TABLE_NAME,
          Item: { PK: pk, SK: sk, ...user }
        }));
      }
      return { statusCode: 200, headers, body: JSON.stringify({ user, community }) };
    }

    // 2. GET USERS
    // Route: GET /users
    if (path.endsWith('/users') && httpMethod === 'GET') {
      const queryParams = event.queryStringParameters || {};
      const communityId = queryParams.communityId;
      
      if (!communityId) return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing communityId" }) };

      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: { ":pk": `COMMUNITY#${communityId}`, ":sk": "USER#" }
      });
      const response = await docClient.send(command);
      return { statusCode: 200, headers, body: JSON.stringify(response.Items || []) };
    }

    // 3. GET ANNOUNCEMENTS
    // Route: GET /announcements
    if (path.endsWith('/announcements') && httpMethod === 'GET') {
      const queryParams = event.queryStringParameters || {};
      const communityId = queryParams.communityId;

      if (!communityId) return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing communityId" }) };

      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: { ":pk": `COMMUNITY#${communityId}`, ":sk": "ANNOUNCEMENT#" }
      });
      const response = await docClient.send(command);
      return { statusCode: 200, headers, body: JSON.stringify(response.Items || []) };
    }

    // 4. POST ANNOUNCEMENT
    // Route: POST /announcements
    if (path.endsWith('/announcements') && httpMethod === 'POST') {
      const data = getBody();
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: { 
          PK: `COMMUNITY#${data.communityId}`, 
          SK: `ANNOUNCEMENT#${Date.now()}`,
          ...data 
        }
      }));
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // 5. UPDATE PROFILE (Handles Image Upload)
    // Route: PUT /profile
    if (path.endsWith('/profile') && httpMethod === 'PUT') {
      let user = getBody();
      
      // Check if avatarUrl is a base64 string
      if (user.avatarUrl && user.avatarUrl.startsWith('data:image')) {
        try {
            const matches = user.avatarUrl.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches) {
                const type = matches[1];
                const base64Data = Buffer.from(matches[2], 'base64');
                const fileName = `${user.communityId}/${user.username}-${Date.now()}.${type}`;
                
                await s3Client.send(new PutObjectCommand({
                  Bucket: BUCKET_NAME,
                  Key: fileName,
                  Body: base64Data,
                  ContentEncoding: 'base64',
                  ContentType: `image/${type}`
                }));
                
                // Update URL to point to S3 (Ensure bucket is public or use CloudFront)
                user.avatarUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
            }
        } catch (e) {
            console.error("S3 Upload Error", e);
        }
      }

      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: { 
          PK: `COMMUNITY#${user.communityId}`, 
          SK: `USER#${user.username}`,
          ...user 
        }
      }));
      return { statusCode: 200, headers, body: JSON.stringify(user) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: "Not Found" }) };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ message: err.message }) };
  }
};