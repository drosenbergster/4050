export interface Cause {
  id: string;
  name: string;
  description: string;
}

export const CURRENT_CAUSES: Cause[] = [
  {
    id: 'food-bank',
    name: 'Local Food Bank',
    description: 'Providing fresh meals and pantry staples. More seeds help us provide more nourishment.'
  },
  {
    id: 'community-garden',
    name: 'Community Garden Fund',
    description: 'Expanding shared growing spaces. More seeds help us cultivate more garden beds.'
  },
  {
    id: 'youth-nature',
    name: 'Youth Nature Programs',
    description: 'Connecting kids with the seasons. More seeds help us grow more educational programs.'
  }
];

