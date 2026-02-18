# VotePulse — Simple Online Poll & Voting App

A lightweight real-time polling application built with Spring Boot. Create polls, share them, and collect votes through a clean web interface.

## Tech Stack

- **Backend**: Spring Boot 4.0.2 (Java 21)
- **Database**: MySQL
- **ORM**: Spring Data JPA / Hibernate
- **Frontend**: Vanilla HTML, CSS, JavaScript (served as static assets)
- **Build Tool**: Maven

## Project Structure

```
src/main/java/com/voting/votingapp/
├── VotingAppApplication.java        # Application entry point
├── config/
│   └── WebConfig.java               # CORS configuration
├── controller/
│   └── PollController.java          # REST API endpoints
├── model/
│   ├── Poll.java                    # Poll entity (id, question, options)
│   └── OptionVOte.java              # Embeddable vote option (voteOption, voteCount)
├── repository/
│   └── PollRepository.java          # JPA repository
├── request/
│   └── Vote.java                    # Vote request DTO (pollId, optionIndex)
└── service/
    └── PollService.java             # Business logic (CRUD, voting)

src/main/resources/
├── application.properties           # Server & database config
├── static/                          # Frontend assets
│   ├── index.html
│   ├── style.css
│   └── app.js
└── templates/
```

## API Reference

Base URL: `http://localhost:9090/api/polls`

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|-------------|
| `GET` | `/api/polls` | Get all polls | — |
| `GET` | `/api/polls/{id}` | Get poll by ID | — |
| `POST` | `/api/polls` | Create a new poll | `{ question, options }` |
| `POST` | `/api/polls/vote` | Vote on an option | `{ pollId, optionIndex }` |

### Create Poll — Request Body

```json
{
  "question": "What is your favorite language?",
  "options": [
    { "voteOption": "Java", "voteCount": 0 },
    { "voteOption": "Python", "voteCount": 0 },
    { "voteOption": "JavaScript", "voteCount": 0 }
  ]
}
```

### Vote — Request Body

```json
{
  "pollId": 1,
  "optionIndex": 0
}
```

## Prerequisites

- Java 21+
- MySQL 8+
- Maven (or use the included Maven wrapper)