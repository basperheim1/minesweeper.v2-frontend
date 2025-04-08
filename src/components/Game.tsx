"use client";

import React, { useState } from "react";
import Board from "./Board";
import Settings from "./Settings";

const Game = () => {
  const [restart, setRestart] = useState<number>(0);
  const [rows, setRows] = useState<number>(16);
  const [columns, setColumns] = useState<number>(30);
  const [mines, setMines] = useState<number>(99);

  const applySettings = (newRows: number, newColumns: number, newMines: number) => {
    if (newMines > newRows * newColumns) {
      console.log("There are too many mines, try again");
    } else {
      setRows(newRows);
      setColumns(newColumns);
      setMines(newMines);
      setRestart((r) => r + 1);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-100 dark:bg-zinc-950 px-4 py-6 flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold text-center text-zinc-800 dark:text-zinc-100">
        Minesweeper
      </h1>

      <Settings
        rows={rows}
        columns={columns}
        mines={mines}
        applySettings={applySettings}
      />

      <div className="mt-4 border-2 border-zinc-300 dark:border-zinc-700 p-4 rounded-xl shadow-md bg-white dark:bg-zinc-900">
        <Board
          rows={rows}
          columns={columns}
          mineCount={mines}
          restart={restart}
        />
      </div>
    </main>
  );
};

export default Game;
