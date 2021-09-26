#!/usr/bin/env node

const program = require("caporal");
const chokidar = require("chokidar");
const debounce = require("lodash.debounce");
const fs = require("fs");
const { spawn } = require("child_process");
const chalk = require("chalk");

program
  .version("0.0.1")
  .argument("[filename]", "Name of a file to execute")
  .action(async ({ filename }) => {
    // destructure filename from args

    const name = filename || "index.js"; // default filename to index.js

    try {
      await fs.promises.access(name); // check to see if this file exists
    } catch (err) {
      throw new Error(`Could not find the file ${name}`);
    }

    let proc;
    const start = debounce(() => {
      if (proc) {
        //kill previous child process if it is still running
        proc.kill();
      }
      console.log(chalk.blue(">>>> Starting process..."));
      proc = spawn("node", [name], { stdio: "inherit" }); // start program as child process and inherit logs and errors
    }, 100);

    chokidar
      .watch(".")
      .on("add", start) // called when a file is created or seen at chokidar startup
      .on("change", start)
      .on("unlink", start);
  });

program.parse(process.argv);
