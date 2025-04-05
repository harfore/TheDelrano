// handles event fetching from ticketmaster and filtering with rate limiting protections

// safely retrieves API key
const API_KEY = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_TM_KEY
    : process.env.VITE_TM_KEY;

if (!API_KEY) {
    throw new Error('Missing API key');
}

/**
 * fetches music events from Ticketmaster API for specified DMA (Designated Market Area)
 * @param {number} dmaId - geographic region identifier
 * @returns {Promise<Array>} array of event objects
 * @throws {Error} on API failure or missing data
 */
export const fetchEvents = async (dmaId) => {
    // construct API URL with required parameters:
    // - music classification filter
    // - DMA-based geographic targeting
    // - API key authentication
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&dmaId=${dmaId}&apikey=${API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);

    // safely extract events array from nested API response structure
    const data = await res.json();
    return data._embedded?.events || []; // default to empty array if no events
};

/**
 * filters events to prevent over-representation of any single event
 * @param {Array} events - raw events array from API
 * @param {number} [maxOccurrences=3] - maximum allowed duplicates per event name
 * @returns {Array} filtered events array
 */
export const filterEvents = (events, maxOccurrences = 3) => {
    const eventCount = {};  // tracks occurrences per event name
    return events.filter(event => {
        const name = event.name;
        eventCount[name] = (eventCount[name] || 0) + 1;

        // include event only if under occurrence threshold
        return eventCount[name] <= maxOccurrences;
    });
};
