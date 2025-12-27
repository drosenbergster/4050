export interface Organization {
  id: string;
  name: string;
  shortDescription: string; // For checkout dropdown
  description: string; // Fuller description for Impact page
  category: 'food' | 'garden' | 'youth' | 'community';
  website?: string;
  logoUrl?: string;
  imageUrl?: string;
  seedsThisQuarter?: number; // Will be dynamic eventually
}

// This Quarter's Partner Organizations
// These are the organizations users can direct their seeds to during checkout
export const CURRENT_QUARTER_ORGS: Organization[] = [
  {
    id: 'helping-hands-food-bank',
    name: 'Helping Hands Food Bank',
    shortDescription: 'Providing fresh meals and pantry staples to families in need.',
    description: 'Helping Hands Food Bank has been serving our community for over 15 years, providing nutritious meals and emergency food assistance to families facing food insecurity. They distribute over 50,000 pounds of food monthly through their network of community partners.',
    category: 'food',
    website: 'https://example.com/helping-hands',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop&q=80',
    seedsThisQuarter: 0,
  },
  {
    id: 'greenway-community-gardens',
    name: 'Greenway Community Gardens',
    shortDescription: 'Expanding shared growing spaces across our neighborhoods.',
    description: 'Greenway Community Gardens transforms vacant lots into thriving garden spaces where neighbors come together to grow food, share knowledge, and build community. They currently maintain 8 gardens across the area, providing plots to over 200 families.',
    category: 'garden',
    website: 'https://example.com/greenway',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&q=80',
    seedsThisQuarter: 0,
  },
  {
    id: 'sprouts-youth-program',
    name: 'Sprouts Youth Program',
    shortDescription: 'Connecting kids with nature and teaching life skills.',
    description: 'Sprouts Youth Program offers after-school and summer programs that get kids outdoors, teaching them about gardening, cooking, and environmental stewardship. Their hands-on approach has reached over 500 children, fostering a love for nature and healthy eating.',
    category: 'youth',
    website: 'https://example.com/sprouts',
    imageUrl: 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=400&h=300&fit=crop&q=80',
    seedsThisQuarter: 0,
  },
  {
    id: 'neighbors-helping-neighbors',
    name: 'Neighbors Helping Neighbors',
    shortDescription: 'Direct assistance to families facing unexpected hardship.',
    description: 'Neighbors Helping Neighbors provides emergency assistance to local families facing unexpected hardship—whether it\'s help with utilities, rent, medical expenses, or other urgent needs. They believe that community takes care of its own.',
    category: 'community',
    website: 'https://example.com/neighbors',
    imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=300&fit=crop&q=80',
    seedsThisQuarter: 0,
  },
];

// Legacy export for backward compatibility with checkout
// Maps to the same data structure the checkout expects
export interface Cause {
  id: string;
  name: string;
  description: string;
}

export const CURRENT_CAUSES: Cause[] = CURRENT_QUARTER_ORGS.map(org => ({
  id: org.id,
  name: org.name,
  description: org.shortDescription,
}));

// Category labels for display
export const CATEGORY_LABELS: Record<Organization['category'], string> = {
  food: 'Food Security',
  garden: 'Community Gardens',
  youth: 'Youth Programs',
  community: 'Community Support',
};
