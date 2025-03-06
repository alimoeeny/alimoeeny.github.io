// Photo data collection
// This file stores information about all photos to be displayed on the website
// Each photo has a title, date, image path, and alt text

export const photos = [
  {
    title: "Banality of Mediocrity",
    date: "March 2, 2025",
    image: "/images/BanalIntentionsMediocrityNotEvil.jpg",
    alt: "Quote about banality of mediocrity"
  },
  {
    title: "Don't Be a Monument to Your Problems",
    date: "February 28, 2025",
    image: "/images/Dontbeamonumenttoyourproblems.png",
    alt: "Quote: Don't be a monument to your problems"
  },
  {
    title: "Energy Is Contagious",
    date: "February 25, 2025",
    image: "/images/EnergyIsContagious.png",
    alt: "Quote: Energy is contagious"
  },
  {
    title: "Important a Lot of Time",
    date: "February 20, 2025",
    image: "/images/ImportantalotofTime.png",
    alt: "Quote about importance and time"
  },
  {
    title: "Keep Calm and Power Through",
    date: "February 15, 2025",
    image: "/images/KeepCalmandPowerThroughTheAwkwardness.png",
    alt: "Quote: Keep calm and power through the awkwardness"
  },
  {
    title: "Life Snaps 1",
    date: "February 10, 2025",
    image: "/images/LifeSnaps.FM.1655473453.309439.jpg",
    alt: "Life Snaps photograph"
  },
  {
    title: "Life Snaps 2",
    date: "February 5, 2025",
    image: "/images/LifeSnaps.FT.1738162740.18994.jpg",
    alt: "Life Snaps photograph"
  },
  {
    title: "Smile",
    date: "January 30, 2025",
    image: "/images/Smile.png",
    alt: "Quote about smiling"
  },
  {
    title: "Unimportant Well",
    date: "January 25, 2025",
    image: "/images/UnimportantWell.png",
    alt: "Quote about unimportance"
  },
  {
    title: "What Said Who Said",
    date: "January 20, 2025",
    image: "/images/WhatSaidWhoSaid.png",
    alt: "Quote: What said who said"
  },
  {
    title: "It Is Our Choices",
    date: "January 15, 2025",
    image: "/images/itisourchoices.png",
    alt: "Quote: It is our choices"
  },
  {
    title: "Elkridge MD",
    date: "January 10, 2025",
    image: "/images/iphonewallpaper20141017ElkridgeMDUSA.jpg",
    alt: "Photograph from Elkridge, MD, USA"
  }
];

// Function to get the most recent photos (for homepage)
export function getRecentPhotos(count = 3) {
  return photos.slice(0, count);
}
