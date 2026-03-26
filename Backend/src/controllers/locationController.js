import LocationService from "../services/locationService.js";
import RecommendationService from "../services/recommendationService.js";
import { parseCoordinate } from "../utils/geo.js";
import prisma from "../utils/prisma.js";

export const searchPlaces = async (req, res) => {
  try {
    const places = await LocationService.searchPlaces(req.query.q, req.query.limit);
    res.status(200).json({ places });
  } catch (error) {
    res.status(500).json({ message: "Error validating location", error: error.message });
  }
};

export const getLocationRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;

    let latitude = parseCoordinate(req.query.latitude);
    let longitude = parseCoordinate(req.query.longitude);

    if (latitude == null || longitude == null) {
      const user = await prisma.user.findUnique({
        where: { userId },
        select: {
          locationLatitude: true,
          locationLongitude: true,
        },
      });

      latitude = parseCoordinate(user?.locationLatitude);
      longitude = parseCoordinate(user?.locationLongitude);
    }

    if (latitude == null || longitude == null) {
      return res.status(400).json({
        message: "Set your profile location first to get nearby recommendations",
      });
    }

    const recommendations = await RecommendationService.getNearbyRecommendations({
      userId,
      latitude,
      longitude,
      radiusKm: req.query.radiusKm,
      limit: req.query.limit,
    });

    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recommendations", error: error.message });
  }
};
