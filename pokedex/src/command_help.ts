import type { State } from "./state.js";

export async function commandHelp(state: State): Promise<void> {
  console.log("Welcome to the Pokedex!\nUsage:\n");
  Object.values(state.commands).forEach((cmd) => {
    console.log(`${cmd.name}: ${cmd.description}`);
  });
}
