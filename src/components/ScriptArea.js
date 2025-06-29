// src/components/ScriptArea.js
import React from "react";
import Block from "./Block";

export default function ScriptArea({ script, onRun }) {
  return (
    <div className="p-2 border border-gray-200 w-full">
      <div className="mb-2 font-semibold">Script Area</div>
      {script.map((block, idx) => (
        <Block key={idx} block={block} />
      ))}
      <button
        onClick={onRun}
        className="mt-2 px-4 py-1 bg-green-600 text-white rounded"
      >
        Play
      </button>
    </div>
  );
}
