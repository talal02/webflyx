import { createInterface, type Interface } from "readline";
import { stdin as input, stdout as output } from "process";
import { getCommands } from "./commands.js";

import { PokeAPI, Pokemon } from "./pokeapi.js";

export type CLICommand = {
	name: string;
	description: string;
	callback: (state: State, ...args: string[]) => Promise<void>;
};

export type State = {
	readline: Interface;
	commands: Record<string, CLICommand>;
  pokedex: Record<string, Pokemon>;
  pokeAPI?: PokeAPI;
  nextLocationsURL?: string | null;
  previousLocationsURL?: string | null;
};

export function initState(): State {
	return {
		readline: createInterface({ input, output, prompt: "Pokedex > " }),
		commands: getCommands(),
		pokeAPI: new PokeAPI(),
		pokedex: {},
	};
}
