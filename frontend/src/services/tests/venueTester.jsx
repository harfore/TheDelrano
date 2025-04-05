// development utility for testing venue creation/retrieval flows

// features:
//  - tests the venue service integration
//  - visual feedback for loading/error states
//  - displays the resulting venue ID

import { useState } from 'react';
import { findOrCreateVenue } from '../events/venueService';

export default function VenueTester() {
    const [venueId, setVenueId] = useState(null); // stores successful venue ID
    const [isLoading, setIsLoading] = useState(false); // loading state flag
    const [error, setError] = useState(null); // error message storage


    // tests the venue creation/lookup flow
    // 1° resets state and triggers loading
    // 2° attempts to find/create test venue
    // 3° updates state with results
    const testVenueFlow = async () => {

        // reset state and begin loading
        setIsLoading(true);
        setError(null);
        try {
            // execute service call with test data
            const id = await findOrCreateVenue({
                city_id: 6,
                name: 'Madison Square Garden',
                country: 'USA',
                dma_id: 345,
            });

            // store successful result
            setVenueId(id);
        } catch (err) {
            // capture and display errors
            setError(err.message);
        } finally {
            // clean up loading state
            setIsLoading(false);
        }
    };

    return (
        <div className="tester-card">
            <h3>Venue Service Test</h3>
            <button
                onClick={testVenueFlow}
                disabled={isLoading}
            >
                {isLoading ? 'Processing...' : 'Test Venue Flow'}
            </button>

            <div className="results">
                {error && <p className="error">Error: {error}</p>}
                {venueId && <p>Venue ID: {venueId}</p>}
            </div>
        </div>
    );
}