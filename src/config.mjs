// cv.config.json reading and writing (Node). Everything else about options is
// browser-safe and lives in options.mjs, re-exported here for convenience.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export * from "./options.mjs";

export const CONFIG_FILE = "cv.config.json";

export const readConfigFile = (file) => {
   const path = resolve(file ?? CONFIG_FILE);
   if (!existsSync(path)) {
      if (file) throw new Error(`Config file not found: ${path}`);
      return {};
   }
   try {
      return JSON.parse(readFileSync(path, "utf8"));
   } catch (error) {
      throw new Error(`Invalid JSON in ${path}: ${error.message}`);
   }
};

export const writeConfigFile = (config, file = CONFIG_FILE) => {
   const path = resolve(file);
   writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
   return path;
};
