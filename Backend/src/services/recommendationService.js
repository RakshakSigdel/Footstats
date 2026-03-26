import { haversineDistanceKm, hasValidCoordinates } from "../utils/geo.js";
import prisma from "../utils/prisma.js";

const withDistance = (items, userLatitude, userLongitude) =>
  items
    .map((item) => {
      const distanceKm = haversineDistanceKm(
        userLatitude,
        userLongitude,
        item.locationLatitude,
        item.locationLongitude,
      );

      if (distanceKm == null) return null;

      return {
        ...item,
        distanceKm: Number(distanceKm.toFixed(1)),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distanceKm - b.distanceKm);

class RecommendationService {
  static async getNearbyRecommendations({
    userId,
    latitude,
    longitude,
    radiusKm = 50,
    limit = 12,
  }) {
    if (!hasValidCoordinates(latitude, longitude)) {
      throw new Error("Valid location coordinates are required");
    }

    const safeRadiusKm = Math.min(Math.max(Number(radiusKm) || 50, 1), 500);
    const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);

    const userClubMemberships = await prisma.userClub.findMany({
      where: { userId },
      select: { clubId: true },
    });

    const userOwnedClubs = await prisma.club.findMany({
      where: { createdBy: userId },
      select: { clubId: true },
    });

    const excludedClubIds = new Set([
      ...userClubMemberships.map((entry) => entry.clubId),
      ...userOwnedClubs.map((entry) => entry.clubId),
    ]);

    const [clubs, tournaments] = await Promise.all([
      prisma.club.findMany({
        where: {
          locationLatitude: { not: null },
          locationLongitude: { not: null },
        },
        select: {
          clubId: true,
          name: true,
          description: true,
          logo: true,
          location: true,
          locationLatitude: true,
          locationLongitude: true,
        },
      }),
      prisma.tournament.findMany({
        where: {
          locationLatitude: { not: null },
          locationLongitude: { not: null },
          status: { in: ["UPCOMING", "ONGOING"] },
          enrollmentStatus: "OPEN",
        },
        select: {
          tournamentId: true,
          name: true,
          description: true,
          logo: true,
          location: true,
          locationLatitude: true,
          locationLongitude: true,
          startDate: true,
          endDate: true,
          status: true,
          entryFee: true,
          format: true,
        },
      }),
    ]);

    const nearbyClubs = withDistance(
      clubs.filter((club) => !excludedClubIds.has(club.clubId)),
      latitude,
      longitude,
    )
      .filter((club) => club.distanceKm <= safeRadiusKm)
      .slice(0, safeLimit);

    const nearbyTournaments = withDistance(tournaments, latitude, longitude)
      .filter((tournament) => tournament.distanceKm <= safeRadiusKm)
      .slice(0, safeLimit);

    return {
      userLocation: {
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      meta: {
        radiusKm: safeRadiusKm,
        limit: safeLimit,
      },
      clubs: nearbyClubs,
      tournaments: nearbyTournaments,
    };
  }
}

export default RecommendationService;
