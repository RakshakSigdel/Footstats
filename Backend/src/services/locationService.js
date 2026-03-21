import { hasValidCoordinates } from "../utils/geo.js";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

const normalizePlaces = (items = []) =>
  items
    .filter((item) => hasValidCoordinates(item?.lat, item?.lon))
    .map((item) => ({
      placeId: String(item.place_id),
      displayName: item.display_name,
      latitude: Number(item.lat),
      longitude: Number(item.lon),
      type: item.type || null,
      importance: item.importance ?? null,
      rawAddress: item.address || null,
    }));

class LocationService {
  static async searchPlaces(query, limit = 20) {
    const trimmedQuery = String(query || "").trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      return [];
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 25);
    const cacheKey = `${trimmedQuery.toLowerCase()}::${safeLimit}`;
    const cached = cache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("q", trimmedQuery);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("accept-language", "en");
    url.searchParams.set("limit", String(safeLimit));

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Footstats/1.0 (location-search)",
        "Accept-Language": "en",
      },
    });

    if (!response.ok) {
      throw new Error("Unable to validate location at the moment");
    }

    const payload = await response.json();
    const places = normalizePlaces(Array.isArray(payload) ? payload : []);

    cache.set(cacheKey, {
      value: places,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return places;
  }
}

export default LocationService;
