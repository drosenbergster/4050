'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Sun,
  Sprout,
  Apple,
  Check,
  Plus,
  Edit3,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  Printer,
  Save,
} from 'lucide-react';

// Types
interface Crop {
  id: string;
  name: string;
  type: 'ANNUAL' | 'PERENNIAL' | 'BIENNIAL';
  seedStartWeek: number | null;
  seedStartNotes: string | null;
  plantOutWeekStart: number | null;
  plantOutWeekEnd: number | null;
  directSow: boolean;
  harvestStart: number;
  harvestEnd: number;
  peakStart: number | null;
  peakEnd: number | null;
  color: string;
  notes: string | null;
  ingredientId: string | null;
  ingredient?: {
    id: string;
    name: string;
    recipeIngredients?: Array<{
      recipe: {
        id: string;
        name: string;
        retailPrice: number;
        product?: { id: string; name: string } | null;
      };
    }>;
  } | null;
}

interface SeasonalTask {
  id: string;
  title: string;
  month: number;
  weekOfMonth: number | null;
  isCompleted: boolean;
  completedAt: string | null;
  year: number;
  notes: string | null;
  sortOrder: number;
}

// Brand-aligned calendar phase colors (warm, earthy palette with transparency for layering)
const PHASE_COLORS = {
  seedStart: 'rgba(168, 198, 168, 0.85)',   // Light sage green - start seeds indoors
  transplant: 'rgba(74, 124, 89, 0.8)',     // Brand forest green - transplant seedlings
  directSow: 'rgba(69, 160, 145, 0.8)',     // Teal green - direct sow outdoors
  harvest: 'rgba(212, 145, 92, 0.75)',      // Harvest amber - ripe, ready to pick
  peak: 'rgba(184, 115, 51, 0.9)',          // Terracotta - peak season, best quality
};

// Solid versions for legend dots
const PHASE_COLORS_SOLID = {
  seedStart: '#A8C6A8',    // Light sage green
  transplant: '#4A7C59',   // Brand forest green
  directSow: '#45A091',    // Teal green
  harvest: '#D4915C',      // Harvest amber
  peak: '#B87333',         // Terracotta
};

// Helper functions
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Sort crops by urgency - those with upcoming activity first
function getNextActivityWeek(crop: Crop, currentWeek: number): number {
  // Priority 0: Currently harvestable (highest priority)
  if (crop.harvestStart <= currentWeek && crop.harvestEnd >= currentWeek) {
    // Crops in peak season get extra priority
    if (crop.peakStart && crop.peakEnd && 
        crop.peakStart <= currentWeek && crop.peakEnd >= currentWeek) {
      return -2; // Peak season - very top
    }
    return -1; // Harvestable now - top priority
  }
  
  // Priority 1: Currently in planting window
  if (crop.plantOutWeekStart && crop.plantOutWeekEnd && 
      crop.plantOutWeekStart <= currentWeek && crop.plantOutWeekEnd >= currentWeek) {
    return 0;
  }
  
  // Collect all upcoming activities (this year and early next year)
  const phases: number[] = [];
  
  // This year's remaining activities
  if (crop.seedStartWeek && crop.seedStartWeek > currentWeek) {
    phases.push(crop.seedStartWeek);
  }
  if (crop.plantOutWeekStart && crop.plantOutWeekStart > currentWeek) {
    phases.push(crop.plantOutWeekStart);
  }
  if (crop.harvestStart > currentWeek) {
    phases.push(crop.harvestStart);
  }
  
  // If late in year (after Oct), also consider early next year's activities
  if (currentWeek > 40) {
    if (crop.seedStartWeek && crop.seedStartWeek <= 20) {
      phases.push(crop.seedStartWeek + 52); // Wrap to next year
    }
    if (crop.plantOutWeekStart && crop.plantOutWeekStart <= 26) {
      phases.push(crop.plantOutWeekStart + 52);
    }
    if (crop.harvestStart <= 26) {
      phases.push(crop.harvestStart + 52);
    }
  }
  
  // Return earliest upcoming, or far future if nothing
  return phases.length > 0 ? Math.min(...phases) : 100;
}

function sortCropsByUrgency(crops: Crop[], currentWeek: number): Crop[] {
  return [...crops].sort((a, b) => {
    const aNext = getNextActivityWeek(a, currentWeek);
    const bNext = getNextActivityWeek(b, currentWeek);
    
    // Primary sort: by next activity week
    if (aNext !== bNext) return aNext - bNext;
    
    // Secondary sort: alphabetically
    return a.name.localeCompare(b.name);
  });
}

function weekToMonth(week: number): number {
  // Approximate: week 1-4 = Jan, week 5-8 = Feb, etc.
  return Math.min(11, Math.floor((week - 1) / 4.33));
}

function getCurrentWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

