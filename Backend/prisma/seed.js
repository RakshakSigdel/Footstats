const { PrismaClient } = require("@prisma/client");

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

  await prisma.user.createMany({
    data: [
      // ── Your SUPERADMIN account ───────────────────────────────────────
      {
        firstName: "admin",
        lastName: "admin",
        email: "admin@gmail.com",
        password: "admin123",
        role: "SUPERADMIN",           
      },
      {
        userId: 5555,
        firstName: 'rakshak',
        lastName: 'sigdel',
        email: 'Rakshaksigdel@gmail.com',
        password: 'rakshak123'
      },
      // ── 20 test player accounts ───────────────────────────────────────
      ...Array.from({ length: 20 }, (_, i) => ({
        firstName: "footstat",
        lastName: "player",
        email: `footstatplayer${i + 1}@gmail.com`,
        password: "footstatplayer123",
      })),
    ],
  });

  // ── Tournament created by rakshaksigdel ───────────────────────────────
  await prisma.tournament.create({
    data: {
      name: "Summer Championship 2026",
      description: "Annual summer football tournament featuring the best local teams",
      location: "City Sports Complex, Downtown",
      entryFee: 500.00,
      startDate: new Date("2026-06-15T09:00:00.000Z"),
      endDate: new Date("2026-06-30T18:00:00.000Z"),
      format: "KNOCKOUT",
      status: "UPCOMING",
      createdBy: 5555,
    },
  });

  console.log("Seeding Finished → 1 SUPERADMIN + 1 user (rakshaksigdel) + 20 players + 1 tournament created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });