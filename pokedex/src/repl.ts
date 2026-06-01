import type { State } from "./state.js";

export function cleanInput(input: string): string[] {
  return input.trim().toLowerCase().split(/\s+/);
}

export function startREPL(state: State) {
  state.readline.prompt();

  state.readline.on("line", async (line: string) => {
    const commands = cleanInput(line);
    if (commands.length === 0) {
      state.readline.prompt();
      return;
    }
    const command = state.commands[commands[0]];
    if (command) {
      await command.callback(state, ...commands.slice(1));
    } else {
      console.log("Unknown command");
    }
    state.readline.prompt();
  });
}
