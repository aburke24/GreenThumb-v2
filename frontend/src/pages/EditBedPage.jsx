import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft,
    Save,
    PlusCircle,
    Trash2,
    RefreshCw,
    X,
    Pencil,
} from 'lucide-react';
import Bed from '../component/BedEditor';
import PlantCatalog from '../plantCatalog.json';
import { useUser } from '../hooks/UserUser';
import { updateBedApi } from '../utils/bedUtil';
import { updatePlantsApi } from '../utils/plantsUtil';
import { v4 as uuidv4 } from 'uuid';
import PlantCatalogModal from '../modal/PlantCatalogModal';

// Helper function to get plant dimensions based on spacing
const getPlantDimensions = (spacing) => {
    const s = parseInt(spacing);
    if (s === 1) return { width: 1, height: 1 };
    if (s === 4) return { width: 2, height: 2 };
    if (s === 9) return { width: 3, height: 3 };
    return { width: 1, height: 1 };
};

const EditBedPage = () => {
    const { gardenId, bedId } = useParams();
    // Access the comprehensive userData and helper functions from the hook
    const { userData, loading, refreshUserData } = useUser();

    const navigate = useNavigate();
    const [originalHeader, setOriginalHeader] = useState({ name: '', width: 0, height: 0 });
    const [bedName, setBedName] = useState('');
    const [bed, setBed] = useState('');
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [hasUnsavedHeader, setHasUnsavedHeader] = useState(false);
    const [hasUnsavedPlants, setHasUnsavedPlants] = useState(false);
    const [isHeaderOpen, setIsHeaderOpen] = useState(false);
    const [showPlantList, setShowPlantList] = useState(false);
    const [showPlantCatalogModal, setShowPlantCatalogModal] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [activePlant, setActivePlant] = useState(null);
    const [bedLayout, setBedLayout] = useState([]);
    const [plantsInBed, setPlantsInBed] = useState([]);
    const [allPlants, setAllPlants] = useState([]);
    const bedContainerRef = useRef(null);
    const [bedContainerDimensions, setBedContainerDimensions] = useState({ width: 0, height: 0 });
    const [garden, setGarden] = useState(null);
    const [hoveredCell, setHoveredCell] = useState(null);
    const [activePlantButtons, setActivePlantButtons] = useState(Array(5).fill(null));
    const [editingButtonIndex, setEditingButtonIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);


    // Use ResizeObserver to get the available dimensions for the bed grid
    useEffect(() => {
        if (!bedContainerRef.current) return;

        const resizeObserver = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setBedContainerDimensions({ width, height });
        });

        resizeObserver.observe(bedContainerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (allPlants && allPlants.length > 0) {
            console.log("all of the plants", allPlants);
            setActivePlantButtons(allPlants.slice(0, 6));
        }
    }, [allPlants]);

    // Populate local state with bed and plants data from the context
    useEffect(() => {
        if (userData) {
            console.log("UserData", userData);
            console.log("The gardenId is", gardenId);
            const foundGarden = userData.gardens.find(garden => garden.id == gardenId);
            setGarden(foundGarden);

            const bedsInGarden = foundGarden.beds;
            const foundBed = bedsInGarden.find(b => parseInt(b.id) === parseInt(bedId));

            if (foundBed) {
                setBedName(foundBed.name);
                setBed(foundBed);
                setWidth(foundBed.width);
                setHeight(foundBed.height);
                setHasUnsavedHeader(false);
                setOriginalHeader({
                    name: foundBed.name,
                    width: foundBed.width,
                    height: foundBed.height,
                });

                const plantsInBed = foundBed.plants;
                setPlantsInBed(plantsInBed);

                const newLayout = Array.from({ length: foundBed.height }, () =>
                    Array.from({ length: foundBed.width }, () => null)
                );

                plantsInBed.forEach(plant => {
                    const { width: plantW, height: plantH } = getPlantDimensions(plant.spacing);
                    for (let r = plant.y_position; r < plant.y_position + plantH; r++) {
                        for (let c = plant.x_position; c < plant.x_position + plantW; c++) {
                            if (newLayout[r] && newLayout[r][c] !== undefined) {
                                newLayout[r][c] = plant;
                            }
                        }
                    }
                });
                setBedLayout(newLayout);
            }
        }
    }, [userData, setGarden, gardenId, bedId]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (PlantCatalog && Array.isArray(PlantCatalog)) {
            setAllPlants(PlantCatalog.slice(0, 5));
        }
    }, []);

    const checkForHeaderChanges = (name, w, h) => {
        const changed =
            name !== originalHeader.name ||
            w !== originalHeader.width ||
            h !== originalHeader.height;

        setHasUnsavedHeader(changed);
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        setBedName(val);
        checkForHeaderChanges(val, width, height);
    };

    const handleWidthChange = (e) => {
        const val = e.target.value;
        const newWidth = val === "" ? "" : Number(val);
        setWidth(newWidth);
        if (newWidth !== "") {
            setBedLayout(Array.from({ length: height }, () => Array.from({ length: newWidth }, () => null)));
        }
        setHasUnsavedPlants(true);
        checkForHeaderChanges(bedName, newWidth, height);
    };

    const handleHeightChange = (e) => {
        const val = e.target.value;
        const newHeight = val === '' ? '' : Number(val);
        setHeight(newHeight);
        if (newHeight !== '') {
            setBedLayout(Array.from({ length: newHeight }, () => Array.from({ length: width }, () => null)));
        }
        setHasUnsavedPlants(true);
        checkForHeaderChanges(bedName, width, newHeight);
    };

    const handleBack = () => {
        if (hasUnsavedHeader || hasUnsavedPlants) {
            const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
            if (!confirmed) {
                return;
            }
        }
        refreshUserData(); // Single refresh call on exit
        navigate(-1);
    };

    const handleSaveHeader = async () => {
        if (!garden || width > garden.width || height > garden.height) {
            alert("Bed dimensions cannot be larger than the garden's dimensions. Please adjust the width and height.");
            return;
        }

        const headerDataToSave = {
            name: bedName,
            width: width,
            height: height
        };

        try {
            await updateBedApi(userData.id, gardenId, bedId, headerDataToSave);
            setOriginalHeader(headerDataToSave);
            setHasUnsavedHeader(false);

            const filteredPlants = plantsInBed.filter(plant => {
                const { width: plantW, height: plantH } = getPlantDimensions(plant.spacing);
                return (
                    plant.x_position + plantW <= width &&
                    plant.y_position + plantH <= height
                );
            });

            const newLayout = Array.from({ length: height }, () =>
                Array.from({ length: width }, () => null)
            );

            filteredPlants.forEach(plant => {
                const { width: plantW, height: plantH } = getPlantDimensions(plant.spacing);
                for (let r = plant.y_position; r < plant.y_position + plantH; r++) {
                    for (let c = plant.x_position; c < plant.x_position + plantW; c++) {
                        if (newLayout[r] && newLayout[r][c] !== undefined) {
                            newLayout[r][c] = plant;
                        }
                    }
                }
            });

            setPlantsInBed(filteredPlants);
            setBedLayout(newLayout);
            setHasUnsavedPlants(false);

            await updatePlantsApi(userData.id, gardenId, bedId, filteredPlants);

            await refreshUserData();

        } catch (error) {
            console.error('Failed to save header or update plants:', error);
            setHasUnsavedHeader(true);
        }
    };



    const handleCancelHeaderChanges = () => {
        const originalBed = garden.beds?.find(b => b.id === bedId);
        if (originalBed) {
            setBed(originalBed);
            setBedName(originalBed.name);
            setWidth(originalBed.width);
            setHeight(originalBed.height);
        }
        setHasUnsavedHeader(false);
    };

    const handleSavePlants = async () => {

        try {
            await updatePlantsApi(userData.id, gardenId, bedId, plantsInBed);
            setHasUnsavedPlants(false);
            await refreshUserData(); // Refresh all data from the API after saving
        } catch (error) {
            console.error('Failed to save plants:', error);
            setHasUnsavedPlants(true);
        }
    };

    const handleChoosePlantForButton = (plant) => {
        if (editingButtonIndex !== null) {
            const updatedButtons = [...activePlantButtons];
            updatedButtons[editingButtonIndex] = plant;
            setActivePlantButtons(updatedButtons);
            setActivePlant(plant);
            setShowPlantCatalogModal(false);
            setEditingButtonIndex(null);
        }
    };

    const handleCancelPlantChanges = () => {
        const originalPlants = bed.plants;

        const newLayout = Array.from({ length: height }, () =>
            Array.from({ length: width }, () => null)
        );
        originalPlants.forEach(plant => {
            const { width: plantW, height: plantH } = getPlantDimensions(plant.spacing);
            for (let r = plant.y_position; r < plant.y_position + plantH; r++) {
                for (let c = plant.x_position; c < plant.x_position + plantW; c++) {
                    if (newLayout[r] && newLayout[r][c] !== undefined) {
                        newLayout[r][c] = plant;
                    }
                }
            }
        });
        setBedLayout(newLayout);
        setPlantsInBed(originalPlants);
        setHasUnsavedPlants(false);
    };

    const handleClearBed = () => {
        const confirmed = window.confirm("Are you sure you want to clear all plants from this bed? This action cannot be undone.");
        if (confirmed) {
            setBedLayout(Array.from({ length: height }, () => Array.from({ length: width }, () => null)));
            setPlantsInBed([]);
            setHasUnsavedPlants(true);
        }
    };

    const handlePlantListBack = () => {
        setShowPlantList(false);
        setActivePlant(null);
    };

    const handleOpenAddPlant = () => {
        setShowPlantList(true);
    };

    const handleCellHover = (coords) => {
        setHoveredCell(coords);
    };

    const handleCellLeave = () => {
        setHoveredCell(null);
    };

    const handleGridClick = (row, col) => {
        if (isDeleteMode) {
            const plantToDelete = bedLayout[row][col];
            if (plantToDelete) {
                let topRow = row, leftCol = col;
                while (topRow > 0 && bedLayout[topRow - 1] && bedLayout[topRow - 1][col] === plantToDelete) topRow--;
                while (leftCol > 0 && bedLayout[row][leftCol - 1] === plantToDelete) leftCol--;

                setPlantsInBed((prevPlants) => prevPlants.filter(p => p.id !== plantToDelete.id));
                const { width: plantW, height: plantH } = getPlantDimensions(plantToDelete.spacing);
                const newLayout = bedLayout.map((r) => [...r]);
                for (let r = topRow; r < topRow + plantH; r++) {
                    for (let c = leftCol; c < leftCol + plantW; c++) {
                        if (newLayout[r] && newLayout[r][c] === plantToDelete) newLayout[r][c] = null;
                    }
                }
                setBedLayout(newLayout);
                setHasUnsavedPlants(true);
            }
            return;
        }

        if (!activePlant) return;

        const { width: plantW, height: plantH } = getPlantDimensions(activePlant.spacing);
        if (row + plantH > height || col + plantW > width) {
            return;
        }

        for (let r = row; r < row + plantH; r++) {
            for (let c = col; c < col + plantW; c++) {
                if (!bedLayout[r] || bedLayout[r][c] !== null) {
                    return;
                }
            }
        }

        const newPlant = {
            id: uuidv4(),
            plant_id: activePlant.plant_id,
            x_position: col,
            y_position: row,
            plant_role: "main",
            name: activePlant.common_name,
            spacing: activePlant.spacing,
            icon: activePlant.icon
        };

        setPlantsInBed((prevPlants) => [...prevPlants, newPlant]);
        const newLayout = bedLayout.map((r) => [...r]);
        for (let r = row; r < row + plantH; r++) {
            for (let c = col; c < col + plantW; c++) {
                newLayout[r][c] = newPlant;
            }
        }
        setBedLayout(newLayout);
        setHasUnsavedPlants(true);
    };

    if (loading || !userData || !garden) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-neutral-800 text-white">
                <span className="text-lg font-semibold">Loading bed...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-screen bg-neutral-800 text-white font-sans antialiased overflow-hidden">
            {/* ... (rest of the component, which is unchanged) ... */}
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-neutral-900 border-b border-neutral-700">
                <div className="flex items-center justify-between w-full sm:w-auto mb-4 sm:mb-0">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button onClick={handleBack} className="p-2 rounded-full hover:bg-neutral-700" aria-label="Back">
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <input
                            type="text"
                            value={bedName}
                            onChange={handleNameChange}
                            placeholder="Bed Name"
                            className="w-40 sm:w-48 px-3 py-2 bg-neutral-700 text-white rounded-lg"
                        />
                    </div>
                    <button
                        onClick={() => setIsHeaderOpen((prev) => !prev)}
                        className="sm:hidden p-2 rounded-full hover:bg-neutral-700"
                        aria-label="Toggle Header"
                    >
                        {isHeaderOpen ? <X className="w-6 h-6 text-white" /> : <Pencil className="w-6 h-6 text-white" />}
                    </button>
                </div>

                <div
                    className={`${isHeaderOpen ? 'flex' : 'hidden'} flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm font-medium w-full sm:w-auto sm:flex`}
                >
                    <input
                        type="number"
                        value={width}
                        onChange={handleWidthChange}
                        placeholder="Width"
                        className="w-24 px-3 py-2 bg-neutral-700 text-white rounded-lg"
                        min="1"
                        max={garden.width}
                    />
                    <input
                        type="number"
                        value={height}
                        onChange={handleHeightChange}
                        placeholder="Height"
                        className="w-24 px-3 py-2 bg-neutral-700 text-white rounded-lg"
                        min="1"
                        max={garden.height}
                    />
                    <button
                        onClick={handleSaveHeader}
                        disabled={!hasUnsavedHeader}
                        className={`flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 rounded-lg transition w-full sm:w-auto
                            ${!hasUnsavedHeader
                                ? 'bg-neutral-700 text-gray-500 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500'
                            }`}
                    >
                        <Save className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleCancelHeaderChanges}
                        disabled={!hasUnsavedHeader}
                        className={`flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 rounded-lg transition w-full sm:w-auto
                            ${!hasUnsavedHeader
                                ? 'bg-neutral-700 text-gray-500 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-500'
                            }`}
                    >
                        <X className="w-5 h-5" />
                        <span>Cancel</span>
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex flex-1 flex-col sm:flex-row p-6 pb-16 sm:pb-6 gap-6 relative">
                <div ref={bedContainerRef} className="flex-1 flex justify-center items-center rounded-xl p-4">
                    <Bed
                        width={width}
                        height={height}
                        isUnsaved={hasUnsavedPlants}
                        bedLayout={bedLayout}
                        onGridClick={handleGridClick}
                        activePlant={activePlant}
                        isDeleteMode={isDeleteMode}
                        dimensions={bedContainerDimensions}
                        onCellHover={handleCellHover}
                        onCellLeave={handleCellLeave}
                        hoveredCell={hoveredCell}
                        isDragging={isDragging} 
                         setIsDragging={setIsDragging}
                    />
                
                </div>

                {/* RIGHT: Action Sidebar */}
                <div className="fixed bottom-0 left-0 w-full bg-neutral-900 border-t border-neutral-700 p-4 pb-6 transition-transform duration-300 ease-in-out z-50 sm:relative sm:w-auto sm:flex-none sm:bg-transparent sm:border-none sm:p-0 sm:translate-y-0">
                    <div className="flex flex-row justify-center space-x-4 sm:flex-col sm:space-x-0 sm:space-y-4 sm:bg-neutral-700 sm:rounded-xl sm:p-4">
                        {!showPlantList ? (
                            <>
                                {/* Save Plants */}
                                <div className="flex flex-col items-center space-y-1">
                                <button
                                    onClick={() => {
                                        setIsDeleteMode(false);
                                        handleSavePlants();
                                    }}
                                    disabled={!hasUnsavedPlants}
                                    className={`group rounded-full p-3 flex items-center justify-center relative transition
        ${hasUnsavedPlants
                                            ? 'bg-yellow-500 hover:bg-yellow-400'
                                            : 'bg-neutral-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                    aria-label="Save bed changes"
                                >
                                    <Save className="w-6 h-6 text-white" />
                                    <Tooltip text="Save Plant Changes" />
                                </button>
                                    <span className="text-xs text-white">Save Plants</span>
                                </div>

                                {/* Cancel Plants */}
                                 <div className="flex flex-col items-center space-y-1">
                                <button
                                    onClick={handleCancelPlantChanges}
                                    disabled={!hasUnsavedPlants}
                                    className={`group rounded-full p-3 flex items-center justify-center relative transition
        ${hasUnsavedPlants
                                            ? 'bg-red-600 hover:bg-red-500'
                                            : 'bg-neutral-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                    aria-label="Cancel plant changes"
                                >
                                    <X className="w-6 h-6 text-white" />
                                    <Tooltip text="Cancel Plant Changes" />
                                </button>
                                    <span className="text-xs text-white">Cancel Changes</span>
                                </div>
                                 <div className="flex flex-col items-center space-y-1">
                                <button
                                    onClick={() => {
                                        console.log("Add Plants button clicked");
                                        handleOpenAddPlant();
                                        setIsDeleteMode(false);
                                    }}
                                    className="group bg-emerald-600 rounded-full p-3 flex items-center justify-center hover:bg-emerald-500 relative"
                                    aria-label="Add plant"
                                >
                                    <PlusCircle className="w-6 h-6 text-white" />
                                    <Tooltip text="Add plant" />
                                </button>
                                    <span className="text-xs text-white">Add Plant</span>
                               </div>
                                <div className="flex flex-col items-center space-y-1">
                                <button
                                    onClick={() => {
                                        setIsDeleteMode((prev) => !prev);
                                        setActivePlant(null);
                                    }}
                                    className={`group rounded-full p-3 flex items-center justify-center relative transition
                                        ${isDeleteMode
                                            ? 'bg-red-500 ring-4 ring-red-400 scale-105'
                                            : 'bg-red-600 hover:bg-red-500'
                                        }`}
                                    aria-label="Delete plant"
                                >
                                    <Trash2 className="w-6 h-6 text-white" />
                                    <Tooltip text="Delete plant" />
                                </button>
                                    <span className="text-xs text-white">Delete Plant</span>
                                </div>
                                 <div className="flex flex-col items-center space-y-1">
                                <button
                                    onClick={() => {
                                        handleClearBed();
                                        setIsDeleteMode(false);
                                    }}
                                    className="group bg-neutral-600 rounded-full p-3 flex items-center justify-center hover:bg-neutral-500 relative"
                                    aria-label="Clear bed"
                                >
                                    <RefreshCw className="w-6 h-6 text-white" />
                                    <Tooltip text="Clear bed" />
                                </button>
                                    <span className="text-xs text-white">Clear Plants</span>
                                </div>
                            </>
                        ) : (
                            <>
                            <div className="flex flex-col items-center space-y-1">
                                <button
                                    onClick={handlePlantListBack}
                                    className="group bg-neutral-600 rounded-full p-3 flex items-center justify-center hover:bg-neutral-500 relative"
                                    aria-label="Back to actions"
                                >
                                    <ChevronLeft className="w-6 h-6 text-white" />
                                    <Tooltip text="Back" />
                                </button>
                                    <span className="text-xs text-white">Return to Actions</span>
                                </div>
                                {activePlantButtons.map((plant, index) => (
                                    <div key={index} className="relative group w-24 h-24">
                                        <button
                                            onClick={() => setActivePlant(plant)}
                                            className={`w-full h-full flex flex-col items-center justify-center text-white font-medium rounded
                                                ${activePlant?.plant_id === plant?.plant_id
                                                    ? 'bg-blue-600 ring-2 ring-offset-2 ring-blue-400'
                                                    : 'bg-neutral-800 hover:bg-neutral-700'}
                                                transition-all duration-200`}
                                        >
                                            {plant ? (
                                                <>
                                                    <img src={plant.icon} alt={plant.common_name} className="w-12 h-12 object-contain" />
                                                    <span className="text-xs text-center px-1">{plant.common_name}</span>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400">+ Add Plant</span>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                console.log("Edit button clicked for index:", index);
                                                setEditingButtonIndex(index);
                                                setShowPlantCatalogModal(true);
                                            }}
                                            className="absolute top-1 right-1 p-1 bg-neutral-700 rounded-full opacity-0 group-hover:opacity-100 hover:bg-neutral-600 transition"
                                            aria-label="Edit plant slot"
                                        >
                                            <Pencil className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <PlantCatalogModal
                isOpen={showPlantCatalogModal}
                onClose={() => setShowPlantCatalogModal(false)}
                onSelect={handleChoosePlantForButton}
                selectedPlantId={editingButtonIndex !== null ? activePlantButtons[editingButtonIndex]?.plant_id : null}
                activePlantButtons={activePlantButtons}
            />
        </div>
    );
};

// Tooltip component
const Tooltip = ({ text }) => (
    <span className="absolute bottom-full mb-2 px-2 py-1 text-xs rounded bg-black text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
        {text}
    </span>
);

export default EditBedPage;