# Scoreboard API Module
## Overview

This module manages a website leaderboard's real-time score updates. By carrying out particular tasks, users accumulate points, and their scores are updated correspondingly. The scoreboard, which is updated in real time to reflect changes, shows the top ten users with the highest scores.

## Features

1.  **Score Update API** - Allows users to update their score upon completing an action.
2.  **Leaderboard API** - Fetches the top 10 users with the highest scores.
3.  **Real-time Updates** - Uses WebSockets to push data updates to clients.
4.  **Security & Authorization** - Prevents unauthorized users from manipulating scores.

## API Endpoints

### 1. Update Score

**Endpoint:**  `POST /api/action`
**Description:** Increases the score of an authenticated user upon completing an action.
**Request:**
```json
{
"userId": string,
"action": enum.ACTION
}

```
**Response:**
```json
{
"success": boolean, //true if success
"newScore": number
}
```
**Security Considerations**
- Authenticate requests using JWT or API keys.
- Validate and verify input.
- Implement rate limiting to prevent abuse.
- Ensure only legit actions trigger score updates.

### 2. Get Leaderboard
**Endpoint:**  `GET /api/leaderboard`
**Description:** Retrieves the top 10 users with the highest scores.

**Response:**
```json
[{
"userId": string,
"score": number
}]

```
**Security Considerations**
- Cache results for optimal performance.

## Real-Time Updates

To ensure live updates of the scoreboard, a WebSocket connection will be used:
-  **Clients subscribe** to score updates.
-  **When a score changes**, the server broadcasts the update.
-  **Only relevant updates** are sent to reduce network load.

## Data Model
  
**User Scores Table**

| Field     | Type   | Description                     |
| --------- | ------ | ------------------------------- |
| userId    | String | Unique identifier for the user. |
| score     | Int    | Total score of the user.        |
| updatedAt | Date   | Timestamp of the last update.   |


## Execution Flow Diagram

```mermaid
sequenceDiagram

participant User
participant Client
participant API Server
participant Database
participant WebSocket

User->>Client: Get the top 10 users' scores
Client->>API Server: GET /api/leaderboard
API Server->>Database: Retrieve top 10 scores
Database-->>API Server: Top 10 leaderboard
API Server->>Client: Top 10 leaderboard
Client->>User: Show top 10 leaderboard UI

Client->>WebSocket: Establish connection

User->>Client: Completes an action
Client->>API Server: POST /api/action (userId, action)
API Server->>API Server: Authenticate and Validate Request

alt If validation fails
  API Server->>Client: { success: false, error: "Invalid action" }
  Client->>User: Show error message
else If valid request
  API Server->>Database: Update user score
  alt If update fails
    API Server->>Client: { success: false, error: "Database error" }
    Client->>User: Show error message
  else If update succeeds
    Database-->>API Server: Score updated
    API Server->>Client: { success: true, newScore: X }
    Client->>User: Show success action

    API Server->>Database: Retrieve new ranking position
    Database-->>API Server: Updated leaderboard positions
    API Server->>WebSocket: Broadcast only the updated user's new score and ranking
    WebSocket-->>Client: Push update (only changed data)
    Client->>User: Update scoreboard UI dynamically
  end
end

```
  ## Improvement Suggestions

1.  **Event-Driven Processing:** Consider using an event queue like RabbitMQ or Kafka to handle score updates asynchronously and improve scalability.

2.  **Distributed Caching:** Implement Redis or Memcached to cache leaderboard results and reduce database load.

3.  **Audit Logging:** Maintain a log of score updates to detect and prevent fraudulent activities.

4.  **Rate Limiting:** Use API rate limiting to prevent spam updates from malicious users.
