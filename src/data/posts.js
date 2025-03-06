// Posts data collection
// This file stores information about all blog posts to be displayed on the website
// Each post has a title, date, formattedDate, slug, excerpt, and tags

export const posts = [
  // Posts will be added here
];

// Function to get the most recent posts (for homepage)
export function getRecentPosts(count = 3) {
  return posts.slice(0, count);
}
