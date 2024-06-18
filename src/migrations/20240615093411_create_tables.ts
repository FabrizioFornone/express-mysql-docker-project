import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", function (table) {
    table.increments("user_id").primary();
    table.string("username").unique().notNullable();
    table.string("hashed_password").notNullable();

    table.timestamps(true, true);
  });

  await knex.schema.createTable("products", function (table) {
    table.increments("product_id").primary();
    table.string("name").notNullable();
    table.text("description");

    table.timestamps(true, true);
  });

  await knex.schema.createTable("price_cuts", function (table) {
    table.increments("price_cut_id").primary();
    table.integer("product_id").unsigned().notNullable();
    table.foreign("product_id").references("products.product_id");
    table.string("name").notNullable();
    table.decimal("price", 10, 2).notNullable();

    table.timestamps(true, true);
  });

  await knex.schema.createTable("assets", function (table) {
    table.increments("asset_id").primary();
    table.integer("product_id").unsigned().notNullable();
    table.foreign("product_id").references("products.product_id");
    table.string("photo_url").notNullable();

    table.timestamps(true, true);
  });

  await knex.schema.createTable("purchases", function (table) {
    table.increments("purchase_id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.foreign("user_id").references("users.user_id");
    table.integer("price_cut_id").unsigned().notNullable();
    table.foreign("price_cut_id").references("price_cuts.price_cut_id");
    table.integer("quantity").notNullable();
    table.decimal("total_price", 10, 2).notNullable();

    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("purchases");
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("assets");
  await knex.schema.dropTableIfExists("price_cuts");
  await knex.schema.dropTableIfExists("products");
}
