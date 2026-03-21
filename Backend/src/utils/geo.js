export const isFiniteNumber = (value) => Number.isFinite(Number(value));

export const parseCoordinate = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const isValidLatitude = (value) => {
  const latitude = Number(value);
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90;
};

export const isValidLongitude = (value) => {
  const longitude = Number(value);
  return Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
};

export const hasValidCoordinates = (latitude, longitude) =>
  isValidLatitude(latitude) && isValidLongitude(longitude);

export const toRadians = (degrees) => (degrees * Math.PI) / 180;

export const haversineDistanceKm = (fromLatitude, fromLongitude, toLatitude, toLongitude) => {
  if (!hasValidCoordinates(fromLatitude, fromLongitude) || !hasValidCoordinates(toLatitude, toLongitude)) {
    return null;
  }

  const earthRadiusKm = 6371;
  const dLat = toRadians(Number(toLatitude) - Number(fromLatitude));
  const dLon = toRadians(Number(toLongitude) - Number(fromLongitude));

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(Number(fromLatitude))) *
      Math.cos(toRadians(Number(toLatitude))) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};
