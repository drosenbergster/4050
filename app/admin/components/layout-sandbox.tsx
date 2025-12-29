'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Group, Text } from 'react-konva';
import Konva from 'konva';
import {
  Plus,
  Trash2,
  RotateCw,
  Save,
  Printer,
  Download,
  ChevronDown,
  X,
  Move,
  Grid3X3,
  Minimize2,
  Edit3,
  Copy,
  Search,
} from 'lucide-react';
import type { GardenLayout, GardenCanvasData, GardenBed, PlacedPlant } from '@/lib/types';

// Simplified Crop interface matching what garden-planner passes
interface Crop {
  id: string;
  name: string;
  color: string;
  spacingInches: number | null;
  yieldPerUnit: number | null;
  yieldUnit: string;
}

// Constants
const GRID_SPACING = 12; // 12" grid
const DEFAULT_BED_WIDTH = 48; // 4ft
const DEFAULT_BED_HEIGHT = 96; // 8ft
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;

// Snap to grid helper
const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SPACING) * GRID_SPACING;
};

// Colors
const COLORS = {
  bedFill: 'rgba(139, 115, 85, 0.25)', // Light, see-through brown
  bedStroke: 'rgba(92, 74, 61, 0.6)',
  gridDot: '#E5DDD3',
  canvas: '#FDF8F3',
  selected: '#4A7C59',
  overlap: 'rgba(220, 38, 38, 0.3)',
};

interface LayoutSandboxProps {
  crops: Crop[];
}

