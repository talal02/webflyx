import { State } from "./state.js";

export async function commandInspect(state: State, ...args: string[]): Promise<void> {
  if (!state.pokeAPI) {
    console.error("PokeAPI not initialized");
    return;
  }
  const pokemonName = args[0];
  if (!pokemonName) {
    console.log("Please specify a pokemon to inspect. Usage: inspect <pokemon_name>");
    return;
  }
  if (!state.pokedex[pokemonName]) {
    console.log(`you have not caught that pokemon`);
    return;
  }
  try {
    const data = await state.pokeAPI.fetchPokemon(pokemonName);
    if (!data) {
      console.log(`Pokemon "${pokemonName}" not found.`);
      return;
    }
    console.log(`Name: ${data.name}`);
    console.log(`Height: ${data.height}`);
    console.log(`Weight: ${data.weight}`);
    console.log(`Stats:`);
    data.stats.forEach((stat) => {
      console.log(`  -${stat.stat.name}: ${stat.base_stat}`);
    });
    console.log(`Types:`);
    data.types.forEach((type) => {
      console.log(`  - ${type.type.name}`);
    });
  } catch (error) {
    console.error("Error fetching pokemon data:", error);
  }
}

export async function commandPokedex(state: State): Promise<void> {
  const caughtPokemon = Object.keys(state.pokedex);
  if (caughtPokemon.length === 0) {
    console.log("You haven't caught any pokemon yet!");
    return;
  }
  console.log("Your Pokedex:");
  caughtPokemon.forEach((name) => {
    console.log(`- ${name}`);
  });
}
