// src/components/Sidebar.js
import React from "react";
import Icon from "./Icon";
import { motionBlocks, looksBlocks } from "./blockData";

function Block({ block, onAddBlock }) {
  const { template, args } = block;

  const inputs = args.map((arg, i) => (
    <input
      key={i}
      defaultValue={arg}
      className="mx-1 w-10 px-1 text-black rounded"
      type="text"
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => e.stopPropagation()}
    />
  ));

  const parts = template.split(/____+/);

  const handleDragStart = (e) => {
    const updatedArgs = Array.from(e.currentTarget.querySelectorAll("input")).map(
      (input) => input.value
    );
    const updatedBlock = {
      ...block,
      args: updatedArgs,
    };
    e.dataTransfer.setData("block", JSON.stringify(updatedBlock));
  };

  const handleClick = (e) => {
    if (e.target.tagName !== 'INPUT') {
      const updatedArgs = Array.from(e.currentTarget.querySelectorAll("input")).map(
        (input) => input.value
      );
      const updatedBlock = {
        ...block,
        args: updatedArgs,
      };
      if (onAddBlock) {
        onAddBlock(updatedBlock);
      }
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      className={`flex flex-wrap items-center text-white px-2 py-1 my-2 text-sm cursor-pointer rounded select-none ${
        block.type === "say" || block.type === "think"
          ? "bg-purple-500"
          : block.type === "repeat"
          ? "bg-green-500"
          : block.type === "goto" ||
            block.type === "move" ||
            block.type === "turn"
          ? "bg-blue-500"
          : "bg-gray-500"
      }`}
    >
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          <span>{part}</span>
          {i < inputs.length && inputs[i]}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Sidebar({ onAddBlock }) {
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = JSON.parse(e.dataTransfer.getData("block"));
    console.log("Block returned to Sidebar:", dropped);
  };

  return (
    <div
      className="w-60 flex-none h-full overflow-y-auto flex flex-col items-start p-2 border-r border-gray-200 sidebar-area"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Motion Animations */}
      <div className="font-bold mt-4">Motion Animations:</div>
      <div className="font-semibold">Motion</div>
      {motionBlocks.map((block, index) => (
        <Block key={index} block={block} onAddBlock={onAddBlock} />
      ))}

      {/* Looks Animations */}
      <div className="font-bold mt-4">Looks Animations:</div>
      <div className="font-semibold">Looks</div>
      {looksBlocks.map((block, index) => (
        <Block key={index} block={block} onAddBlock={onAddBlock} />
      ))}
    </div>
  );
}
