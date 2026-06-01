import { commandExit } from "./command_exit.js";
import { commandHelp } from "./command_help.js";
import { commandMap, commandMapBack } from "./command_map.js";
import { commandExplore } from "./command_explore.js";
import { commandCatch } from "./command_catch.js";
import { commandInspect, commandPokedex } from "./command_inspect.js";
import type { CLICommand } from "./state.js";

export function getCommands(): Record<string, CLICommand> {
  return {
    exit: {
      name: "exit",
      description: "Exits the pokedex",
      callback: commandExit,
    },
    help: {
      name: "help",
      description: "Displays a list of available commands",
      callback: commandHelp,
    },
    map: {
      name: "map",
      description: "Displays the next page of locations",
      callback: commandMap,
    },
    mapb: {
      name: "mapback",
      description: "Displays the previous page of locations",
      callback: commandMapBack,
    },
    explore: {
      name: "explore",
      description: "Explore a location in detail",
      callback: commandExplore,
    },
    catch: {
      name: "catch",
      description: "Attempt to catch a pokemon",
      callback: commandCatch,
    },
    inspect: {
      name: "inspect",
      description: "Inspect a caught pokemon in detail",
      callback: commandInspect,
    },
    pokedex: {
      name: "pokedex",
      description: "Display your pokedex",
      callback: commandPokedex,
    },
  };
}