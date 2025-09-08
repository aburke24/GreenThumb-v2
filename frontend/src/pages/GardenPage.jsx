import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Ruler, X, Save } from 'lucide-react';
import { useUser } from '../hooks/UserUser';
import AddBedModal from '../modal/AddBedModal';
import { updateGardenApi } from '../utils/gardenUtil';
import { updateBedApi, deleteBedApi } from '../utils/bedUtil';
import GardenView from '../component/GardenView';
import BedsPanel from '../component/BedsPanel';
import { updatePlantsApi } from '../utils/plantsUtil';

const GardenPage = () => {
    const { gardenId } = useParams();
    const navigate = useNavigate();
    const { userData, loading, refreshUserData } = useUser();

    const [garden, setGarden] = useState(null);
    const [gardenName, setGardenName] = useState('');
    const [gardenWidth, setGardenWidth] = useState('');
    const [gardenHeight, setGardenHeight] = useState('');
    const [isAddBedOpen, setIsAddBedOpen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [displayWidth, setDisplayWidth] = useState(0);
    const [displayHeight, setDisplayHeight] = useState(0);
    const [isBedsOpen, setIsBedsOpen] = useState(true);
    const [bedPanelHeight, setBedPanelHeight] = useState(300);
    const [gardenBeds, setGardenBeds] = useState([]);

    const [isHeaderOpen, setIsHeaderOpen] = useState(false);
    const [selectedBedId, setSelectedBedId] = useState(null);
    const [showUnplacedBeds, setShowUnplacedBeds] = useState(true);
    const [unsavedPositions, setUnsavedPositions] = useState({});

    const isDragging = useRef(false);
    const userId = userData?.id;

    useEffect(() => {
        if (!loading && userData && userData.gardens) {
            const foundGarden = userData.gardens.find(g => g.id == gardenId);
            if (foundGarden) {
                setGarden(foundGarden);
                setGardenName(foundGarden.garden_name);
                setGardenWidth(foundGarden.width.toString());
                setGardenHeight(foundGarden.height.toString());
                setDisplayWidth(foundGarden.width * 10);
                setDisplayHeight(foundGarden.height * 10);
                setGardenBeds(foundGarden.beds);
            } else {
                console.error("Garden not found");
                // Navigate away or show an error state
            }
        }
    }, [gardenId, loading, userData, navigate]);

    useEffect(() => {
        if (isBedsOpen) {
            setBedPanelHeight(300);
        } else {
            setBedPanelHeight(60);
        }
    }, [isBedsOpen]);

    const handleBack = () => {
        const hasHeaderChanges = hasUnsavedChanges;
        const hasUnsavedBedPositions = Object.keys(unsavedPositions).length > 0;
        if (hasHeaderChanges || hasUnsavedBedPositions) {
            const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
            if (!confirmed) {
                return;
            }
        }
        refreshUserData();
        navigate(-1);
    };

    const openAddBedModal = () => setIsAddBedOpen(true);
    const closeAddBedModal = () => setIsAddBedOpen(false);
    const toggleBeds = () => setIsBedsOpen(prev => !prev);
    const toggleHeader = () => setIsHeaderOpen(prev => !prev);
    const handleBedAdded = () => {
        refreshUserData();
    };

    const checkForChanges = (name, width, height) => {
        if (!garden) return;
        const changed =
            name !== garden.garden_name ||
            width !== garden.width.toString() ||
            height !== garden.height.toString();
        setHasUnsavedChanges(changed);
    };

    const handleNameChange = (e) => {
        const newName = e.target.value;
        setGardenName(newName);
        checkForChanges(newName, gardenWidth, gardenHeight);
    };

    const handleWidthChange = (e) => {
        const newWidth = e.target.value;
        setGardenWidth(newWidth);
        checkForChanges(gardenName, newWidth, gardenHeight);
    };

    const handleHeightChange = (e) => {
        const newHeight = e.target.value;
        setGardenHeight(newHeight);
        checkForChanges(gardenName, gardenWidth, newHeight);
    };

    const handleSave = async () => {
        if (!garden || !userId || !gardenId) return;
        const newData = {
            garden_name: gardenName,
            width: parseFloat(gardenWidth),
            height: parseFloat(gardenHeight),
        };
        try {
            await updateGardenApi(userId, gardenId, newData);
            const updatePromises = Object.entries(unsavedPositions).map(([bedId, bedData]) => {
                const originalBed = gardenBeds.find(b => b.id == bedId);
                if (!originalBed) return null;
                const updatedBed = {
                    ...originalBed,
                    top_position: bedData.top,
                    left_position: bedData.left,
                    width: bedData.width,
                    height: bedData.height,
                };
                return updateBedApi(userId, gardenId, bedId, updatedBed);
            }).filter(Boolean);
            await Promise.all(updatePromises);
            setUnsavedPositions({});
            setSelectedBedId(null);
            setHasUnsavedChanges(false);
            setDisplayWidth(newData.width * 10);
            setDisplayHeight(newData.height * 10);
            await refreshUserData();
        } catch (error) {
            console.error('Error saving garden and beds:', error);
        }
    };

    const handleCancelChanges = () => {
        if (garden) {
            setGardenName(garden.garden_name);
            setGardenWidth(garden.width.toString());
            setGardenHeight(garden.height.toString());
        }
        setHasUnsavedChanges(false);
    };

    const handleDeleteBed = async (bedId) => {
        if (!userId || !gardenId || !bedId) {
            console.error('Missing required parameters for bed deletion.');
            return;
        }
        const confirmed = window.confirm("Are you sure you want to delete this bed?");
        if (!confirmed) return;
        try {
            await deleteBedApi(userId, gardenId, bedId);
            await refreshUserData();
        } catch (error) {
            console.error(`Error deleting bed ${bedId}:`, error);
        }
    };

    const handleEditBed = (bed) => {
        refreshUserData();
        navigate(`/garden/${gardenId}/bed/${bed.id}`);
    };

    const handleMouseDown = () => {
        isDragging.current = true;
        document.body.style.cursor = 'ns-resize';
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.cursor = 'default';
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const newHeight = window.innerHeight - e.clientY;
        const clamped = Math.max(100, Math.min(500, newHeight));
        setBedPanelHeight(clamped);
        if (!isBedsOpen) setIsBedsOpen(true);
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    if (loading || !garden) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-neutral-800 text-white">
                <span className="text-lg font-semibold">Loading garden...</span>
            </div>
        );
    }
    
    // ... rest of your component
    const handleCardClick = (bed) => {
        if (selectedBedId === bed.id) {
            setSelectedBedId(null);
            setUnsavedPositions({});
        } else {
            console.log("BED ID IS ", bed.id);
            setSelectedBedId(bed.id);
            setUnsavedPositions({
                [bed.id]: {
                    top: bed.top_position,
                    left: bed.left_position,
                    width: bed.width,
                    height: bed.height,
                }
            });
        }
    };

    const onGardenClick = ({ row, col }) => {
        console.log("The beds position is being updated", selectedBedId, row, col);
        if (!selectedBedId) return;
        const bed = gardenBeds.find((b) => b.id === selectedBedId);
        if (!bed) return;
        const isUnplaced = bed.top_position === -1 && bed.left_position === -1;
        const bedWidth = unsavedPositions[selectedBedId]?.width || bed.width;
        const bedHeight = unsavedPositions[selectedBedId]?.height || bed.height;
        if (
            row >= 0 &&
            col >= 0 &&
            row + bedHeight <= parseInt(gardenHeight) &&
            col + bedWidth <= parseInt(gardenWidth)
        ) {
            if (isUnplaced || bed.top_position !== row || bed.left_position !== col) {
                setUnsavedPositions((prev) => ({
                    ...prev,
                    [selectedBedId]: {
                        ...prev[selectedBedId],
                        top: row,
                        left: col,
                        width: bedWidth,
                        height: bedHeight,
                    },
                }));
            }
        } else {
            console.log('Bed does not fit at the clicked position.');
        }
    };

    const onConfirmPlacement = async (bedId, newBedData) => {
        try {
            await updateBedApi(userId, gardenId, bedId, {
                ...gardenBeds.find((bed) => bed.id === bedId),
                top_position: newBedData.top,
                left_position: newBedData.left,
                width: newBedData.width,
                height: newBedData.height,
            });
            await updatePlantsApi(userId, gardenId, bedId, newBedData.plants);
            await refreshUserData();
            setUnsavedPositions((prev) => {
                const updated = { ...prev };
                delete updated[bedId];
                return updated;
            });
            setSelectedBedId(null);
        } catch (err) {
            console.error("Failed to save bed position and dimensions", err);
        }
    };

    const onUnplaceBed = async (bed) => {
        if (!userId || !gardenId || !bed.id) {
            console.error('Missing required parameters for unplacing bed.');
            return;
        }
        const updatedBedData = {
            ...bed,
            top_position: -1,
            left_position: -1,
        };
        try {
            await updateBedApi(userId, gardenId, bed.id, updatedBedData);
            await refreshUserData();
            setSelectedBedId(null);
        } catch (error) {
            console.error(`Error unplacing bed ${bed.id}:`, error);
        }
    };

    const onCancelPlacement = (bedId) => {
        setUnsavedPositions(prev => {
            const updated = { ...prev };
            delete updated[bedId];
            return updated;
        });
        setSelectedBedId(null);
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-neutral-800 text-white font-sans antialiased overflow-hidden">
            {/* Top Bar - Mobile/Tablet/Desktop */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-neutral-900 border-b border-neutral-700">
                <div className="flex items-center justify-between w-full sm:w-auto mb-4 sm:mb-0">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button onClick={handleBack} className="p-2 rounded-full hover:bg-neutral-700">
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <input
                            type="text"
                            value={gardenName}
                            onChange={handleNameChange}
                            className="w-40 sm:w-48 px-3 py-2 bg-neutral-700 text-white rounded-lg"
                            placeholder="Garden Name"
                        />
                    </div>
                    <button onClick={toggleHeader} className="sm:hidden p-2 rounded-full hover:bg-neutral-700">
                        {isHeaderOpen ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
                <div className={`${isHeaderOpen ? 'flex' : 'hidden'} flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm font-medium w-full sm:w-auto sm:flex`}>
                    <label className="flex items-center space-x-2 w-full sm:w-auto">
                        <Ruler className="w-5 h-5 text-gray-400" />
                        <input
                            type="number"
                            value={gardenWidth}
                            onChange={handleWidthChange}
                            className="w-24 px-3 py-2 bg-neutral-700 text-white rounded-lg"
                            min="1"
                            max="50"
                        />
                    </label>
                    <label className="flex items-center space-x-2 w-full sm:w-auto">
                        <Ruler className="w-5 h-5 text-gray-400" />
                        <input
                            type="number"
                            value={gardenHeight}
                            onChange={handleHeightChange}
                            className="w-24 px-3 py-2 bg-neutral-700 text-white rounded-lg"
                            min="1"
                            max="50"
                        />
                    </label>
                    <button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges}
                        className={`flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 rounded-lg transition w-full sm:w-auto ${hasUnsavedChanges
                            ? 'bg-emerald-600 hover:bg-emerald-500'
                            : 'bg-neutral-700 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Save className="w-5 h-5" />
                        <span>Save</span>
                    </button>
                    <button
                        onClick={handleCancelChanges}
                        disabled={!hasUnsavedChanges}
                        className={`flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 rounded-lg transition w-full sm:w-auto ${hasUnsavedChanges
                            ? 'bg-red-600 hover:bg-red-500'
                            : 'bg-neutral-700 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <X className="w-5 h-5" />
                        <span>Cancel</span>
                    </button>
                </div>
            </div>
            {/* Main Garden Area */}
            <GardenView
                gardenId={gardenId}
                gardenWidth={parseInt(gardenWidth)}
                gardenHeight={parseInt(gardenHeight)}
                displayWidth={displayWidth}
                displayHeight={displayHeight}
                beds={gardenBeds}
                selectedBedId={selectedBedId}
                onSelectBed={(bedId) => setSelectedBedId(bedId)}
                unsavedPositions={unsavedPositions}
                setUnsavedPositions={setUnsavedPositions}
                onConfirmPlacement={onConfirmPlacement}
                onCancelPlacement={onCancelPlacement}
                onGardenClick={onGardenClick}
                setSelectedBedId={setSelectedBedId}
                onEditBed={handleEditBed}
                onUnplaceBed={onUnplaceBed}
            />
            {/* Bottom Panel with Unplaced Beds */}
            <BedsPanel
                gardenBeds={gardenBeds}
                showUnplacedBeds={showUnplacedBeds}
                setShowUnplacedBeds={setShowUnplacedBeds}
                isBedsOpen={isBedsOpen}
                toggleBeds={toggleBeds}
                bedPanelHeight={bedPanelHeight}
                isDragging={isDragging}
                handleMouseDown={handleMouseDown}
                selectedBedId={selectedBedId}
                handleCardClick={handleCardClick}
                handleDeleteBed={handleDeleteBed}
                handleEditBed={handleEditBed}
            />
            {/* Add Bed Button */}
            <button
                onClick={openAddBedModal}
                className="fixed bottom-6 right-6 p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 transition z-50 sm:p-3"
                aria-label="Add Bed"
            >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {/* Add Bed Modal */}
            <AddBedModal
                isOpen={isAddBedOpen}
                onClose={closeAddBedModal}
                userId={userId}
                garden={garden}
                onSuccess={handleBedAdded}
            />
        </div>
    );
};

export default GardenPage;