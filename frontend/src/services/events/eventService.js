import { normalizeEvent } from './normalizers/ticketmaster';
import { findOrCreateCity } from '../cityService';
import { findOrCreateTour } from './tourService';
import { findOrCreateVenue } from './venueService';
import { createConcertIfNotExists } from './concertService';

export const saveConcertAndTour = async (rawEvent) => {
  try {
    const event = normalizeEvent(rawEvent);

    // ensure city exists (for concert venue)
    const cityId = await findOrCreateCity(
      event.venue.city,
      event.venue.country
    );

    // 2. ensure venue exists (linked to city)
    const venueId = await findOrCreateVenue({
      ...event.venue,
      city_id: cityId
    });

    // 3. find or create tour
    const tourId = await findOrCreateTour({
      name: event.name,
      artist_id: event.artist_id,
      start_date: event.start_date,
      end_date: event.end_date,
      image_urls: event.image_url
    });

    // 4. create concert
    await createConcertIfNotExists({
      tour_id: tourId,
      venue_id: venueId,
      date: event.start_date,
      special_notes: event.description || null
    });

  } catch (error) {
    console.error(`Failed to save ${rawEvent.name}:`, error);
    throw error;
  }
};