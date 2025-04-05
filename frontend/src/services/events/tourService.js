/**
 * finds or creates a tour in the system
 * implements a check-then-create pattern to prevent duplicates
 */

const API_URL = 'http://localhost:3000/api/tours';

// @param {Object} tourData - Tour details including:
//   @property {string} name - Tour name
//   @property {number} artist_id - Associated artist ID
//   @property {string} start_date - Tour start date (YYYY-MM-DD)
//   @property {string} [end_date] - Optional end date
//   @property {string} [image_url] - Optional primary image URL
// @returns {Promise<number>} ID of existing or newly created tour
// @throws {Error} When API requests fail or validation errors occur

export const findOrCreateTour = async (tourData) => {
    try {
        // 1° check if tour exists
        const checkRes = await fetch(`${API_URL}/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: tourData.name,
                artist_id: tourData.artist_id,
                start_date: tourData.start_date
            })
        });

        if (!checkRes.ok) throw new Error('Tour check failed');

        const { exists, id } = await checkRes.json();
        if (exists) return id;

        // 2° create new tour
        const createRes = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...tourData,
                image_urls: tourData.image_url ? [tourData.image_url] : [], // convert to array format
                is_live_album: false,
                is_concert_film: false
            })
        });

        if (!createRes.ok) {
            const error = await createRes.json();
            throw new Error(error.error || 'Tour creation failed');
        }

        return (await createRes.json()).id;
    } catch (error) {
        console.error('Tour service error:', error);
        throw error;
    }
};