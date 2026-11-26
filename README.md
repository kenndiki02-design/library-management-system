# Library Management System

NestJS + Prisma + PostgreSQL.

## Setup

```bash
cd api
cp .env.example .env        # then set DATABASE_URL to your hosted Postgres
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run build
```

The Prisma seed command is configured in `api/package.json`. The API build generates
the Prisma client from the schema before compiling the NestJS application.

## Schema Decisions

**Why `Book` references `Genre` instead of embedding it**

- **Genre is shared, not owned.** Many books belong to one genre. Embedding would copy the genre into every book, so renaming "Sci-Fi" to "Science Fiction" would mean updating every book, and any missed copy would leave the data inconsistent. With a `genreId` foreign key, the genre is stored once and changed in one place.
- **Integrity is enforced by the database.** The `@relation` foreign key means a book cannot point to a genre that doesn't exist, and a genre with books cannot be deleted by accident. Embedded data has no such guarantee.
- **Genres are queried on their own.** Browsing by genre, listing genres, and counting books per genre are simple queries against a `Genre` table. With embedded genres they would require scanning every book.
- **Cheap, flexible reads.** `include: { genre: true }` fetches the genre with the book when needed, and the `@@index([genreId])` keeps genre filtering fast.

**Other decisions**

- `Role` is a Prisma enum (`PATRON`, `LIBRARIAN`) on `User`, defaulting to `PATRON`. The database rejects any other value.
- `isbn` and `User.email` are `@unique` to prevent duplicates.
- **Stretch:** `Review` links `Book` and `User` (many-to-one each), with `@@unique([bookId, userId])` so a user can review a book only once. Reviews cascade-delete with their book or user.

## Prisma vs. a document database

In a document database like MongoDB, I would have been tempted to nest a book's genre and reviews inside the book document, so one read returns everything. In Prisma I had to decide up front what is its own table and how the tables connect, and the schema file made those relationships explicit and enforced. It felt stricter at first, but it removed a whole class of "which copy is correct?" bugs.