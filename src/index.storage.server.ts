import net from "net";
import log from "@ajar/marker";
import fs from "fs";

const server = net.createServer();

server.on("connection", (socket) => {
  log.yellow("✨ client connected ✨");

  let stream: fs.WriteStream;

  socket.on("data", (data) => {
    try {
      const json = JSON.parse(data.toString());
      if (stream) stream.end();
      stream = fs.createWriteStream(json.fileName, "utf-8");
    } catch (err) {
      stream.write(data);
    }
  });

  socket.on("end", () => {
    log.yellow("✨ client disconnected ✨");
    stream.end();
  });
});

server.on("error", (err) => {
  log.error(err);
  process.exit(1);
});

server.listen(3000, () => log.v("✨ ⚡Server is up  🚀"));
