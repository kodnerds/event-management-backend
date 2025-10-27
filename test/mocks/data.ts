export const mockArtists = {
  valid: {
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'SecurePass123!',
    genre: ['Rock', 'Blues'],
    bio: 'Professional musician with 10 years of experience.'
  },
  validWithoutBio: {
    name: 'Jane Smith',
    email: 'janesmith@example.com',
    password: 'MyPass456@',
    genre: ['Pop', 'Electronic']
  }
};

export const mockShows = {
  valid: {
    id: '3241980',
    title: 'Davido in Uyo',
    description: 'Davido is performing live in one of Nigeria growing city',
    location: 'Uyo',
    date: '2025-12-15T20:00:00Z',
    ticketPrice: 10000,
    availableTickets: 45000
  },
  invalid:{
    id: '3241980',
    title: 'D',
    description: 'Davido is performing live in one of Nigeria growing city',
    location: 'U',
    date: '2025-12-15',
    ticketPrice: '',
    availableTickets: '45000'
  }
}
