import type {
  VenueWithDetails,
  Location,
  VenueType,
  Amenity,
  Rate,
} from '../types/venue.types';

// Mock Venue Types
export const mockVenueTypes: VenueType[] = [
  {
    venueType_id: '1',
    name: 'Minimizelist',
    description: 'Professional meeting space with modern amenities',
    minCapacity: 10,
    maxCapacity: 50,
    area: 80,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    venueType_id: '2',
    name: 'Ballroom',
    description: 'Elegant space for weddings and large events',
    minCapacity: 100,
    maxCapacity: 500,
    area: 500,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    venueType_id: '3',
    name: 'Meeting Room',
    description: 'Intimate space for small team meetings',
    minCapacity: 4,
    maxCapacity: 12,
    area: 30,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    venueType_id: '4',
    name: 'Rooftop Terrace',
    description: 'Outdoor venue with stunning city views',
    minCapacity: 20,
    maxCapacity: 100,
    area: 200,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock Locations
export const mockLocations: Location[] = [
  {
    location_id: '1',
    owner_id: 'owner1',
    name: 'Davue Hotel Da Nang',
    description: 'Luxury beachfront hotel with stunning sea views',
    addrNo: '123',
    ward: 'My An Ward, Ngu Hanh Son District',
    city: 'Da Nang',
    avgRating: 8.6,
    policy: 'Free cancellation',
    phoneNo: '0362555555',
    mapURL: 'https://maps.google.com/?q=Davue+Hotel+Da+Nang',
    thumbnailURL:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    location_id: '2',
    owner_id: 'owner2',
    name: 'Gold Central Hotel',
    description: 'Premium hotel in the heart of Da Nang city center',
    addrNo: '456',
    ward: 'Hai Chau District',
    city: 'Da Nang',
    avgRating: 8.4,
    policy: 'Free cancellation up to 24 hours',
    phoneNo: '0362333333',
    mapURL: 'https://maps.google.com/?q=Gold+Central+Hotel+Da+Nang',
    thumbnailURL:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    location_id: '3',
    owner_id: 'owner3',
    name: 'Grand Hotel Saigon',
    description: 'Luxury 5-star hotel in the heart of Ho Chi Minh City',
    addrNo: '8',
    ward: 'Ben Nghe',
    city: 'Ho Chi Minh City',
    avgRating: 4.8,
    policy: 'Cancellation allowed up to 24 hours before event',
    phoneNo: '0283823456',
    mapURL: 'https://maps.google.com/?q=Grand+Hotel+Saigon',
    thumbnailURL:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    location_id: '4',
    owner_id: 'owner4',
    name: 'Riverside Palace',
    description: 'Elegant riverside venue with panoramic views',
    addrNo: '123',
    ward: 'District 1',
    city: 'Ho Chi Minh City',
    avgRating: 4.6,
    policy: 'Flexible cancellation policy',
    phoneNo: '0283987654',
    mapURL: 'https://maps.google.com/?q=Riverside+Palace',
    thumbnailURL:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock Amenities
export const mockAmenities: Amenity[] = [
  // LOCATION 1: Sunrise Conference Hall
  {
    amenity_id: 'aaaa1111-aaaa-aaaa-aaaa-000000000001',
    amenity_name: '',
    location_id: '1',
    category: 'Projector',
    description: 'High-Lumen Laser Projector & 200" Screen',
    price: 800000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    amenity_id: 'aaaa1111-aaaa-aaaa-aaaa-000000000002',
    amenity_name: '',
    location_id: '1',
    category: 'Catering',
    description: 'Full Buffet Service (Asian/Western)',
    price: 400000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    amenity_id: 'aaaa1111-aaaa-aaaa-aaaa-000000000003',
    amenity_name: '',
    location_id: '1',
    category: 'Audio Set',
    description: 'Standard PA System (2 Wireless Mics + Speaker)',
    price: 300000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    amenity_id: 'aaaa1111-aaaa-aaaa-aaaa-000000000004',
    amenity_name: '',
    location_id: '1',
    category: 'Projector',
    description: 'P3 LED Video Wall (Custom Size)',
    price: 2000000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    amenity_id: 'aaaa1111-aaaa-aaaa-aaaa-000000000005',
    amenity_name: '',
    location_id: '1',
    category: 'Catering',
    description: 'VIP Gala Dinner Set Menu',
    price: 600000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  // LOCATION 2: Sunrise Annex
  {
    amenity_id: 'aaaa2222-aaaa-aaaa-aaaa-000000000001',
    amenity_name: '',
    location_id: '2',
    category: 'Projector',
    description: 'Portable Mini Projector (3000 Lumens)',
    price: 150000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    amenity_id: 'aaaa2222-aaaa-aaaa-aaaa-000000000002',
    amenity_name: '',
    location_id: '2',
    category: 'Catering',
    description: 'Basic Tea Break (Coffee/Tea + Cookies)',
    price: 80000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    amenity_id: 'aaaa2222-aaaa-aaaa-aaaa-000000000003',
    amenity_name: '',
    location_id: '2',
    category: 'Audio Set',
    description: 'Standard PA System (2 Wireless Mics + Speaker)',
    price: 300000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    amenity_id: 'aaaa2222-aaaa-aaaa-aaaa-000000000004',
    amenity_name: '',
    location_id: '2',
    category: 'Projector',
    description: 'Standard HD Projector & 100" Screen',
    price: 300000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    amenity_id: 'aaaa2222-aaaa-aaaa-aaaa-000000000005',
    amenity_name: '',
    location_id: '2',
    category: 'Catering',
    description: 'Lunch Box & Drink Set',
    price: 150000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  // LOCATION 3: Grand Hotel Saigon (Mapped to ID 3)
  {
    amenity_id: 'bbbb1111-bbbb-bbbb-bbbb-000000000001',
    amenity_name: '',
    location_id: '3',
    category: 'Projector',
    description: 'High-Lumen Laser Projector & 200" Screen',
    price: 800000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    amenity_id: 'bbbb1111-bbbb-bbbb-bbbb-000000000002',
    amenity_name: '',
    location_id: '3',
    category: 'Catering',
    description: 'Full Buffet Service (Asian/Western)',
    price: 400000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    amenity_id: 'bbbb1111-bbbb-bbbb-bbbb-000000000003',
    amenity_name: '',
    location_id: '3',
    category: 'Audio Set',
    description: 'Standard PA System (2 Wireless Mics + Speaker)',
    price: 300000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  // LOCATION 4: Riverside Palace (Mapped to ID 4)
  {
    amenity_id: 'dddd1111-dddd-dddd-dddd-000000000001',
    amenity_name: '',
    location_id: '4',
    category: 'Projector',
    description: 'Standard HD Projector & 100" Screen',
    price: 300000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    amenity_id: 'dddd1111-dddd-dddd-dddd-000000000002',
    amenity_name: '',
    location_id: '4',
    category: 'Catering',
    description: 'Lunch Box & Drink Set',
    price: 150000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    amenity_id: 'dddd1111-dddd-dddd-dddd-000000000003',
    amenity_name: '',
    location_id: '4',
    category: 'Audio Set',
    description: 'Standard PA System (2 Wireless Mics + Speaker)',
    price: 300000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    amenity_id: 'dddd1111-dddd-dddd-dddd-000000000004',
    amenity_name: '',
    location_id: '4',
    category: 'Projector',
    description: 'High-Lumen Laser Projector & 200" Screen',
    price: 800000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    amenity_id: 'dddd1111-dddd-dddd-dddd-000000000005',
    amenity_name: '',
    location_id: '4',
    category: 'Catering',
    description: 'BBQ Party Package',
    price: 450000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock Reviews
export const mockReviews: Rate[] = [
  {
    client_id: 'client1',
    location_id: '1',
    stars: 5,
    comment: 'Excellent venue! Professional staff and beautiful space.',
    created_at: new Date('2024-11-15'),
    updated_at: new Date('2024-11-15'),
  },
  {
    client_id: 'client2',
    location_id: '1',
    stars: 4,
    comment: 'Great location and amenities. Would book again!',
    created_at: new Date('2024-11-10'),
    updated_at: new Date('2024-11-10'),
  },
  {
    client_id: 'client3',
    location_id: '1',
    stars: 5,
    comment: 'Perfect for our corporate event. Highly recommended!',
    created_at: new Date('2024-11-05'),
    updated_at: new Date('2024-11-05'),
  },
];

// Mock Venues with Details
export const mockVenues: VenueWithDetails[] = [
  // Da Nang Venues
  {
    location_id: '1',
    name: 'Ocean View Room',
    venueType_id: '1',
    floor: '5th Floor',
    pricePerHour: 2470300,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    location: mockLocations[0]!,
    venueType: mockVenueTypes[0]!,
    images: [
      {
        image_id: '1',
        location_id: '1',
        venueName: 'Ocean View Room',
        locationImgURL:
          'https://images.unsplash.com/photo-1519167758481-83f29da8c2b1?w=800',
      },
      {
        image_id: '2',
        location_id: '1',
        venueName: 'Ocean View Room',
        locationImgURL:
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
      },
    ],
    amenities: mockAmenities.slice(0, 2),
    avgRating: 8.6,
    reviewCount: 1100,
    isFavorite: false,
  },
  {
    location_id: '2',
    name: 'Deluxe Suite',
    venueType_id: '1',
    floor: '8th Floor',
    pricePerHour: 2800000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    location: mockLocations[1]!,
    venueType: mockVenueTypes[0]!,
    images: [
      {
        image_id: '3',
        location_id: '2',
        venueName: 'Deluxe Suite',
        locationImgURL:
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      },
      {
        image_id: '4',
        location_id: '2',
        venueName: 'Deluxe Suite',
        locationImgURL:
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
      },
    ],
    amenities: mockAmenities.slice(0, 3),
    avgRating: 8.4,
    reviewCount: 838,
    isFavorite: true,
  },
  {
    location_id: '1',
    name: 'Beach Bungalow',
    venueType_id: '2',
    floor: '1st Floor',
    pricePerHour: 1800000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    location: mockLocations[0]!,
    venueType: mockVenueTypes[1]!,
    images: [
      {
        image_id: '5',
        location_id: '1',
        venueName: 'Beach Bungalow',
        locationImgURL:
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
      },
    ],
    amenities: mockAmenities.slice(1, 3),
    avgRating: 8.5,
    reviewCount: 567,
    isFavorite: false,
  },
  {
    location_id: '2',
    name: 'Premier City Room',
    venueType_id: '3',
    floor: '12th Floor',
    pricePerHour: 3200000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    location: mockLocations[1]!,
    venueType: mockVenueTypes[2]!,
    images: [
      {
        image_id: '6',
        location_id: '2',
        venueName: 'Premier City Room',
        locationImgURL:
          'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
      },
    ],
    amenities: mockAmenities.slice(0, 2),
    avgRating: 8.3,
    reviewCount: 423,
    isFavorite: false,
  },
  // Ho Chi Minh City Venues
  {
    location_id: '3',
    name: 'Grand Ballroom',
    venueType_id: '2',
    floor: '5th Floor',
    pricePerHour: 5000000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    location: mockLocations[2]!,
    venueType: mockVenueTypes[1]!,
    images: [
      {
        image_id: '7',
        location_id: '3',
        venueName: 'Grand Ballroom',
        locationImgURL:
          'https://images.unsplash.com/photo-1519167758481-83f29da8c2b1?w=800',
      },
      {
        image_id: '8',
        location_id: '3',
        venueName: 'Grand Ballroom',
        locationImgURL:
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
      },
    ],
    amenities: mockAmenities,
    avgRating: 4.8,
    reviewCount: 156,
    isFavorite: false,
  },
  {
    location_id: '3',
    name: 'Executive Conference Room',
    venueType_id: '1',
    floor: '3rd Floor',
    pricePerHour: 2000000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    location: mockLocations[2]!,
    venueType: mockVenueTypes[0]!,
    images: [
      {
        image_id: '9',
        location_id: '3',
        venueName: 'Executive Conference Room',
        locationImgURL:
          'https://images.unsplash.com/photo-1497366548035-1c02ded184e0?w=800',
      },
    ],
    amenities: mockAmenities.slice(0, 2),
    avgRating: 4.7,
    reviewCount: 89,
    isFavorite: true,
  },
  {
    location_id: '4',
    name: 'Riverside Terrace',
    venueType_id: '4',
    floor: 'Rooftop',
    pricePerHour: 3500000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    location: mockLocations[3]!,
    venueType: mockVenueTypes[3]!,
    images: [
      {
        image_id: '10',
        location_id: '4',
        venueName: 'Riverside Terrace',
        locationImgURL:
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
      },
      {
        image_id: '11',
        location_id: '4',
        venueName: 'Riverside Terrace',
        locationImgURL:
          'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
      },
    ],
    amenities: mockAmenities.slice(2, 4),
    avgRating: 4.9,
    reviewCount: 234,
    isFavorite: false,
  },
];

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Helper function to calculate duration in hours
export const calculateDuration = (startHour: Date, endHour: Date): number => {
  const diff = endHour.getTime() - startHour.getTime();
  return Math.round(diff / (1000 * 60 * 60));
};

// Helper function to calculate total price
export const calculateTotalPrice = (
  pricePerHour: number,
  startHour: Date,
  endHour: Date,
  amenities: Amenity[] = [],
): number => {
  const duration = calculateDuration(startHour, endHour);
  const venuePrice = pricePerHour * duration;
  const amenitiesPrice = amenities.reduce(
    (sum, amenity) => sum + amenity.price,
    0,
  );
  return venuePrice + amenitiesPrice;
};

// Helper function to get amenities by location
export const getAmenitiesByLocation = (locationId: string): Amenity[] => {
  return mockAmenities.filter((amenity) => amenity.location_id === locationId);
};

// Mock Clients
export const mockClients = [
  {
    client_id: 'client1',
    firstName: 'Nguyen',
    lastName: 'Tuan',
    email: 'nguyen.tuan@example.com',
    phoneNo: '0901234567',
    membership_points: 500,
  },
  {
    client_id: 'client2',
    firstName: 'Tran',
    lastName: 'Minh',
    email: 'tran.minh@example.com',
    phoneNo: '0912345678',
    membership_points: 1200,
  },
  {
    client_id: 'client3',
    firstName: 'Pham',
    lastName: 'Duc',
    email: 'pham.duc@example.com',
    phoneNo: '0923456789',
    membership_points: 300,
  },
];

// Mock Orders for owner1
export const mockOrders = [
  {
    order_id: 'ord001',
    client_id: 'client1',
    venue_loc_id: '1',
    venueName: 'Ocean View Room',
    totalPrice: 4940600,
    status: 'CONFIRMED' as const,
    startHour: new Date('2025-12-10T14:00:00'),
    endHour: new Date('2025-12-10T16:00:00'),
    points: 50,
    expiredAt: new Date('2025-12-09T23:59:59'),
    createdAt: new Date('2025-12-03T10:30:00'),
    updatedAt: new Date('2025-12-03T10:30:00'),
    paidAt: new Date('2025-12-03T10:45:00'),
    clientBankAccount: '1234567890',
    client: mockClients[0],
    venue: mockVenues[0],
  },
  {
    order_id: 'ord002',
    client_id: 'client2',
    venue_loc_id: '1',
    venueName: 'Ocean View Room',
    totalPrice: 2470300,
    status: 'PENDING' as const,
    startHour: new Date('2025-12-15T09:00:00'),
    endHour: new Date('2025-12-15T10:00:00'),
    points: 25,
    expiredAt: new Date('2025-12-14T23:59:59'),
    createdAt: new Date('2025-12-02T14:20:00'),
    updatedAt: new Date('2025-12-02T14:20:00'),
    client: mockClients[1],
    venue: mockVenues[0],
  },
  {
    order_id: 'ord003',
    client_id: 'client3',
    venue_loc_id: '1',
    venueName: 'Ocean View Room',
    totalPrice: 7411000,
    status: 'COMPLETED' as const,
    startHour: new Date('2025-11-20T10:00:00'),
    endHour: new Date('2025-11-20T13:00:00'),
    points: 75,
    expiredAt: new Date('2025-11-19T23:59:59'),
    createdAt: new Date('2025-11-15T09:15:00'),
    updatedAt: new Date('2025-11-20T14:00:00'),
    paidAt: new Date('2025-11-15T09:30:00'),
    clientBankAccount: '9876543210',
    client: mockClients[2],
    venue: mockVenues[0],
  },
  {
    order_id: 'ord004',
    client_id: 'client1',
    venue_loc_id: '1',
    venueName: 'Ocean View Room',
    totalPrice: 3704050,
    status: 'CANCELLED' as const,
    startHour: new Date('2025-12-05T11:00:00'),
    endHour: new Date('2025-12-05T12:30:00'),
    points: 37,
    expiredAt: new Date('2025-12-04T23:59:59'),
    createdAt: new Date('2025-11-28T16:45:00'),
    updatedAt: new Date('2025-12-01T10:00:00'),
    client: mockClients[0],
    venue: mockVenues[0],
  },
];
