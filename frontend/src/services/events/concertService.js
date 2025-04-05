const API_BASE_URL = 'http://localhost:3000';
const CONCERTS_ENDPOINT = `${API_BASE_URL}/api/concerts`;

/**
 * checks if a concert exists using tour_id + venue_id + date
 * @returns {Promise<{ exists: boolean }>}
 */
export const checkConcertExists = async ({ tour_id, venue_id, date }) => {
    try {
        // make sure date is properly formatted (YYYY-MM-DD)
        const formattedDate = new Date(date).toISOString().split('T')[0];

        const res = await fetch(`${CONCERTS_ENDPOINT}/exists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tour_id: Number(tour_id),
                venue_id: Number(venue_id),
                date: formattedDate
            })
        });

        // handle 404 specifically
        if (res.status === 404) {
            throw new Error('Endpoint not found - check your backend routes');
        }

        const responseData = await res.json();

        if (!res.ok) {
            throw new Error(responseData?.error || `Check concert failed (${res.status})`);
        }

        return responseData;
    } catch (error) {
        console.error('checkConcertExists error:', {
            tour_id,
            venue_id,
            date,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};

/**
 * creates a new concert with minimal required fields
 * @returns {Promise<{ id: number }>} the new concert ID
 */
export const createConcert = async ({
    tour_id,
    venue_id,
    date,
    special_notes = null
}) => {
    try {
        // validate required fields on client side too
        if (!tour_id || !venue_id || !date) {
            throw new Error('tour_id, venue_id, and date are required');
        }

        const res = await fetch(CONCERTS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tour_id,
                venue_id,
                date,
                special_notes,
                user_count: 0,
                review_count: 0
            })
        });

        const responseText = await res.text();
        let responseData;

        try {
            responseData = responseText ? JSON.parse(responseText) : null;
        } catch (parseError) {
            console.error('JSON parse failed:', {
                responseText,
                status: res.status,
                headers: Object.fromEntries(res.headers.entries())
            });
            throw new Error('Invalid server response format');
        }

        if (!res.ok) {
            // handle specific error cases from controller
            if (res.status === 400) {
                throw new Error(responseData.error);
            }
            if (res.status === 409) {
                throw new Error('Concert already exists for this tour/venue/date');
            }
            throw new Error(responseData?.error || `HTTP ${res.status} - Create concert failed`);
        }

        return responseData;
    } catch (error) {
        console.error('createConcert error:', {
            tour_id,
            venue_id,
            date,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};

/**
 * gets all concerts
 * @returns {Promise<Array<{id: number, tour_id: number, venue_id: number, date: string}>>}
 */
export const getAllConcerts = async () => {
    try {
        const res = await fetch(CONCERTS_ENDPOINT);
        const responseText = await res.text();
        let responseData;
        try {
            responseData = responseText ? JSON.parse(responseText) : null;
        } catch (parseError) {
            console.error('JSON parse failed:', {
                responseText,
                status: res.status,
                headers: Object.fromEntries(res.headers.entries())
            });
            throw new Error('Invalid server response format');
        }

        if (!res.ok) {
            throw new Error(responseData?.error || `HTTP ${res.status} - Fetch concerts failed`);
        }

        return responseData;
    } catch (error) {
        console.error('getAllConcerts error:', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};

/**
 * gets a single concert by ID
 * @returns {Promise<Object>} full concert details
 */
export const getConcertById = async (id) => {
    try {
        const res = await fetch(`${CONCERTS_ENDPOINT}/${id}`);
        const responseText = await res.text();
        let responseData;
        try {
            responseData = responseText ? JSON.parse(responseText) : null;
        } catch (parseError) {
            console.error('JSON parse failed:', {
                responseText,
                status: res.status,
                headers: Object.fromEntries(res.headers.entries())
            });
            throw new Error('Invalid server response format');
        }

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Concert not found');
            }
            throw new Error(responseData?.error || `HTTP ${res.status} - Fetch concert failed`);
        }

        return responseData;
    } catch (error) {
        console.error('getConcertById error:', {
            id,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};

/**
 * main interface: creates concert only if it doesn't exist
 * @returns {Promise<boolean>} true if created, false if already existed
 */
export const createConcertIfNotExists = async (concertData) => {
    try {
        const { exists } = await checkConcertExists(concertData);
        if (exists) return false;

        await createConcert(concertData);
        return true;
    } catch (error) {
        console.error('createConcertIfNotExists error:', {
            concertData,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};