const { PrismaClient } = require("@prisma/client");
const { hashPassword } = require("../src/utils/hashPassword");

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

  await prisma.club.createMany({
    data: [
      {
        name: "RUG FC",
        description: "Rock Up Gang Football Club",
        location: "Baliya Chowk",
        foundedDate: "2026-06-15T09:00:00.000Z",
        createdBy: 5555,
      },
      {
        name: "Itahari under 18 football club",
        description:
          "THis is only for childrens who are age eighteen and below",
        location: "Itahari, Sunsari",
        foundedDate: "2026-06-15T09:00:00.000Z",
        createdBy: 5555,
      },
    ],
  });
  console.log(
    "Seeding Finished → 1 SUPERADMIN + 1 user (rakshaksigdel) + 20 players + 1 tournament created",
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