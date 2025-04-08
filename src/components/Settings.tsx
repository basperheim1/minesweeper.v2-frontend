"use client";

import { SettingsData } from "@/types/types";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

const Settings: React.FC<SettingsData> = ({ rows, columns, mines, applySettings }) => {
  const [localRows, setLocalRows] = useState<number[]>([rows]);
  const [localColumns, setLocalColumns] = useState<number[]>([columns]);
  const [localMines, setLocalMines] = useState<number[]>([mines]);

  const currentRows = localRows[0];
  const currentColumns = localColumns[0];
  const currentMines = localMines[0];
  const maxMines = currentRows * currentColumns - 1;
  const minesInvalid = currentMines > maxMines;

  return (
    <div className="w-full max-w-xl mx-auto mt-6 p-6 rounded-2xl shadow-md bg-white dark:bg-zinc-900 space-y-6">
      <h2 className="text-2xl font-bold text-center text-zinc-800 dark:text-zinc-100">
        Game Settings
      </h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Rows: {currentRows}
        </label>
        <Slider min={1} max={24} step={1} value={localRows} onValueChange={setLocalRows} />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Columns: {currentColumns}
        </label>
        <Slider min={1} max={30} step={1} value={localColumns} onValueChange={setLocalColumns} />
      </div>

      <div className="space-y-2">
        <label
          className={`block text-sm font-medium ${
            minesInvalid ? "text-red-600 dark:text-red-400" : "text-zinc-700 dark:text-zinc-300"
          }`}
        >
          Mines: {currentMines}
          {minesInvalid && (
            <span className="ml-2 text-xs font-semibold text-red-500">
              (Too many mines for board size)
            </span>
          )}
        </label>
        <Slider
          min={1}
          max={200}
          step={1}
          value={localMines}
          onValueChange={setLocalMines}
          className={minesInvalid ? "border border-red-500 rounded-lg p-1" : ""}
        />
      </div>

      <div className="flex justify-center pt-2">
        <Button
          onClick={() => {
            applySettings(currentRows, currentColumns, currentMines);
          }}
          disabled={minesInvalid}
          className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          New Game
        </Button>
      </div>
    </div>
  );
};

export default Settings;
