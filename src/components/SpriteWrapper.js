// src/components/SpriteWrapper.js
import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import CatSprite from "./CatSprite";
import ButterflySprite from "./ButterflySprite";
import BallSprite from "./BallSprite";

const SpriteWrapper = forwardRef(({ script, spriteType = "cat", spriteId, registerSpriteRef, isColliding = false }, ref) => {
  const spriteRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef(0);
  const scriptRef = useRef(script);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("say");
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [isScriptRunning, setIsScriptRunning] = useState(false);
  const abortControllerRef = useRef(null);
  const animationRef = useRef(null);

  // Update script ref when script changes
  useEffect(() => {
    scriptRef.current = script;
  }, [script]);

  // Register this sprite with the parent component
  useEffect(() => {
    console.log(`Sprite ${spriteId} attempting to register with registerSpriteRef:`, registerSpriteRef, 'ref:', ref);
    if (registerSpriteRef && ref) {
      console.log(`Registering sprite ${spriteId} with ref:`, ref);
      registerSpriteRef(spriteId, ref);
    } else {
      console.log(`Cannot register sprite ${spriteId} - registerSpriteRef:`, registerSpriteRef, 'ref:', ref);
    }
  }, [spriteId, registerSpriteRef]);

  // Expose runScript method to parent component
  useImperativeHandle(ref, () => ({
    runScript: () => {
      console.log(`Sprite ${spriteId} runScript called directly - STARTING ANIMATION FROM CURRENT POSITION`);
      console.log(`Current position before runScript: (${positionRef.current.x}, ${positionRef.current.y})`);
      
      // Clear any existing animations
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
        console.log(`Cleared existing animation for sprite ${spriteId}`);
      }
      
      // Cancel any ongoing script execution
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        console.log(`Aborted previous script execution for sprite ${spriteId}`);
      }
      
      // Create new abort controller for this execution
      abortControllerRef.current = new AbortController();
      
      // Clear any existing messages
      setMessage(null);
      
      // Ensure the sprite is positioned correctly before starting
      if (spriteRef.current) {
        spriteRef.current.style.left = "50%";
        spriteRef.current.style.top = "50%";
        spriteRef.current.style.position = "absolute";
        spriteRef.current.style.translate = "-50% -50%";
        spriteRef.current.style.transform = `translate(${positionRef.current.x}px, ${-positionRef.current.y}px) rotate(${rotationRef.current}deg)`;
        console.log(`Applied transform for sprite ${spriteId}: translate(${positionRef.current.x}px, ${-positionRef.current.y}px) rotate(${rotationRef.current}deg)`);
      }
      
      // Start new script execution (don't reset position - keep current position like MIT Scratch)
      setIsScriptRunning(true);
      
      // Execute the script with a small delay to ensure state is reset
      setTimeout(() => {
        console.log(`Starting script execution for sprite ${spriteId} from position: (${positionRef.current.x}, ${positionRef.current.y})`);
        executeBlocks(scriptRef.current)
          .then(() => {
            console.log(`Script execution completed for sprite ${spriteId} at final position: (${positionRef.current.x}, ${positionRef.current.y})`);
          })
          .catch((error) => {
            if (error.name !== 'AbortError') {
              console.error('Script execution error:', error);
            } else {
              console.log(`Script execution aborted for sprite ${spriteId}`);
            }
          })
          .finally(() => {
            setIsScriptRunning(false);
          });
      }, 50);
    },
    
    reset: () => {
      console.log(`Sprite ${spriteId} reset called - RESETTING TO STARTING POSITION`);
      
      // Cancel any ongoing script execution
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear any existing animations
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
      
      // Reset script running state
      setIsScriptRunning(false);
      setMessage(null);
      
      // Reset sprite position and rotation to starting position based on sprite type
      let startX = 0, startY = 0;
      
      switch (spriteType) {
        case "cat":
          startX = 0;
          startY = 0;
          break;
        case "butterfly":
          startX = -100;
          startY = -50;
          break;
        case "ball":
          startX = 100;
          startY = 50;
          break;
        default:
          startX = 0;
          startY = 0;
      }
      
      positionRef.current = { x: startX, y: startY };
      rotationRef.current = 0;
      
      if (spriteRef.current) {
        spriteRef.current.style.left = "50%";
        spriteRef.current.style.top = "50%";
        spriteRef.current.style.position = "absolute";
        spriteRef.current.style.translate = "-50% -50%";
        spriteRef.current.style.transform = `translate(${startX}px, ${-startY}px) rotate(0deg)`;
        console.log(`Reset ${spriteType} sprite ${spriteId} to starting position: (${startX}, ${startY})`);
      }
    },
    
    setPosition: (x, y) => {
      console.log(`Sprite ${spriteId} setPosition called - SETTING TO (${x}, ${y})`);
      
      // Cancel any ongoing script execution
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear any existing animations
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
      
      // Reset script running state
      setIsScriptRunning(false);
      setMessage(null);
      
      // Set sprite position to specified coordinates
      positionRef.current = { x, y };
      rotationRef.current = 0;
      
      if (spriteRef.current) {
        spriteRef.current.style.left = "50%";
        spriteRef.current.style.top = "50%";
        spriteRef.current.style.position = "absolute";
        spriteRef.current.style.translate = "-50% -50%";
        spriteRef.current.style.transform = `translate(${x}px, ${-y}px) rotate(0deg)`;
        console.log(`Set ${spriteType} sprite ${spriteId} to position: (${x}, ${y})`);
      }
    },
    
    // Expose abortControllerRef for external access
    abortControllerRef: abortControllerRef
  }), [spriteId]);

  const clampAndApplyTransform = () => {
    const el = spriteRef.current;
    const stage = el?.parentElement;
    if (!stage || !el) return;

    const sw = el.offsetWidth;
    const sh = el.offsetHeight;
    const stw = stage.offsetWidth;
    const sth = stage.offsetHeight;

    const halfW = sw / 2;
    const halfH = sh / 2;

    // Clamp position to keep sprite within stage bounds
    positionRef.current.x = Math.max(
      -stw / 2 + halfW,
      Math.min(stw / 2 - halfW, positionRef.current.x)
    );
    positionRef.current.y = Math.max(
      -sth / 2 + halfH,
      Math.min(sth / 2 - halfH, positionRef.current.y)
    );

    // Apply transform with hardware acceleration for smooth movement
    el.style.transform = `translate3d(${positionRef.current.x}px, ${-positionRef.current.y}px, 0) rotate(${rotationRef.current}deg)`;
  };

  // Drag functionality
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't start dragging if script is running
    if (isScriptRunning) return;
    
    setIsDragging(true);
    
    const stage = spriteRef.current?.parentElement;
    if (!stage) return;

    const stageRect = stage.getBoundingClientRect();
    
    // Calculate mouse position relative to stage center
    const mouseX = e.clientX - stageRect.left - stageRect.width / 2;
    const mouseY = stageRect.top + stageRect.height / 2 - e.clientY;
    
    // Store the difference between mouse and sprite position
    dragStartRef.current = {
      x: mouseX - positionRef.current.x,
      y: mouseY - positionRef.current.y
    };

    spriteRef.current.style.cursor = "grabbing";
    spriteRef.current.style.userSelect = "none";
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const stage = spriteRef.current?.parentElement;
    if (!stage) return;

    const stageRect = stage.getBoundingClientRect();
    
    // Calculate mouse position relative to stage center
    const mouseX = e.clientX - stageRect.left - stageRect.width / 2;
    const mouseY = stageRect.top + stageRect.height / 2 - e.clientY;
    
    // Calculate new sprite position
    const newX = mouseX - dragStartRef.current.x;
    const newY = mouseY - dragStartRef.current.y;

    // Update position ref
    positionRef.current.x = newX;
    positionRef.current.y = newY;

    // Apply transform immediately for smooth dragging
    clampAndApplyTransform();
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (spriteRef.current) {
        spriteRef.current.style.cursor = "grab";
        spriteRef.current.style.userSelect = "auto";
      }
    }
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e) => {
        e.preventDefault();
        handleMouseMove(e);
      };
      
      const handleGlobalMouseUp = (e) => {
        e.preventDefault();
        handleMouseUp();
      };

      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalMouseUp, { passive: false });
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const executeBlocks = useCallback(async (blocks) => {
    console.log(`Sprite ${spriteId} executing blocks:`, blocks);
    
    if (!blocks || blocks.length === 0) {
      console.log(`No blocks to execute for sprite ${spriteId}`);
      return;
    }

    // First pass: find repeat blocks and mark the move block before it to be skipped
    const skipBlocks = new Set();
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].type === "repeat") {
        // Mark the last move block before this repeat block to be skipped in normal execution
        for (let j = i - 1; j >= 0; j--) {
          if (blocks[j].type === "move") {
            skipBlocks.add(j);
            break;
          }
        }
      }
    }

    // Execute all blocks in order
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      
      // Check if script execution was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        console.log(`Script execution aborted for sprite ${spriteId} at block ${i}`);
        return;
      }

      // Skip blocks that will be executed in repeat loops
      if (skipBlocks.has(i)) {
        console.log(`Sprite ${spriteId} skipping block ${i} in normal execution (will be executed in repeat loop):`, block);
        continue;
      }

      console.log(`Sprite ${spriteId} executing block ${i}:`, block);

      switch (block.type) {
        case "move": {
          const dx = parseInt(block.args[0]);
          console.log(`Sprite ${spriteId} MOVE: Current position (${positionRef.current.x}, ${positionRef.current.y}), moving ${dx} steps`);
          positionRef.current.x += dx;
          console.log(`Sprite ${spriteId} MOVE: New position after move (${positionRef.current.x}, ${positionRef.current.y})`);
          clampAndApplyTransform();
          await delay(300);
          break;
        }

        case "turn": {
          const angle = parseInt(block.args[0]);
          rotationRef.current += angle;
          clampAndApplyTransform();
          await delay(300);
          break;
        }

        case "goto": {
          positionRef.current = {
            x: parseInt(block.args[0]),
            y: parseInt(block.args[1]),
          };
          clampAndApplyTransform();
          break;
        }

        case "say":
        case "think": {
          setMessageType(block.type);
          setMessage(block.args[0]);
          await delay(parseInt(block.args[1]) * 1000);
          if (!abortControllerRef.current?.signal.aborted) {
            setMessage(null);
          }
          break;
        }

        case "repeat": {
          const times = parseInt(block.args[0]);
          console.log(`Sprite ${spriteId} repeating ${times} times`);
          
          // Get only the last move block before this repeat block
          let lastMoveBlock = null;
          for (let j = i - 1; j >= 0; j--) {
            if (blocks[j].type === "move") {
              lastMoveBlock = blocks[j];
              break;
            }
          }
          
          if (lastMoveBlock) {
            console.log(`Sprite ${spriteId} will repeat this move block:`, lastMoveBlock);
            console.log(`Sprite ${spriteId} starting position before repeat: (${positionRef.current.x}, ${positionRef.current.y})`);
            
            // Execute the last move block the specified number of times
            for (let j = 0; j < times; j++) {
              if (abortControllerRef.current?.signal.aborted) {
                console.log(`Repeat loop aborted for sprite ${spriteId}`);
                return;
              }
              console.log(`Sprite ${spriteId} repeat iteration ${j + 1}/${times}, position: (${positionRef.current.x}, ${positionRef.current.y})`);
              
              // Execute the move block
              const dx = parseInt(lastMoveBlock.args[0]);
              console.log(`Sprite ${spriteId} REPEAT MOVE: Current position (${positionRef.current.x}, ${positionRef.current.y}), moving ${dx} steps`);
              positionRef.current.x += dx;
              console.log(`Sprite ${spriteId} REPEAT MOVE: New position after move (${positionRef.current.x}, ${positionRef.current.y})`);
              clampAndApplyTransform();
              await delay(300);
            }
            console.log(`Sprite ${spriteId} finished repeat block, final position: (${positionRef.current.x}, ${positionRef.current.y})`);
          } else {
            console.log(`Sprite ${spriteId} no move block found to repeat`);
          }
          break;
        }

        default:
          console.log(`Unknown block type: ${block.type}`);
          break;
      }
    }
    
    console.log(`Sprite ${spriteId} finished executing all blocks`);
  }, [spriteId]);

  // Set initial position based on sprite ID
  useEffect(() => {
    const el = spriteRef.current;
    if (el && spriteId) {
      // Only set initial position if position is at origin (indicating no manual position set)
      if (positionRef.current.x === 0 && positionRef.current.y === 0) {
        // Set different starting positions for each sprite type
        let startX = 0, startY = 0;
        
        switch (spriteType) {
          case "cat":
            startX = 0;
            startY = 0;
            break;
          case "butterfly":
            startX = -100;
            startY = -50;
            break;
          case "ball":
            startX = 100;
            startY = 50;
            break;
          default:
            startX = 0;
            startY = 0;
        }
        
        positionRef.current = { x: startX, y: startY };
        el.style.transform = `translate(${startX}px, ${-startY}px) rotate(0deg)`;
        console.log(`Set initial position for ${spriteType} sprite ${spriteId}: (${startX}, ${startY})`);
      } else {
        // Preserve existing position
        el.style.transform = `translate(${positionRef.current.x}px, ${-positionRef.current.y}px) rotate(0deg)`;
        console.log(`Preserving existing position for ${spriteType} sprite ${spriteId}: (${positionRef.current.x}, ${positionRef.current.y})`);
      }
    }
  }, [spriteId, spriteType]);

  const renderSprite = () => {
    switch (spriteType) {
      case "butterfly":
        return <ButterflySprite />;
      case "cat":
        return <CatSprite />;
      case "ball":
        return <BallSprite />;
      default:
        return <CatSprite />;
    }
  };

  return (
    <div
      ref={spriteRef}
      data-sprite-wrapper
      data-sprite-id={spriteId}
      className={`transition-transform duration-300 cursor-grab select-none ${
        isColliding ? 'animate-pulse shadow-lg shadow-red-500' : ''
      }`}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        translate: "-50% -50%",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        zIndex: spriteId === 1 ? 10 : 20, // Ensure sprites don't overlap
        willChange: isDragging ? "transform" : "auto", // Optimize for dragging
        transform: "translate3d(0px, 0px, 0px) rotate(0deg)", // Initial transform
        filter: isColliding ? 'drop-shadow(0 0 10px #ef4444)' : 'none' // Red glow when colliding
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Message bubble */}
      {message && (
        <div
          className={`absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded shadow text-sm ${
            messageType === "say" ? "bg-white border" : "bg-purple-100 border-purple-300"
          }`}
        >
          {messageType === "say" ? `💬 ${message}` : `💭 ${message}`}
        </div>
      )}

      {renderSprite()}
    </div>
  );
});

export default SpriteWrapper;