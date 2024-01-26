// access the data store (store.json)
import fs from "fs";
import path from "path";

// handle requests and reponses
import { ServerResponse, IncomingMessage } from "http";

// access the task structure
import { Task } from "./ITask";

const checkScopes = async(req: IncomingMessage, scope: string): Promise<boolean> => {
  const authString = req.headers.authorization?.slice('Bearere '.length - 1);
  const response = await fetch("https://api.authlete.com/api/auth/introspection", {
    method: "POST",
    mode: "cors",
    headers: new Headers({
      Authorization:
        "Basic " +
        btoa("224518375068946:YSUFMgk3vAtoMKg6mW_ZaIqJ5zmNjW52YzcAAMxqU6c"),
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      'token': authString,
    })
  });
  const responseJson = await response.json();
  if (responseJson.scopes !== undefined && responseJson.scopes.includes(scope)) return true;
  return false;
}

const getTasks = (req: IncomingMessage, res: ServerResponse) => {
  return fs.readFile(
    path.join(__dirname, "../DB/store.json"),
    "utf8",
    (err, data) => {
      // Read the store.json file
      // Check out any errors
      if (err) {
        // error, send an error message
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: err,
          })
        );
      } else {
        // no error, send the data
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: JSON.parse(data),
          })
        );
      }
    }
  );
};

const addTask = async (req: IncomingMessage, res: ServerResponse) => {
  const isValid = await checkScopes(req, 'task.write');
  if (!isValid) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: 'Not Authorized',
      })
    );
  } else {
    // Read the data from the request
    let data = "";

    req.on("data", (chunk) => {
      data += chunk.toString();
    });

    // When the request is done
    req.on("end", () => {
      let task = JSON.parse(data);

      // Read the store.json file
      fs.readFile(path.join(__dirname, "../DB/store.json"), "utf8", (err, data) => {
        // Check out any errors
        if (err) {
          // error, send an error message
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              error: err,
            })
          );
        } else {
          // no error, get the current tasks
          let tasks: [Task] = JSON.parse(data);
          // get the id of the latest task
          let latest_id = tasks.reduce(
            (max = 0, task: Task) => (task.id > max ? task.id : max),
            0
          );
          // increment the id by 1
          task.id = latest_id + 1;
          // add the new task to the tasks array
          tasks.push(task);
          // write the new tasks array to the store.json file
          fs.writeFile(
            path.join(__dirname, "../DB/store.json"),
            JSON.stringify(tasks),
            (err) => {
              // Check out any errors
              if (err) {
                // error, send an error message
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    success: false,
                    error: err,
                  })
                );
              } else {
                // no error, send the data
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    success: true,
                    message: task,
                  })
                );
              }
            }
          );
        }
      });
    });
  }
};

const updateTask = (req: IncomingMessage, res: ServerResponse) => {
  // Read the data from the request
  let data = "";
  req.on("data", (chunk) => {
    data += chunk.toString();
  });
  // When the request is done
  req.on("end", () => {
    // Parse the data
    let task: Task = JSON.parse(data);
    // Read the store.json file
    fs.readFile(path.join(__dirname, "../DB/store.json"), "utf8", (err, data) => {
      // Check out any errors
      if (err) {
        // error, send an error message
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: err,
          })
        );
      } else {
        // no error, get the current tasks
        let tasks: [Task] = JSON.parse(data);
        // find the task with the id
        let index = tasks.findIndex((t) => t.id == task.id);
        // replace the task with the new one
        tasks[index] = task;
        // write the new tasks array to the store.json file
        fs.writeFile(
          path.join(__dirname, "../DB/store.json"),
          JSON.stringify(tasks),
          (err) => {
            // Check out any errors
            if (err) {
              // error, send an error message
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: false,
                  error: err,
                })
              );
            } else {
              // no error, send the data
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: true,
                  message: task,
                })
              );
            }
          }
        );
      }
    });
  });
};

const deleteTask = (req: IncomingMessage, res: ServerResponse) => {
  // Read the data from the request
  let data = "";
  req.on("data", (chunk) => {
    data += chunk.toString();
  });
  // When the request is done
  req.on("end", () => {
    // Parse the data
    let task: Task = JSON.parse(data);
    // Read the store.json file
    fs.readFile(path.join(__dirname, "../DB/store.json"), "utf8", (err, data) => {
      // Check out any errors
      if (err) {
        // error, send an error message
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: err,
          })
        );
      } else {
        // no error, get the current tasks
        let tasks: [Task] = JSON.parse(data);
        // find the task with the id
        let index = tasks.findIndex((t) => t.id == task.id);
        // remove the task
        tasks.splice(index, 1);
        // write the new tasks array to the store.json file
        fs.writeFile(
          path.join(__dirname, "../DB/store.json"),
          JSON.stringify(tasks),
          (err) => {
            // Check out any errors
            if (err) {
              // error, send an error message
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: false,
                  error: err,
                })
              );
            } else {
              // no error, send the data
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: true,
                  message: task,
                })
              );
            }
          }
        );
      }
    });
  });
};

export { getTasks, addTask, updateTask, deleteTask };
