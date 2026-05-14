export interface TripCoordinates {
  lat: number;
  lng: number;
}

export interface TripPlace {
  name: string;
  details: string;
  ticketPrice: string;
  timeToVisit: string;
  travelTime: string;
  coordinates: TripCoordinates;
}

export interface TripDay {
  day: number;
  theme: string;
  places: TripPlace[];
}

export interface TripHotel {
  name: string;
  address: string;
  price: string;
  rating: number;
  description: string;
  coordinates: TripCoordinates;
}

export interface TripData {
  tripName: string;
  destination: string;
  duration: number;
  budget: string;
  travelers: string;
  bestTimeToVisit: string;
  hotels: TripHotel[];
  itinerary: TripDay[];
}
