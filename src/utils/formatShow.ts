import type { ShowEntity } from '../entities/ShowEntity';
import type { FormattedShow } from '../types';

export const formatShow = (show: ShowEntity): FormattedShow => ({
  id: show.id,
  artistId: show.artist.id,
  title: show.title,
  location: show.location,
  date: show.date,
  ticketPrice: show.ticketPrice ?? 0,
  availableTickets: show.availableTickets ?? null,
  artist: {
    name: show.artist.name,
    genre: show.artist.genre.join(', ')
  }
});
