import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const movies = [
  { title: "The quiet hour", year: 2026, runtime: 124, genres: "Drama", featured: true,
    overview: "A night-shift radio host takes one last call that unravels a small town's oldest secret." },
  { title: "Northbound", year: 2025, runtime: 108, genres: "Thriller", overview: "Two estranged siblings drive a stolen truck toward the border with a cargo neither of them understands." },
  { title: "Paper cities", year: 2026, runtime: 97, genres: "Animation, Family", overview: "A girl who folds origami buildings discovers her city comes alive at night." },
  { title: "Salt and iron", year: 2024, runtime: 141, genres: "Historical, War", overview: "A shipyard welder becomes the unlikely voice of a coastal strike in 1919." },
  { title: "Low tide", year: 2025, runtime: 89, genres: "Horror", overview: "Something has been waiting under the pier since the water went out and never came back." },
  { title: "Glass garden", year: 2026, runtime: 115, genres: "Romance, Drama", overview: "A botanist and an architect disagree about everything except the greenhouse they both refuse to leave." },
  { title: "Static bloom", year: 2024, runtime: 102, genres: "Sci-fi", overview: "A satellite technician hears a flower growing on a dead channel." },
  { title: "Half measures", year: 2025, runtime: 118, genres: "Crime", overview: "A retired bookkeeper audits the wrong family's accounts." },
];

async function main() {
  await prisma.$transaction([
    prisma.like.deleteMany(), prisma.comment.deleteMany(), prisma.listItem.deleteMany(),
    prisma.list.deleteMany(), prisma.follow.deleteMany(), prisma.rating.deleteMany(),
    prisma.post.deleteMany(), prisma.movie.deleteMany(), prisma.user.deleteMany(),
  ]);

  const [demo, jkim, alopez, mreyes] = await Promise.all([
    prisma.user.create({ data: { username: "demo", displayName: "Demo user", bio: "Prototype account. Everything you do is saved as me." } }),
    prisma.user.create({ data: { username: "jkim", displayName: "June Kim", bio: "Long takes, longer walks." } }),
    prisma.user.create({ data: { username: "alopez", displayName: "Ana Lopez", bio: "Writing about slow cinema and fast cars." } }),
    prisma.user.create({ data: { username: "mreyes", displayName: "Marco Reyes", bio: "Horror first, questions later." } }),
  ]);

  const m = await Promise.all(movies.map((data) => prisma.movie.create({ data })));

  await prisma.follow.createMany({
    data: [
      { followerId: demo.id, followingId: jkim.id },
      { followerId: demo.id, followingId: alopez.id },
      { followerId: jkim.id, followingId: demo.id },
    ],
  });

  const ratings: [string, number, number, string?][] = [
    [jkim.id, 3, 10, "Every frame looks like it was welded by hand. A masterpiece."],
    [jkim.id, 0, 9, "The final phone call wrecked me."],
    [alopez.id, 0, 8, "Patient, precise, and quietly devastating."],
    [alopez.id, 5, 7],
    [mreyes.id, 4, 8, "The pier scene. That's it. That's the review."],
    [mreyes.id, 1, 7],
    [demo.id, 2, 8, "Gorgeous animation, a bit long in the middle."],
    [alopez.id, 6, 6],
    [mreyes.id, 7, 5],
  ];
  const created = [];
  for (const [userId, mi, score, review] of ratings) {
    created.push(await prisma.rating.create({ data: { userId, movieId: m[mi].id, score, review } }));
  }
  await prisma.like.createMany({
    data: [
      { userId: demo.id, ratingId: created[0].id },
      { userId: alopez.id, ratingId: created[0].id },
      { userId: mreyes.id, ratingId: created[1].id },
    ],
  });

  const post = await prisma.post.create({
    data: {
      authorId: alopez.id,
      title: "Why slow cinema is having a moment",
      body: "Three of this year's most talked-about films run over two hours and barely raise their voice.\n\nThat isn't an accident. After a decade of franchise noise, audiences are rediscovering what it feels like to sit with an image.\n\nThe quiet hour is the clearest example: it trusts you to wait, and pays you back for it.",
    },
  });
  await prisma.post.create({
    data: {
      authorId: jkim.id,
      title: "Five welders, one strike: the real history behind Salt and iron",
      body: "The film compresses eight months of 1919 into two and a half hours. Here's what it kept, and what it changed.",
    },
  });
  await prisma.like.create({ data: { userId: jkim.id, postId: post.id } });

  const c1 = await prisma.comment.create({ data: { authorId: jkim.id, movieId: m[0].id, body: "Did anyone else catch the clock in the last shot?" } });
  await prisma.comment.create({ data: { authorId: mreyes.id, movieId: m[0].id, parentId: c1.id, body: "Yes! It's stopped at the time of the first call." } });
  await prisma.comment.create({ data: { authorId: demo.id, postId: post.id, body: "Great piece. Adding all three to my watchlist." } });

  const watchlist = await prisma.list.create({ data: { ownerId: demo.id, name: "Watchlist", isWatchlist: true } });
  await prisma.listItem.createMany({ data: [{ listId: watchlist.id, movieId: m[0].id }, { listId: watchlist.id, movieId: m[3].id }] });
  const favs = await prisma.list.create({ data: { ownerId: demo.id, name: "Best of 2026 so far" } });
  await prisma.listItem.createMany({ data: [{ listId: favs.id, movieId: m[2].id }, { listId: favs.id, movieId: m[5].id }] });
  for (const u of [jkim, alopez, mreyes]) {
    await prisma.list.create({ data: { ownerId: u.id, name: "Watchlist", isWatchlist: true } });
  }
}

main().finally(() => prisma.$disconnect());
