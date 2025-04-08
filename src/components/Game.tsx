"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Board from "./Board";
import Settings from "./Settings";
import { Button } from "@/components/ui/button";

const Game = () => {
  const [restart, setRestart] = useState(0);
  const [rows, setRows] = useState(16);
  const [columns, setColumns] = useState(30);
  const [mines, setMines] = useState(99);
  const [showSettings, setShowSettings] = useState(false);

  const applySettings = (newRows: number, newColumns: number, newMines: number) => {
    if (newMines > newRows * newColumns) {
      console.log("Too many mines!");
    } else {
      setRows(newRows);
      setColumns(newColumns);
      setMines(newMines);
      setRestart((r) => r + 1);
      setShowSettings(false);
    }
  };

  return (
    <div className="relative min-h-screen flex bg-zinc-100 dark:bg-zinc-950">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
            />

            <motion.aside
              className="fixed top-0 right-0 z-20 w-80 h-full bg-white dark:bg-zinc-900 shadow-lg p-4 overflow-y-auto"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Settings
                rows={rows}
                columns={columns}
                mines={mines}
                applySettings={applySettings}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 gap-6 w-full z-0 relative">
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Minesweeper</h1>

        {/* Hamburger Menu */}
        <button
          onClick={() => setShowSettings(true)}
          className="absolute top-4 right-4 z-30 flex flex-col justify-center items-center w-10 h-10 space-y-1 group"
          aria-label="Open Settings"
        >
          <span className="w-6 h-0.5 bg-zinc-700 dark:bg-zinc-200 transition-all group-hover:w-7" />
          <span className="w-6 h-0.5 bg-zinc-700 dark:bg-zinc-200 transition-all group-hover:w-7" />
          <span className="w-6 h-0.5 bg-zinc-700 dark:bg-zinc-200 transition-all group-hover:w-7" />
        </button>

        <div className="mt-4 border-2 border-zinc-300 dark:border-zinc-700 p-4 rounded-xl shadow-md bg-white dark:bg-zinc-900">
          <Board rows={rows} columns={columns} mineCount={mines} restart={restart} />
        </div>
      </div>
    </div>
  );
};

export default Game;
