import type { ArtistRepository } from '../repositories';

export type GetShowType = {
  date?: Date;
  artistId?: string;
};

export type FormattedShow = {
  id: string;
  artistId: string;
  title: string;
  location: string;
  date: Date;
  ticketPrice: number;
  availableTickets: number | null;
  artist: {
    name: string;
    genre: string | null;
  };
};

export type BuildFiltersType = {
  artistRepo: ArtistRepository;
  artistId?: string;
  from?: string;
  to?: string;
  res?: Response;
};
