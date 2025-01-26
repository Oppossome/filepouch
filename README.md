<p align="center">
  <h1 align="center">Filepouch</h1>
  <p align="center">
    A loose file file hosting platform with responsive UI/UX
  </p>
</p>

<p align="center">
  <a href="https://github.com/Oppossome/filepouch/actions/workflows/lint-and-test.yml?query=branch:main"><img src="https://github.com/Oppossome/filepouch/actions/workflows/lint-and-test.yml/badge.svg?event=push&branch=main"></a>
  <a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/oppossome/filepouch" alt="License"></a>
</p>

https://github.com/user-attachments/assets/485f888d-c486-43ef-8c72-3ab507a3a17e

<br/>
<br/>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Viewing Playwright Tests](#viewing-playwright-tests)

## Features

### End-to-end testing

Tests are run with against a real browser, aginast an actual server connected to a real database that tests are able to [seed data into](https://github.com/Oppossome/filepouch/blob/8ce54edb1030b77143e6e8c2bf27ad21b88bac08/e2e/users.test.ts#L4-L5) and [interact with](https://github.com/Oppossome/filepouch/blob/8ce54edb1030b77143e6e8c2bf27ad21b88bac08/e2e/session.test.ts#L37-L44)

### Responsive UI/UX

The UI is responsive and works well on both desktop and mobile devices.

### File Uploading

Files can be uploaded to the server and are stored by the server, and can be downloaded and browsed by other users.

## Getting Started

### Prerequisites

- Docker
- Node.js (v18 or higher)
- [pnpm](https://pnpm.io/9.x/installation#using-corepack)

### Installation

1. Clone the repository
2. Install dependencies

```bash
pnpm install
```

3. Initalize the database

```bash
pnpm db:start
pnpm db:push
```

4. Start the development server

```bash
pnpm dev
```

5. Open your browser and navigate to `http://localhost:5173/`

### Viewing Playwright Tests

To view the Playwright tests in an interactive mode, run the following command:

```bash
pnpm test:e2e --ui
```
