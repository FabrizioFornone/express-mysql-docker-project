import { Knex } from "knex";

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

  const products = await knex("products").select("product_id");

  for (const product of products) {
    const priceCuts = [];
    for (let i = 0; i < 3; i++) {
      priceCuts.push({
        product_id: product.product_id,
        price: (Math.random() * 100).toFixed(2), // Generate random price with 2 decimal places
      });
    }

    await knex("price_cuts").insert(priceCuts);
  }

  const assetsUrls = [
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

  const assets = products.flatMap((product, i) => {
    // Ensure we are not accessing an index that's out of bounds
    if (i < assetsUrls.length) {
      const [firstPhotoUrl, secondPhotoUrl] = assetsUrls[i];
      return [
        { product_id: product.product_id, photo_url: firstPhotoUrl },
        { product_id: product.product_id, photo_url: secondPhotoUrl },
      ];
    }
    return [];
  });

  await knex("assets").insert(assets);
}
