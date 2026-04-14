import bcrypt from "bcryptjs";
import prismaPkg from "@prisma/client";

const { PrismaClient } = prismaPkg;

const prisma = new PrismaClient();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@ajaysteel.local").toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeThisPassword123!";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.adminUser.upsert({
    where: { email: ADMIN_EMAIL },
    create: { email: ADMIN_EMAIL, passwordHash },
    update: { passwordHash },
  });

  const existingCount = await prisma.product.count();
  if (existingCount > 0) return;

  const placeholderImg =
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=1200&q=60";

  await prisma.product.createMany({
    data: [
      {
        name: "Angles",
        description: "MS angles in various sizes for fabrication and structural works.",
        imageUrl: placeholderImg,
        pricePaise: 0,
        inStock: true,
      },
      {
        name: "Channels",
        description: "MS channels for construction, supports, and frames.",
        imageUrl: placeholderImg,
        pricePaise: 0,
        inStock: true,
      },
      {
        name: "Flats",
        description: "Steel flats for industrial and general engineering use.",
        imageUrl: placeholderImg,
        pricePaise: 0,
        inStock: true,
      },
      {
        name: "Round bars",
        description: "Round bars for machining, shafts, and fabrication.",
        imageUrl: placeholderImg,
        pricePaise: 0,
        inStock: true,
      },
      {
        name: "Square bars",
        description: "Square bars for tooling, supports, and fabrication.",
        imageUrl: placeholderImg,
        pricePaise: 0,
        inStock: true,
      },
      {
        name: "GP / MS Pipes",
        description: "GP and MS pipes in multiple sizes and thicknesses.",
        imageUrl: placeholderImg,
        pricePaise: 0,
        inStock: true,
      },
      {
        name: "GP sheets",
        description: "Galvanized plain sheets for roofing and fabrication.",
        imageUrl: placeholderImg,
        pricePaise: 0,
        inStock: true,
      },
      {
        name: "CRC Sheets",
        description: "Cold rolled close annealed sheets for smooth finish applications.",
        imageUrl: placeholderImg,
        pricePaise: 0,
        inStock: true,
      },
      {
        name: "Profile Sheets",
        description: "Profile sheets for industrial and residential roofing.",
        imageUrl: placeholderImg,
        pricePaise: 0,
        inStock: true,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

