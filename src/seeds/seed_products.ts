import { Knex } from "knex";
import type { Product, PriceCut } from "../models";

interface PriceCutData {
  product_id: number;
  name: string;
  price: string;
}

interface AssetData {
  product_id: number;
  photo_url: string;
}

export async function seed(knex: Knex): Promise<void> {
  await knex("price_cuts").del();
  await knex("assets").del();
  await knex("products").del();

  await knex("products").insert([
    { name: "Meal Ticket Card", description: "A card for purchasing meals" },
    { name: "Fuel Card", description: "A card for purchasing fuel" },
    { name: "Insurance Card", description: "A card for purchasing insurance" },
    { name: "Travel Card", description: "A card for purchasing travels" },
  ]);

  const products: Product[] = await knex("products").select("product_id");

  const priceNames: string[] = ["bronze", "silver", "gold", "platinum"];

  const priceCuts: PriceCutData[] = products.flatMap((product: Product) => {
    const randomPrice: number = Math.random() * 100;

    return priceNames.map((name: string, i: number) => ({
      product_id: product.product_id,
      name,
      price: (randomPrice + 5 * i).toFixed(2),
    }));
  });

  await knex("price_cuts").insert(priceCuts);

  const assetsUrls: string[][] = [
    [
      "https://images.pexels.com/photos/5926431/pexels-photo-5926431.jpeg",
      "https://images.pexels.com/photos/697224/pexels-photo-697224.jpeg",
    ],
    [
      "https://images.pexels.com/photos/5926459/pexels-photo-5926459.jpeg",
      "https://images.pexels.com/photos/17796/christmas-xmas-gifts-presents.jpg",
    ],
    [
      "https://images.pexels.com/photos/5926428/pexels-photo-5926428.jpeg",
      "https://images.pexels.com/photos/1178562/pexels-photo-1178562.jpeg",
    ],
    [
      "https://images.pexels.com/photos/6956772/pexels-photo-6956772.jpeg",
      "https://images.pexels.com/photos/360624/pexels-photo-360624.jpeg",
    ],
  ];

  const assets: AssetData[] = products.flatMap(
    (product: Product, i: number) => {
      // Ensure we are not accessing an index that's out of bounds
      if (i < assetsUrls.length) {
        const [firstPhotoUrl, secondPhotoUrl] = assetsUrls[i];
        return [
          { product_id: product.product_id, photo_url: firstPhotoUrl },
          { product_id: product.product_id, photo_url: secondPhotoUrl },
        ];
      }
      return [];
    }
  );

  await knex("assets").insert(assets);
}
