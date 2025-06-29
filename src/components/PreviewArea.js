// src/components/PreviewArea.js
import React, { useState, useRef, useEffect } from "react";
import SpriteWrapper from "./SpriteWrapper";
import { FaFlag, FaUndo, FaPlay, FaChevronDown } from "react-icons/fa";

export default function PreviewArea({ sprites, selectedSprites, onGlobalPlay, selectedSpriteId, onSpriteSelect, onSpriteDisplayToggle, registerSpriteRef, onAnimationSwap }) {
  const stageRef = useRef(null);
  const [coordinates, setCoordinates] = useState({});
  const spriteRefs = useRef({});
  const [editingCoordinates, setEditingCoordinates] = useState({});
  const [collisionCooldown, setCollisionCooldown] = useState({});
  const [heroSectionEnabled, setHeroSectionEnabled] = useState(false);
  const [showSwapNotification, setShowSwapNotification] = useState(false);
  const [collidingSprites, setCollidingSprites] = useState([]);
  const [swappedSprites, setSwappedSprites] = useState([]);
  
  // NEW: Additional state for collision-based animation swapping
  const [collisionSwapEnabled, setCollisionSwapEnabled] = useState(false);
  const [collisionSwapCooldown, setCollisionSwapCooldown] = useState({});
  const [collisionSwapNotification, setCollisionSwapNotification] = useState(false);

  // Create refs for each sprite
  const getSpriteRef = (spriteId) => {
    if (!spriteRefs.current[spriteId]) {
      spriteRefs.current[spriteId] = React.createRef();
    }
    return spriteRefs.current[spriteId];
  };

  // Track sprite positions relative to center of stage
  useEffect(() => {
    const updateCoordinates = () => {
      if (stageRef.current) {
        const stageRect = stageRef.current.getBoundingClientRect();
        const centerX = stageRect.left + stageRect.width / 2;
        const centerY = stageRect.top + stageRect.height / 2;

        const newCoordinates = {};
        selectedSprites.forEach(sprite => {
          const spriteElement = document.querySelector(`[data-sprite-id="${sprite.id}"]`);
          if (spriteElement) {
            const spriteRect = spriteElement.getBoundingClientRect();
            const x = Math.round(spriteRect.left + spriteRect.width / 2 - centerX);
            const y = Math.round(centerY - (spriteRect.top + spriteRect.height / 2));
            newCoordinates[sprite.id] = { x, y };
          }
        });
        setCoordinates(newCoordinates);
        
        // Check for collisions when coordinates change
        if (Object.keys(newCoordinates).length >= 2) {
          console.log('Calling collision detection with', Object.keys(newCoordinates).length, 'sprites');
          checkCollisions(newCoordinates);
        } else {
          console.log('Not enough sprites for collision detection:', Object.keys(newCoordinates).length);
        }
      }
    };

    const interval = setInterval(updateCoordinates, 100);
    return () => clearInterval(interval);
  }, [selectedSprites, collisionCooldown]);

  // Reset all selected sprite positions
  const handleReset = () => {
    console.log('Reset button clicked - resetting all selected sprites');
    selectedSprites.forEach(sprite => {
      const spriteRef = spriteRefs.current[sprite.id];
      console.log(`Looking for sprite ref for reset with ID ${sprite.id}:`, spriteRef);
      
      if (spriteRef && spriteRef.current && spriteRef.current.reset) {
        console.log(`Calling reset on sprite ${sprite.id}`);
        spriteRef.current.reset();
      } else {
        console.log(`Sprite ref not found or reset method not available for sprite ${sprite.id}`);
        // Fallback to DOM manipulation if ref method is not available
        const spriteElement = document.querySelector(`[data-sprite-id="${sprite.id}"]`);
        if (spriteElement) {
          spriteElement.style.transform = "none";
          spriteElement.style.left = "50%";
          spriteElement.style.top = "50%";
          spriteElement.style.position = "absolute";
          spriteElement.style.translate = "-50% -50%";
        }
      }
    });
  };

  // Set sprite position manually
  const setSpritePosition = (spriteId, x, y) => {
    const spriteRef = spriteRefs.current[spriteId];
    if (spriteRef && spriteRef.current && spriteRef.current.setPosition) {
      console.log(`Setting position for sprite ${spriteId} to (${x}, ${y})`);
      spriteRef.current.setPosition(x, y);
    } else {
      console.log(`Sprite ref not found or setPosition method not available for sprite ${spriteId}`);
    }
  };

  // Handle coordinate input change
  const handleCoordinateChange = (spriteId, axis, value) => {
    const numValue = parseInt(value) || 0;
    const currentCoords = coordinates[spriteId] || { x: 0, y: 0 };
    const newCoords = { ...currentCoords, [axis]: numValue };
    
    // Update local state
    setCoordinates(prev => ({
      ...prev,
      [spriteId]: newCoords
    }));
    
    // Set the sprite position
    setSpritePosition(spriteId, newCoords.x, newCoords.y);
  };

  // Handle coordinate input click to prevent event bubbling
  const handleCoordinateInputClick = (e) => {
    e.stopPropagation();
  };

  // Handle coordinate input focus to prevent event bubbling
  const handleCoordinateInputFocus = (e) => {
    e.stopPropagation();
  };

  // Handle coordinate input start editing
  const handleCoordinateStartEdit = (spriteId, axis) => {
    setEditingCoordinates(prev => ({
      ...prev,
      [`${spriteId}-${axis}`]: true
    }));
  };

  // Handle coordinate input finish editing
  const handleCoordinateFinishEdit = (spriteId, axis, value) => {
    setEditingCoordinates(prev => ({
      ...prev,
      [`${spriteId}-${axis}`]: false
    }));
    handleCoordinateChange(spriteId, axis, value);
  };

  // Check for collisions and swap animations
  const checkCollisions = (currentCoordinates) => {
    console.log('=== COLLISION CHECK START ===');
    console.log('Collision check called with coordinates:', currentCoordinates);
    console.log('Hero section enabled:', heroSectionEnabled);
    console.log('Selected sprites:', selectedSprites.map(s => ({ id: s.id, name: s.name })));
    
    const spriteIds = Object.keys(currentCoordinates);
    console.log('Sprite IDs to check:', spriteIds);
    
    if (spriteIds.length < 2) {
      console.log('Not enough sprites for collision detection');
      return;
    }
    
    for (let i = 0; i < spriteIds.length; i++) {
      for (let j = i + 1; j < spriteIds.length; j++) {
        const spriteId1 = parseInt(spriteIds[i]);
        const spriteId2 = parseInt(spriteIds[j]);
        const coords1 = currentCoordinates[spriteId1];
        const coords2 = currentCoordinates[spriteId2];
        
        console.log(`Checking collision between sprite ${spriteId1} (${coords1?.x}, ${coords1?.y}) and sprite ${spriteId2} (${coords2?.x}, ${coords2?.y})`);
        
        if (!coords1 || !coords2) {
          console.log('Skipping - missing coordinates');
          continue;
        }
        
        // Check if coordinates match (collision)
        const tolerance = 20; // Increased tolerance for better collision detection
        const xMatch = Math.abs(coords1.x - coords2.x) <= tolerance;
        const yMatch = Math.abs(coords1.y - coords2.y) <= tolerance;
        
        console.log(`X difference: ${Math.abs(coords1.x - coords2.x)}, Y difference: ${Math.abs(coords1.y - coords2.y)}`);
        console.log(`X match: ${xMatch}, Y match: ${yMatch}`);
        console.log(`Tolerance: ${tolerance}`);
        
        if (xMatch && yMatch) {
          const collisionKey = `${spriteId1}-${spriteId2}`;
          const reverseCollisionKey = `${spriteId2}-${spriteId1}`;
          
          console.log('*** COLLISION DETECTED! ***');
          console.log('Current cooldown state:', collisionCooldown);
          console.log('Collision key:', collisionKey, 'Reverse key:', reverseCollisionKey);
          
          // Set colliding sprites for visual feedback
          setCollidingSprites([spriteId1, spriteId2]);
          
          // Check if we're not in cooldown for this collision
          if (!collisionCooldown[collisionKey] && !collisionCooldown[reverseCollisionKey]) {
            console.log(`*** COLLISION CONFIRMED between sprites ${spriteId1} and ${spriteId2}! ***`);
            
            // Only swap animations if hero section is enabled OR collision swap is enabled
            if (heroSectionEnabled || collisionSwapEnabled) {
              console.log('*** ANIMATION SWAP ENABLED - SWAPPING ANIMATIONS ***');
              
              // Store current collision position
              const collisionPosition = { x: coords1.x, y: coords1.y };
              console.log('Collision position:', collisionPosition);
              
              // Stop all current animations without resetting positions
              console.log('Stopping all current animations...');
              selectedSprites.forEach(sprite => {
                const spriteRef = spriteRefs.current[sprite.id];
                if (spriteRef && spriteRef.current) {
                  console.log(`Stopping animation for sprite ${sprite.id}`);
                  // Cancel any ongoing script execution
                  if (spriteRef.current.abortControllerRef?.current) {
                    spriteRef.current.abortControllerRef.current.abort();
                    console.log(`Aborted script execution for sprite ${sprite.id}`);
                  }
                }
              });
              
              // Swap animations
              console.log('Calling onAnimationSwap...');
              console.log('Before swap - Sprite 1 script:', selectedSprites.find(s => s.id === spriteId1)?.script);
              console.log('Before swap - Sprite 2 script:', selectedSprites.find(s => s.id === spriteId2)?.script);
              onAnimationSwap(spriteId1, spriteId2);
              
              // Track swapped sprites for notification
              const sprite1Name = selectedSprites.find(s => s.id === spriteId1)?.name || `Sprite ${spriteId1}`;
              const sprite2Name = selectedSprites.find(s => s.id === spriteId2)?.name || `Sprite ${spriteId2}`;
              setSwappedSprites([sprite1Name, sprite2Name]);
              
              // Restart animations with swapped scripts after a short delay
              setTimeout(() => {
                console.log('Restarting animations with swapped scripts...');
                console.log('After swap - Sprite 1 script:', selectedSprites.find(s => s.id === spriteId1)?.script);
                console.log('After swap - Sprite 2 script:', selectedSprites.find(s => s.id === spriteId2)?.script);
                
                // Only restart the colliding sprites with their new swapped scripts
                const sprite1Ref = spriteRefs.current[spriteId1];
                const sprite2Ref = spriteRefs.current[spriteId2];
                
                if (sprite1Ref && sprite1Ref.current && sprite1Ref.current.runScript) {
                  console.log(`Restarting animation for sprite ${spriteId1} with swapped script`);
                  sprite1Ref.current.runScript();
                }
                
                if (sprite2Ref && sprite2Ref.current && sprite2Ref.current.runScript) {
                  console.log(`Restarting animation for sprite ${spriteId2} with swapped script`);
                  sprite2Ref.current.runScript();
                }
              }, 300); // Reduced delay for faster response
              
              // Show notification
              setShowSwapNotification(true);
              
              // Hide notification after 3 seconds
              setTimeout(() => {
                setShowSwapNotification(false);
                setSwappedSprites([]);
              }, 3000);
            } else {
              console.log('*** ANIMATION SWAP DISABLED - NO ANIMATION SWAP ***');
            }
            
            // Set cooldown to prevent multiple swaps
            setCollisionCooldown(prev => ({
              ...prev,
              [collisionKey]: true
            }));
            
            // Clear cooldown after 3 seconds (increased from 2 seconds)
            setTimeout(() => {
              setCollisionCooldown(prev => {
                const newCooldown = { ...prev };
                delete newCooldown[collisionKey];
                return newCooldown;
              });
            }, 3000);
          } else {
            console.log('Collision detected but in cooldown period');
          }
        } else {
          // Clear colliding sprites if no collision
          setCollidingSprites([]);
        }
      }
    }
    console.log('=== COLLISION CHECK END ===');
  };

  return (
    <div className="flex flex-col items-center justify-start h-full w-full p-4 bg-[#f0f0f0]">
      {/* Stage Area (upper rectangle) */}
      <div
        ref={stageRef}
        className="relative bg-white border border-gray-400 rounded shadow-md overflow-hidden"
        style={{ width: 480, height: 360 }}
      >
        {/* Collision Indicator */}
        {collidingSprites.length > 0 && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-lg font-medium z-50 animate-pulse">
            💥 COLLISION DETECTED!
          </div>
        )}
        
        {/* Hero Section Status */}
        {heroSectionEnabled && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-lg font-medium z-50">
            🎯 Hero Mode Active
          </div>
        )}
        
        {/* NEW: Collision Animation Swap Status */}
        {collisionSwapEnabled && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-lg font-medium z-50">
            🔄 Collision Swap Active
          </div>
        )}
        
        {/* Show all selected sprites */}
        {selectedSprites.map((sprite) => (
          <SpriteWrapper
            key={sprite.id}
            ref={getSpriteRef(sprite.id)}
            script={sprite.script}
            spriteType={sprite.type}
            spriteId={sprite.id}
            registerSpriteRef={registerSpriteRef}
            isColliding={collidingSprites.includes(sprite.id)}
          />
        ))}
      </div>

      {/* Bottom Panel */}
      <div className="w-[480px] mt-3 bg-gray-100 p-4 rounded shadow flex flex-col gap-y-2 text-sm">
        {/* Line 1: Sprite Selection Checkboxes */}
        <div className="flex justify-center mb-2">
          <div className="flex gap-4">
            {sprites.map((sprite) => (
              <label key={sprite.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sprite.isSelected}
                  onChange={() => onSpriteDisplayToggle(sprite.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className={`text-sm ${sprite.isSelected ? 'font-semibold' : 'text-gray-600'}`}>
                  {sprite.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Line 1.5: Hero Section Checkbox */}
        <div className="flex justify-center mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={heroSectionEnabled}
              onChange={(e) => setHeroSectionEnabled(e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className={`text-sm font-medium ${heroSectionEnabled ? 'text-green-700' : 'text-gray-600'}`}>
              🎯 Hero Section
            </span>
          </label>
        </div>

        {/* NEW: Collision Animation Swap Checkbox */}
        <div className="flex justify-center mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={collisionSwapEnabled}
              onChange={(e) => setCollisionSwapEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className={`text-sm font-medium ${collisionSwapEnabled ? 'text-blue-700' : 'text-gray-600'}`}>
              🔄 Collision Animation Swap
            </span>
          </label>
        </div>

        {/* Line 2: Global Play Button */}
        <div className="flex justify-center mb-2">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium"
            onClick={onGlobalPlay}
          >
            <FaPlay /> PLAY
          </button>
        </div>

        {/* Line 3: Selected Sprites Coordinates */}
        {selectedSprites.length > 0 && (
          <div className="grid grid-cols-1 gap-2">
            {selectedSprites.map((sprite) => (
              <div key={sprite.id} className="bg-white p-2 rounded border">
                <div className="font-semibold text-xs mb-1">{sprite.name}:</div>
                <div className="flex gap-4 text-xs items-center">
                  <div className="flex items-center gap-1">
                    <strong>X:</strong>
                    <input
                      key={`${sprite.id}-x-${coordinates[sprite.id]?.x || 0}`}
                      type="text"
                      defaultValue={coordinates[sprite.id]?.x || 0}
                      onBlur={(e) => handleCoordinateFinishEdit(sprite.id, 'x', e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCoordinateFinishEdit(sprite.id, 'x', e.target.value);
                        }
                      }}
                      onClick={(e) => handleCoordinateInputClick(e)}
                      onFocus={(e) => handleCoordinateStartEdit(sprite.id, 'x')}
                      className="w-12 px-1 py-0.5 text-center bg-white text-black rounded border border-gray-300 focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <strong>Y:</strong>
                    <input
                      key={`${sprite.id}-y-${coordinates[sprite.id]?.y || 0}`}
                      type="text"
                      defaultValue={coordinates[sprite.id]?.y || 0}
                      onBlur={(e) => handleCoordinateFinishEdit(sprite.id, 'y', e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCoordinateFinishEdit(sprite.id, 'y', e.target.value);
                        }
                      }}
                      onClick={(e) => handleCoordinateInputClick(e)}
                      onFocus={(e) => handleCoordinateStartEdit(sprite.id, 'y')}
                      className="w-12 px-1 py-0.5 text-center bg-white text-black rounded border border-gray-300 focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Line 4: Reset Button */}
        <div className="flex justify-center">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-2"
            onClick={handleReset}
          >
            <FaUndo /> Reset All
          </button>
        </div>

        {/* Line 5: Animation Swap Notification */}
        {showSwapNotification && swappedSprites.length > 0 && (
          <div className="flex justify-center">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium animate-pulse text-center">
              <div>🎉 Animations Swapped Successfully!</div>
              <div className="text-sm mt-1">
                {swappedSprites[0]} ↔ {swappedSprites[1]}
              </div>
            </div>
          </div>
        )}

        {/* NEW: Collision Animation Swap Notification */}
        {collisionSwapNotification && (
          <div className="flex justify-center">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium animate-pulse text-center">
              <div>🔄 Collision Animation Swap!</div>
              <div className="text-sm mt-1">
                Sprites swapped animations on collision!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
