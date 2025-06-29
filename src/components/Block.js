// src/components/Block.js
import React from "react";

export default function Block({ block, onClick }) {
  return (
    <div
      onClick={() => onClick && onClick(block)}
      className={`px-3 py-1 my-2 text-sm cursor-pointer rounded text-white ${
        block.type === "move" || block.type === "turn" || block.type === "goto" || block.type === "repeat"
          ? "bg-blue-500"
          : "bg-purple-500"
      }`}
    >
      {block.label} {block.args?.join(" ")}
    </div>
  );
}
