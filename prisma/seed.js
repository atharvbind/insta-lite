
const prisma = require("../src/db");
const { users, posts, likes } = require("./seed-data");

async function main() {
  // Delete children before parents.
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create all users in one query.
  const createdUsers = await prisma.user.createManyAndReturn({
    data: users.map((user) => ({
      ...user,
      createdAt: new Date(user.createdAt),
    })),
  });

  const userIds = new Map(
    createdUsers.map((user) => [user.username, user.id])
  );

  // Create all posts in one query.
  const createdPosts = await prisma.post.createManyAndReturn({
    data: posts.map((post) => ({
      imageUrl: post.imageUrl,
      caption: post.caption,
      location: post.location,
      createdAt: new Date(post.createdAt),
      authorId: userIds.get(post.author),
    })),
  });

  const postIds = new Map(
    createdPosts.map((post) => [
      post.imageUrl.split("/")[4],
      post.id,
    ])
  );

  // Create all likes in one query.
  const createdLikes = await prisma.like.createMany({
    data: likes.map((like) => ({
      userId: userIds.get(like.user),
      postId: postIds.get(like.post),
    })),
  });

  console.log(
    `🌱 Seeded ${createdUsers.length} users, ` +
    `${createdPosts.length} posts and ${createdLikes.count} likes`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
