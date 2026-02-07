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
    // prisma.tournament.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);

  await prisma.user.createMany({
    data: [
      {
        firstName: "footstat",
        lastName: "player",
        email: "footstatplayer@gmail.com",
        password: "footstatplayer123",
      },
      {
        firstName: "footstat",
        lastName: "player",
        email: "footstatplayer1@gmail.com",
        password: "footstatplayer123",
      },
    ],
  });
  console.log("Seeding Finished");
}
main()
    .catch((e)=>{
        console.error(e);
        process.exit(1);
    })
    .finally(async()=>{
        await prisma.$disconnect();
    })