function weekToDate(week: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = weekToMonth(week);
  const weekInMonth = Math.ceil((week - month * 4.33));
  return `${months[month]} Week ${Math.min(4, weekInMonth)}`;
}

export default function SeasonalPlanner() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [tasks, setTasks] = useState<SeasonalTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'year' | 'month'>('year');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(new Date().getMonth());
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [isAddingCrop, setIsAddingCrop] = useState(false);
  const [deletingCrop, setDeletingCrop] = useState<Crop | null>(null);
  
  const currentWeek = getCurrentWeek();
  const currentMonth = new Date().getMonth();

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cropsRes, tasksRes] = await Promise.all([
        fetch('/api/admin/crops'),
        fetch(`/api/admin/tasks?year=${selectedYear}`)
      ]);

      if (cropsRes.ok) {
        const cropsData = await cropsRes.json();
        setCrops(cropsData);
      }
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Failed to fetch planner data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle task completion
  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentStatus })
      });

      if (res.ok) {
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, isCompleted: !currentStatus, completedAt: !currentStatus ? new Date().toISOString() : null }
            : t
        ));
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  // Group tasks by month
  const tasksByMonth = useMemo(() => {
    const grouped: Record<number, SeasonalTask[]> = {};
    tasks.forEach(task => {
      if (!grouped[task.month]) grouped[task.month] = [];
      grouped[task.month].push(task);
    });
    return grouped;
  }, [tasks]);

  // Calculate task completion stats per month
  const monthStats = useMemo(() => {
    const stats: Record<number, { total: number; completed: number }> = {};
    for (let m = 1; m <= 12; m++) {
      const monthTasks = tasksByMonth[m] || [];
      stats[m] = {
        total: monthTasks.length,
        completed: monthTasks.filter(t => t.isCompleted).length
      };
    }
    return stats;
  }, [tasksByMonth]);

  // Handle crop save (create/update)
  const handleSaveCrop = async (cropData: Partial<Crop>) => {
    try {
      if (editingCrop) {
        // Update existing
        const res = await fetch(`/api/admin/crops/${editingCrop.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cropData)
        });
        if (res.ok) {
          await fetchData();
          setEditingCrop(null);
        }
      } else {
        // Create new
        const res = await fetch('/api/admin/crops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cropData)
        });
        if (res.ok) {
          await fetchData();
          setIsAddingCrop(false);
        }
      }
    } catch (error) {
      console.error('Failed to save crop:', error);
    }
  };

  // Handle crop delete
  const handleDeleteCrop = async (cropId: string) => {
    try {
      const res = await fetch(`/api/admin/crops/${cropId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchData();
        setDeletingCrop(null);
      }
    } catch (error) {
      console.error('Failed to delete crop:', error);
    }
  };

  // Print calendar
  const handlePrint = () => {
    window.print();
  };

  // Get crops active in a given month
  const getCropsForMonth = (month: number) => {
    // Month is 0-indexed here, convert to week range
    const startWeek = Math.floor(month * 4.33) + 1;
    const endWeek = Math.floor((month + 1) * 4.33);
    
    return crops.filter(crop => {
      // Check if any phase is active in this month
      const harvestActive = crop.harvestStart <= endWeek && crop.harvestEnd >= startWeek;
      const plantActive = crop.plantOutWeekStart && crop.plantOutWeekEnd && 
        crop.plantOutWeekStart <= endWeek && crop.plantOutWeekEnd >= startWeek;
      const seedActive = crop.seedStartWeek && crop.seedStartWeek >= startWeek && crop.seedStartWeek <= endWeek;
      
      return harvestActive || plantActive || seedActive;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A7C59]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#5C4A3D] flex items-center gap-2">
            <Sprout size={24} className="text-[#4A7C59]" />
            Seasonal Planner
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Portland, OR (Zone 8b) • {crops.length} crops • {tasks.length} tasks for {selectedYear}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Action Buttons */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#5C4A3D] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Printer size={18} />
            Print
          </button>
          <button
            onClick={() => setIsAddingCrop(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#4A7C59] text-white rounded-lg hover:bg-[#3d6649] transition-colors"
          >
            <Plus size={18} />
            Add Crop
          </button>
          
          {/* Year Selector */}
          <div className="flex items-center gap-1 ml-2 border-l pl-4 border-gray-200">
            <button
              onClick={() => setSelectedYear(y => y - 1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-lg font-bold text-[#5C4A3D] min-w-[60px] text-center">
              {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear(y => y + 1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Print Header - Only visible when printing */}
      <div className="hidden print-only mb-6">
        <h1 className="text-2xl font-serif font-bold text-[#5C4A3D]">
          🌱 Heritage Orchard - {selectedYear} Seasonal Planner
        </h1>
        <p className="text-sm text-gray-500">Portland, OR (Zone 8b) • Printed: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl border border-[#E5DDD3] overflow-hidden">
        {/* Month Headers */}
        <div className="grid grid-cols-12 border-b border-[#E5DDD3] bg-[#FDF8F3]">
          {MONTH_NAMES.map((month, idx) => (
            <div 
              key={month}
              className={`p-2 text-center text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#E8F0EA] transition-colors ${
                idx === currentMonth ? 'bg-[#E8F0EA] text-[#4A7C59]' : 'text-[#8B7355]'
              }`}
              onClick={() => {
                setExpandedMonth(expandedMonth === idx ? null : idx);
              }}
            >
              {month}
              {monthStats[idx + 1]?.total > 0 && (
                <div className="mt-1 flex justify-center">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    monthStats[idx + 1].completed === monthStats[idx + 1].total
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {monthStats[idx + 1].completed}/{monthStats[idx + 1].total}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Crop Timeline */}
        <div className="p-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar size={14} />
            Growing Calendar
            <span className="ml-auto flex items-center gap-3 font-normal normal-case text-[#8B7355] text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: PHASE_COLORS_SOLID.seedStart }}></span> Start Indoors</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: PHASE_COLORS_SOLID.transplant }}></span> Transplant</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: PHASE_COLORS_SOLID.directSow }}></span> Direct Sow</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: PHASE_COLORS_SOLID.harvest }}></span> Harvest</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: PHASE_COLORS_SOLID.peak }}></span> Peak</span>
            </span>
          </div>

          <div className="space-y-1">
            {sortCropsByUrgency(crops, currentWeek).map(crop => (
              <CropRow 
                key={crop.id} 
                crop={crop} 
                currentWeek={currentWeek}
                onClick={() => setSelectedCrop(crop)}
                onEdit={() => setEditingCrop(crop)}
                onDelete={() => setDeletingCrop(crop)}
              />
            ))}
          </div>

          {/* Current Week Indicator */}
          <div className="mt-4 pt-4 border-t border-[#E5DDD3]">
            <div className="flex items-center gap-2 text-sm text-[#4A7C59]">
              <Sun size={16} />
              <span>Current: Week {currentWeek} ({weekToDate(currentWeek)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-xl border border-[#E5DDD3] overflow-hidden">
        <div className="p-4 border-b border-[#E5DDD3] bg-[#FDF8F3]">
          <h3 className="font-serif font-bold text-[#5C4A3D] flex items-center gap-2">
            <Check size={18} className="text-[#4A7C59]" />
            Production Tasks - {selectedYear}
          </h3>
        </div>
        
        <div className="divide-y divide-[#E5DDD3]">
          {Array.from({ length: 12 }, (_, i) => i).map(monthIdx => {
            const monthTasks = tasksByMonth[monthIdx + 1] || [];
            const isExpanded = expandedMonth === monthIdx;
            const stats = monthStats[monthIdx + 1];
            const isCurrentMonth = monthIdx === currentMonth;

            return (
              <div key={monthIdx} className={isCurrentMonth ? 'bg-[#FDF8F3]' : ''}>
                <button
                  onClick={() => setExpandedMonth(isExpanded ? null : monthIdx)}
                  className="w-full p-3 flex items-center justify-between hover:bg-[#FDF8F3] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-medium ${isCurrentMonth ? 'text-[#4A7C59]' : 'text-[#5C4A3D]'}`}>
                      {MONTH_FULL_NAMES[monthIdx]}
                    </span>
                    {isCurrentMonth && (
                      <span className="text-xs bg-[#4A7C59] text-white px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {stats.total > 0 && (
                      <span className={`text-sm ${
                        stats.completed === stats.total ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {stats.completed}/{stats.total} done
                      </span>
                    )}
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    {monthTasks.length === 0 ? (
                      <p className="text-sm text-gray-400 italic py-2">No tasks for this month</p>
                    ) : (
                      <div className="space-y-2">
                        {monthTasks.map(task => (
                          <div 
                            key={task.id}
                            className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                              task.isCompleted ? 'bg-green-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <button
                              onClick={() => toggleTask(task.id, task.isCompleted)}
                              className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                task.isCompleted 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-gray-300 hover:border-[#4A7C59]'
                              }`}
                            >
                              {task.isCompleted && <Check size={14} />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${task.isCompleted ? 'text-gray-400 line-through' : 'text-[#5C4A3D]'}`}>
                                {task.title}
                              </p>
                              {task.weekOfMonth && (
                                <p className="text-xs text-gray-400">Week {task.weekOfMonth}</p>
                              )}
                              {task.notes && (
                                <p className="text-xs text-gray-400 mt-1">{task.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Crops active this month */}
                    <div className="mt-4 pt-3 border-t border-[#E5DDD3]">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Active This Month
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {getCropsForMonth(monthIdx).map(crop => (
                          <button
                            key={crop.id}
                            onClick={() => setSelectedCrop(crop)}
                            className="text-xs px-2 py-1 rounded-full border transition-colors hover:bg-[#E8F0EA]"
                            style={{ borderColor: crop.color, color: crop.color }}
                          >
                            {crop.name}
                          </button>
                        ))}
                        {getCropsForMonth(monthIdx).length === 0 && (
                          <span className="text-xs text-gray-400 italic">No active crops</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Crop Detail Modal */}
      {selectedCrop && (
        <CropDetailModal 
          crop={selectedCrop} 
          onClose={() => setSelectedCrop(null)}
          onEdit={() => {
            setEditingCrop(selectedCrop);
            setSelectedCrop(null);
          }}
        />
      )}

      {/* Crop Form Modal (Add/Edit) */}
      {(isAddingCrop || editingCrop) && (
        <CropFormModal
          crop={editingCrop}
          onClose={() => {
            setIsAddingCrop(false);
            setEditingCrop(null);
          }}
          onSave={handleSaveCrop}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingCrop && (
        <DeleteCropModal
          crop={deletingCrop}
          onClose={() => setDeletingCrop(null)}
          onConfirm={() => handleDeleteCrop(deletingCrop.id)}
        />
      )}
    </div>
  );
}

// Crop Row Component for the timeline
function CropRow({ crop, currentWeek, onClick, onEdit, onDelete }: { 
  crop: Crop; 
  currentWeek: number; 
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const weeks = 52;
  const monthWidth = 100 / 12;

  // Calculate positions as percentages
  const getWeekPosition = (week: number) => ((week - 1) / weeks) * 100;
  const getWeekWidth = (start: number, end: number) => ((end - start + 1) / weeks) * 100;

  return (
    <div 
      className="flex items-center gap-2 py-1 cursor-pointer hover:bg-[#FDF8F3] rounded px-2 -mx-2 transition-colors group"
      onClick={onClick}
    >
      {/* Crop Name */}
      <div className="w-28 flex-shrink-0 flex items-center gap-1">
        <span className="text-sm font-medium text-[#5C4A3D] group-hover:text-[#4A7C59] transition-colors">
          {crop.name}
        </span>
        <span className="text-[10px] text-gray-400">
          {crop.type === 'PERENNIAL' ? '🌳' : crop.type === 'BIENNIAL' ? '🌿' : '🌱'}
        </span>
        {/* Edit/Delete buttons - visible on hover */}
        <div className="hidden group-hover:flex items-center gap-0.5 ml-auto no-print">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1 hover:bg-white rounded text-gray-400 hover:text-[#4A7C59]"
            title="Edit crop"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 hover:bg-white rounded text-gray-400 hover:text-red-500"
            title="Delete crop"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Timeline Bar */}
      <div className="flex-1 h-6 bg-gray-50 rounded relative overflow-hidden">
        {/* Month grid lines */}
        {Array.from({ length: 11 }, (_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-gray-200"
            style={{ left: `${(i + 1) * monthWidth}%` }}
          />
        ))}

        {/* Current week indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#4A7C59] z-20"
          style={{ left: `${getWeekPosition(currentWeek)}%` }}
        />

        {/* Start Indoors phase (seed starting) - only for crops that need transplanting */}
        {crop.seedStartWeek && (
          <div
            className="absolute top-1 h-4 rounded-sm"
            style={{
              left: `${getWeekPosition(crop.seedStartWeek)}%`,
              width: `${Math.max(getWeekWidth(crop.seedStartWeek, crop.seedStartWeek + 3), 2)}%`,
              backgroundColor: PHASE_COLORS.seedStart,
            }}
            title={`Start Indoors: ${weekToDate(crop.seedStartWeek)}`}
          />
        )}

        {/* Transplant phase - for crops started indoors */}
        {crop.plantOutWeekStart && crop.plantOutWeekEnd && crop.seedStartWeek && !crop.directSow && (
          <div
            className="absolute top-1 h-4 rounded-sm"
            style={{
              left: `${getWeekPosition(crop.plantOutWeekStart)}%`,
              width: `${getWeekWidth(crop.plantOutWeekStart, crop.plantOutWeekEnd)}%`,
              backgroundColor: PHASE_COLORS.transplant,
            }}
            title={`Transplant: ${weekToDate(crop.plantOutWeekStart)} - ${weekToDate(crop.plantOutWeekEnd)}`}
          />
        )}

        {/* Direct Sow phase - for crops sown directly outside */}
        {crop.plantOutWeekStart && crop.plantOutWeekEnd && crop.directSow && (
          <div
            className="absolute top-1 h-4 rounded-sm"
            style={{
              left: `${getWeekPosition(crop.plantOutWeekStart)}%`,
              width: `${getWeekWidth(crop.plantOutWeekStart, crop.plantOutWeekEnd)}%`,
              backgroundColor: PHASE_COLORS.directSow,
            }}
            title={`Direct Sow: ${weekToDate(crop.plantOutWeekStart)} - ${weekToDate(crop.plantOutWeekEnd)}`}
          />
        )}

        {/* Transplant phase - for crops that CAN be transplanted (have seedStart but also allow direct sow) */}
        {crop.plantOutWeekStart && crop.plantOutWeekEnd && crop.seedStartWeek && crop.directSow && (
          <div
            className="absolute top-1 h-4 rounded-sm"
            style={{
              left: `${getWeekPosition(crop.plantOutWeekStart)}%`,
              width: `${getWeekWidth(crop.plantOutWeekStart, crop.plantOutWeekEnd)}%`,
              background: `linear-gradient(90deg, ${PHASE_COLORS.transplant} 50%, ${PHASE_COLORS.directSow} 50%)`,
            }}
            title={`Transplant or Direct Sow: ${weekToDate(crop.plantOutWeekStart)} - ${weekToDate(crop.plantOutWeekEnd)}`}
          />
        )}

        {/* Harvest phase - warm amber for all crops */}
        <div
          className="absolute top-1 h-4 rounded-sm"
          style={{
            left: `${getWeekPosition(crop.harvestStart)}%`,
            width: `${getWeekWidth(crop.harvestStart, crop.harvestEnd)}%`,
            backgroundColor: PHASE_COLORS.harvest,
          }}
          title={`Harvest: ${weekToDate(crop.harvestStart)} - ${weekToDate(crop.harvestEnd)}`}
        />

        {/* Peak Season highlight - terracotta overlay */}
        {crop.peakStart && crop.peakEnd && (
          <div
            className="absolute top-1 h-4 rounded-sm"
            style={{
              left: `${getWeekPosition(crop.peakStart)}%`,
              width: `${getWeekWidth(crop.peakStart, crop.peakEnd)}%`,
              backgroundColor: PHASE_COLORS.peak,
            }}
            title={`Peak Season: ${weekToDate(crop.peakStart)} - ${weekToDate(crop.peakEnd)}`}
          />
        )}
      </div>
    </div>
  );
}

// Crop Detail Modal
function CropDetailModal({ crop, onClose, onEdit }: { crop: Crop; onClose: () => void; onEdit: () => void }) {
  const [fullCrop, setFullCrop] = useState<Crop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCropDetails();
  }, [crop.id]);

  const fetchCropDetails = async () => {
    try {
      const res = await fetch(`/api/admin/crops/${crop.id}`);
      if (res.ok) {
        const data = await res.json();
        setFullCrop(data);
      }
    } catch (error) {
      console.error('Failed to fetch crop details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayCrop = fullCrop || crop;
  const recipes = displayCrop.ingredient?.recipeIngredients?.map(ri => ri.recipe) || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5DDD3] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${displayCrop.color}20` }}
            >
              <Apple size={20} style={{ color: displayCrop.color }} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#5C4A3D]">{displayCrop.name}</h3>
              <p className="text-xs text-gray-500">{displayCrop.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#4A7C59]"
              title="Edit crop"
            >
              <Edit3 size={18} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Growing Calendar */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar size={14} />
              Growing Calendar
            </h4>
            
            <div className="space-y-2 text-sm">
              {displayCrop.seedStartWeek && (
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: PHASE_COLORS_SOLID.seedStart }}></span>
                  <span className="text-[#8B7355]">Start Indoors:</span>
                  <span className="font-medium text-[#5C4A3D]">{weekToDate(displayCrop.seedStartWeek)}</span>
                  {displayCrop.seedStartNotes && (
                    <span className="text-[#8B7355] text-xs">({displayCrop.seedStartNotes})</span>
                  )}
                </div>
              )}
              
              {displayCrop.plantOutWeekStart && displayCrop.plantOutWeekEnd && displayCrop.seedStartWeek && !displayCrop.directSow && (
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: PHASE_COLORS_SOLID.transplant }}></span>
                  <span className="text-[#8B7355]">Transplant:</span>
                  <span className="font-medium text-[#5C4A3D]">
                    {weekToDate(displayCrop.plantOutWeekStart)} - {weekToDate(displayCrop.plantOutWeekEnd)}
                  </span>
                </div>
              )}
              
              {displayCrop.plantOutWeekStart && displayCrop.plantOutWeekEnd && displayCrop.directSow && !displayCrop.seedStartWeek && (
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: PHASE_COLORS_SOLID.directSow }}></span>
                  <span className="text-[#8B7355]">Direct Sow:</span>
                  <span className="font-medium text-[#5C4A3D]">
                    {weekToDate(displayCrop.plantOutWeekStart)} - {weekToDate(displayCrop.plantOutWeekEnd)}
                  </span>
                </div>
              )}
              
              {displayCrop.plantOutWeekStart && displayCrop.plantOutWeekEnd && displayCrop.seedStartWeek && displayCrop.directSow && (
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded" style={{ background: `linear-gradient(90deg, ${PHASE_COLORS_SOLID.transplant} 50%, ${PHASE_COLORS_SOLID.directSow} 50%)` }}></span>
                  <span className="text-[#8B7355]">Transplant or Direct Sow:</span>
                  <span className="font-medium text-[#5C4A3D]">
                    {weekToDate(displayCrop.plantOutWeekStart)} - {weekToDate(displayCrop.plantOutWeekEnd)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: PHASE_COLORS_SOLID.harvest }}></span>
                <span className="text-[#8B7355]">Harvest:</span>
                <span className="font-medium text-[#5C4A3D]">
                  {weekToDate(displayCrop.harvestStart)} - {weekToDate(displayCrop.harvestEnd)}
                </span>
              </div>
              
              {displayCrop.peakStart && displayCrop.peakEnd && (
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: PHASE_COLORS_SOLID.peak }}></span>
                  <span className="text-[#8B7355]">Peak Season:</span>
                  <span className="font-medium" style={{ color: PHASE_COLORS_SOLID.peak }}>
                    {weekToDate(displayCrop.peakStart)} - {weekToDate(displayCrop.peakEnd)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {displayCrop.notes && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notes</h4>
              <p className="text-sm text-gray-600 bg-[#FDF8F3] p-3 rounded-lg">{displayCrop.notes}</p>
            </div>
          )}

          {/* Linked Ingredient */}
          {displayCrop.ingredient && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Leaf size={14} className="text-green-500" />
                Linked Ingredient
              </h4>
              <p className="text-sm text-gray-600">
                {displayCrop.ingredient.name} 
                <span className="text-green-600 ml-2">🌱 From Garden ($0)</span>
              </p>
            </div>
          )}

          {/* Recipes */}
          {recipes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Package size={14} />
                Recipes Using This Ingredient
              </h4>
              <div className="space-y-2">
                {recipes.map(recipe => (
                  <div 
                    key={recipe.id}
                    className="flex items-center justify-between p-3 bg-[#FDF8F3] rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-[#5C4A3D]">{recipe.name}</p>
                      <p className="text-xs text-gray-500">
                        Retail: ${recipe.retailPrice.toFixed(2)}
                      </p>
                    </div>
                    {recipe.product ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                        <Check size={12} />
                        Published
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Not published</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Color options for crops
const CROP_COLORS = [
  { name: 'Red', value: '#C41E3A' },
  { name: 'Tomato', value: '#E74C3C' },
  { name: 'Orange', value: '#F39C12' },
  { name: 'Green', value: '#27AE60' },
  { name: 'Teal', value: '#16A085' },
  { name: 'Blue', value: '#3498DB' },
  { name: 'Purple', value: '#9B59B6' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Forest', value: '#4A7C59' },
  { name: 'Brown', value: '#8B4513' },
];

// Month helpers for simplified form
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthToWeek = (month: number) => Math.floor(month * 4.33) + 1;
const weekToMonthIndex = (week: number) => Math.min(11, Math.floor((week - 1) / 4.33));

// Quick pick presets for Portland (Zone 8b)
const QUICK_PICKS = [
  { name: 'Tomatoes', type: 'ANNUAL' as const, seedStart: 1, plantStart: 4, plantEnd: 5, harvestStart: 6, harvestEnd: 9, peakStart: 7, peakEnd: 8, color: '#E74C3C' },
  { name: 'Peppers', type: 'ANNUAL' as const, seedStart: 1, plantStart: 4, plantEnd: 5, harvestStart: 7, harvestEnd: 9, peakStart: 7, peakEnd: 8, color: '#F39C12' },
  { name: 'Cucumbers', type: 'ANNUAL' as const, seedStart: 3, plantStart: 4, plantEnd: 5, harvestStart: 5, harvestEnd: 8, color: '#27AE60' },
  { name: 'Zucchini', type: 'ANNUAL' as const, seedStart: 3, plantStart: 4, plantEnd: 5, harvestStart: 5, harvestEnd: 9, color: '#27AE60' },
  { name: 'Lettuce', type: 'ANNUAL' as const, plantStart: 2, plantEnd: 4, harvestStart: 3, harvestEnd: 5, directSow: true, color: '#27AE60' },
  { name: 'Strawberries', type: 'PERENNIAL' as const, harvestStart: 4, harvestEnd: 8, peakStart: 5, peakEnd: 6, color: '#E74C3C' },
];

// Crop Form Modal Component - Simplified with Progressive Disclosure
interface CropFormModalProps {
  crop: Crop | null;
  onClose: () => void;
  onSave: (data: Partial<Crop>) => void;
}

function CropFormModal({ crop, onClose, onSave }: CropFormModalProps) {
  // Basic fields (always visible)
  const [name, setName] = useState(crop?.name || '');
  const [type, setType] = useState<'ANNUAL' | 'PERENNIAL' | 'BIENNIAL'>(crop?.type || 'ANNUAL');
  const [harvestStartMonth, setHarvestStartMonth] = useState(crop ? weekToMonthIndex(crop.harvestStart) : 5);
  const [harvestEndMonth, setHarvestEndMonth] = useState(crop ? weekToMonthIndex(crop.harvestEnd) : 9);
  
  // Advanced fields (collapsed by default)
  const [showAdvanced, setShowAdvanced] = useState(!!crop); // Expand if editing
  const [seedStartMonth, setSeedStartMonth] = useState<number | null>(crop?.seedStartWeek ? weekToMonthIndex(crop.seedStartWeek) : null);
  const [plantStartMonth, setPlantStartMonth] = useState<number | null>(crop?.plantOutWeekStart ? weekToMonthIndex(crop.plantOutWeekStart) : null);
  const [plantEndMonth, setPlantEndMonth] = useState<number | null>(crop?.plantOutWeekEnd ? weekToMonthIndex(crop.plantOutWeekEnd) : null);
  const [directSow, setDirectSow] = useState(crop?.directSow || false);
  const [peakStartMonth, setPeakStartMonth] = useState<number | null>(crop?.peakStart ? weekToMonthIndex(crop.peakStart) : null);
  const [peakEndMonth, setPeakEndMonth] = useState<number | null>(crop?.peakEnd ? weekToMonthIndex(crop.peakEnd) : null);
  const [notes, setNotes] = useState(crop?.notes || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const isPerennial = type === 'PERENNIAL';

  // Apply quick pick preset
  const applyQuickPick = (preset: typeof QUICK_PICKS[0]) => {
    setName(preset.name);
    setType(preset.type);
    setHarvestStartMonth(preset.harvestStart);
    setHarvestEndMonth(preset.harvestEnd);
    if (preset.seedStart !== undefined) setSeedStartMonth(preset.seedStart);
    if (preset.plantStart !== undefined) setPlantStartMonth(preset.plantStart);
    if (preset.plantEnd !== undefined) setPlantEndMonth(preset.plantEnd);
    if (preset.peakStart !== undefined) setPeakStartMonth(preset.peakStart);
    if (preset.peakEnd !== undefined) setPeakEndMonth(preset.peakEnd);
    if (preset.directSow) setDirectSow(preset.directSow);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    await onSave({
      name,
      type,
      seedStartWeek: isPerennial ? null : (seedStartMonth !== null ? monthToWeek(seedStartMonth) : null),
      seedStartNotes: null,
      plantOutWeekStart: isPerennial ? null : (plantStartMonth !== null ? monthToWeek(plantStartMonth) : null),
      plantOutWeekEnd: isPerennial ? null : (plantEndMonth !== null ? monthToWeek(plantEndMonth) : null),
      directSow: isPerennial ? false : directSow,
      harvestStart: monthToWeek(harvestStartMonth),
      harvestEnd: monthToWeek(harvestEndMonth) + 3, // End of month
      peakStart: peakStartMonth !== null ? monthToWeek(peakStartMonth) : null,
      peakEnd: peakEndMonth !== null ? monthToWeek(peakEndMonth) + 3 : null,
      color: crop?.color || '#4A7C59', // Keep existing color or use brand green
      notes: notes || null,
    });
    
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5DDD3] p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E8F0EA] rounded-lg text-[#4A7C59]">
              <Sprout size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#5C4A3D]">
              {crop ? 'Edit Crop' : 'Add Crop'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Quick Picks (only for new crops) */}
          {!crop && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Quick add (Portland timing):</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PICKS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyQuickPick(preset)}
                    className="px-2.5 py-1 text-xs bg-[#FDF8F3] hover:bg-[#E8F0EA] text-[#5C4A3D] rounded-full transition-colors border border-[#E5DDD3]"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What are you growing?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] text-base"
              placeholder="e.g., Strawberries"
              autoFocus
            />
          </div>

          {/* Type - Simplified */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Type:</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'ANNUAL' | 'PERENNIAL' | 'BIENNIAL')}
              className="px-3 py-1.5 border border-[#E5DDD3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59]"
            >
              <option value="ANNUAL">🌱 Annual</option>
              <option value="PERENNIAL">🌳 Perennial</option>
              <option value="BIENNIAL">🌿 Biennial</option>
            </select>
          </div>

          {/* Harvest - Month Pickers */}
          <div className="bg-[#FDF8F3] rounded-xl p-4">
            <label className="block text-sm font-medium text-[#5C4A3D] mb-3">
              When can you harvest?
            </label>
            <div className="flex items-center gap-3">
              <select
                value={harvestStartMonth}
                onChange={(e) => setHarvestStartMonth(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border border-[#E5DDD3] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59]"
              >
                {MONTHS.map((month, idx) => (
                  <option key={idx} value={idx}>{month}</option>
                ))}
              </select>
              <span className="text-gray-400">to</span>
              <select
                value={harvestEndMonth}
                onChange={(e) => setHarvestEndMonth(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border border-[#E5DDD3] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59]"
              >
                {MONTHS.map((month, idx) => (
                  <option key={idx} value={idx}>{month}</option>
                ))}
              </select>
            </div>
            
            {/* Visual preview */}
            <div className="mt-3 flex gap-0.5">
              {MONTHS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 flex-1 rounded-sm transition-colors ${
                    idx >= harvestStartMonth && idx <= harvestEndMonth
                      ? ''
                      : 'bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: idx >= harvestStartMonth && idx <= harvestEndMonth ? PHASE_COLORS_SOLID.harvest : undefined
                  }}
                  title={MONTHS[idx]}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Jan</span>
              <span>Dec</span>
            </div>
          </div>

          {/* Advanced Options - Collapsible */}
          <div className="border-t border-[#E5DDD3] pt-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#4A7C59] transition-colors w-full"
            >
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showAdvanced ? 'Hide' : 'Show'} advanced options
              <span className="text-xs text-gray-400">(planting, peak season, notes)</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                {/* Planting (not for perennials) */}
                {!isPerennial && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-amber-800 mb-2">🌱 Planting Schedule</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-24">Start seeds:</span>
                        <select
                          value={seedStartMonth ?? ''}
                          onChange={(e) => setSeedStartMonth(e.target.value ? parseInt(e.target.value) : null)}
                          className="flex-1 px-2 py-1 text-sm border border-amber-200 rounded bg-white"
                        >
                          <option value="">Not needed</option>
                          {MONTHS.slice(0, 6).map((month, idx) => (
                            <option key={idx} value={idx}>{month}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-24">Plant outside:</span>
                        <select
                          value={plantStartMonth ?? ''}
                          onChange={(e) => setPlantStartMonth(e.target.value ? parseInt(e.target.value) : null)}
                          className="flex-1 px-2 py-1 text-sm border border-amber-200 rounded bg-white"
                        >
                          <option value="">Select</option>
                          {MONTHS.slice(2, 8).map((month, idx) => (
                            <option key={idx + 2} value={idx + 2}>{month}</option>
                          ))}
                        </select>
                        <span className="text-xs text-gray-400">to</span>
                        <select
                          value={plantEndMonth ?? ''}
                          onChange={(e) => setPlantEndMonth(e.target.value ? parseInt(e.target.value) : null)}
                          className="flex-1 px-2 py-1 text-sm border border-amber-200 rounded bg-white"
                        >
                          <option value="">Select</option>
                          {MONTHS.slice(3, 9).map((month, idx) => (
                            <option key={idx + 3} value={idx + 3}>{month}</option>
                          ))}
                        </select>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={directSow}
                          onChange={(e) => setDirectSow(e.target.checked)}
                          className="w-3.5 h-3.5 text-amber-600 rounded"
                        />
                        <span className="text-xs text-gray-600">Can direct sow outdoors</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Peak Season */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Peak season:</span>
                  <select
                    value={peakStartMonth ?? ''}
                    onChange={(e) => setPeakStartMonth(e.target.value ? parseInt(e.target.value) : null)}
                    className="px-2 py-1 text-sm border border-[#E5DDD3] rounded"
                  >
                    <option value="">None</option>
                    {MONTHS.map((month, idx) => (
                      <option key={idx} value={idx}>{month}</option>
                    ))}
                  </select>
                  {peakStartMonth !== null && (
                    <>
                      <span className="text-xs text-gray-400">to</span>
                      <select
                        value={peakEndMonth ?? ''}
                        onChange={(e) => setPeakEndMonth(e.target.value ? parseInt(e.target.value) : null)}
                        className="px-2 py-1 text-sm border border-[#E5DDD3] rounded"
                      >
                        {MONTHS.map((month, idx) => (
                          <option key={idx} value={idx}>{month}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-[#E5DDD3] rounded-lg resize-none"
                    placeholder="Growing tips, variety info..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex-1 px-4 py-2.5 bg-[#4A7C59] text-white rounded-lg hover:bg-[#3d6549] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                crop ? 'Save Changes' : 'Add Crop'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteCropModal({ crop, onClose, onConfirm }: { crop: Crop; onClose: () => void; onConfirm: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg text-red-600">
            <Trash2 size={20} />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#5C4A3D]">Delete Crop</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{crop.name}</strong>? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

