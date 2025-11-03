export type GetShowType = {
  date?: Date;
  artistId?: string;
};

export type FormattedShow {
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
}