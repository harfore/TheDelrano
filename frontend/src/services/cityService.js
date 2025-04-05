const API_BASE_URL = 'http://localhost:3000';

export const findOrCreateCity = async (cityName, country, dmaId = null) => {
    if (!cityName || !country) {
        throw new Error('City name and country are required');
    }

    try {
        // 1° debug request URL
        const searchParams = new URLSearchParams({ name: cityName, country });
        const url = `http://localhost:3000/api/cities?${searchParams}`;

        // 2° check existing city
        const findResponse = await fetch(
            `${API_BASE_URL}/api/cities?name=${encodeURIComponent(cityName)}&country=${encodeURIComponent(country)}`
        );
        const findResponseText = await findResponse.text();

        // bulletproof JSON parsing
        let existing;
        try {
            existing = findResponseText ? JSON.parse(findResponseText) : null;
        } catch (parseError) {
            throw new Error('Invalid server response format');
        }

        if (!findResponse.ok) {
            throw new Error(existing?.message || `City lookup failed: ${findResponse.status}`);
        }

        if (existing?.id) return existing.id;

        // 3° create new city
        const postData = {
            name: cityName,
            country,
            ...(dmaId && { dma_id: Number(dmaId) })
        };

        const createResponse = await fetch(`${API_BASE_URL}/api/cities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: cityName,
                country,
                ...(dmaId && { dma_id: Number(dmaId) })
            })
        });

        const createResponseText = await createResponse.text();

        // bulletproof JSON parsing
        let newCity;
        try {
            newCity = createResponseText ? JSON.parse(createResponseText) : null;
        } catch (parseError) {
            console.error('JSON parse failed:', {
                responseText: createResponseText,
                status: createResponse.status,
                headers: Object.fromEntries(createResponse.headers.entries())
            });
            throw new Error('Invalid server response format');
        }

        if (!createResponse.ok || !newCity?.id) {
            throw new Error(newCity?.message || 'City creation failed');
        }

        return newCity.id;

    } catch (error) {
        console.error('City service error:', {
            cityName,
            country,
            dmaId,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};