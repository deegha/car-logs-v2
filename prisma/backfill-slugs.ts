import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient();

function generateCarSlug(make: string, model: string, year: number, id: number): string {
  const base = `${make} ${model} ${year}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${id}`;
}

async function main() {
  const cars = await db.car.findMany({
    where: { slug: null },
    select: { id: true, make: true, model: true, year: true },
  });
  console.log(`Backfilling slugs for ${cars.length} car(s)…`);
  for (const car of cars) {
    const slug = generateCarSlug(car.make, car.model, car.year, car.id);
    await db.car.update({ where: { id: car.id }, data: { slug } });
    console.log(`  #${car.id} → ${slug}`);
  }
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
