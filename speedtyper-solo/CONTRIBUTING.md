# Contributing

*This is a work in progress.*

### **Table of Contents**
- [Required](#required) 
- [Running Speedtyper.dev](#running-speedtyperdev)
    - [Backend](#backend)
    - [Frontend](#frontend)

## Required

|Prerequisite                               |Link                                                                   |
|-------------------------------------------|-----------------------------------------------------------------------|
|Git                                        |[🔗](https://git-scm.com/downloads)                                   |
|Node 20                                    |[🔗](https://nodejs.org/en/)                                          |
| Yarn                                      |[🔗](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable)|
|PostgreSQL                                 |            |
|build-essential (or equivalent for your OS)|                                                                       |
| Docker (Optional)                         |[🔗](https://www.docker.com/)                                         |

## Running Speedtyper.dev

### Backend

Install dependencies:
```
make install-backend-dependencies
```
Copy over path of env file:
```
cp ./packages/back-nest/.env.development ./packages/back-nest/.env
```
Start Docker Compose in the background:
```
make run-dev-db
```
Seed the db with example challenges 
```
make run-seed-codesources
```

Run the backend:
```
make run-backend-dev
```

### Frontend

Install dependencies:
```
make install-webapp-dependencies
```
Run the frontend:
```
make run-webapp-dev
```
