# Users Meeting Scheduler

## Requirements

- Docker and Docker Compose
- Auth0 account

## Get the token authenticator

First of all, its need at least one user have to be created at Auth0 enviorment.

- At Postman (or any other HTTP client), hit this endpoint: `POST https://dev-emth2dws.us.auth0.com/oauth/token`
- Use this body:

```
{
    "client_id": $AUTH0_CLIENT_ID,
    "client_secret": $AUTH0_CLIENT_SECRET,
    "audience": $AUTH0_API_URL,
    "grant_type":"password",
    "username": $AUTH0_USER_NAME,
    "password": $AUTH0_USER_PASSWORD
}
```

- The response will return somethign like this:

```
{
    "access_token": $AUth0_TOKEN,
    "expires_in": 86400,
    "token_type": "Bearer"
}
```

- Get the JWT secret at AUth0 dashboard
- In `.env` file, put the JWT secret as value of `AUTH_SECRET`

## Start Server

To start the graphql server, at project root folder, just run the docker compose file: `docker-compose up`.

- It will run a server that is listen on port `8000`.
- Hit `http:localhost:8000` in a browser tab.
- It will open a studio apollo graphql sandbox plataform
- At `Hearders` tab, add a new header call `Authorization` and its values `Bearer $AUTH0_TOKEN`

## Queries and Mutations

# Meetings

- Query `meetings`
- Mutation `addMeeting(title: string, description: string, guestsUsersId: string[])`
- Mutation `deleteMeeting(meetingId: number)`
- Mutation `addInvitedUserToMeeting(invitedUserEmail: string, meetingId: number)`
- Mutatation `removeGuestUserFromMeeting(invitedUserEmail: string, meetingId: number)`

# Users

- Mutation `addUser(email: string, password: string, nickname: string, userId: string)`
