// development utility for testing city creation/retrieval flows

// features:
// - tests city service integration (findOrCreateCity)
// - provides visual feedback for loading/error states
// - displays the resulting city ID

import { useState } from 'react';
import { findOrCreateCity } from '../cityService';

export default function CityTester() {
    // state management
    const [cityId, setCityId] = useState(null); // successful city ID
    const [isLoading, setIsLoading] = useState(false); // loading indicator
    const [error, setError] = useState(null); // error message storage

    const testCityFlow = async () => {
        // Initialize state
        setIsLoading(true);
        setError(null);
        try {
            const id = await findOrCreateCity('New York', 'USA');
            setCityId(id); // store successful result
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
            <h3>City Service Test</h3>
            <button
                onClick={testCityFlow}
                disabled={isLoading}
            >
                {isLoading ? 'Processing...' : 'Test City Flow'}
            </button>

            <div className="results">
                {error && <p className="error">Error: {error}</p>}
                {cityId && <p>City ID: {cityId}</p>}
            </div>
        </div>
    );
}