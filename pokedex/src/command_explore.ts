import { State } from "./state.js";

export async function commandExplore(state: State, ...args: string[]): Promise<void> {
  if (!state.pokeAPI) {
    console.error("PokeAPI not initialized");
    return;
  }
  const locationName = args[0];
  if (!locationName) {
    console.log("Please specify a location to explore. Usage: explore <location_name>");
    return;
  }
  try {
    const data = await state.pokeAPI.fetchLocationArea(locationName);
    if (!data) {
      console.log(`Location area "${locationName}" not found.`);
      return;
    }
    console.log(`Exploring ${data.name}`);
    console.log("Found Pokemon:");
    data.pokemon_encounters.forEach((encounter) => {
      console.log(`- ${encounter.pokemon.name}`);
    });
  } catch (error) {
    console.error("Error fetching location data:", error);
  }
}
