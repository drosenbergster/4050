import { prisma } from '@/lib/server/db';
import { OrganizationStatus } from '@prisma/client';

/**
 * Organization interface matching the existing lib/causes.ts structure
 * for backward compatibility
 */
export interface Organization {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: 'food' | 'garden' | 'youth' | 'community';
  website?: string;
  logoUrl?: string;
  imageUrl?: string;
}

/**
 * Cause interface for backward compatibility with checkout
 */
export interface Cause {
  id: string;
  name: string;
  description: string;
}

/**
 * Fetch all active organizations from the database
 * Returns data in the same format as CURRENT_QUARTER_ORGS from lib/causes.ts
 */
export async function getActiveOrganizations(): Promise<Organization[]> {
  const organizations = await prisma.organization.findMany({
    where: {
      status: OrganizationStatus.ACTIVE,
    },
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      shortDescription: true,
      description: true,
      category: true,
      website: true,
      logoUrl: true,
      imageUrl: true,
    },
  });

  // Transform to match existing interface (lowercase category)
  return organizations.map(org => ({
    ...org,
    category: org.category.toLowerCase() as 'food' | 'garden' | 'youth' | 'community',
    website: org.website ?? undefined,
    logoUrl: org.logoUrl ?? undefined,
    imageUrl: org.imageUrl ?? undefined,
  }));
}

/**
 * Fetch active organizations in the Cause format for checkout
 * Returns data in the same format as CURRENT_CAUSES from lib/causes.ts
 */
export async function getActiveCauses(): Promise<Cause[]> {
  const organizations = await getActiveOrganizations();
  
  return organizations.map(org => ({
    id: org.id,
    name: org.name,
    description: org.shortDescription,
  }));
}

/**
 * Get a single organization by ID
 * Works with both old hardcoded IDs and new database UUIDs
 */
export async function getOrganizationById(id: string): Promise<Organization | null> {
  const org = await prisma.organization.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      shortDescription: true,
      description: true,
      category: true,
      website: true,
      logoUrl: true,
      imageUrl: true,
    },
  });

  if (!org) return null;

  return {
    ...org,
    category: org.category.toLowerCase() as 'food' | 'garden' | 'youth' | 'community',
    website: org.website ?? undefined,
    logoUrl: org.logoUrl ?? undefined,
    imageUrl: org.imageUrl ?? undefined,
  };
}

/**
 * Category labels for display
 */
export const CATEGORY_LABELS: Record<Organization['category'], string> = {
  food: 'Food Security',
  garden: 'Community Gardens',
  youth: 'Youth Programs',
  community: 'Community Support',
};


