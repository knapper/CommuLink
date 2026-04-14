#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="us-east-1"
APP_PREFIX="/commulink/docker/backend"

API_BASE_URL=$(aws ssm get-parameter \
    --name "$APP_PREFIX/BASE_ENDPOINT" \
    --region "$AWS_REGION" \
    --with-decryption \
    --query "Parameter.Value" \
    --output text \
)

cat > .env <<EOF
VITE_API_BASE_URL=$API_BASE_URL
EOF

chmod 600 .env
echo ".env file created from ssm parameters"