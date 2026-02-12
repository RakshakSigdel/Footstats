// const { PrismaClient } = require("@prisma/client");
import {PrismaClient} from "@prisma/client";
// const { hashPassword } = require("../src/utils/hashPassword");
import { hashPassword } from "../src/utils/hashPassword.js";

const prisma = new PrismaClient();

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log("The database already has data. Skipping seed");
    return;
  }

  console.log("Seeding Database");

  await prisma.$transaction([
    prisma.tournament.deleteMany({}),
    prisma.club.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);

  // Hash passwords before seeding
  const adminPassword = await hashPassword("admin123");
  const rakshakPassword = await hashPassword("rakshak123");
  const playerPassword = await hashPassword("footstatplayer123");

  await prisma.user.createMany({
    data: [
      // ── Your SUPERADMIN account ───────────────────────────────────────
      {
        firstName: "admin",
        lastName: "admin",
        email: "admin@gmail.com",
        password: adminPassword,
        role: "SUPERADMIN",
      },
      {
        userId: 5555,
        firstName: "rakshak",
        lastName: "sigdel",
        email: "rakshaksigdel@gmail.com",
        gender: "Male",
        location: "Sundarharaicha-04, Morang",
        preferredFoot: "RIGHT",
        password: rakshakPassword,
      },
      // ── 20 test player accounts ───────────────────────────────────────
      ...Array.from({ length: 20 }, (_, i) => ({
        firstName: "footstat",
        lastName: "player",
        email: `footstatplayer${i + 1}@gmail.com`,
        password: playerPassword,
      })),
    ],
  });

  // ── Tournament created by rakshaksigdel ───────────────────────────────
  await prisma.tournament.createMany({
    data: [
      {
        name: "Summer Championship 2026",
        description:
          "Annual summer football tournament featuring the best local teams",
        location: "City Sports Complex, Downtown",
        entryFee: 500.0,
        startDate: new Date("2026-06-15T09:00:00.000Z"),
        endDate: new Date("2026-06-30T18:00:00.000Z"),
        format: "KNOCKOUT",
        status: "UPCOMING",
        createdBy: 5555,
      },
      {
        name: "Holi Special Bhale Cup",
        description:
          "Bhale Cup organized by the youths of itahari. Winner will get 10kg of Hen meat along with medals and certifications, no age limit",
        location: "Itahari Rangashala",
        entryFee: 800.0,
        startDate: new Date("2026-06-15T09:00:00.000Z"),
        endDate: new Date("2026-06-30T18:00:00.000Z"),
        format: "KNOCKOUT",
        status: "UPCOMING",
        createdBy: 5555,
      },
    ],
  });
  //Create Another Club
  await prisma.club.createMany({
    data: [
      {
        name: "RUG FC",
        description: "Rock Up Gang Football Club",
        location: "Baliya Chowk",
        foundedDate: new Date("2026-06-15T09:00:00.000Z"),
        createdBy: 5555,
      },
      {
        name: "Itahari under 18 football club",
        description:
          "This is only for childrens who are age eighteen and below",
        location: "Itahari, Sunsari",
        foundedDate: new Date("2026-06-15T09:00:00.000Z"),
        createdBy: 5555,
      },
    ],
  });
  //10 player join rug FC and 10 Player Join Itahari under 18 football club

  // Fetch the created players and clubs
  const players = await prisma.user.findMany({
    where: {
      email: {
        startsWith: "footstatplayer",
      },
    },
    orderBy: {
      email: "asc",
    },
  });

  const rugFC = await prisma.club.findFirst({
    where: { name: "RUG FC" },
  });

  const itahariU18 = await prisma.club.findFirst({
    where: { name: "Itahari under 18 football club" },
  });

  if (rugFC && itahariU18 && players.length >= 20) {
    // First 10 players join RUG FC
    const rugFCMembers = players.slice(0, 10).map((player) => ({
      userId: player.userId,
      clubId: rugFC.clubId,
      role: "MEMBER",
    }));

    // Next 10 players join Itahari under 18 football club
    const itahariMembers = players.slice(10, 20).map((player) => ({
      userId: player.userId,
      clubId: itahariU18.clubId,
      role: "MEMBER",
    }));

    await prisma.userClub.createMany({
      data: [...rugFCMembers, ...itahariMembers],
    });
  }
  
  console.log(
    "Seeding Finished → 1 SUPERADMIN + 1 user (rakshaksigdel) + 20 players + 2 tournaments + 2 clubs + 20 club memberships created",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });