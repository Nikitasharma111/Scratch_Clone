// src/App.js
import React, { useState, useRef } from "react";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";

export default function App() {
  const [sprites, setSprites] = useState([
    {
      id: 1,
      name: "Cat",
      type: "cat",
      script: [],
      isSelected: true
    },
    {
      id: 2,
      name: "Butterfly",
      type: "butterfly",
      script: [],
      isSelected: false
    },
    {
      id: 3,
      name: "Ball",
      type: "ball",
      script: [],
      isSelected: false
    }
  ]);

  const [selectedSpriteId, setSelectedSpriteId] = useState(1);
  const spriteRefs = useRef({});

  // Get the currently selected sprite for editing
  const selectedSprite = sprites.find(sprite => sprite.id === selectedSpriteId && sprite.isSelected) || 
                        sprites.find(sprite => sprite.isSelected);
  
  // Get all sprites that are selected for display
  const selectedSprites = sprites.filter(sprite => sprite.isSelected);

  // Register sprite ref
  const registerSpriteRef = (spriteId, ref) => {
    console.log(`Registering sprite ref for sprite ${spriteId}:`, ref);
    spriteRefs.current[spriteId] = ref;
    console.log('Current sprite refs:', spriteRefs.current);
  };

  // Handle adding blocks to the selected sprite
  const handleAddBlock = (block) => {
    if (!selectedSprite) {
      console.log('No sprite selected for editing');
      return;
    }
    
    console.log('Adding block to sprite:', selectedSprite.id, selectedSprite.name, block);
    setSprites(prevSprites => 
      prevSprites.map(sprite => 
        sprite.id === selectedSprite.id 
          ? { ...sprite, script: [...sprite.script, block] }
          : sprite
      )
    );
  };

  // Handle script changes for the selected sprite
  const handleScriptChange = (updatedScript) => {
    try {
      if (!selectedSprite) {
        console.log('No sprite selected for editing');
        return;
      }
      
      console.log('Updating script for sprite:', selectedSprite.id, selectedSprite.name, 'New script:', updatedScript);
      setSprites(prevSprites => 
        prevSprites.map(sprite => 
          sprite.id === selectedSprite.id 
            ? { ...sprite, script: updatedScript || [] }
            : sprite
        )
      );
    } catch (error) {
      console.error('Error updating script:', error);
    }
  };

  // Handle sprite selection for editing
  const handleSpriteSelect = (spriteId) => {
    setSelectedSpriteId(spriteId);
  };

  // Handle sprite selection for display (toggle selection)
  const handleSpriteDisplayToggle = (spriteId) => {
    setSprites(prevSprites => {
      const updatedSprites = prevSprites.map(sprite => 
        sprite.id === spriteId 
          ? { ...sprite, isSelected: !sprite.isSelected }
          : sprite
      );
      
      // If the currently selected sprite for editing is being deselected,
      // automatically switch to the first available selected sprite
      if (spriteId === selectedSpriteId && !updatedSprites.find(s => s.id === spriteId)?.isSelected) {
        const firstSelectedSprite = updatedSprites.find(sprite => sprite.isSelected);
        if (firstSelectedSprite) {
          setSelectedSpriteId(firstSelectedSprite.id);
        }
      }
      
      return updatedSprites;
    });
  };

  // Handle global play - run all sprites
  const handleGlobalPlay = () => {
    console.log('Global play button clicked, selected sprites:', selectedSprites);
    console.log('Available sprite refs:', Object.keys(spriteRefs.current));
    
    // Call runScript directly on each selected sprite
    selectedSprites.forEach((sprite, index) => {
      setTimeout(() => {
        const spriteRef = spriteRefs.current[sprite.id];
        console.log(`Looking for sprite ref with ID ${sprite.id}:`, spriteRef);
        
        if (spriteRef && spriteRef.current && spriteRef.current.runScript) {
          console.log(`Calling runScript on sprite ${sprite.id}`);
          spriteRef.current.runScript();
        } else {
          console.log(`Sprite ref not found or runScript method not available for sprite ${sprite.id}`);
          console.log('spriteRef:', spriteRef);
          console.log('spriteRef.current:', spriteRef?.current);
        }
      }, index * 100); // Small delay between sprites
    });
  };

  // Handle animation swapping between sprites
  const handleAnimationSwap = (spriteId1, spriteId2) => {
    console.log(`Swapping animations between sprites ${spriteId1} and ${spriteId2}`);
    
    setSprites(prevSprites => {
      const sprite1 = prevSprites.find(s => s.id === spriteId1);
      const sprite2 = prevSprites.find(s => s.id === spriteId2);
      
      if (!sprite1 || !sprite2) {
        console.log('One or both sprites not found for animation swap');
        return prevSprites;
      }
      
      console.log('Before swap:');
      console.log(`Sprite ${spriteId1} (${sprite1.name}) script:`, sprite1.script);
      console.log(`Sprite ${spriteId2} (${sprite2.name}) script:`, sprite2.script);
      
      // Swap the scripts
      const updatedSprites = prevSprites.map(sprite => {
        if (sprite.id === spriteId1) {
          return { ...sprite, script: [...sprite2.script] };
        } else if (sprite.id === spriteId2) {
          return { ...sprite, script: [...sprite1.script] };
        }
        return sprite;
      });
      
      const newSprite1 = updatedSprites.find(s => s.id === spriteId1);
      const newSprite2 = updatedSprites.find(s => s.id === spriteId2);
      
      console.log('After swap:');
      console.log(`Sprite ${spriteId1} (${newSprite1.name}) script:`, newSprite1.script);
      console.log(`Sprite ${spriteId2} (${newSprite2.name}) script:`, newSprite2.script);
      
      console.log('Animation swap completed');
      return updatedSprites;
    });
  };

  return (
    <div className="bg-blue-100 pt-6 font-sans">
      <div className="h-screen overflow-hidden flex flex-row">
        {/* Left Side: Sidebar + MidArea */}
        <div className="flex-1 h-screen overflow-hidden flex flex-row bg-white border-t border-r border-gray-200 rounded-tr-xl mr-2">
          <Sidebar onAddBlock={handleAddBlock} />
          <MidArea 
            script={selectedSprite?.script || []} 
            setScript={handleScriptChange}
            selectedSprite={selectedSprite}
            onSpriteSelect={handleSpriteSelect}
            sprites={sprites}
          />
        </div>

        {/* Right Side: Preview Area */}
        <div className="w-1/3 h-screen overflow-hidden flex flex-row bg-white border-t border-l border-gray-200 rounded-tl-xl ml-2">
          <PreviewArea 
            sprites={sprites}
            selectedSprites={selectedSprites}
            onGlobalPlay={handleGlobalPlay}
            selectedSpriteId={selectedSpriteId}
            onSpriteSelect={handleSpriteSelect}
            onSpriteDisplayToggle={handleSpriteDisplayToggle}
            registerSpriteRef={registerSpriteRef}
            onAnimationSwap={handleAnimationSwap}
          />
        </div>
      </div>
    </div>
  );
}
