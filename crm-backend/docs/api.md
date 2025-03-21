# CRM API Documentation

This document provides comprehensive documentation for the CRM API, including authentication methods, endpoint specifications, and usage examples.

## Authentication

The API supports two authentication methods:

1. **JWT Authentication** - For internal use by the web application
2. **API Key Authentication** - For external integrations

### JWT Authentication

For internal routes, use JWT token-based authentication.

1. Obtain a token by logging in via `/api/auth/login`
2. Include the token in the Authorization header: `Authorization: Bearer {token}`

### API Key Authentication

For external API access, use API key authentication.

1. Generate an API key in the API Management section of the CRM
2. Include the API key in the `X-API-KEY` header for all requests

## Rate Limiting

The public API endpoints are subject to rate limiting to ensure fair usage and system stability:

- Standard limit: 100 requests per 15-minute window
- Premium limit: 500 requests per 15-minute window (contact sales for upgrade)

## Error Handling

All API endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created (for POST requests that create new resources)
- `400` - Bad Request (malformed request or validation error)
- `401` - Unauthorized (missing or invalid authentication)
- `403` - Forbidden (authenticated but lacking necessary permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

Error responses include a JSON body with:

```json
{
  "message": "Brief error description",
  "error": "Detailed error information (development only)",
  "code": "ERROR_CODE"
}
```

## Endpoints

### Pipeline Management

#### Get All Pipelines

```
GET /api/public/pipelines
```

**Response:**

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "stages": [
        {
          "id": "string",
          "name": "string",
          "position": "number"
        }
      ]
    }
  ]
}
```

#### Get Pipeline Details

```
GET /api/public/pipelines/:id
```

**Response:**

```json
{
  "data": {
    "id": "string",
    "name": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "stages": [
      {
        "id": "string",
        "name": "string",
        "position": "number"
      }
    ]
  }
}
```

### Lead Management

#### Get Leads

```
GET /api/public/leads
```

Query parameters:
- `pipelineId`: Filter by pipeline ID
- `stageId`: Filter by stage ID
- `status`: Filter by status
- `sort`: Sort field (createdAt, updatedAt, value)
- `direction`: Sort direction (asc, desc)
- `page`: Page number
- `limit`: Items per page

**Response:**

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "value": "number",
      "status": "string",
      "pipelineId": "string",
      "stageId": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "customFields": {}
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

#### Create Lead

```
POST /api/public/leads
```

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "value": "number",
  "pipelineId": "string",
  "stageId": "string",
  "customFields": {}
}
```

**Response:**

```json
{
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "value": "number",
    "status": "string",
    "pipelineId": "string",
    "stageId": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "customFields": {}
  }
}
```

#### Update Lead

```
PUT /api/public/leads/:id
```

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "value": "number",
  "status": "string",
  "stageId": "string",
  "customFields": {}
}
```

**Response:**

```json
{
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "value": "number",
    "status": "string",
    "pipelineId": "string",
    "stageId": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "customFields": {}
  }
}
```

### Webhooks

The CRM supports webhooks for real-time event notifications.

#### Webhook Events

- `lead.created` - Triggered when a new lead is created
- `lead.updated` - Triggered when a lead is updated
- `lead.stage_changed` - Triggered when a lead changes stage
- `pipeline.created` - Triggered when a new pipeline is created
- `pipeline.updated` - Triggered when a pipeline is updated
- `team.created` - Triggered when a new team is created
- `team.member_added` - Triggered when a member is added to a team

#### Webhook Security

Webhooks are signed with an HMAC signature using your API key as the secret. To verify webhook authenticity:

1. Extract the `X-Signature` header from the request
2. Calculate the HMAC-SHA256 signature of the request body using your API key
3. Compare the calculated signature with the `X-Signature` header

Example in Node.js:

```javascript
const crypto = require('crypto');

function verifyWebhook(body, signature, apiKey) {
  const hmac = crypto.createHmac('sha256', apiKey);
  const calculatedSignature = hmac.update(JSON.stringify(body)).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(calculatedSignature, 'hex'),
    Buffer.from(signature, 'hex')
  );
}
```

### Reports and Analytics

#### Get Pipeline Performance

```
GET /api/public/reports/pipeline/:id
```

Query parameters:
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `interval`: Interval for data points (day, week, month)

**Response:**

```json
{
  "data": {
    "conversionRates": [
      {
        "fromStage": "string",
        "toStage": "string",
        "rate": "number"
      }
    ],
    "stageTimes": [
      {
        "stage": "string",
        "averageTime": "number"
      }
    ],
    "leadValuesByStage": [
      {
        "stage": "string",
        "totalValue": "number",
        "count": "number"
      }
    ],
    "timeSeriesData": [
      {
        "date": "string",
        "newLeads": "number",
        "convertedLeads": "number",
        "totalValue": "number"
      }
    ]
  }
}
```

## API Key Management

API keys can be managed via the API Management page in the CRM. Each key has the following properties:

- **Name**: A descriptive name for the key
- **Permissions**: Specific permissions granted to the key
- **Rate Limit**: Custom rate limit (if applicable)
- **Expiration**: Optional expiration date

## Webhooks Management

Webhooks can be configured and managed via the API Management page in the CRM. Each webhook has:

- **URL**: The destination URL where events will be sent
- **Events**: Array of events to subscribe to
- **Active**: Boolean indicating if the webhook is active
- **Secret**: Used for signature verification (automatically generated)

## Best Practices

1. **Use Conditional Requests**: Include the `If-Modified-Since` header to avoid unnecessary data transfer.
2. **Implement Proper Error Handling**: Always check for error responses and handle them appropriately.
3. **Respect Rate Limits**: Implement rate limit handling with exponential backoff.
4. **Secure Your API Keys**: Never expose API keys in client-side code.
5. **Validate Webhook Signatures**: Always verify webhook signatures to prevent security issues.

## Support

For additional support or questions about the API, please contact our support team at api-support@example.com.

## Changelog

### v1.0.0 (2023-03-21)
- Initial API release
- Pipeline and lead management endpoints
- Webhook system
- Basic reporting 