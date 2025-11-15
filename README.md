# BeyondTime 🚀

Welcome to **BeyondTime**! This is an elegant and intuitive application to create, schedule, and manage your daily time, resources, routines, and life's events all in one place. It features a soothing, animated gradient background and is built with modern web technologies.

This guide will walk you through setting up and running the application on your local machine. We've made it as simple as possible using Docker, so you don't need to worry about complex setup procedures.

---

## Getting Started: The Easy Way with Docker

We use **Docker** to run this application. Think of Docker as a magic box that contains everything the app needs to run perfectly on any computer. This means you won't have to install special tools or configure your machine—just install Docker, run one command, and you're good to go!

This setup also includes an **n8n** instance, which is a powerful tool for automating workflows. The BeyondTime app is pre-configured to communicate with it.

### Step 1: Prerequisites (Things You Need)

Before you begin, you only need one thing installed on your computer:

1.  **Docker Desktop**: This is the software that manages our "magic boxes" (containers). If you don't have it, download it from the official website. It's a straightforward installation for Windows, Mac, and Linux.

    *   [**Download Docker Desktop**](https://www.docker.com/products/docker-desktop/)

> **Note:** You do not need to install Node.js, Nginx, or any other developer tools. Docker handles everything!

### Step 2: Get the Application Code

First, you need to get a copy of the project code on your computer.

1.  **Download the Code**: If you have `git` installed, you can clone the repository. If not, you can download the project as a ZIP file from GitHub and unzip it.
    
2.  **Navigate into the directory**: Open your terminal (or Command Prompt/PowerShell on Windows) and move into the project folder.
    ```bash
    cd path/to/your/project
    ```

### Step 3: Run the Application!

This is the final and most important step. Make sure Docker Desktop is running on your computer. Then, in your terminal, from inside the project folder, run this single command:

```bash
docker-compose up --build
```

**What does this command do?**
*   `docker-compose up`: This tells Docker to read our configuration file (`docker-compose.yml`) and start up all the services defined in it (our web app and the n8n service).
*   `--build`: This part tells Docker to build the application from its source code the first time you run it. If you make code changes later, running this command again will rebuild it with your changes.

Your terminal will show a lot of output as Docker builds the application and starts the services. This might take a few minutes the first time. Once you see messages indicating that the servers are running, you're all set!

---

## Accessing Your Applications

Once the command finishes, your applications are running!

*   **BeyondTime Web App**: Open your web browser and go to:
    *   **http://localhost:8080**

*   **n8n Automation Tool**: To access the n8n interface, go to:
    *   **http://localhost:5678**

The BeyondTime app is now able to send requests to the n8n instance, allowing you to create powerful integrations and workflows. You can import the provided `n8n_flow.json` file to get started with a pre-built workflow.

## Stopping the Application

When you're finished using the app, you can stop it easily.

1.  Go back to the terminal where you ran the `docker-compose up` command.
2.  Press **`Ctrl + C`**.
3.  To fully remove the containers and clean up the network, you can also run:
    ```bash
    docker-compose down
    ```

And that's it! You have successfully set up and run a production-ready, containerized web application.
