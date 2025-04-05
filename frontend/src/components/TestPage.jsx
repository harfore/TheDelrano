import React from 'react';
import CityTester from "../services/tests/cityTester";
import ConcertTester from "../services/tests/concertTester";
import TourTester from "../services/tests/tourTester";
import VenueTester from "../services/tests/venueTester";

const TestPage = () => {
    return (
        <div className="test-page">
            <h1>Service Tests</h1>

            {/* Option 1: Use individual testers */}
            <div className="test-group">
                <CityTester />
                <VenueTester />
                <TourTester />
                <ConcertTester />
            </div>

            <style jsx>{`
        .test-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .test-group {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
      `}</style>
        </div>
    );
};

export default TestPage;