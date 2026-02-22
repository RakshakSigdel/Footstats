# Footstats API Endpoints Documentation

Base URL: `http://localhost:5555`

---

## Table of Contents
1. [Authentication](#authentication)
2. [Players](#players)
3. [Tournaments](#tournaments)
4. [Clubs](#clubs)
5. [Schedules](#schedules)
6. [Matches](#matches)
7. [Requests](#requests)

---

## Authentication

### 1. Register New User
- **Endpoint**: `POST /api/auth/register`
- **Authentication**: None required
- **Description**: Creates a new user account

**Request Body** (All fields required):
```json
{
  "firstName": "Rakshak",
  "lastName": "Sigdel",
  "email": "rakshaksigdel1@gmail.com",
  "password": "rakshak123"
}
```

**Response** (201 Created):
```json
{
  "message": "Registered successfully!!!",
  "user": {
    "id": "user_id",
    "firstName": "Rakshak",
    "lastName": "Sigdel",
    "email": "rakshaksigdel1@gmail.com"
  }
}
```

**Error Responses**:
- `400`: Missing required fields
- `500`: Server error during registration

---

### 2. Login
- **Endpoint**: `POST /api/auth/login`
- **Authentication**: None required
- **Description**: Authenticates user and returns JWT token

**Request Body** (All fields required):
```json
{
  "email": "rakshaksigdel@gmail.com",
  "password": "rakshak123"
}
```

**Response** (201 Created):
```json
{
  "message": "Login successfully!!!",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "rakshaksigdel@gmail.com"
  }
}
```

**Error Responses**:
- `400`: Missing email or password
- `500`: Error during login

---

## Players

### 1. Get All Players
- **Endpoint**: `GET /api/players`
- **Authentication**: None required
- **Description**: Retrieves all players in the system

**Response** (200 OK):
```json
{
  "players": [
    {
      "id": "player_id",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1995-01-01",
      "gender": "Male",
      "Phone": "1234567890",
      "location": "City, Country",
      "profilePhoto": "url_to_photo",
      "position": "Forward"
    }
  ]
}
```

**Error Responses**:
- `500`: Error retrieving players

---

### 2. Get My Profile
- **Endpoint**: `GET /api/players/me`
- **Authentication**: Required (JWT Token)
- **Description**: Retrieves the authenticated user's player profile

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "profile": {
    "id": "player_id",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1995-01-01",
    "gender": "Male",
    "Phone": "1234567890",
    "location": "City, Country",
    "profilePhoto": "url_to_photo",
    "position": "Forward",
    "userId": "user_id"
  }
}
```

**Error Responses**:
- `401`: Unauthorized (invalid or missing token)
- `500`: Error retrieving profile

---

### 3. Get Player By ID
- **Endpoint**: `GET /api/players/:id`
- **Authentication**: Required (JWT Token)
- **Description**: Retrieves a specific player's details by ID

**URL Parameters**:
- `id`: Player ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "player": {
    "id": "player_id",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1995-01-01",
    "gender": "Male",
    "Phone": "1234567890",
    "location": "City, Country",
    "profilePhoto": "url_to_photo",
    "position": "Forward"
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Error retrieving player

---

### 4. Update Player By ID
- **Endpoint**: `PUT /api/players/:id`
- **Authentication**: Required (JWT Token)
- **Authorization**: Must be the owner of the player profile
- **Description**: Updates a player's information

**URL Parameters**:
- `id`: Player ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body** (All fields optional):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1995-01-01",
  "gender": "Male",
  "Phone": "1234567890",
  "location": "City, Country",
  "profilePhoto": "url_to_photo",
  "position": "Midfielder"
}
```

**Response** (200 OK):
```json
{
  "updatedPlayer": {
    "id": "player_id",
    "firstName": "John",
    "lastName": "Doe",
    "position": "Midfielder"
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `403`: Forbidden (not the owner)
- `500`: Error updating player

---

### 5. Delete Player By ID
- **Endpoint**: `DELETE /api/players/:id`
- **Authentication**: Required (JWT Token)
- **Authorization**: Must be the owner of the player profile
- **Description**: Deletes a player profile

**URL Parameters**:
- `id`: Player ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "deletedPlayer": {
    "id": "player_id",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `403`: Forbidden (not the owner)
- `500`: Error deleting player

---

## Tournaments

### 1. Create Tournament
- **Endpoint**: `POST /api/tournaments`
- **Authentication**: Required (JWT Token)
- **Description**: Creates a new tournament

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body** (All fields required):
```json
{
  "name": "Summer Championship",
  "description": "Annual summer football tournament",
  "location": "City Stadium",
  "startDate": "2026-06-01T00:00:00Z",
  "endDate": "2026-06-30T00:00:00Z",
  "entryFee": 100,
  "format": "Knockout",
  "status": "Upcoming"
}
```

**Response** (201 Created):
```json
{
  "tournament": {
    "id": "tournament_id",
    "name": "Summer Championship",
    "description": "Annual summer football tournament",
    "location": "City Stadium",
    "startDate": "2026-06-01T00:00:00Z",
    "endDate": "2026-06-30T00:00:00Z",
    "entryFee": 100,
    "format": "Knockout",
    "status": "Upcoming",
    "organizerId": "user_id"
  }
}
```

**Error Responses**:
- `400`: Missing required fields
- `401`: Unauthorized
- `500`: Error creating tournament

---

### 2. Get My Tournaments
- **Endpoint**: `GET /api/tournaments/me`
- **Authentication**: Required (JWT Token)
- **Description**: Retrieves all tournaments created by the authenticated user

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "tournaments": [
    {
      "id": "tournament_id",
      "name": "Summer Championship",
      "description": "Annual summer football tournament",
      "location": "City Stadium",
      "status": "Upcoming"
    }
  ]
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Error fetching tournaments

---

### 3. Get All Tournaments
- **Endpoint**: `GET /api/tournaments`
- **Authentication**: None required
- **Description**: Retrieves all tournaments in the system

**Response** (200 OK):
```json
{
  "tournaments": [
    {
      "id": "tournament_id",
      "name": "Summer Championship",
      "description": "Annual summer football tournament",
      "location": "City Stadium",
      "startDate": "2026-06-01T00:00:00Z",
      "endDate": "2026-06-30T00:00:00Z",
      "entryFee": 100,
      "format": "Knockout",
      "status": "Upcoming"
    }
  ]
}
```

**Error Responses**:
- `500`: Error fetching tournaments

---

### 4. Get Tournament By ID
- **Endpoint**: `GET /api/tournaments/:id`
- **Authentication**: Required (JWT Token)
- **Description**: Retrieves a specific tournament by ID

**URL Parameters**:
- `id`: Tournament ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "tournament": {
    "id": "tournament_id",
    "name": "Summer Championship",
    "description": "Annual summer football tournament",
    "location": "City Stadium",
    "startDate": "2026-06-01T00:00:00Z",
    "endDate": "2026-06-30T00:00:00Z",
    "entryFee": 100,
    "format": "Knockout",
    "status": "Upcoming"
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `404`: Tournament not found
- `500`: Error fetching tournament

---

### 5. Update Tournament
- **Endpoint**: `PUT /api/tournaments/:id`
- **Authentication**: Required (JWT Token)
- **Authorization**: Must be the tournament organizer
- **Description**: Updates tournament information

**URL Parameters**:
- `id`: Tournament ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body** (All fields optional):
```json
{
  "name": "Updated Championship",
  "description": "Updated description",
  "location": "New Stadium",
  "startDate": "2026-07-01T00:00:00Z",
  "endDate": "2026-07-31T00:00:00Z",
  "entryFee": 150,
  "format": "League",
  "status": "Active"
}
```

**Response** (200 OK):
```json
{
  "updatedTournament": {
    "id": "tournament_id",
    "name": "Updated Championship",
    "status": "Active"
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `403`: Forbidden (not the organizer)
- `500`: Error updating tournament

---

### 6. Delete Tournament
- **Endpoint**: `DELETE /api/tournaments/:id`
- **Authentication**: Required (JWT Token)
- **Authorization**: Must be the tournament organizer
- **Description**: Deletes a tournament

**URL Parameters**:
- `id`: Tournament ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "message": "Tournament deleted successfully"
}
```

**Error Responses**:
- `401`: Unauthorized
- `403`: Forbidden (not the organizer)
- `500`: Error deleting tournament

---

## Clubs

### 1. Create Club
- **Endpoint**: `POST /api/clubs`
- **Authentication**: Required (JWT Token)
- **Description**: Creates a new club

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body** (All fields required):
```json
{
  "name": "FC Barcelona",
  "description": "Professional football club",
  "location": "Barcelona, Spain",
  "foundedDate": "1899-11-29T00:00:00Z"
}
```

**Response** (201 Created):
```json
{
  "club": {
    "id": "club_id",
    "name": "FC Barcelona",
    "description": "Professional football club",
    "location": "Barcelona, Spain",
    "foundedDate": "1899-11-29T00:00:00Z",
    "ownerId": "user_id"
  }
}
```

**Error Responses**:
- `400`: Missing required fields
- `401`: Unauthorized
- `500`: Error creating club

---

### 2. Get My Clubs
- **Endpoint**: `GET /api/clubs/me`
- **Authentication**: Required (JWT Token)
- **Description**: Retrieves all clubs created by the authenticated user

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "clubs": [
    {
      "id": "club_id",
      "name": "FC Barcelona",
      "description": "Professional football club",
      "location": "Barcelona, Spain",
      "foundedDate": "1899-11-29T00:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Error fetching clubs

---

### 3. Get All Clubs
- **Endpoint**: `GET /api/clubs`
- **Authentication**: None required
- **Description**: Retrieves all clubs in the system

**Response** (200 OK):
```json
{
  "clubs": [
    {
      "id": "club_id",
      "name": "FC Barcelona",
      "description": "Professional football club",
      "location": "Barcelona, Spain",
      "foundedDate": "1899-11-29T00:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `500`: Error fetching clubs

---

### 4. Get Club By ID
- **Endpoint**: `GET /api/clubs/:id`
- **Authentication**: Required (JWT Token)
- **Description**: Retrieves a specific club by ID

**URL Parameters**:
- `id`: Club ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "club": {
    "id": "club_id",
    "name": "FC Barcelona",
    "description": "Professional football club",
    "location": "Barcelona, Spain",
    "foundedDate": "1899-11-29T00:00:00Z"
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `404`: Club not found
- `500`: Error fetching club

---

### 5. Update Club
- **Endpoint**: `PUT /api/clubs/:id`
- **Authentication**: Required (JWT Token)
- **Authorization**: Must be the club owner
- **Description**: Updates club information

**URL Parameters**:
- `id`: Club ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body** (All fields optional):
```json
{
  "name": "Barcelona FC",
  "description": "Updated description",
  "location": "Barcelona",
  "foundedDate": "1899-11-29T00:00:00Z"
}
```

**Response** (200 OK):
```json
{
  "updatedClub": {
    "id": "club_id",
    "name": "Barcelona FC",
    "description": "Updated description"
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `403`: Forbidden (not the owner)
- `500`: Error updating club

---

### 6. Delete Club
- **Endpoint**: `DELETE /api/clubs/:id`
- **Authentication**: Required (JWT Token)
- **Authorization**: Must be the club owner
- **Description**: Deletes a club

**URL Parameters**:
- `id`: Club ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "message": "Club deleted successfully"
}
```

**Error Responses**:
- `401`: Unauthorized
- `403`: Forbidden (not the owner)
- `500`: Error deleting club

---

## Schedules

### 1. Create Schedule
- **Endpoint**: `POST /api/schedules`
- **Authentication**: Required (JWT Token)
- **Authorization**: Must be owner of the club or tournament creating the schedule
- **Description**: Creates a new match schedule

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "teamOneId": "club_id_1",
  "teamTwoId": "club_id_2",
  "scheduleStatus": "Scheduled",
  "date": "2026-06-15T15:00:00Z",
  "scheduleType": "League",
  "location": "Stadium Name",
  "createdFromClub": "club_id",
  "createdFromTournament": null
}
```

**Required Fields**:
- `teamOneId`: ID of the first team
- `teamTwoId`: ID of the second team
- `date`: Match date and time
- `scheduleType`: Type of schedule (League, Knockout, etc.)
- `location`: Match location
- Either `createdFromClub` OR `createdFromTournament` (one must be provided)

**Optional Fields**:
- `scheduleStatus`: Status of the schedule (default varies by implementation)

**Response** (201 Created):
```json
{
  "message": "Schedule created successfully",
  "schedule": {
    "id": "schedule_id",
    "teamOneId": "club_id_1",
    "teamTwoId": "club_id_2",
    "scheduleStatus": "Scheduled",
    "date": "2026-06-15T15:00:00Z",
    "scheduleType": "League",
    "location": "Stadium Name",
    "createdFromClub": "club_id",
    "createdBy": "user_id"
  }
}
```

**Error Responses**:
- `400`: Missing required fields or invalid data
- `401`: Unauthorized
- `403`: Forbidden (not authorized to create schedule)
- `500`: Error creating schedule

---

### 2. Get All Schedules
- **Endpoint**: `GET /api/schedules`
- **Authentication**: Required (JWT Token)
- **Description**: Retrieves all schedules in the system

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "schedules": [
    {
      "id": "schedule_id",
      "teamOneId": "club_id_1",
      "teamTwoId": "club_id_2",
      "scheduleStatus": "Scheduled",
      "date": "2026-06-15T15:00:00Z",
      "scheduleType": "League",
      "location": "Stadium Name"
    }
  ]
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Error fetching schedules

---

### 3. Get Schedule By ID
- **Endpoint**: `GET /api/schedules/:id`
- **Authentication**: Required (JWT Token)
- **Description**: Retrieves a specific schedule by ID

**URL Parameters**:
- `id`: Schedule ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "schedule": {
    "id": "schedule_id",
    "teamOneId": "club_id_1",
    "teamTwoId": "club_id_2",
    "scheduleStatus": "Scheduled",
    "date": "2026-06-15T15:00:00Z",
    "scheduleType": "League",
    "location": "Stadium Name",
    "createdFromClub": "club_id",
    "createdBy": "user_id"
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `404`: Schedule not found
- `500`: Error fetching schedule

---

### 4. Get My Schedules
- **Endpoint**: `GET /api/schedules/me`
- **Authentication**: Required (JWT Token)
- **Description**: Retrieves all schedules created by the authenticated user

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "message": "Schedules fetched successfully",
  "schedules": [
    {
      "id": "schedule_id",
      "teamOneId": "club_id_1",
      "teamTwoId": "club_id_2",
      "date": "2026-06-15T15:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Error fetching schedules

---

### 5. Get Club Schedules
- **Endpoint**: `GET /api/schedules/club/:id`
- **Authentication**: Required (JWT Token)
- **Description**: Retrieves all schedules for a specific club

**URL Parameters**:
- `id`: Club ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "schedules": [
    {
      "id": "schedule_id",
      "teamOneId": "club_id",
      "teamTwoId": "club_id_2",
      "date": "2026-06-15T15:00:00Z",
      "location": "Stadium Name"
    }
  ]
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Error fetching club schedules

---

### 6. Get Tournament Schedules
- **Endpoint**: `GET /api/schedules/tournament/:id`
- **Authentication**: Required (JWT Token)
- **Description**: Retrieves all schedules for a specific tournament

**URL Parameters**:
- `id`: Tournament ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "schedules": [
    {
      "id": "schedule_id",
      "teamOneId": "club_id_1",
      "teamTwoId": "club_id_2",
      "date": "2026-06-15T15:00:00Z",
      "createdFromTournament": "tournament_id"
    }
  ]
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Error fetching tournament schedules

---

### 7. Update Schedule
- **Endpoint**: `PUT /api/schedules/:id`
- **Authentication**: Required (JWT Token)
- **Authorization**: Must be authorized to modify the schedule
- **Description**: Updates schedule information

**URL Parameters**:
- `id`: Schedule ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body** (All fields optional):
```json
{
  "teamOneId": "club_id_1",
  "teamTwoId": "club_id_2",
  "scheduleStatus": "Completed",
  "date": "2026-06-16T15:00:00Z",
  "scheduleType": "League",
  "location": "New Stadium"
}
```

**Response** (200 OK):
```json
{
  "message": "Schedule updated successfully",
  "schedule": {
    "id": "schedule_id",
    "scheduleStatus": "Completed",
    "date": "2026-06-16T15:00:00Z"
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `403`: Forbidden (not authorized to modify)
- `500`: Failed to update schedule

---

### 8. Delete Schedule
- **Endpoint**: `DELETE /api/schedules/:id`
- **Authentication**: Required (JWT Token)
- **Authorization**: Must be authorized to modify the schedule
- **Description**: Deletes a schedule

**URL Parameters**:
- `id`: Schedule ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "message": "Schedule deleted successfully"
}
```

**Error Responses**:
- `401`: Unauthorized
- `403`: Forbidden (not authorized to delete)
- `500`: Failed to delete schedule

---

## Matches

### 1. Create Match
- **Endpoint**: `POST /api/matches`
- **Authentication**: Required (JWT Token)
- **Description**: Creates a new match result

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body** (All fields required):
```json
{
  "scheduleId": "schedule_id",
  "teamOneGoals": 2,
  "teamTwoGoals": 1
}
```

**Response** (201 Created):
```json
{
  "match": {
    "id": "match_id",
    "scheduleId": "schedule_id",
    "teamOneGoals": 2,
    "teamTwoGoals": 1,
    "createdAt": "2026-06-15T18:00:00Z"
  }
}
```

**Error Responses**:
- `400`: All fields are required
- `401`: Unauthorized
- `500`: Error creating match

---

### 2. Get All Matches
- **Endpoint**: `GET /api/matches`
- **Authentication**: Required (JWT Token)
- **Description**: Retrieves all matches in the system

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "matches": [
    {
      "id": "match_id",
      "scheduleId": "schedule_id",
      "teamOneGoals": 2,
      "teamTwoGoals": 1,
      "createdAt": "2026-06-15T18:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Error fetching matches

---

### 3. Get Match By Schedule ID
- **Endpoint**: `GET /api/matches/:scheduleID`
- **Authentication**: Required (JWT Token)
- **Description**: Retrieves all matches for a specific schedule

**URL Parameters**:
- `scheduleID`: Schedule ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "matches": [
    {
      "id": "match_id",
      "scheduleId": "schedule_id",
      "teamOneGoals": 2,
      "teamTwoGoals": 1
    }
  ]
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Error fetching matches

---

### 4. Update Match
- **Endpoint**: `PUT /api/matches/:matchId`
- **Authentication**: Required (JWT Token)
- **Authorization**: Must be authorized to modify the match
- **Description**: Updates match information

**URL Parameters**:
- `matchId`: Match ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body** (All fields optional):
```json
{
  "teamOneGoals": 3,
  "teamTwoGoals": 2
}
```

**Response** (200 OK):
```json
{
  "match": {
    "id": "match_id",
    "scheduleId": "schedule_id",
    "teamOneGoals": 3,
    "teamTwoGoals": 2
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `403`: Forbidden (not authorized to modify)
- `404`: Match not found
- `500`: Error updating match

---

### 5. Delete Match
- **Endpoint**: `DELETE /api/matches/:matchId`
- **Authentication**: Required (JWT Token)
- **Authorization**: Must be authorized to modify the match
- **Description**: Deletes a match

**URL Parameters**:
- `matchId`: Match ID

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "message": "Match deleted successfully"
}
```

**Error Responses**:
- `401`: Unauthorized
- `403`: Forbidden (not authorized to delete)
- `404`: Match not found
- `500`: Error deleting match

---

## Requests

**Note**: These endpoints are defined but not currently active in server.js

### 1. Create Join Request
- **Endpoint**: `POST /api/requests/join`
- **Authentication**: Required (JWT Token)
- **Description**: Creates a request to join a club

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "clubId": "club_id"
}
```

---

### 2. Get Club Requests
- **Endpoint**: `GET /api/requests/club/:clubId`
- **Authentication**: Required (JWT Token)
- **Description**: Retrieves all join requests for a specific club

**URL Parameters**:
- `clubId`: Club ID

---

### 3. Approve Join Request
- **Endpoint**: `POST /api/requests/approve/:requestId`
- **Authentication**: Required (JWT Token)
- **Description**: Approves a join request

**URL Parameters**:
- `requestId`: Request ID

---

### 4. Reject Join Request
- **Endpoint**: `DELETE /api/requests/reject/:requestId`
- **Authentication**: Required (JWT Token)
- **Description**: Rejects a join request

**URL Parameters**:
- `requestId`: Request ID

---

## Authentication & Authorization

### JWT Token
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

The token is obtained from the login endpoint and should be included in all subsequent requests.

### Authorization Levels
1. **Player Ownership**: User can only modify their own player profile
2. **Club Ownership**: User can only modify clubs they created
3. **Tournament Ownership**: User can only modify tournaments they organized
4. **Schedule Authorization**: User must be owner of the club or tournament that created the schedule
5. **Match Authorization**: User must be authorized to modify the associated schedule

---

## Error Response Format

All error responses follow this general structure:

```json
{
  "message": "Error description",
  "error": "Detailed error message (optional)"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created successfully
- `400`: Bad request (missing or invalid data)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `500`: Internal server error

---

## Notes

1. All date fields should be in ISO 8601 format
2. Token expires after a set duration (check token expiration in response)
3. Match Event and Match Lineup endpoints are currently under development
4. Request endpoints are not yet active in the server

