'use client';

import { useState, useEffect } from 'react';
import { 
  Heart, 
  Leaf, 
  Users, 
  Building2, 
  ChevronDown,
  Check,
  X,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Clock,
  CheckCircle2,
  Sprout,
  DollarSign
} from 'lucide-react';
import { formatPrice } from '@/lib/format';

// Types matching the Prisma models
interface Organization {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: 'FOOD' | 'GARDEN' | 'YOUTH' | 'COMMUNITY';
  website: string | null;
  imageUrl: string | null;
  status: 'ACTIVE' | 'IN_POOL' | 'PAST_PARTNER';
  activeCycles: string[];
  createdAt: string;
}

interface Nomination {
  id: string;
  organizationName: string;
  website: string | null;
  missionDescription: string;
  reason: string;
  nominatorName: string | null;
  nominatorEmail: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface OrderWithSeeds {
  id: string;
  proceedsChoice?: string | null;
  seedCount?: number | null;
  extraSupportAmount?: number | null;
  total: number;
}

// Category display config
const CATEGORY_CONFIG = {
  FOOD: { label: 'Food Security', icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
  GARDEN: { label: 'Community Gardens', icon: Leaf, color: 'text-green-600', bg: 'bg-green-50' },
  YOUTH: { label: 'Youth Programs', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  COMMUNITY: { label: 'Community Support', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
};

interface Props {
  orders: OrderWithSeeds[];
}

export default function OrganizationManager({ orders }: Props) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrgId, setExpandedOrgId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('FOOD');

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [orgsRes, nomsRes] = await Promise.all([
        fetch('/api/admin/organizations'),
        fetch('/api/admin/nominations?status=PENDING'),
      ]);

      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        setOrganizations(orgsData);
      }

      if (nomsRes.ok) {
        const nomsData = await nomsRes.json();
        setNominations(nomsData);
      }
    } catch (error) {
      console.error('Failed to fetch organization data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate seeds and money for each organization from orders
  const getOrgStats = (orgId: string) => {
    const orgOrders = orders.filter(o => o.proceedsChoice === orgId);
    const seeds = orgOrders.reduce((sum, o) => sum + (o.seedCount || 0), 0);
    const extraSupport = orgOrders.reduce((sum, o) => sum + (o.extraSupportAmount || 0), 0);
    return { seeds, extraSupport, orderCount: orgOrders.length };
  };

  // Toggle organization active status
  const toggleOrgStatus = async (org: Organization) => {
    const newStatus = org.status === 'ACTIVE' ? 'IN_POOL' : 'ACTIVE';
    
    try {
      const res = await fetch(`/api/admin/organizations/${org.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrganizations(prev => 
          prev.map(o => o.id === org.id ? updated : o)
        );
      }
    } catch (error) {
      console.error('Failed to update organization:', error);
    }
  };

  // Approve nomination
  const approveNomination = async (nomination: Nomination) => {
    try {
      const res = await fetch(`/api/admin/nominations/${nomination.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', category: selectedCategory }),
      });

      if (res.ok) {
        const data = await res.json();
        // Add new org to list and remove nomination
        setOrganizations(prev => [...prev, data.organization]);
        setNominations(prev => prev.filter(n => n.id !== nomination.id));
        setApprovingId(null);
      }
    } catch (error) {
      console.error('Failed to approve nomination:', error);
    }
  };

  // Reject nomination
  const rejectNomination = async (nomination: Nomination) => {
    try {
      const res = await fetch(`/api/admin/nominations/${nomination.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (res.ok) {
        setNominations(prev => prev.filter(n => n.id !== nomination.id));
      }
    } catch (error) {
      console.error('Failed to reject nomination:', error);
    }
  };

  // Separate active and pool organizations
  const activeOrgs = organizations.filter(o => o.status === 'ACTIVE');
  const poolOrgs = organizations.filter(o => o.status === 'IN_POOL' || o.status === 'PAST_PARTNER');

  // Calculate totals
  const totalSeeds = orders.reduce((sum, o) => sum + (o.seedCount || 0), 0);
  const totalExtraSupport = orders.reduce((sum, o) => sum + (o.extraSupportAmount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading organizations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Organizations - Main Table */}
      <div className="bg-white rounded-xl border border-[#E5DDD3] overflow-hidden">
        <div className="px-6 py-4 bg-[#FDF8F3] border-b border-[#E5DDD3]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#E8F0EA] rounded-lg text-[#4A7C59]">
                <Sprout size={20} />
              </div>
              <div>
                <h2 className="font-serif font-bold text-[#5C4A3D]">Active Organizations</h2>
                <p className="text-xs text-gray-500">These are currently available for customers to select at checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E8F0EA] rounded-full">
                <Leaf size={14} className="text-[#4A7C59]" />
                <span className="font-bold text-[#4A7C59]">{totalSeeds}</span>
                <span className="text-gray-500">total seeds</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5EDE4] rounded-full">
                <DollarSign size={14} className="text-[#8B7355]" />
                <span className="font-bold text-[#8B7355]">{formatPrice(totalExtraSupport)}</span>
                <span className="text-gray-500">extra support</span>
              </div>
            </div>
          </div>
        </div>

        {activeOrgs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No active organizations. Toggle some on from the pool below.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Organization</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Seeds</th>
                <th className="px-6 py-3 text-right">Extra Support</th>
                <th className="px-6 py-3 text-center">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeOrgs.map(org => {
                const stats = getOrgStats(org.id);
                const percentage = totalSeeds > 0 ? Math.round((stats.seeds / totalSeeds) * 100) : 0;
                const CategoryIcon = CATEGORY_CONFIG[org.category].icon;
                
                return (
                  <tr key={org.id} className="hover:bg-[#FDF8F3] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#5C4A3D]">{org.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{org.shortDescription.substring(0, 60)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_CONFIG[org.category].bg} ${CATEGORY_CONFIG[org.category].color}`}>
                        <CategoryIcon size={12} />
                        {CATEGORY_CONFIG[org.category].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-[#4A7C59]">{stats.seeds}</div>
                      <div className="text-xs text-gray-400">{percentage}% of total</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-[#8B7355]">{formatPrice(stats.extraSupport)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleOrgStatus(org)}
                        className="text-[#4A7C59] hover:text-[#3D6649] transition-colors"
                        title="Click to deactivate"
                      >
                        <ToggleRight size={28} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Organization Pool - Collapsible */}
      <details className="group bg-white rounded-xl border border-[#E5DDD3] overflow-hidden">
        <summary className="px-6 py-4 bg-[#FDF8F3] border-b border-[#E5DDD3] cursor-pointer hover:bg-[#F5EDE4] transition-colors list-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="font-serif font-bold text-[#5C4A3D]">Organization Pool</h2>
                <p className="text-xs text-gray-500">Approved organizations that can be activated for the current cycle</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{poolOrgs.length} in pool</span>
              <ChevronDown size={20} className="text-gray-400 group-open:rotate-180 transition-transform" />
            </div>
          </div>
        </summary>
        
        <div className="divide-y divide-gray-100">
          {poolOrgs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No organizations in the pool yet.</p>
            </div>
          ) : (
            poolOrgs.map(org => {
              const isExpanded = expandedOrgId === org.id;
              const CategoryIcon = CATEGORY_CONFIG[org.category].icon;
              
              return (
                <div key={org.id} className="hover:bg-[#FDF8F3] transition-colors">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <button
                        onClick={() => toggleOrgStatus(org)}
                        className="text-gray-300 hover:text-[#4A7C59] transition-colors flex-shrink-0"
                        title="Click to activate"
                      >
                        <ToggleLeft size={28} />
                      </button>
                      <div className="min-w-0">
                        <div className="font-medium text-[#5C4A3D]">{org.name}</div>
                        <span className={`inline-flex items-center gap-1 text-xs ${CATEGORY_CONFIG[org.category].color}`}>
                          <CategoryIcon size={10} />
                          {CATEGORY_CONFIG[org.category].label}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedOrgId(isExpanded ? null : org.id)}
                      className="text-xs text-[#4A7C59] hover:underline flex-shrink-0"
                    >
                      {isExpanded ? 'Hide details' : 'Show details'}
                    </button>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-6 pb-4 pl-16 text-sm text-gray-600 space-y-2">
                      <p>{org.description}</p>
                      {org.website && (
                        <a 
                          href={org.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#4A7C59] hover:underline"
                        >
                          <ExternalLink size={12} />
                          Visit website
                        </a>
                      )}
                      {org.activeCycles.length > 0 && (
                        <p className="text-xs text-gray-400">
                          Previously active: {org.activeCycles.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </details>

      {/* Pending Nominations - Collapsible */}
      <details className="group bg-white rounded-xl border border-[#E5DDD3] overflow-hidden">
        <summary className="px-6 py-4 bg-[#FDF8F3] border-b border-[#E5DDD3] cursor-pointer hover:bg-[#F5EDE4] transition-colors list-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                <Clock size={20} />
              </div>
              <div>
                <h2 className="font-serif font-bold text-[#5C4A3D]">Pending Nominations</h2>
                <p className="text-xs text-gray-500">Community suggestions awaiting your review</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {nominations.length > 0 && (
                <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                  {nominations.length} pending
                </span>
              )}
              <ChevronDown size={20} className="text-gray-400 group-open:rotate-180 transition-transform" />
            </div>
          </div>
        </summary>
        
        <div className="divide-y divide-gray-100">
          {nominations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <CheckCircle2 size={32} className="mx-auto text-green-400 mb-2" />
              <p>No pending nominations to review.</p>
            </div>
          ) : (
            nominations.map(nomination => (
              <div key={nomination.id} className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-[#5C4A3D]">{nomination.organizationName}</h3>
                    {nomination.website && (
                      <a 
                        href={nomination.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#4A7C59] hover:underline mt-1"
                      >
                        <ExternalLink size={10} />
                        {nomination.website}
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(nomination.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">What they do</div>
                    <p className="text-gray-600">{nomination.missionDescription}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Why nominate them</div>
                    <p className="text-gray-600">{nomination.reason}</p>
                  </div>
                  {(nomination.nominatorName || nomination.nominatorEmail) && (
                    <div className="text-xs text-gray-400">
                      Nominated by: {nomination.nominatorName || 'Anonymous'} 
                      {nomination.nominatorEmail && ` (${nomination.nominatorEmail})`}
                    </div>
                  )}
                </div>

                {/* Approval UI */}
                {approvingId === nomination.id ? (
                  <div className="bg-[#FDF8F3] rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Select Category
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                          const Icon = config.icon;
                          return (
                            <button
                              key={key}
                              onClick={() => setSelectedCategory(key)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                selectedCategory === key
                                  ? `${config.bg} ${config.color} ring-2 ring-offset-1 ring-current`
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <Icon size={14} />
                              {config.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveNomination(nomination)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#4A7C59] text-white rounded-lg font-medium hover:bg-[#3D6649] transition-colors"
                      >
                        <Check size={16} />
                        Confirm Approval
                      </button>
                      <button
                        onClick={() => setApprovingId(null)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setApprovingId(nomination.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#4A7C59] text-white rounded-lg font-medium hover:bg-[#3D6649] transition-colors"
                    >
                      <Check size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectNomination(nomination)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </details>
    </div>
  );
}

