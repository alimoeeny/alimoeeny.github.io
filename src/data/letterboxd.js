// This file handles fetching and parsing Letterboxd RSS feed data
import { XMLParser } from 'fast-xml-parser';

// Cache mechanism to avoid excessive requests
let cachedMovies = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export async function getRecentMovies(count = 5) {
  const currentTime = Date.now();
  
  // Return cached data if it's still valid
  if (cachedMovies && (currentTime - lastFetchTime < CACHE_DURATION)) {
    return cachedMovies.slice(0, count);
  }
  
  try {
    // Fetch the RSS feed
    const response = await fetch('https://letterboxd.com/alimoeeny/rss/');
    
    if (!response.ok) {
      console.error('Failed to fetch Letterboxd RSS feed');
      return [];
    }
    
    const xmlData = await response.text();
    
    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    
    const result = parser.parse(xmlData);
    const items = result.rss.channel.item;
    
    // Process and format the data
    cachedMovies = items.map(item => {
      // Extract the movie title from the description
      const descriptionMatch = item.description.match(/<p>(.*?)<\/p>/);
      const description = descriptionMatch ? descriptionMatch[1] : '';
      
      // Extract rating if available (★★★½)
      const ratingMatch = description.match(/★+½?/);
      const rating = ratingMatch ? ratingMatch[0] : '';
      
      // Extract image URL
      const imageMatch = item.description.match(/src="([^"]+)"/);
      const imageUrl = imageMatch ? imageMatch[1] : '';
      
      // Extract year and director if available
      const metaMatch = description.match(/(\d{4})\s*(?:directed by\s*(.*?)(?:$|\s*<))?/i);
      const year = metaMatch ? metaMatch[1] : '';
      const director = metaMatch && metaMatch[2] ? metaMatch[2].trim() : '';
      
      // Format the date
      const pubDate = new Date(item.pubDate);
      const formattedDate = pubDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Extract movie title (remove "Watched " prefix if present)
      const title = item.title.replace(/^Watched\s+/, '').replace(/\s+\d{4}$/, '');
      
      return {
        title,
        link: item.link,
        date: formattedDate,
        imageUrl,
        rating,
        year,
        director
      };
    });
    
    lastFetchTime = currentTime;
    return cachedMovies.slice(0, count);
    
  } catch (error) {
    console.error('Error fetching Letterboxd data:', error);
    return [];
  }
}
