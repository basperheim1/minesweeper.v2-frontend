"use client";

import { SettingsData } from "@/types/types";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

const Settings: React.FC<SettingsData> = ({ rows, columns, mines, applySettings }) => {
  const [localRows, setLocalRows] = useState<number[]>([rows]);
  const [localColumns, setLocalColumns] = useState<number[]>([columns]);
  const [localMines, setLocalMines] = useState<number[]>([mines]);

  return (
    <div className="w-full max-w-xl mx-auto mt-6 p-6 rounded-2xl shadow-md bg-white dark:bg-zinc-900 space-y-6">
      <h2 className="text-2xl font-bold text-center text-zinc-800 dark:text-zinc-100">Game Settings</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Rows: {localRows[0]}
        </label>
        <Slider min={1} max={24} step={1} value={localRows} onValueChange={setLocalRows} />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Columns: {localColumns[0]}
        </label>
        <Slider min={1} max={30} step={1} value={localColumns} onValueChange={setLocalColumns} />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Mines: {localMines[0]}
        </label>
        <Slider min={1} max={200} step={1} value={localMines} onValueChange={setLocalMines} />
      </div>

      <div className="flex justify-center pt-2">
        <Button
          onClick={() => {
            applySettings(localRows[0], localColumns[0], localMines[0]);
            console.log("Applied:", localRows[0], localColumns[0], localMines[0]);
          }}
          className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition rounded-lg"
        >
          New Game
        </Button>
      </div>
    </div>
  );
};

export default Settings;
