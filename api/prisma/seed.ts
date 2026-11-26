import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const catalog: Record<string, { title: string; author: string; isbn: string; year: number }[]> = {
  'Science Fiction': [
    { title: 'Dune', author: 'Frank Herbert', isbn: '9780441013593', year: 1965 },
    { title: 'Neuromancer', author: 'William Gibson', isbn: '9780441569595', year: 1984 },
    { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', isbn: '9780441478125', year: 1969 },
    { title: 'Foundation', author: 'Isaac Asimov', isbn: '9780553293357', year: 1951 },
  ],
  Fantasy: [
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227', year: 1937 },
    { title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', isbn: '9780547773742', year: 1968 },
    { title: 'The Name of the Wind', author: 'Patrick Rothfuss', isbn: '9780756404741', year: 2007 },
    { title: 'Mistborn: The Final Empire', author: 'Brandon Sanderson', isbn: '9780765311788', year: 2006 },
  ],
  'African Literature': [
    { title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '9780385474542', year: 1958 },
    { title: 'Weep Not, Child', author: 'Ngũgĩ wa Thiong’o', isbn: '9780143026327', year: 1964 },
    { title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', isbn: '9781400095209', year: 2006 },
    { title: 'Petals of Blood', author: 'Ngũgĩ wa Thiong’o', isbn: '9780143106463', year: 1977 },
  ],
  'Non-Fiction': [
    { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316110', year: 2011 },
    { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', isbn: '9780135957059', year: 1999 },
    { title: 'Educated', author: 'Tara Westover', isbn: '9780399590504', year: 2018 },
  ],
  Mystery: [
    { title: 'And Then There Were None', author: 'Agatha Christie', isbn: '9780062073501', year: 1939 },
    { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', isbn: '9780307454546', year: 2005 },
    { title: 'Gone Girl', author: 'Gillian Flynn', isbn: '9780307588371', year: 2012 },
  ],
};

async function main() {
  // Idempotent: clear in dependency order, then re-insert
  await prisma.review.deleteMany();
  await prisma.book.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { email: 'librarian@library.test', name: 'Lena Librarian', role: Role.LIBRARIAN },
      { email: 'patron@library.test', name: 'Paul Patron', role: Role.PATRON },
    ],
  });

  for (const [genreName, books] of Object.entries(catalog)) {
    await prisma.genre.create({
      data: {
        name: genreName,
        books: {
          create: books.map((b) => ({
            title: b.title,
            author: b.author,
            isbn: b.isbn,
            publishedYear: b.year,
            copiesTotal: 3,
          })),
        },
      },
    });
  }

  const [genres, books] = await Promise.all([prisma.genre.count(), prisma.book.count()]);
  console.log(`Seeded ${genres} genres and ${books} books.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());