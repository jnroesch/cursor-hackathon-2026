Technical Description

# Overview

We want to build a web app that allows authors to collaborate on writing books, articles etc.
The main feature is a texteditor where each author can work on their local version and create a merge request to the main version. Other authors can then vote on each submission individually and changes only get accepted when the majority accepts.

That means that there is always a true live version of a document and every author has a shadowcopy of the document where they make changes that they then can submit for review.

We need to track these submissions so we can handle merge conflicts etc.

# Approach

We are building an MVP over the weekend. Speed is paramount, we dont need tests, we dont need multiple environments etc. But we still want a solid technical architecutre.

# Tech Stack

## Backend

We will be using Dotnet 10 with Entity Framework and a Postgresql database.

## Frontend

We will be using Angular setup with Nx and Tailwind CSS

## Deployment

We will be using Github Actions together with terraform. Secrets and Configs will be stored in Github environments.

We only need a single environment, no need to worry about a testing environment.

## Authentication

We want to use Microsoft Identity to handle user authentication. Data will be stored in our postgresql database. We should include the following functions

- register
- login
- forgot password

## Specifics

### Deployments

We want to create individual docker files for all required services (eg backend, frontend)
To test locally we want to create a centralized docker compose file to get everything up and running quickly.

### Communication

Most of the communication between backend and frontend will be handled my REST API.

We also want to use the webhooks of the Tiptap editor to handle quick updates.

### Editor

We want to use the TipTap open source editor (https://tiptap.dev/docs) as our base. With this, the document should be represented as a json tree.

### Suggestions

Individual proposals should be stored as operations which then can be reviewd and accepted/declined individually.

We also need to be able

### Coding Style

#### Backend

In the backend we want to use thin controllers that delegate the business logic to services.
We want to use dependency injection and create interfaces for each service.

#### Frontend

We want to use seperate html, css and ts files for each module. Do not combine them into a single file.

# Pages

## Login

We should have a page where users can regsiter and login etc

## Dashboard

When we enter the app we should see the dashboard where we see all of our projects, recent activity and so one

## Project

When navigating inside any project i should be able to see the current live document as well as any recent changes
i can then jump into my local working copy and start typing
