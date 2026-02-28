import {
    integer,
    pgEnum,
    pgSchema,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

// Reference Supabase's auth schema
const authSchema = pgSchema("auth");
const authUsers = authSchema.table("users", {
	id: uuid("id").primaryKey(),
});

export const Users = pgTable("users", {
	id: uuid("id")
		.primaryKey()
		.references(() => authUsers.id, { onDelete: "cascade" }),
	email: varchar("email", { length: 255 }),
	firstname: varchar("firstname", { length: 255 }),
	lastname: varchar("lastname", { length: 255 }),
});

export const Addresses = pgTable("addresses", {
	id: uuid("id")
		.primaryKey()
		.references(() => Users.id, { onDelete: "cascade" }),
	address: varchar("address", { length: 255 }),
});

export const Businesses = pgTable("businesses", {
	id: uuid("id").primaryKey().defaultRandom(),
	ownerid: uuid("ownerid")
		.notNull()
		.references(() => Users.id, { onDelete: "cascade" }),
	name: varchar("name", { length: 255 }).notNull(),
	category: varchar("category", { length: 255 })
		.notNull()
		.default("Miscellaneous"),
});

export const BusinessInformation = pgTable("business_information", {
	id: uuid("id")
		.primaryKey()
		.references(() => Businesses.id, { onDelete: "cascade" }),
	description: text("description"),
	email: varchar("email", { length: 255 }),
	phone: varchar("phone", { length: 255 }),
	website: varchar("website", { length: 255 }),
	banner: varchar("banner", { length: 255 }),
});

export const BusinessAddresses = pgTable("business_addresses", {
	id: uuid("id")
		.primaryKey()
		.references(() => Businesses.id, { onDelete: "cascade" }),
	address: varchar("address", { length: 255 }),
});

export const PostType = pgEnum("post_type", ["announcement", "coupon", "sale"]);

export const BusinessPosts = pgTable("business_posts", {
	id: uuid("id").primaryKey().defaultRandom(),
	businessid: uuid("businessid")
		.notNull()
		.references(() => Businesses.id, { onDelete: "cascade" }),
	type: PostType("type").notNull(),
	highlight: varchar("highlight", { length: 255 }),
	text: text("text").notNull(),
	date: timestamp("date").defaultNow().notNull(),
});

export const FavoriteBusinesses = pgTable(
	"favorite_businesses",
	{
		userid: uuid("userid")
			.notNull()
			.references(() => Users.id, { onDelete: "cascade" }),
		businessid: uuid("businessid")
			.notNull()
			.references(() => Businesses.id, { onDelete: "cascade" }),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userid, table.businessid] }),
	}),
);

export const Reviews = pgTable("reviews", {
	id: uuid("id").primaryKey().defaultRandom(),
	businessid: uuid("businessid").references(() => Businesses.id, {
		onDelete: "cascade",
	}),
	reviewerid: uuid("reviewerid").references(() => Users.id, {
		onDelete: "cascade",
	}),
	rating: integer("rating"),
	review: text("review"),
	date: timestamp("date").defaultNow().notNull(),
});

// Type exports for use in the app
export type User = typeof Users.$inferSelect;
export type NewUser = typeof Users.$inferInsert;

export type Address = typeof Addresses.$inferSelect;
export type NewAddress = typeof Addresses.$inferInsert;

export type Business = typeof Businesses.$inferSelect;
export type NewBusiness = typeof Businesses.$inferInsert;

export type BusinessInfo = typeof BusinessInformation.$inferSelect;
export type NewBusinessInfo = typeof BusinessInformation.$inferInsert;

export type BusinessPost = typeof BusinessPosts.$inferSelect;
export type NewBusinessPost = typeof BusinessPosts.$inferInsert;

export type FavoriteBusiness = typeof FavoriteBusinesses.$inferSelect;
export type NewFavoriteBusiness = typeof FavoriteBusinesses.$inferInsert;

export type BusinessAddress = typeof BusinessAddresses.$inferSelect;
export type NewBusinessAddress = typeof BusinessAddresses.$inferInsert;

export type Review = typeof Reviews.$inferSelect;
export type NewReview = typeof Reviews.$inferInsert;
