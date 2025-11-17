# BeyondTime 🚀

Welcome to **BeyondTime**! This is an elegant and intuitive application to create, schedule, and manage your daily time, resources, routines, and life's events all in one place. It features a soothing, animated gradient background and is built with modern web technologies, following Material Design 3 principles.

---

## ✨ Features

- **Dynamic Interface**: A beautiful, animated lava-lamp style background that changes with the selected theme.
- **Multiple Views**: Seamlessly switch between three main views:
    - **Routines & Events**: A virtualized list for managing all recurring and one-time events.
    - **Clock**: A central, interactive analog clock displaying your day's schedule, team member timezones, and a built-in timer.
    - **Tasks & Payments**: A dedicated view for managing one-off tasks and financial items.
- **Comprehensive Item Management**: Create, edit, and delete Routines, Events, Tasks, and Payments with detailed options for scheduling, repetition, and notifications.
- **Team & Member Management**: A robust system for managing teams and members, complete with a flexible role-based permission model.
- **Deep Personalization**:
    - **Theming**: Multiple light and dark themes to suit your mood.
    - **Accent Colors**: Customize the primary color used throughout the UI.
    - **Clock Customization**: Choose from multiple analog clock faces and toggle visual effects like 3D parallax and glint.
- **Calendar Views**: Visualize your schedule with integrated Weekly and Monthly calendar views.
- **Data Portability**: Easily import and export your data as a JSON file, and load sample data to get started quickly.
- **Internationalization (i18n)**: Full support for multiple languages (English, French, German, Italian, Spanish).
- **Responsive & Accessible**: Designed to work beautifully on desktop and mobile devices, with a focus on accessibility.

---

## 🛠️ Tech Stack

- **Frontend**: React & TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: esbuild
- **Development Server**: live-server
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (for the Dockerized version)

---

## 🚀 Getting Started

You can run this project in two ways: with Docker (recommended for a quick and consistent setup) or locally using Node.js.

### Option 1: The Easy Way with Docker (Recommended)

We use **Docker** to run this application. Think of Docker as a magic box that contains everything the app needs to run perfectly on any computer. This means you won't have to install special tools or configure your machine. This setup also includes an **n8n** instance for workflow automation.

#### Prerequisites

1.  **Docker Desktop**: If you don't have it, download it from the official website.
    *   [**Download Docker Desktop**](https://www.docker.com/products/docker-desktop/)

> **Note:** You do not need to install Node.js, Nginx, or any other developer tools. Docker handles everything!

#### Running the Application

1.  **Get the Code**: Clone the repository or download and unzip the source code.
2.  **Navigate into the directory**: Open your terminal (or Command Prompt/PowerShell) and move into the project folder.
    ```bash
    cd path/to/your/project
    ```
3.  **Run the command**: Make sure Docker Desktop is running, then execute:
    ```bash
    docker-compose up --build
    ```
    This command builds the application and starts all services. It might take a few minutes the first time.

### Option 2: Local Development without Docker

If you prefer to run the application without Docker, you can use Node.js and `npm`.

#### Prerequisites

1.  **Node.js**: Ensure you have Node.js (version 16 or later) and npm installed. You can download it from [nodejs.org](https://nodejs.org/).

#### Running the Application

1.  **Get the Code**: Clone or download the source code and navigate into the project directory.
2.  **Install Dependencies**: Open your terminal and run:
    ```bash
    npm install
    ```
3.  **Build the Project**: The application needs to be bundled before it can be served.
    ```bash
    npm run build
    ```
4.  **Start the Development Server**: This command will launch the app.
    ```bash
    npm run dev
    ```
5.  **Access the App**: Open your browser and go to **http://localhost:8080**. Note that `live-server` may occasionally pick a different port if 8080 is in use.

---

## 🐳 Accessing Your Applications

Once the services are running, you can access them in your browser.

-   **BeyondTime Web App**:
    -   **http://localhost:8080**

-   **n8n Automation Tool** (Only available with the Docker setup):
    -   **http://localhost:5678**
    - The BeyondTime app can send requests to this n8n instance for workflow automation. You can import the provided `n8n_flow.json` file to get started with a pre-built workflow.

### Stopping the Application

-   **Docker**: Go to the terminal where you ran `docker-compose up` and press **`Ctrl + C`**. To clean up completely, run `docker-compose down`.
-   **Local Development**: Go to the terminal where you ran `npm run dev` and press **`Ctrl + C`**.

And that's it! You have successfully set up and run a production-ready, containerized web application.
