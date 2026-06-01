import { State } from "./state.js";

export async function commandMap(state: State): Promise<void> {
  if (!state.pokeAPI) {
    console.error("PokeAPI not initialized");
    return;
  }
  try {
    const data = await state.pokeAPI.fetchLocations(state.nextLocationsURL || undefined);
    const locationData = await Promise.all(
      data.results.map((loc) => state.pokeAPI!.fetchLocation(loc.name))
    );
    locationData.forEach((loc) => console.log(`${loc?.areas[0]?.name}`));
    state.nextLocationsURL = data.next;
    state.previousLocationsURL = data.previous;
  } catch (error) {
    console.error("Error fetching locations:", error);
  }
}

export async function commandMapBack(state: State): Promise<void> {
  if (!state.pokeAPI) {
    console.error("PokeAPI not initialized");
    return;
  }
  if (!state.previousLocationsURL) {
    console.log("No previous page of locations.");
    return;
  }
  try {
    const data = await state.pokeAPI.fetchLocations(state.previousLocationsURL);
    const locationData = await Promise.all(
      data.results.map((loc) => state.pokeAPI!.fetchLocation(loc.name))
    );
    locationData.forEach((loc) => console.log(`${loc?.areas[0]?.name}`));
    state.nextLocationsURL = data.next;
    state.previousLocationsURL = data.previous;
  } catch (error) {
    console.error("Error fetching locations:", error);
  }
}
