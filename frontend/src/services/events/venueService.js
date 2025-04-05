/**
 * finds or creates a venue in the system
 * implements a check-then-create pattern to prevent duplicates
 * 
 * @param {Object} venueData - venue details including name and city_id
 * @returns {Promise<number>} ID of existing or newly created venue
 * @throws {Error} if either API request fails
 */

export const findOrCreateVenue = async (venueData) => {
    // 1° check for existing venue
    const checkRes = await fetch('http://localhost:3000/api/venues/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: venueData.name,
            city_id: venueData.city_id
        })
    });

    if (!checkRes.ok) throw new Error(`Venue check failed: ${checkRes.status}`);

    // parse response and return existing ID if found
    const { exists, id } = await checkRes.json();
    if (exists) return id;

    // 2° create new venue
    const createRes = await fetch('http://localhost:3000/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venueData) // pass full venue data object
    });

    if (!createRes.ok) throw new Error(`Venue creation failed: ${createRes.status}`);
    return (await createRes.json()).id; // return new venue ID
};