import { Cache } from "./pokecache.js";

export class PokeAPI {
  private static readonly baseURL = "https://pokeapi.co/api/v2";
  #cache = new Cache(60_000);

  constructor() {}

  async fetchLocations(pageURL?: string): Promise<ShallowLocations> {
    const url = pageURL || `${PokeAPI.baseURL}/location`;
    const cachedResponse = this.#cache.get<ShallowLocations>(url);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.statusText}`);
    }
    const locations = await response.json();
    this.#cache.add(url, locations);
    return locations;
  }

  async fetchLocation(locationName: string): Promise<Location> {
    const url = `${PokeAPI.baseURL}/location/${locationName}`;
    const cachedResponse = this.#cache.get<Location>(url);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch location: ${response.statusText}`);
    }
    const location = await response.json();
    this.#cache.add(url, location);
    return location;
  }

  async fetchLocationArea(areaName: string): Promise<LocationArea> {
    const url = `${PokeAPI.baseURL}/location-area/${areaName}`;
    const cachedResponse = this.#cache.get<LocationArea>(url);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch location area: ${response.statusText}`);
    }
    const locationArea = await response.json();
    this.#cache.add(url, locationArea);
    return locationArea;
  }

  async fetchPokemon(pokemonName: string): Promise<Pokemon> {
    const url = `${PokeAPI.baseURL}/pokemon/${pokemonName}`;
    const cachedResponse = this.#cache.get<Pokemon>(url);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch pokemon: ${response.statusText}`);
    }
    const pokemon = await response.json();
    this.#cache.add(url, pokemon);
    return pokemon;
  }
}

export type ShallowLocations = {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
};

export type Location = {
  id: number;
  name: string;
  region: {
    name: string;
    url: string;
  };
  areas: {
    name: string;
    url: string;
  }[];
};

export type LocationArea = {
  id: number;
  name: string;
  pokemon_encounters: {
    pokemon: {
      name: string;
      url: string;
    };
  }[];
}

export type Pokemon = {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  stats: {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }[];
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
}
