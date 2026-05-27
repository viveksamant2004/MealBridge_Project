// src/utils/geocode.ts

export async function geocodeAddress(
  address: string,
  city: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const query = encodeURIComponent(`${address}, ${city}, India`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { "User-Agent": "FoodShareApp/1.0" } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
  } catch {
    // silently fail — listing saves without coordinates
  }
  return null;
}