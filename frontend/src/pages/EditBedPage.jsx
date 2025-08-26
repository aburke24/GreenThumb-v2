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
import Bed from '../component/Bed';
import PlantCatalog from '../PlantCatalog.json';
import { useUser } from '../hooks/UserUser';
import { updateBedApi } from '../utils/bedUtil';
import { updatePlantsApi } from '../utils/plantsUtil';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get plant dimensions based on spacing
const getPlantDimensions = (spacing) => {
    const s = parseInt(spacing);
    if (s === 1) return { width: 1, height: 1 };
    if (s === 4) return { width: 2, height: 2 };
    if (s === 9) return { width: 3, height: 3 };
    return { width: 1, height: 1 };
};

const EditBedPage = () => {
    const { bedId, gardenId } = useParams();
    const { userId, bed, refreshBed, loading, refreshPlants, plants } = useUser();

    const navigate = useNavigate();
    const [bedName, setBedName] = useState('');
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [hasUnsavedHeader, setHasUnsavedHeader] = useState(false);
    const [hasUnsavedPlants, setHasUnsavedPlants] = useState(false);
    const [isHeaderOpen, setIsHeaderOpen] = useState(false);
    const [showPlantList, setShowPlantList] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [activePlant, setActivePlant] = useState(null);
    const [bedLayout, setBedLayout] = useState([]);
    const [plantsInBed, setPlantsInBed] = useState([]);
    const [allPlants, setAllPlants] = useState([]);

    const mainContentRef = useRef(null);

    // This useEffect populates the local state with bed and plants data
    // It now correctly uses the 'plants' array from the context.
    useEffect(() => {
        if (bed) {
            setBedName(bed.name);
            setWidth(bed.width);
            setHeight(bed.height);
        }

        if (bed && plants) {
            const newLayout = Array.from({ length: bed.height }, () =>
                Array.from({ length: bed.width }, () => null)
            );
            
            plants.forEach(plant => {
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
            setPlantsInBed(plants);
        }
    }, [bed, plants]); // Added 'plants' to the dependency array

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
        setHasUnsavedHeader(name !== bed.name || w !== bed.width || h !== bed.height);
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        setBedName(val);
        checkForHeaderChanges(val, width, height);
    };

    const handleWidthChange = (e) => {
        const val = e.target.value;
        const newWidth = val === '' ? 0 : Number(val);
        setWidth(newWidth);
        setPlantsInBed([]);
        setBedLayout(Array.from({ length: height }, () => Array.from({ length: newWidth }, () => null)));
        setHasUnsavedPlants(true);
        checkForHeaderChanges(bedName, newWidth, height);
    };

    const handleHeightChange = (e) => {
        const val = e.target.value;
        const newHeight = val === '' ? 0 : Number(val);
        setHeight(newHeight);
        setPlantsInBed([]);
        setBedLayout(Array.from({ length: newHeight }, () => Array.from({ length: width }, () => null)));
        setHasUnsavedPlants(true);
        checkForHeaderChanges(bedName, width, newHeight);
    };

    const handleBack = () => navigate(-1);

    const handleSaveHeader = async () => {
        setIsSaving(true);
        setHasUnsavedHeader(false);

       const headerDataToSave = {
        name: bedName, 
        width: width,
        height: height
    };
        try {
            await updateBedApi(userId,gardenId,bedId, headerDataToSave);
            refreshBed(gardenId, bedId);
        } catch (error) {
            console.error('Failed to save header:', error);
            setHasUnsavedHeader(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePlants = async () => {
        setIsSaving(true);
        setHasUnsavedPlants(false);

        const plantsDataToSave = { plants: plantsInBed };
        try {
            await updatePlantsApi(userId, gardenId, bedId, plantsDataToSave.plants);
            refreshPlants(gardenId,bedId);
        } catch (error) {
            console.error('Failed to save plants:', error);
            setHasUnsavedPlants(true);
        } finally {
            setIsSaving(false);
        }
    };


    const handleClearBed = () => {
        setBedLayout(Array.from({ length: height }, () => Array.from({ length: width }, () => null)));
        setPlantsInBed([]);
        setHasUnsavedPlants(true);
    };

    const handleSelectPlant = (plant) => {
        setActivePlant(plant);
    };

    const handlePlantListBack = () => {
        setShowPlantList(false);
        setActivePlant(null);
    };

    const handleOpenAddPlant = () => { setShowPlantList(true) };

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

    if (loading || !bed) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-neutral-800 text-white">
                <span className="text-lg font-semibold">Loading bed...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-screen bg-neutral-800 text-white font-sans antialiased overflow-hidden">
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
                    className={`${isHeaderOpen ? 'flex' : 'hidden'
                        } flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm font-medium w-full sm:w-auto sm:flex`}
                >
                    <input
                        type="number"
                        value={width}
                        onChange={handleWidthChange}
                        placeholder="Width"
                        className="w-24 px-3 py-2 bg-neutral-700 text-white rounded-lg"
                    />
                    <input
                        type="number"
                        value={height}
                        onChange={handleHeightChange}
                        placeholder="Height"
                        className="w-24 px-3 py-2 bg-neutral-700 text-white rounded-lg"
                    />
                    {/* ⬅️ Header Save Button */}
                    <button
                        onClick={handleSaveHeader}
                        disabled={!hasUnsavedHeader || isSaving}
                        className={`flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 rounded-lg transition w-full sm:w-auto
                            ${!hasUnsavedHeader || isSaving
                                ? 'bg-neutral-700 text-gray-500 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500'
                            }`}
                    >
                        <Save className="w-5 h-5" />
                        <span>{isSaving ? 'Saving...' : 'Save Bed Info'}</span>
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div ref={mainContentRef} className="flex flex-1 flex-col sm:flex-row p-6 pb-16 sm:pb-6 gap-6 relative">
                {/* LEFT: Bed Grid container */}
                <div className="flex-1 flex justify-center items-center rounded-xl p-4">
                    <Bed
                        width={width}
                        height={height}
                        isUnsaved={hasUnsavedPlants}
                        bedLayout={bedLayout}
                        onGridClick={handleGridClick}
                        activePlant={activePlant}
                        isDeleteMode={isDeleteMode}
                    />
                </div>

                {/* RIGHT: Action Sidebar */}
                <div className="fixed bottom-0 left-0 w-full bg-neutral-900 border-t border-neutral-700 p-4 pb-6 transition-transform duration-300 ease-in-out z-50 sm:relative sm:w-auto sm:flex-none sm:bg-transparent sm:border-none sm:p-0 sm:translate-y-0">
                    <div className="flex flex-row justify-center space-x-4 sm:flex-col sm:space-x-0 sm:space-y-4 sm:bg-neutral-700 sm:rounded-xl sm:p-4">
                        {!showPlantList ? (
                            <>
                                {/* ⬅️ Plant Save Button */}
                                <button
                                    onClick={handleSavePlants}
                                    disabled={!hasUnsavedPlants || isSaving}
                                    className={`group rounded-full p-3 flex items-center justify-center relative transition
                                        ${isSaving
                                            ? 'bg-neutral-700 text-gray-500 cursor-not-allowed'
                                            : hasUnsavedPlants
                                                ? 'bg-yellow-500 hover:bg-yellow-400'
                                                : 'bg-emerald-600 text-white'
                                        }`}
                                    aria-label="Save bed changes"
                                >
                                    <Save className="w-6 h-6 text-white" />
                                    <Tooltip text={isSaving ? 'Saving...' : 'Save Plants'} />
                                </button>
                                {/* Add Plant Button */}
                                <button
                                    onClick={() => {
                                        handleOpenAddPlant();
                                        setIsDeleteMode(false);
                                        console.log("Delete mode after Add Plant clicked:", false);
                                    }}
                                    className="group bg-emerald-600 rounded-full p-3 flex items-center justify-center hover:bg-emerald-500 relative"
                                    aria-label="Add plant"
                                >
                                    <PlusCircle className="w-6 h-6 text-white" />
                                    <Tooltip text="Add plant" />
                                </button>

                                {/* Delete Mode Toggle Button */}
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

                                {/* Clear Bed Button */}
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
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handlePlantListBack}
                                    className="group bg-neutral-600 rounded-full p-3 flex items-center justify-center hover:bg-neutral-500 relative"
                                    aria-label="Back to actions"
                                >
                                    <X className="w-6 h-6 text-white" />
                                    <Tooltip text="Back" />
                                </button>
                                {allPlants.map((plant) => (
                                    <button
                                        key={plant.plant_id}
                                        onClick={() => handleSelectPlant(plant)}
                                        className={`group w-24 h-24 flex flex-col items-center justify-center relative text-white font-medium ${activePlant?.plant_id === plant.plant_id
                                            ? 'bg-blue-600 ring-2 ring-offset-2 ring-blue-400'
                                            : 'bg-neutral-800 hover:bg-neutral-700'
                                            } transition-all duration-200`}
                                        aria-label={`Select ${plant.common_name}`}
                                    >
                                        <img
                                            src={plant.icon}
                                            alt={plant.common_name}
                                            className="w-full h-full object-contain"
                                        />
                                        <span className="text-xs">{plant.common_name}</span>
                                        <Tooltip text={plant.common_name} />
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Tooltip component defined outside the main function
const Tooltip = ({ text }) => (
    <span className="absolute bottom-full mb-2 px-2 py-1 text-xs rounded bg-black text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
        {text}
    </span>
);

export default EditBedPage;
