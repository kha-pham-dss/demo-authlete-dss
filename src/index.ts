import http from "http";

// import controller
import { getTasks, addTask, updateTask, deleteTask } from "./controller";

// create the http server
const server = http.createServer(async (req, res) => {
  // hello world
  if (req.method == "GET" && req.url == "/hello") {
    res.write("Hello World!");
    res.end();
  }
  // get tasks
  if (req.method == "GET" && req.url == "/api/tasks") {
    return getTasks(req, res);
  }

  // Creating a task
  if (req.method == "POST" && req.url == "/api/tasks") {
    return await addTask(req, res);
  }

  // Updating a task
  if (req.method == "PUT" && req.url == "/api/tasks") {
    return updateTask(req, res);
  }

  // Deleting a task
  if (req.method == "DELETE" && req.url == "/api/tasks") {
    return deleteTask(req, res);
  }
});

// set up the server port and listen for connections
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// myServer.close();
