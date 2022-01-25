import { exec } from "child_process";
import { CronJob } from "cron";
import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";

const { cwd } = process;

async function main() {
  const backupConfigJson = JSON.parse(
    await fs.readFile(path.join(cwd(), "mysql.backup.config.json"), "utf-8")
  );
  const dbs: string[] = backupConfigJson.dbs;

  const pendingDbs = dbs.map(async (db) => {
    const fileName = `${Date.now()}-${db}-backup.sql`;
    const dumpStream = exec(
      `docker exec mysql-db /usr/bin/mysqldump -u root --password=qwerty ${db}`
    );

    const response = await fetch("http://localhost:4000", {
      body: dumpStream.stdout,
      method: "POST",
      headers: { "file-name": fileName },
    });

    return await response.json();
  });

  const results = await Promise.all(pendingDbs);
  console.log(results);
}

const job = new CronJob("*/20 * * * * *", main);
job.start();
