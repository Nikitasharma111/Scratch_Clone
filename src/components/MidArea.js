// src/components/MidArea.js
import React, { useState } from "react";

export default function MidArea({ script, setScript, selectedSprite, onSpriteSelect, sprites }) {
  const [dragIndexPath, setDragIndexPath] = useState(null); // for nested indexes

  const handleDrop = (e) => {
    try {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData("block"));
      console.log('Dropped block data:', data);
      
      // Add to main script (no special handling for repeat blocks)
      const newScript = [...script, data];
      console.log('Adding block to script:', data, 'New script length:', newScript.length);
      setScript(newScript);
    } catch (error) {
      console.error('Error in handleDrop:', error);
      // Don't update script if there's an error
    }
  };

  const handleDragStart = (e, path, block) => {
    setDragIndexPath(path);
    e.dataTransfer.setData("block", JSON.stringify(block));
  };

  const handleDragEnd = (e) => {
    const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
    if (dropTarget && dropTarget.closest(".sidebar-area")) {
      const updated = [...script];
      removeBlockAtPath(updated, dragIndexPath);
      setScript(updated);
    }
    setDragIndexPath(null);
  };

  const removeBlockAtPath = (blocks, path) => {
    if (path.length === 1) {
      blocks.splice(path[0], 1);
    } else {
      const [head, ...rest] = path;
      removeBlockAtPath(blocks[head].children, rest);
    }
  };

  const updateBlockValue = (path, argIndex, newValue) => {
    const updated = [...script];
    updateBlockAtPath(updated, path, argIndex, newValue);
    setScript(updated);
  };

  const updateBlockAtPath = (blocks, path, argIndex, newValue) => {
    if (path.length === 1) {
      const block = blocks[path[0]];
      const newArgs = [...(block.args || [])];
      // Convert to number if it's a numeric field
      if (block.type === "move" || block.type === "turn" || block.type === "goto" || block.type === "repeat") {
        newArgs[argIndex] = parseInt(newValue) || 0;
      } else {
        newArgs[argIndex] = newValue;
      }
      block.args = newArgs;
    } else {
      const [head, ...rest] = path;
      updateBlockAtPath(blocks[head].children, rest, argIndex, newValue);
    }
  };

  return (
    <div
      className="flex-1 bg-gray-100 p-4 overflow-y-auto"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Sprite Selection Tabs */}
      <div className="flex mb-4 border-b border-gray-300">
        {sprites.filter(sprite => sprite.isSelected).map((sprite) => (
          <button
            key={sprite.id}
            onClick={() => onSpriteSelect(sprite.id)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              selectedSprite?.id === sprite.id
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {sprite.name}
          </button>
        ))}
      </div>

      <h2 className="text-lg font-bold mb-2">Script Area - {selectedSprite?.name || "No Sprite Selected"}</h2>
      {selectedSprite ? (
        Array.isArray(script) && script.length > 0 ? (
          script.map((block, index) => (
            <BlockItem
              key={index}
              block={block}
              path={[index]}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onValueChange={updateBlockValue}
            />
          ))
        ) : (
          <div className="text-gray-500 text-center py-8">
            Drag animation blocks here to create a script for {selectedSprite.name}
          </div>
        )
      ) : (
        <div className="text-gray-500 text-center py-8">
          Select a sprite to edit its script
        </div>
      )}
    </div>
  );
}

function BlockItem({ block, path, onDragStart, onDragEnd, onValueChange }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleValueClick = (index, value) => {
    setEditingIndex(index);
    setEditValue(value.toString());
  };

  const handleValueSubmit = () => {
    if (onValueChange && editingIndex !== null) {
      onValueChange(path, editingIndex, editValue);
    }
    setEditingIndex(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleValueSubmit();
    } else if (e.key === "Escape") {
      setEditingIndex(null);
    }
  };

  const renderEditableValue = (index, value, label = "") => {
    if (editingIndex === index) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleValueSubmit}
          onKeyPress={handleKeyPress}
          className="w-12 px-1 py-0.5 text-center bg-white text-black rounded border border-gray-300 focus:outline-none focus:border-blue-500"
          autoFocus
        />
      );
    } else {
      return (
        <span
          onClick={() => handleValueClick(index, value)}
          className="inline-block w-12 px-1 py-0.5 text-center bg-white text-black rounded border border-gray-300 cursor-pointer hover:bg-gray-100"
        >
          {value}
        </span>
      );
    }
  };

  const renderEditableText = (index, value, label = "") => {
    if (editingIndex === index) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleValueSubmit}
          onKeyPress={handleKeyPress}
          className="w-20 px-1 py-0.5 text-center bg-white text-black rounded border border-gray-300 focus:outline-none focus:border-blue-500"
          autoFocus
        />
      );
    } else {
      return (
        <span
          onClick={() => handleValueClick(index, value)}
          className="inline-block w-20 px-1 py-0.5 text-center bg-white text-black rounded border border-gray-300 cursor-pointer hover:bg-gray-100"
        >
          {value}
        </span>
      );
    }
  };

  return (
    <div
      className="bg-white p-2 shadow mb-2 rounded cursor-pointer"
      draggable
      onDragStart={(e) => onDragStart(e, path, block)}
      onDragEnd={onDragEnd}
    >
      {block.type === "move" && (
        <>Move {renderEditableValue(0, block.args?.[0] || 10)} steps</>
      )}
      {block.type === "turn" && (
        <>Turn {renderEditableValue(0, block.args?.[0] || 15)} degrees</>
      )}
      {block.type === "goto" && (
        <>Go to x: {renderEditableValue(0, block.args?.[0] || 0)}, y: {renderEditableValue(1, block.args?.[1] || 0)}</>
      )}
      {block.type === "say" && (
        <>Say "{renderEditableText(0, block.args?.[0] || "Hello")}" for {renderEditableValue(1, block.args?.[1] || 2)}s</>
      )}
      {block.type === "think" && (
        <>Think "{renderEditableText(0, block.args?.[0] || "Hmm...")}" for {renderEditableValue(1, block.args?.[1] || 2)}s</>
      )}
      {block.type === "repeat" && (
        <>
          Repeat {renderEditableValue(0, block.args?.[0] || 5)} times
        </>
      )}
      {!block.type && (
        <div className="text-red-500">Invalid block type</div>
      )}
    </div>
  );
}
