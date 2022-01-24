import { exec } from "child_process";
import { CronJob } from "cron";
import net from "net";
import fs from "fs/promises";
import path from "path";

const { cwd } = process;

// const client = new net.Socket();
const socket = net.createConnection({ port: 3000 });

async function main() {
  const backupConfigJson = JSON.parse(
    await fs.readFile(path.join(cwd(), "mysql.backup.config.json"), "utf-8")
  );
  const dbs: string[] = backupConfigJson.dbs;

  // const socket = client.connect({ port: 3000 });
  for (const db of dbs) {
    const fileName = `${Date.now()}-${db}-backup.sql`;
    socket.write(`${JSON.stringify({ fileName })}\n`);
    const dumpStream = exec(
      `docker exec mysql-db /usr/bin/mysqldump -u root --password=qwerty ${db}`
    );

    // dumpStream.stdout?.on('data',(chunk)=>{socket.write(chunk)})
    if (!dumpStream.stdout) continue;
    for await (const data of dumpStream.stdout) {
      socket.write(data);
    }
  }
  // socket.end();
}

const job = new CronJob("*/20 * * * * *", main);
job.start();
