import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images

// AWS Configuration
// When running on EC2 with an IAM Role, credentials are auto-fetched.
// When running locally, it looks at ~/.aws/credentials or env vars.
const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_NAME = process.env.TABLE_NAME || "CommuLinkData";

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

// --- API Routes ---

// 1. LOGIN (Get or Create User)
app.post('/api/login', async (req, res) => {
  try {
    const { communityId, username } = req.body;
    if (!communityId || !username) {
        return res.status(400).json({ message: "Missing communityId or username" });
    }

    const pk = `COMMUNITY#${communityId}`;
    const sk = `USER#${username}`;

    const getRes = await docClient.send(new GetCommand({ 
        TableName: TABLE_NAME, 
        Key: { PK: pk, SK: sk } 
    }));

    let user = getRes.Item;
    const community = { 
      id: communityId, 
      name: communityId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), 
      type: 'Neighborhood' 
    };

    if (!user) {
      // Auto-register new user
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

    res.json({ user, community });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 2. GET USERS
app.get('/api/users', async (req, res) => {
  try {
    const { communityId } = req.query;
    if (!communityId) return res.status(400).json({ message: "Missing communityId" });

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: { ":pk": `COMMUNITY#${communityId}`, ":sk": "USER#" }
    });
    
    const response = await docClient.send(command);
    res.json(response.Items || []);
  } catch (err) {
    console.error("Get Users Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 3. GET ANNOUNCEMENTS
app.get('/api/announcements', async (req, res) => {
  try {
    const { communityId } = req.query;
    if (!communityId) return res.status(400).json({ message: "Missing communityId" });

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: { ":pk": `COMMUNITY#${communityId}`, ":sk": "ANNOUNCEMENT#" }
    });

    const response = await docClient.send(command);
    res.json(response.Items || []);
  } catch (err) {
    console.error("Get Announcements Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 4. POST ANNOUNCEMENT
app.post('/api/announcements', async (req, res) => {
  try {
    const data = req.body;
    if (!data.communityId || !data.title) return res.status(400).json({ message: "Invalid data" });

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: { 
        PK: `COMMUNITY#${data.communityId}`, 
        SK: `ANNOUNCEMENT#${Date.now()}`,
        ...data 
      }
    }));

    res.json({ success: true });
  } catch (err) {
    console.error("Create Announcement Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 5. UPDATE PROFILE
app.put('/api/profile', async (req, res) => {
  try {
    const user = req.body;
    if (!user.communityId || !user.username) return res.status(400).json({ message: "Invalid user data" });

    // Note: For simplicity in this Docker/EC2 version, we are storing the base64 avatar directly in DynamoDB.
    // Ideally, you would upload to S3 and store the URL here, but that requires setting up S3 permissions.
    // If the base64 string is too large, DynamoDB might reject it (>400KB).
    
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: { 
        PK: `COMMUNITY#${user.communityId}`, 
        SK: `USER#${user.username}`,
        ...user 
      }
    }));

    res.json(user);
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// --- Serve Static Frontend in Production ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});