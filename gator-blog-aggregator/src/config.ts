import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName: string;
};

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

function writeConfig(cfg: Config): void {
  const rawConfig = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };

  fs.writeFileSync(getConfigFilePath(), JSON.stringify(rawConfig, null, 2), {
    encoding: "utf8",
  });
}

function validateConfig(rawConfig: any): Config {
  if (
    typeof rawConfig !== "object" ||
    rawConfig === null ||
    typeof rawConfig.db_url !== "string" ||
    typeof rawConfig.current_user_name !== "string"
  ) {
    throw new Error("Invalid config file");
  }

  return {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  };
}

export function setUser(currentUserName: string, cfg: Config): void {
  cfg.currentUserName = currentUserName;
  writeConfig(cfg);
}

export function readConfig(): Config {
  const configFile = fs.readFileSync(getConfigFilePath(), { encoding: "utf8" });
  const rawConfig = JSON.parse(configFile);

  return validateConfig(rawConfig);
}