# Event Management Backend

This repository contains the backend service for the Event Management application, built with TypeScript, Node.js, and TypeORM.

## Getting Started

Follow these steps to get the project set up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your system.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/event-management-backend.git
    cd event-management-backend
    ```

2.  **Install dependencies:**
    This command installs all the necessary packages defined in `package.json`.
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file by copying the example file. This file will store your local environment-specific settings, such as database credentials.
    ```bash
    # Linux
    cp .env.example .env
    # Window
    copy .env.example .env
    ```
    After creating the file, be sure to update the values inside `.env` to match your local configuration.

4.  **Run the Application:**
    This command starts the development server with hot-reloading enabled, which automatically restarts the server when you make changes to the code.
    ```bash
    npm run dev
    ```

## Development Workflow

To maintain code quality and a clean Git history, we follow specific guidelines for branching and commit messages.

### Branching Strategy

Direct pushes to the `main` branch are disabled. All new features and fixes must be developed in a separate feature branch and submitted as a pull request.

1.  **Create a feature branch:**
    ```bash
    # Branch off from the main branch
    git checkout -b feat/your-feature-name
    ```

2.  **Make and commit your changes.**

3.  **Push your branch and open a pull request:**
    ```bash
    git push origin feature/your-feature-name
    ```
    A pre-push Git hook is in place to prevent accidental pushes directly to `main` or `master`.

### Commit Message Convention

This project enforces the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard for all commit messages. This helps create an explicit and easy-to-read commit history.

A `commit-msg` Git hook, managed by Husky and `commitlint`, automatically checks your commit message format. If your message does not meet the conventional commit standard, the commit will be rejected.

**Example of valid commit messages:**
