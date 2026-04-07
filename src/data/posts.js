// Posts data collection
// This file stores information about all blog posts to be displayed on the website
// Each post has a title, date, formattedDate, slug, excerpt, and tags

export const posts = [
  {
    title: "There's a Better Way",
    date: "2026-04-07",
    formattedDate: "April 7, 2026",
    slug: "happypathology-theres-a-better-way",
    excerpt: "Most clinical labs still process fax and paper orders like it's 1996. HappyPathology is changing that.",
    tags: ["Healthcare", "Labs", "Automation", "HappyPathology"],
  },
];

// Function to get the most recent posts (for homepage)
export function getRecentPosts(count = 3) {
  return posts.slice(0, count);
}
