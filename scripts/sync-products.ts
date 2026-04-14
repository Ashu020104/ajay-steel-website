import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

type ProductInput = {
  name: string;
  description: string;
  imageUrl: string;
  pricePaise?: number;
  inStock?: boolean;
};

const products: ProductInput[] = [
  {
    name: "Angles",
    description: "MS angles in various sizes for fabrication and structural works.",
    imageUrl: "/products/angles.png",
    pricePaise: 0,
    inStock: true,
  },
  {
    name: "Channels",
    description: "MS channels for construction, supports, and frames.",
    imageUrl: "/products/channels.png",
    pricePaise: 0,
    inStock: true,
  },
  {
    name: "Flats",
    description: "Steel flats for industrial and general engineering use.",
    imageUrl: "/products/flats-1.png",
    pricePaise: 0,
    inStock: true,
  },
  {
    name: "Profile Sheets",
    description: "Profile sheets for industrial and residential roofing.",
    imageUrl: "/products/profile-sheets.png",
    pricePaise: 0,
    inStock: true,
  },
  {
    name: "GP sheets",
    description: "Galvanized plain sheets for roofing and fabrication.",
    imageUrl: "/products/gp-sheets.png",
    pricePaise: 0,
    inStock: true,
  },
  {
    name: "Girders",
    description: "Steel girders / I-beams for structural work (sizes as per requirement).",
    imageUrl: "/products/girders.png",
    pricePaise: 0,
    inStock: true,
  },
  {
    name: "MS Pipes",
    description: "MS pipes / square sections in multiple sizes and thicknesses.",
    imageUrl: "/products/ms-pipes-1.png",
    pricePaise: 0,
    inStock: true,
  },
  {
    name: "GP Pipes",
    description: "Galvanized pipes for plumbing and industrial use (sizes on request).",
    imageUrl: "/products/gp-pipes.png",
    pricePaise: 0,
    inStock: true,
  },
];

async function upsertByName(input: ProductInput) {
  const existing = await prisma.product.findFirst({ where: { name: input.name } });
  if (existing) {
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        description: input.description,
        imageUrl: input.imageUrl,
        pricePaise: input.pricePaise ?? existing.pricePaise,
        inStock: input.inStock ?? existing.inStock,
      },
    });
    return;
  }

  await prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      pricePaise: input.pricePaise ?? 0,
      inStock: input.inStock ?? true,
    },
  });
}

async function main() {
  for (const p of products) {
    await upsertByName(p);
  }

  // Remove any products not in the final list (keeps the catalog clean).
  const keepNames = new Set(products.map((p) => p.name));
  const all = await prisma.product.findMany({ select: { id: true, name: true } });
  const toDelete = all.filter((p) => !keepNames.has(p.name));
  if (toDelete.length) {
    await prisma.product.deleteMany({ where: { id: { in: toDelete.map((p) => p.id) } } });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

