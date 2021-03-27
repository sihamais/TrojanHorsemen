/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import "./pre-start";
import "reflect-metadata";
import app from "./Server";
import cors from "cors";
import path from "path";
import { Request, Response } from "express";
import { createConnection } from "typeorm";
import readline from "readline";
import { exit } from "process";
import { startGame } from "./gamelogic/startGame";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

/* Ask a question to the player and return his answer */
function ask(quest: string): Promise<string> {
  return new Promise((res) =>
    rl.question(quest + "\n", (ans) => {
      res(ans);
    })
  );
}

(async function chooseDemo() {
  console.log("1. Demo gamelogic");
  const answer = Number(await ask("2. Demo socket"));

  if (isNaN(answer)) {
    console.log("Veuillez entrer un nombre valide !");
    chooseDemo();
  } else if (answer == 1) {
    // Start the server
    const port = Number(process.env.PORT || 3000);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const server = app.listen(port, async () => {
      console.log("Express server started on port: " + port);
      await startGame();

      server.close(() => {
        console.log("Express stopped server");
      });
      exit(0);
    });
    chooseDemo();
  } else if (answer == 2) {
    const port = Number(process.env.PORT || 3000);
    const http = require("http").Server(app);
    const io = require("socket.io")(http);
    require("./routes/game.routes")(io);

    createConnection();

    app.get("/", function (req: Request, res: Response) {
      res.sendFile(path.resolve("./src/index.html"));
    });

    app.use(cors());

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    http.listen(port, async () => {
      console.log("Express server started on port: " + port);
    });
  } else {
    console.log("Veuillez entrer un nombre valide !");
    chooseDemo();
  }
})();
