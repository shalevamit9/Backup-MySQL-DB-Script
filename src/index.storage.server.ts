import express from "express";
import path from "path";
import fs from "fs";

const { cwd } = process;

const app = express();

app.use(express.json());

app.post("/", (req, res) => {
  console.log(req.headers["file-name"] as string);
  const filePath = path.join(
    cwd(),
    "files",
    req.headers["file-name"] as string
  );
  const writeStream = fs.createWriteStream(filePath, "utf-8");
  req.pipe(writeStream);
  req.on("end", () => res.status(201).json({ message: "success" }));
});

app.listen(4000, () => console.log("listening 4000"));
