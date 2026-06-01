import { State } from "./state.js";

export async function commandCatch(state: State, ...args: string[]): Promise<void> {
  if (!state.pokeAPI) {
    console.error("PokeAPI not initialized");
    return;
  }
  const pokemonName = args[0];
  if (!pokemonName) {
    console.log("Please specify a pokemon to catch. Usage: catch <pokemon_name>");
    return;
  }
  try {
    const data = await state.pokeAPI.fetchPokemon(pokemonName);
    if (!data) {
      console.log(`Pokemon "${pokemonName}" not found.`);
      return;
    }
    console.log(`Throwing a Pokeball at ${data.name}...`);
    let base_experience = data.base_experience;
    const catchChance = Math.random() * 300;
    if (catchChance > base_experience) {
      state.pokedex[pokemonName] = data; // Add caught pokemon to pokedex
      console.log(`${pokemonName} was caught!`);
    } else {
      console.log(`${pokemonName} escaped!`);
    }
  } catch (error) {
    console.error("Error fetching pokemon data:", error);
  }
}
