// const { PrismaClient } = require("@prisma/client");
import {PrismaClient} from "@prisma/client";
// const { hashPassword } = require("../src/utils/hashPassword");
import { hashPassword } from "../src/utils/hashPassword.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding super admin user");

  const superAdminEmail = "footstatteam@gmail.com";
  const superAdminPassword = "9842100139R@kshak";
  const hashedPassword = await hashPassword(superAdminPassword);

  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      firstName: "Footstat",
      lastName: "Team",
      Phone: "9842100139",
      password: hashedPassword,
      role: "SUPERADMIN",
      authProvider: "LOCAL",
      emailVerified: true,
    },
    create: {
      firstName: "Footstat",
      lastName: "Team",
      email: superAdminEmail,
      Phone: "9842100139",
      password: hashedPassword,
      role: "SUPERADMIN",
      authProvider: "LOCAL",
      emailVerified: true,
    },
  });

  console.log("Seeding finished: super admin is ready");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });