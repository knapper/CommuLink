# CommuLink Portal

CommuLink is a full-stack web and mobile application portal that allows users to interact, view announcements, access a directory, and manage their profiles. It leverages React, Express, AWS DynamoDB, and is packaged for mobile use using Capacitor. The application infrastructure can be provisioned via an included AWS CloudFormation template and is containerized using Docker.

## Project Architecture

- **Frontend:** React 18, React Router v6, Tailwind CSS, Lucide React (Icons), Vite
- **Backend:** Node.js with Express.js
- **Mobile Wrapper:** Capacitor for Android
- **Database:** AWS DynamoDB (AWS SDK v3)
- **Deployment & Infrastructure:** Docker, AWS CloudFormation

## Repository Structure

- `components/`: Reusable React components (Layout, etc.).
- `pages/`: React views for the portal (Dashboard, Announcements, Directory, Profile, Login).
- `backend/`: AWS Lambda functions.
- `services/`: Services for business logic.
- `android/`: Capacitor-generated Android project files.
- `server.js`: Node.js/Express backend server serving the API and React built assets.
- `Dockerfile` & `docker-compose.yml`: For containerizing the application.
- `cloudformation.yaml`: Infrastructure as Code for provisioning AWS resources.
- `load_ssm_parameter.sh`: Retrieves environment parameters from AWS SSM.

## Prerequisites

Before running the project, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker](https://www.docker.com/) & Docker Compose (for containerized deployment)
- [Android Studio](https://developer.android.com/studio) (only if compiling and running the Capacitor Android app)

## How to Run Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Ensure you have configured AWS credentials locally (`~/.aws/credentials`) or set environment variables:
   ```env
   PORT=3000
   AWS_REGION=us-east-2
   TABLE_NAME=CommuLinkData
   ```

3. **Development (Frontend only):**
   ```bash
   npm run dev
   ```

4. **Production Server (Frontend & Backend API):**
   ```bash
   npm run build
   npm run start
   ```

## How to Run with Docker

To run the full stack inside a Docker container:
```bash
docker-compose up --build
```

## How to Build the Mobile App (Android)

1. **Build the Web App:**
   ```bash
   npm run build
   ```
2. **Sync the Built Assets to Capacitor:**
   ```bash
   npx cap sync android
   ```
3. **Open Android Studio to Build and Run on a Device/Emulator:**
   ```bash
   npx cap open android
   ```
