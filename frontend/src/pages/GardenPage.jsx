import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Ruler, Box, Save } from 'lucide-react';
import { useUser } from '../hooks/UserUser';
import AddBedModal from '../modal/AddBedModal';
import { updateGardenApi } from '../utils/gardenUtil';
import { updateBedApi, deleteBedApi } from '../utils/bedUtil';
import GardenView from '../component/GardenView';
import BedsPanel from '../component/BedsPanel';

const GardenPage = () => {
    const { gardenId } = useParams();
    const navigate = useNavigate();
    const { gardens, refreshGardens, refreshBeds, refreshBed, userId, beds, loading, refreshPlants } = useUser();

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

    const [isHeaderOpen, setIsHeaderOpen] = useState(false);
    const [selectedBedId, setSelectedBedId] = useState(null);
    const [showUnplacedBeds, setShowUnplacedBeds] = useState(true);
    const [unsavedPositions, setUnsavedPositions] = useState({});

    const isDragging = useRef(false);

    useEffect(() => {
        if (gardens && gardenId) {
            const foundGarden = gardens.find((g) => g.id.toString() === gardenId);
            setGarden(foundGarden);
            if (foundGarden) {
                setGardenName(foundGarden.garden_name);
                setGardenWidth(foundGarden.width.toString());
                setGardenHeight(foundGarden.height.toString());
                setDisplayWidth(foundGarden.width * 10);
                setDisplayHeight(foundGarden.height * 10);
            }
        }
    }, [gardens, gardenId]);

    useEffect(() => {
        if (isBedsOpen) {
            setBedPanelHeight(300);
        } else {
            setBedPanelHeight(60);
        }
    }, [isBedsOpen]);

    const gardenBeds = beds?.[gardenId] ?? [];

    const handleBack = () => {
        refreshGardens();
        navigate(-1);
    }
    const openAddBedModal = () => setIsAddBedOpen(true);
    const closeAddBedModal = () => setIsAddBedOpen(false);
    const toggleBeds = () => setIsBedsOpen(prev => !prev);
    const toggleHeader = () => setIsHeaderOpen(prev => !prev);

    const handleBedAdded = () => {
        refreshBeds(gardenId);
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
            // 1. Update the garden info
            console.log("Updating the new garden ", userId, gardenId, newData);
            await updateGardenApi(userId, gardenId, newData);

            // 2. Update only beds with unsaved changes
            const updatePromises = Object.entries(unsavedPositions).map(([bedId, bedData]) => {
                const originalBed = gardenBeds.find(b => b.bed_id === bedId);
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

            // 3. Refresh garden and bed state
            setGarden({ ...garden, ...newData });
            await refreshBeds(gardenId);
            setUnsavedPositions({});
            setSelectedBedId(null);
            setHasUnsavedChanges(false);
            setDisplayWidth(newData.width * 10);
            setDisplayHeight(newData.height * 10);
        } catch (error) {
            console.error('Error saving garden and beds:', error);
        }
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
            await refreshBeds(gardenId);
        } catch (error) {
            console.error(`Error deleting bed ${bedId}:`, error);
        }
    };

    const handleEditBed = (bed) => {
        console.log("Editing bed:", bed.bed_id);
        refreshBed(gardenId,bed.bed_id);
        refreshPlants(gardenId,bed.bed_id);
        navigate(`/garden/${gardenId}/bed/${bed.bed_id}`);
        
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

    const handleCardClick = (bed) => {
        if (selectedBedId === bed.bed_id) {
            setSelectedBedId(null);
            setUnsavedPositions({});
        } else {
            console.log("BED ID IS ", bed.bed_id);
            setSelectedBedId(bed.bed_id);
            setUnsavedPositions({
                [bed.bed_id]: {
                    top: bed.top_position,
                    left: bed.left_position,
                    width: bed.width,
                    height: bed.height,
                }
            });
        }
    };

    const onGardenClick = ({ row, col }) => {
        // If no bed is selected, do nothing
        if (!selectedBedId) return;

        const bed = gardenBeds.find((b) => b.bed_id === selectedBedId);
        if (!bed) return;

        // Check if the bed is unplaced (positions are -1)
        const isUnplaced = bed.top_position === -1 && bed.left_position === -1;

        // Use the bed's original width/height if no unsaved changes exist
        const bedWidth = unsavedPositions[selectedBedId]?.width || bed.width;
        const bedHeight = unsavedPositions[selectedBedId]?.height || bed.height;

        // Check if the bed fits within the garden bounds
        if (
            row >= 0 &&
            col >= 0 &&
            row + bedHeight <= parseInt(gardenHeight) &&
            col + bedWidth <= parseInt(gardenWidth)
        ) {
            // If the bed is unplaced OR it's a placed bed being moved, update the unsaved positions
            if (isUnplaced || bed.top_position !== row || bed.left_position !== col) {
                setUnsavedPositions((prev) => ({
                    ...prev,
                    [selectedBedId]: {
                        ...prev[selectedBedId],
                        top: row,
                        left: col,
                        // Ensure width and height are included when initially placing
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
                ...gardenBeds.find((bed) => bed.bed_id === bedId),
                top_position: newBedData.top,
                left_position: newBedData.left,
                width: newBedData.width,
                height: newBedData.height,
            });
            await refreshBeds(gardenId);
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
        if (!userId || !gardenId || !bed.bed_id) {
            console.error('Missing required parameters for unplacing bed.');
            return;
        }

        // Create the updated bed object with new positions
        const updatedBedData = {
            ...bed,
            top_position: -1,
            left_position: -1,
        };

        try {
            await updateBedApi(userId, gardenId, bed.bed_id, updatedBedData);
            await refreshBeds(gardenId);
            // Deselect the bed after unplacing it
            setSelectedBedId(null);
        } catch (error) {
            console.error(`Error unplacing bed ${bed.bed_id}:`, error);
        }
    };

    // New function to handle the cancel action
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
                    {/* Hamburger menu button for mobile */}
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

                {/* Collapsible content for mobile */}
                <div className={`${isHeaderOpen ? 'flex' : 'hidden'} flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm font-medium w-full sm:w-auto sm:flex`}>
                    <label className="flex items-center space-x-2 w-full sm:w-auto">
                        <Ruler className="w-5 h-5 text-gray-400" />
                        <input
                            type="number"
                            value={gardenWidth}
                            onChange={handleWidthChange}
                            className="w-24 px-3 py-2 bg-neutral-700 text-white rounded-lg"
                        />
                    </label>
                    <label className="flex items-center space-x-2 w-full sm:w-auto">
                        <Ruler className="w-5 h-5 text-gray-400" />
                        <input
                            type="number"
                            value={gardenHeight}
                            onChange={handleHeightChange}
                            className="w-24 px-3 py-2 bg-neutral-700 text-white rounded-lg"
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
                </div>
            </div>

            {/* Main Garden Area */}
            <GardenView
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
                onCancelPlacement={onCancelPlacement} // Pass the new cancel handler
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
                gardenId={gardenId}
                onSuccess={handleBedAdded}
            />
        </div>
    );
};

export default GardenPage;