export default function LayoutSandbox({ crops }: LayoutSandboxProps) {
  // Layout management
  const [layouts, setLayouts] = useState<GardenLayout[]>([]);
  const [currentLayoutId, setCurrentLayoutId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Canvas state
  const [beds, setBeds] = useState<GardenBed[]>([]);
  const [plants, setPlants] = useState<PlacedPlant[]>([]);
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.8);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [canvasWidth, setCanvasWidth] = useState(600); // 50ft default
  const [canvasHeight, setCanvasHeight] = useState(600); // 50ft default

  // UI state
  const [showLayoutDropdown, setShowLayoutDropdown] = useState(false);
  const [showNewLayoutModal, setShowNewLayoutModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGardenSettings, setShowGardenSettings] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [editingBed, setEditingBed] = useState<GardenBed | null>(null);
  const [cropSearch, setCropSearch] = useState('');
  const [showAddBedModal, setShowAddBedModal] = useState(false);
  const [selectedCropToPlace, setSelectedCropToPlace] = useState<Crop | null>(null);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'canvas' | 'bed' | 'plant';
    targetId?: string;
    canvasX?: number;
    canvasY?: number;
  } | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track container dimensions to prevent jumping
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 });

  // Fetch layouts on mount
  useEffect(() => {
    fetchLayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Track container size changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateDimensions = () => {
      setContainerDimensions({
        width: container.clientWidth || 800,
        height: container.clientHeight || 600,
      });
    };
    
    // Set initial dimensions
    updateDimensions();
    
    // Use ResizeObserver for efficient tracking
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);
    
    return () => resizeObserver.disconnect();
  }, []);

  const fetchLayouts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/layouts');
      if (res.ok) {
        const data = await res.json();
        setLayouts(data);
        if (data.length > 0 && !currentLayoutId) {
          loadLayout(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch layouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLayout = (layout: GardenLayout) => {
    setCurrentLayoutId(layout.id);
    const canvas = layout.canvasData as GardenCanvasData;
    setBeds(canvas.beds || []);
    setPlants(canvas.plants || []);
    setCanvasWidth(canvas.width || 600);
    setCanvasHeight(canvas.height || 600);
    setSelectedBedId(null);
    setSelectedPlantId(null);
    setHasUnsavedChanges(false);
  };

  const saveLayout = async () => {
    if (!currentLayoutId) return;
    
    setIsSaving(true);
    try {
      const canvasData: GardenCanvasData = { 
        beds, 
        plants,
        width: canvasWidth,
        height: canvasHeight 
      };
      const res = await fetch(`/api/admin/layouts/${currentLayoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasData })
      });
      
      if (res.ok) {
        setHasUnsavedChanges(false);
        await fetchLayouts();
      }
    } catch (error) {
      console.error('Failed to save layout:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const createLayout = async () => {
    if (!newLayoutName.trim()) return;
    
    try {
      const res = await fetch('/api/admin/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newLayoutName.trim(),
          canvasData: { beds: [], plants: [] }
        })
      });
      
      if (res.ok) {
        const newLayout = await res.json();
        await fetchLayouts();
        loadLayout(newLayout);
        setShowNewLayoutModal(false);
        setNewLayoutName('');
      }
    } catch (error) {
      console.error('Failed to create layout:', error);
    }
  };

  const renameLayout = async () => {
    if (!currentLayoutId || !newLayoutName.trim()) return;
    
    try {
      const res = await fetch(`/api/admin/layouts/${currentLayoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLayoutName.trim() })
      });
      
      if (res.ok) {
        await fetchLayouts();
        setShowRenameModal(false);
        setNewLayoutName('');
      }
    } catch (error) {
      console.error('Failed to rename layout:', error);
    }
  };

  const deleteLayout = async () => {
    if (!currentLayoutId) return;
    
    try {
      const res = await fetch(`/api/admin/layouts/${currentLayoutId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        const remainingLayouts = layouts.filter(l => l.id !== currentLayoutId);
        setLayouts(remainingLayouts);
        if (remainingLayouts.length > 0) {
          loadLayout(remainingLayouts[0]);
        } else {
          setCurrentLayoutId(null);
          setBeds([]);
          setPlants([]);
        }
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Failed to delete layout:', error);
    }
  };

  // Bed operations
  const addBed = (width?: number, height?: number, atX?: number, atY?: number) => {
    const newBed: GardenBed = {
      id: `bed-${Date.now()}`,
      x: snapToGrid(atX ?? 96), // Start at 8ft from corner or specified position
      y: snapToGrid(atY ?? 96),
      width: width ?? DEFAULT_BED_WIDTH,
      height: height ?? DEFAULT_BED_HEIGHT,
      rotation: 0,
    };
    setBeds([...beds, newBed]);
    setSelectedBedId(newBed.id);
    setHasUnsavedChanges(true);
  };

  const duplicateBed = (id: string) => {
    const bed = beds.find(b => b.id === id);
    if (!bed) return;
    const newBed: GardenBed = {
      ...bed,
      id: `bed-${Date.now()}`,
      x: snapToGrid(bed.x + 24),
      y: snapToGrid(bed.y + 24),
    };
    setBeds([...beds, newBed]);
    setSelectedBedId(newBed.id);
    setHasUnsavedChanges(true);
  };

  const updateBed = (id: string, updates: Partial<GardenBed>) => {
    setBeds(beds.map(bed => 
      bed.id === id ? { ...bed, ...updates } : bed
    ));
    setHasUnsavedChanges(true);
  };

  const rotateBed = (id: string) => {
    const bed = beds.find(b => b.id === id);
    if (!bed) return;
    const newRotation = ((bed.rotation + 90) % 360) as 0 | 90 | 180 | 270;
    updateBed(id, { rotation: newRotation });
  };

  const deleteBed = (id: string) => {
    setBeds(beds.filter(bed => bed.id !== id));
    if (selectedBedId === id) setSelectedBedId(null);
    setHasUnsavedChanges(true);
  };

  // Plant operations
  const addPlant = (cropId: string, x: number, y: number) => {
    const newPlant: PlacedPlant = {
      id: `plant-${Date.now()}`,
      cropId,
      x: snapToGrid(x),
      y: snapToGrid(y),
    };
    setPlants([...plants, newPlant]);
    setHasUnsavedChanges(true);
  };

  const updatePlant = (id: string, updates: Partial<PlacedPlant>) => {
    setPlants(plants.map(plant => 
      plant.id === id ? { ...plant, ...updates } : plant
    ));
    setHasUnsavedChanges(true);
  };

  const deletePlant = (id: string) => {
    setPlants(plants.filter(plant => plant.id !== id));
    if (selectedPlantId === id) setSelectedPlantId(null);
    setHasUnsavedChanges(true);
  };

  const duplicatePlant = (id: string) => {
    const plant = plants.find(p => p.id === id);
    if (!plant) return;
    const newPlant: PlacedPlant = {
      ...plant,
      id: `plant-${Date.now()}`,
      x: snapToGrid(plant.x + GRID_SPACING),
      y: snapToGrid(plant.y),
    };
    setPlants([...plants, newPlant]);
    setSelectedPlantId(newPlant.id);
    setHasUnsavedChanges(true);
  };

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, type: 'canvas' | 'bed' | 'plant', targetId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate canvas position for placing items
    const rect = containerRef.current?.getBoundingClientRect();
    let canvasX = 0, canvasY = 0;
    if (rect) {
      canvasX = (e.clientX - rect.left - position.x) / scale;
      canvasY = (e.clientY - rect.top - position.y) / scale;
    }
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      targetId,
      canvasX,
      canvasY,
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Check for overlapping plants
  const getOverlappingPlants = useCallback(() => {
    const overlapping = new Set<string>();
    
    for (let i = 0; i < plants.length; i++) {
      for (let j = i + 1; j < plants.length; j++) {
        const p1 = plants[i];
        const p2 = plants[j];
        const crop1 = crops.find(c => c.id === p1.cropId);
        const crop2 = crops.find(c => c.id === p2.cropId);
        
        if (!crop1 || !crop2) continue;
        
        const r1 = (crop1.spacingInches || 12) / 2;
        const r2 = (crop2.spacingInches || 12) / 2;
        const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        
        if (distance < r1 + r2) {
          overlapping.add(p1.id);
          overlapping.add(p2.id);
        }
      }
    }
    
    return overlapping;
  }, [plants, crops]);

  // Zoom controls
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));

    setScale(clampedScale);
  };

  const zoomIn = () => setScale(Math.min(MAX_ZOOM, scale * 1.2));
  const zoomOut = () => setScale(Math.max(MIN_ZOOM, scale / 1.2));

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Export as PNG
  const handleExport = () => {
    const stage = stageRef.current;
    if (!stage) return;
    
    const uri = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `garden-layout-${Date.now()}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate summary
  const plantSummary = plants.reduce((acc, plant) => {
    const crop = crops.find(c => c.id === plant.cropId);
    if (!crop) return acc;
    
    if (!acc[crop.id]) {
      acc[crop.id] = {
        crop,
        count: 0,
        expectedYield: 0,
      };
    }
    acc[crop.id].count++;
    acc[crop.id].expectedYield = acc[crop.id].count * (Number(crop.yieldPerUnit) || 0);
    return acc;
  }, {} as Record<string, { crop: Crop; count: number; expectedYield: number }>);

  const overlappingPlants = getOverlappingPlants();
  const currentLayout = layouts.find(l => l.id === currentLayoutId);
  
  // Filter crops by search
  const filteredCrops = crops.filter(crop => 
    crop.name.toLowerCase().includes(cropSearch.toLowerCase())
  );

  // Handle drag from crop palette
  const handleCropDragStart = (e: React.DragEvent, crop: Crop) => {
    e.dataTransfer.setData('cropId', crop.id);
    
    // Create a custom drag image - just the color dot
    const dragEl = document.createElement('div');
    dragEl.style.width = '24px';
    dragEl.style.height = '24px';
    dragEl.style.borderRadius = '50%';
    dragEl.style.backgroundColor = crop.color;
    dragEl.style.border = '3px solid white';
    dragEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    dragEl.style.position = 'absolute';
    dragEl.style.top = '-1000px';
    document.body.appendChild(dragEl);
    e.dataTransfer.setDragImage(dragEl, 12, 12);
    
    // Clean up the element after drag starts
    setTimeout(() => document.body.removeChild(dragEl), 0);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const cropId = e.dataTransfer.getData('cropId');
    if (!cropId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - position.x) / scale;
    const y = (e.clientY - rect.top - position.y) / scale;
    
    addPlant(cropId, x, y);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A7C59]"></div>
      </div>
    );
  }

  // Empty state
  if (layouts.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Grid3X3 size={64} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-serif font-bold text-[#5C4A3D] mb-2">
          No Garden Layouts Yet
        </h3>
        <p className="text-gray-500 mb-6 max-w-md">
          Create your first layout to start planning raised beds and placing crops in your garden.
        </p>
        <button
          onClick={() => setShowNewLayoutModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#4A7C59] text-white rounded-lg hover:bg-[#3d6649] transition-colors"
        >
          <Plus size={20} />
          Create Your First Layout
        </button>
        
        {/* New Layout Modal */}
        {showNewLayoutModal && (
          <NewLayoutModal
            name={newLayoutName}
            setName={setNewLayoutName}
            onCreate={createLayout}
            onClose={() => { setShowNewLayoutModal(false); setNewLayoutName(''); }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        {/* Layout Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Layout:</span>
          <div className="relative">
            <button
              onClick={() => setShowLayoutDropdown(!showLayoutDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5DDD3] rounded-lg hover:bg-gray-50 min-w-[180px]"
            >
              <span className="font-medium text-[#5C4A3D] truncate">
                {currentLayout?.name || 'Select Layout'}
              </span>
              {hasUnsavedChanges && (
                <span className="w-2 h-2 bg-amber-400 rounded-full" title="Unsaved changes" />
              )}
              <ChevronDown size={16} className="ml-auto text-gray-400" />
            </button>
            
            {showLayoutDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#E5DDD3] rounded-lg shadow-lg z-20">
                {layouts.map(layout => (
                  <button
                    key={layout.id}
                    onClick={() => {
                      loadLayout(layout);
                      setShowLayoutDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#FDF8F3] ${
                      layout.id === currentLayoutId ? 'bg-[#E8F0EA]' : ''
                    }`}
                  >
                    {layout.name}
                  </button>
                ))}
                <div className="border-t border-[#E5DDD3]">
                  <button
                    onClick={() => {
                      setShowNewLayoutModal(true);
                      setShowLayoutDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#FDF8F3] text-[#4A7C59] flex items-center gap-2"
                  >
                    <Plus size={16} />
                    New Layout
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => {
              setNewLayoutName(currentLayout?.name || '');
              setShowRenameModal(true);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            title="Rename"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Add Bed Button */}
          <button
            onClick={() => setShowAddBedModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#7a6549] transition-colors"
          >
            <Plus size={16} />
            Add Bed
          </button>
          
          {/* Garden Size */}
          <button
            onClick={() => setShowGardenSettings(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#5C4A3D] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Grid3X3 size={16} />
            {Math.round(canvasWidth / 12)}×{Math.round(canvasHeight / 12)} ft
          </button>
          
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button
            onClick={saveLayout}
            disabled={!hasUnsavedChanges || isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasUnsavedChanges 
                ? 'bg-[#4A7C59] text-white hover:bg-[#3d6649]' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handlePrint}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            title="Print"
          >
            <Printer size={18} />
          </button>
          <button
            onClick={handleExport}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            title="Export PNG"
          >
            <Download size={18} />
          </button>
        </div>
      </div>
      
      {/* Placement Mode Banner */}
      {selectedCropToPlace && (
        <div className="mb-4 px-4 py-3 bg-[#E8F0EA] border border-[#4A7C59]/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span 
              className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: selectedCropToPlace.color }}
            />
            <span className="text-sm text-[#5C4A3D]">
              <strong>Click on the canvas</strong> to place {selectedCropToPlace.name}
            </span>
          </div>
          <button
            onClick={() => setSelectedCropToPlace(null)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 space-y-4 overflow-y-auto">
          {/* Crops Palette - Compact */}
          <div className="bg-white rounded-xl border border-[#E5DDD3] p-3 flex-1 flex flex-col min-h-0">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              🌿 Crops
            </h3>
            
            {/* Search */}
            <div className="relative mb-2">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={cropSearch}
                onChange={(e) => setCropSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59]"
              />
            </div>
            
            {/* Compact Crop List */}
            <div className="flex-1 overflow-y-auto space-y-0.5 min-h-0">
              {filteredCrops.map(crop => {
                const placedCount = plants.filter(p => p.cropId === crop.id).length;
                const isSelected = selectedCropToPlace?.id === crop.id;
                const spacing = crop.spacingInches || 12;
                
                return (
                  <div
                    key={crop.id}
                    draggable
                    onDragStart={(e) => handleCropDragStart(e, crop)}
                    onClick={() => setSelectedCropToPlace(isSelected ? null : crop)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-[#E8F0EA] ring-1 ring-[#4A7C59]' 
                        : 'hover:bg-[#FDF8F3]'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
                      style={{ backgroundColor: crop.color }}
                    />
                    <span className="text-sm text-[#5C4A3D] truncate flex-1">
                      {crop.name}
                      <span className="text-gray-400 font-normal"> · {spacing}&quot;</span>
                    </span>
                    {placedCount > 0 && (
                      <span className="text-[10px] text-[#4A7C59] font-medium bg-[#E8F0EA] px-1.5 py-0.5 rounded-full">
                        {placedCount}
                      </span>
                    )}
                  </div>
                );
              })}
              
              {filteredCrops.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">
                  No crops match &quot;{cropSearch}&quot;
                </p>
              )}
            </div>
            
            <p className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-[#E5DDD3]">
              {selectedCropToPlace ? 'Click canvas to place' : 'Click or drag to place'}
            </p>
          </div>

          {/* Selected Bed Tools - only show when bed selected */}
          {selectedBedId && (
            <div className="bg-white rounded-xl border border-[#E5DDD3] p-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                🛏️ Selected Bed
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => rotateBed(selectedBedId)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                >
                  <RotateCw size={12} /> Rotate
                </button>
                <button
                  onClick={() => deleteBed(selectedBedId)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
              <button
                onClick={() => {
                  const bed = beds.find(b => b.id === selectedBedId);
                  if (bed) setEditingBed(bed);
                }}
                className="w-full mt-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs"
              >
                <Edit3 size={12} /> Edit Size
              </button>
            </div>
          )}

          {/* Summary */}
          {Object.keys(plantSummary).length > 0 && (
            <div className="bg-white rounded-xl border border-[#E5DDD3] p-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                📊 Summary
              </h3>
              <div className="space-y-2">
                {Object.values(plantSummary).map(({ crop, count, expectedYield }) => (
                  <div key={crop.id} className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: crop.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#5C4A3D] truncate">{crop.name}</p>
                      <p className="text-xs text-gray-400">
                        {count} plant{count !== 1 ? 's' : ''}
                        {expectedYield > 0 && ` • ~${expectedYield.toFixed(0)} ${crop.yieldUnit}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Canvas */}
        <div 
          ref={containerRef}
          className="flex-1 bg-white rounded-xl border border-[#E5DDD3] overflow-hidden relative"
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          onContextMenu={(e) => handleContextMenu(e, 'canvas')}
        >
          <Stage
            ref={stageRef}
            width={containerDimensions.width}
            height={containerDimensions.height}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            draggable
            onWheel={handleWheel}
            onDragEnd={(e) => {
              // Only update position when dragging the Stage itself, not child elements
              if (e.target === stageRef.current) {
                setPosition({ x: e.target.x(), y: e.target.y() });
              }
            }}
            onClick={(e) => {
              // Handle crop placement mode
              if (selectedCropToPlace && e.target === e.target.getStage()) {
                const stage = stageRef.current;
                if (stage) {
                  const pointer = stage.getPointerPosition();
                  if (pointer) {
                    const x = (pointer.x - position.x) / scale;
                    const y = (pointer.y - position.y) / scale;
                    addPlant(selectedCropToPlace.id, x, y);
                  }
                }
                return;
              }
              
              // Deselect when clicking on empty canvas
              if (e.target === e.target.getStage()) {
                setSelectedBedId(null);
                setSelectedPlantId(null);
              }
              closeContextMenu();
            }}
          >
            <Layer>
              {/* Background */}
              <Rect
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fill={COLORS.canvas}
              />
              
              {/* Grid Dots */}
              {Array.from({ length: Math.floor(canvasWidth / GRID_SPACING) + 1 }).map((_, i) =>
                Array.from({ length: Math.floor(canvasHeight / GRID_SPACING) + 1 }).map((_, j) => (
                  <Circle
                    key={`dot-${i}-${j}`}
                    x={i * GRID_SPACING}
                    y={j * GRID_SPACING}
                    radius={1}
                    fill={COLORS.gridDot}
                  />
                ))
              )}

              {/* Beds */}
              {beds.map(bed => (
                <Group
                  key={bed.id}
                  x={bed.x}
                  y={bed.y}
                  rotation={bed.rotation}
                  draggable
                  onClick={() => {
                    setSelectedBedId(bed.id);
                    setSelectedPlantId(null);
                  }}
                  onContextMenu={(e) => {
                    e.evt.preventDefault();
                    const stage = stageRef.current;
                    if (!stage) return;
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    setContextMenu({
                      x: e.evt.clientX,
                      y: e.evt.clientY,
                      type: 'bed',
                      targetId: bed.id,
                    });
                    setSelectedBedId(bed.id);
                  }}
                  onDragEnd={(e) => {
                    const snappedX = snapToGrid(e.target.x());
                    const snappedY = snapToGrid(e.target.y());
                    e.target.x(snappedX);
                    e.target.y(snappedY);
                    updateBed(bed.id, { x: snappedX, y: snappedY });
                  }}
                >
                  <Rect
                    width={bed.width}
                    height={bed.height}
                    fill={COLORS.bedFill}
                    stroke={selectedBedId === bed.id ? COLORS.selected : COLORS.bedStroke}
                    strokeWidth={selectedBedId === bed.id ? 3 : 2}
                    cornerRadius={4}
                    offsetX={bed.width / 2}
                    offsetY={bed.height / 2}
                  />
                </Group>
              ))}

              {/* Plants */}
              {plants.map(plant => {
                const crop = crops.find(c => c.id === plant.cropId);
                if (!crop) return null;
                
                const spacing = crop.spacingInches || 12;
                const isOverlapping = overlappingPlants.has(plant.id);
                const isSelected = selectedPlantId === plant.id;
                const firstLetter = crop.name.charAt(0).toUpperCase();
                
                return (
                  <Group
                    key={plant.id}
                    x={plant.x}
                    y={plant.y}
                    draggable
                    onClick={() => {
                      setSelectedPlantId(plant.id);
                      setSelectedBedId(null);
                    }}
                    onContextMenu={(e) => {
                      e.evt.preventDefault();
                      setContextMenu({
                        x: e.evt.clientX,
                        y: e.evt.clientY,
                        type: 'plant',
                        targetId: plant.id,
                      });
                      setSelectedPlantId(plant.id);
                    }}
                    onDragEnd={(e) => {
                      const snappedX = snapToGrid(e.target.x());
                      const snappedY = snapToGrid(e.target.y());
                      e.target.x(snappedX);
                      e.target.y(snappedY);
                      updatePlant(plant.id, { x: snappedX, y: snappedY });
                    }}
                  >
                    {/* Spacing circle */}
                    <Circle
                      radius={spacing / 2}
                      fill={isOverlapping ? COLORS.overlap : `${crop.color}20`}
                      stroke={isSelected ? COLORS.selected : crop.color}
                      strokeWidth={isSelected ? 2 : 1}
                      opacity={0.5}
                    />
                    {/* Plant dot with letter */}
                    <Circle
                      radius={8}
                      fill={crop.color}
                      stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.5)'}
                      strokeWidth={isSelected ? 3 : 2}
                    />
                    {/* First letter of crop name */}
                    <Text
                      text={firstLetter}
                      fontSize={10}
                      fontStyle="bold"
                      fill="white"
                      align="center"
                      verticalAlign="middle"
                      offsetX={3}
                      offsetY={5}
                    />
                  </Group>
                );
              })}
            </Layer>
          </Stage>

              {/* Zoom Controls Overlay */}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-lg shadow-sm border border-[#E5DDD3] flex flex-col items-center">
                <button 
                  onClick={zoomIn} 
                  className="p-2 hover:bg-gray-100 rounded-t-lg border-b border-[#E5DDD3] transition-colors"
                  title="Zoom in"
                >
                  <Plus size={16} className="text-gray-600" />
                </button>
                <div className="px-2 py-1 text-xs text-gray-500 font-medium">
                  {Math.round(scale * 100)}%
                </div>
                <button 
                  onClick={zoomOut} 
                  className="p-2 hover:bg-gray-100 rounded-b-lg border-t border-[#E5DDD3] transition-colors"
                  title="Zoom out"
                >
                  <Minimize2 size={16} className="text-gray-600" />
                </button>
              </div>

              {/* Canvas Legend */}
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur rounded-lg px-3 py-2 text-xs text-gray-500 flex items-center gap-3">
                <span>1ft grid</span>
                <span className="text-gray-300">|</span>
                <Move size={12} className="text-gray-400" />
                <span>Drag to pan</span>
              </div>

          {/* Selected Plant Actions */}
          {selectedPlantId && (
            <div className="absolute top-3 right-3 bg-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
              <span className="text-sm text-gray-500">Selected plant:</span>
              <button
                onClick={() => deletePlant(selectedPlantId)}
                className="flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showNewLayoutModal && (
        <NewLayoutModal
          name={newLayoutName}
          setName={setNewLayoutName}
          onCreate={createLayout}
          onClose={() => { setShowNewLayoutModal(false); setNewLayoutName(''); }}
        />
      )}

      {showRenameModal && (
        <NewLayoutModal
          name={newLayoutName}
          setName={setNewLayoutName}
          onCreate={renameLayout}
          onClose={() => { setShowRenameModal(false); setNewLayoutName(''); }}
          title="Rename Layout"
          buttonText="Rename"
        />
      )}

      {showDeleteModal && (
        <DeleteLayoutModal
          layoutName={currentLayout?.name || ''}
          onDelete={deleteLayout}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      {editingBed && (
        <BedSizeModal
          bed={editingBed}
          onSave={(updates) => {
            updateBed(editingBed.id, updates);
            setEditingBed(null);
          }}
          onClose={() => setEditingBed(null)}
        />
      )}

      {showGardenSettings && (
        <GardenSettingsModal
          width={canvasWidth}
          height={canvasHeight}
          onSave={(w, h) => {
            setCanvasWidth(w);
            setCanvasHeight(h);
            setShowGardenSettings(false);
            setHasUnsavedChanges(true);
          }}
          onClose={() => setShowGardenSettings(false)}
        />
      )}

      {showAddBedModal && (
        <AddBedModal
          onAdd={(width, height) => {
            addBed(width, height);
            setShowAddBedModal(false);
          }}
          onClose={() => setShowAddBedModal(false)}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          targetId={contextMenu.targetId}
          canvasX={contextMenu.canvasX}
          canvasY={contextMenu.canvasY}
          crops={filteredCrops}
          onAddBed={(x, y) => { addBed(x, y); closeContextMenu(); }}
          onAddPlant={(cropId, x, y) => { addPlant(cropId, x, y); closeContextMenu(); }}
          onEditBed={(id) => {
            const bed = beds.find(b => b.id === id);
            if (bed) setEditingBed(bed);
            closeContextMenu();
          }}
          onRotateBed={(id) => { rotateBed(id); closeContextMenu(); }}
          onDuplicateBed={(id) => { duplicateBed(id); closeContextMenu(); }}
          onDeleteBed={(id) => { deleteBed(id); closeContextMenu(); }}
          onDuplicatePlant={(id) => { duplicatePlant(id); closeContextMenu(); }}
          onDeletePlant={(id) => { deletePlant(id); closeContextMenu(); }}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}

// New Layout Modal
function NewLayoutModal({ 
  name, 
  setName, 
  onCreate, 
  onClose,
  title = 'New Layout',
  buttonText = 'Create'
}: { 
  name: string; 
  setName: (n: string) => void; 
  onCreate: () => void; 
  onClose: () => void;
  title?: string;
  buttonText?: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-lg text-[#5C4A3D]">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., 2025 Garden Plan"
          className="w-full px-4 py-3 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59]"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) onCreate();
          }}
        />
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={!name.trim()}
            className="px-6 py-2 bg-[#4A7C59] text-white rounded-lg hover:bg-[#3d6649] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete Layout Modal
function DeleteLayoutModal({ 
  layoutName, 
  onDelete, 
  onClose 
}: { 
  layoutName: string; 
  onDelete: () => void; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg text-red-600">
            <Trash2 size={20} />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#5C4A3D]">Delete Layout</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{layoutName}</strong>? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Bed Size Modal
function BedSizeModal({ 
  bed, 
  onSave, 
  onClose 
}: { 
  bed: GardenBed; 
  onSave: (updates: Partial<GardenBed>) => void; 
  onClose: () => void;
}) {
  const [widthFt, setWidthFt] = useState(Math.round(bed.width / 12));
  const [heightFt, setHeightFt] = useState(Math.round(bed.height / 12));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-lg text-[#5C4A3D]">Edit Bed Size</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Width (feet)</label>
            <input
              type="number"
              min="1"
              max="20"
              value={widthFt}
              onChange={(e) => setWidthFt(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Length (feet)</label>
            <input
              type="number"
              min="1"
              max="20"
              value={heightFt}
              onChange={(e) => setHeightFt(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ width: widthFt * 12, height: heightFt * 12 })}
            className="px-6 py-2 bg-[#4A7C59] text-white rounded-lg hover:bg-[#3d6649]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// Garden Settings Modal
function GardenSettingsModal({ 
  width, 
  height, 
  onSave, 
  onClose 
}: { 
  width: number;
  height: number;
  onSave: (width: number, height: number) => void; 
  onClose: () => void;
}) {
  const [widthFt, setWidthFt] = useState(Math.round(width / 12));
  const [heightFt, setHeightFt] = useState(Math.round(height / 12));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-lg text-[#5C4A3D]">Garden Dimensions</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Set the size of your garden canvas. Items outside the new bounds will remain but may be off-canvas.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Width (feet)</label>
            <input
              type="number"
              min="10"
              max="200"
              value={widthFt}
              onChange={(e) => setWidthFt(parseInt(e.target.value) || 10)}
              className="w-full px-4 py-2 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Height (feet)</label>
            <input
              type="number"
              min="10"
              max="200"
              value={heightFt}
              onChange={(e) => setHeightFt(parseInt(e.target.value) || 10)}
              className="w-full px-4 py-2 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-xs text-gray-500">Presets:</span>
          {[
            { label: '20×20', w: 20, h: 20 },
            { label: '30×30', w: 30, h: 30 },
            { label: '50×50', w: 50, h: 50 },
            { label: '50×100', w: 50, h: 100 },
            { label: '100×100', w: 100, h: 100 },
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => {
                setWidthFt(preset.w);
                setHeightFt(preset.h);
              }}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-[#E8F0EA] text-[#5C4A3D] rounded"
            >
              {preset.label} ft
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(widthFt * 12, heightFt * 12)}
            className="px-6 py-2 bg-[#4A7C59] text-white rounded-lg hover:bg-[#3d6649]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// Context Menu Component
// Context menu item component (defined outside to avoid recreation during render)
function ContextMenuItem({ 
  icon, 
  label, 
  onClick, 
  danger = false,
  hasSubmenu = false,
  onMouseEnter,
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick?: () => void;
  danger?: boolean;
  hasSubmenu?: boolean;
  onMouseEnter?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
        danger 
          ? 'text-red-600 hover:bg-red-50' 
          : 'text-[#5C4A3D] hover:bg-[#FDF8F3]'
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {hasSubmenu && <ChevronDown size={14} className="-rotate-90" />}
    </button>
  );
}

function ContextMenu({
  x,
  y,
  type,
  targetId,
  canvasX,
  canvasY,
  crops,
  onAddBed,
  onAddPlant,
  onEditBed,
  onRotateBed,
  onDuplicateBed,
  onDeleteBed,
  onDuplicatePlant,
  onDeletePlant,
  onClose,
}: {
  x: number;
  y: number;
  type: 'canvas' | 'bed' | 'plant';
  targetId?: string;
  canvasX?: number;
  canvasY?: number;
  crops: Crop[];
  onAddBed: (x: number, y: number) => void;
  onAddPlant: (cropId: string, x: number, y: number) => void;
  onEditBed: (id: string) => void;
  onRotateBed: (id: string) => void;
  onDuplicateBed: (id: string) => void;
  onDeleteBed: (id: string) => void;
  onDuplicatePlant: (id: string) => void;
  onDeletePlant: (id: string) => void;
  onClose: () => void;
}) {
  const [showCropSubmenu, setShowCropSubmenu] = useState(false);
  const [cropFilter, setCropFilter] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Adjust position to stay in viewport
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 300);

  const filteredCrops = crops.filter(c => 
    c.name.toLowerCase().includes(cropFilter.toLowerCase())
  );

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-[#E5DDD3] py-1 min-w-[180px]"
      style={{ left: adjustedX, top: adjustedY }}
      onClick={(e) => e.stopPropagation()}
    >
      {type === 'canvas' && (
        <>
          <ContextMenuItem
            icon={<Plus size={16} />}
            label="Add Raised Bed"
            onClick={() => { onAddBed(canvasX || 100, canvasY || 100); onClose(); }}
          />
          <div className="h-px bg-[#E5DDD3] my-1" />
          <div
            className="relative"
            onMouseEnter={() => setShowCropSubmenu(true)}
            onMouseLeave={() => setShowCropSubmenu(false)}
          >
            <ContextMenuItem
              icon={<span className="text-lg">🌱</span>}
              label="Add Plant"
              hasSubmenu
              onMouseEnter={() => setShowCropSubmenu(true)}
            />
            
            {/* Crop Submenu */}
            {showCropSubmenu && (
              <div 
                className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-[#E5DDD3] py-1 min-w-[200px] max-h-[300px] overflow-hidden"
                style={{ 
                  left: adjustedX > window.innerWidth - 400 ? 'auto' : '100%',
                  right: adjustedX > window.innerWidth - 400 ? '100%' : 'auto',
                }}
              >
                <div className="px-2 py-1.5 border-b border-[#E5DDD3]">
                  <input
                    type="text"
                    placeholder="Filter crops..."
                    value={cropFilter}
                    onChange={(e) => setCropFilter(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-[#E5DDD3] rounded focus:outline-none focus:ring-1 focus:ring-[#4A7C59]"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="max-h-[230px] overflow-y-auto">
                  {filteredCrops.map(crop => (
                    <button
                      key={crop.id}
                      onClick={() => { onAddPlant(crop.id, canvasX || 100, canvasY || 100); onClose(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-[#5C4A3D] hover:bg-[#FDF8F3]"
                    >
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0 border border-white shadow-sm"
                        style={{ backgroundColor: crop.color }}
                      />
                      <span className="flex-1 truncate">{crop.name}</span>
                      <span className="text-xs text-gray-400">{crop.spacingInches}&quot;</span>
                    </button>
                  ))}
                  {filteredCrops.length === 0 && (
                    <p className="px-3 py-2 text-sm text-gray-400">No crops found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {type === 'bed' && targetId && (
        <>
          <ContextMenuItem
            icon={<Edit3 size={16} />}
            label="Edit Size"
            onClick={() => { onEditBed(targetId); onClose(); }}
          />
          <ContextMenuItem
            icon={<RotateCw size={16} />}
            label="Rotate 90°"
            onClick={() => { onRotateBed(targetId); onClose(); }}
          />
          <ContextMenuItem
            icon={<Copy size={16} />}
            label="Duplicate"
            onClick={() => { onDuplicateBed(targetId); onClose(); }}
          />
          <div className="h-px bg-[#E5DDD3] my-1" />
          <ContextMenuItem
            icon={<Trash2 size={16} />}
            label="Delete Bed"
            onClick={() => { onDeleteBed(targetId); onClose(); }}
            danger
          />
        </>
      )}

      {type === 'plant' && targetId && (
        <>
          <ContextMenuItem
            icon={<Copy size={16} />}
            label="Duplicate"
            onClick={() => { onDuplicatePlant(targetId); onClose(); }}
          />
          <div className="h-px bg-[#E5DDD3] my-1" />
          <ContextMenuItem
            icon={<Trash2 size={16} />}
            label="Remove Plant"
            onClick={() => { onDeletePlant(targetId); onClose(); }}
            danger
          />
        </>
      )}
    </div>
  );
}

// Add Bed Modal
function AddBedModal({
  onAdd,
  onClose,
}: {
  onAdd: (width: number, height: number) => void;
  onClose: () => void;
}) {
  const [widthFt, setWidthFt] = useState(4);
  const [heightFt, setHeightFt] = useState(8);

  const presets = [
    { label: '2×4', w: 2, h: 4 },
    { label: '3×6', w: 3, h: 6 },
    { label: '4×4', w: 4, h: 4 },
    { label: '4×8', w: 4, h: 8 },
    { label: '4×12', w: 4, h: 12 },
    { label: '3×3', w: 3, h: 3 },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-lg text-[#5C4A3D]">Add Raised Bed</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Choose a preset size or enter custom dimensions.
        </p>

        {/* Presets */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {presets.map(preset => (
            <button
              key={preset.label}
              onClick={() => {
                setWidthFt(preset.w);
                setHeightFt(preset.h);
              }}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                widthFt === preset.w && heightFt === preset.h
                  ? 'bg-[#E8F0EA] border-[#4A7C59] text-[#4A7C59]'
                  : 'bg-white border-[#E5DDD3] text-[#5C4A3D] hover:bg-[#FDF8F3]'
              }`}
            >
              {preset.label} ft
            </button>
          ))}
        </div>
        
        {/* Custom Size */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Width (feet)</label>
            <input
              type="number"
              min="1"
              max="20"
              value={widthFt}
              onChange={(e) => setWidthFt(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Length (feet)</label>
            <input
              type="number"
              min="1"
              max="20"
              value={heightFt}
              onChange={(e) => setHeightFt(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="bg-[#FDF8F3] rounded-lg p-4 mb-6 flex items-center justify-center">
          <div 
            className="border-2 border-[#8B7355] rounded"
            style={{
              width: Math.min(120, widthFt * 20),
              height: Math.min(120, heightFt * 15),
              backgroundColor: 'rgba(139, 115, 85, 0.25)',
            }}
          />
          <span className="ml-4 text-sm text-gray-500">
            {widthFt}&apos; × {heightFt}&apos;
          </span>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onAdd(widthFt * 12, heightFt * 12)}
            className="px-6 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#7a6549] flex items-center gap-2"
          >
            <Plus size={18} />
            Add Bed
          </button>
        </div>
      </div>
    </div>
  );
}


