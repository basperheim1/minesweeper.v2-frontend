"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Board from "./Board";
import Settings from "./Settings";
import HamburgerMenu from "./HamburgerMenu";
import ProbabilityLegend from "./Legend";

const Game = () => {
  const [restart, setRestart] = useState(0);
  const [rows, setRows] = useState(16);
  const [columns, setColumns] = useState(30);
  const [mines, setMines] = useState(99);
  const [showSettings, setShowSettings] = useState(false);
  const [showProbability, setShowProbability] = useState<boolean>(true);

  const applySettings = (
    newRows: number,
    newColumns: number,
    newMines: number
  ) => {
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
    <div className="relative min-h-screen flex">
      {/* ✅ Hamburger always visible and on top */}
      <div className="fixed top-4 left-4 z-[10000]">
        <HamburgerMenu onClick={() => setShowSettings(!showSettings)} />
      </div>

      {/* Sidebar Overlay & Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* ❗ Make sure overlay is BELOW hamburger */}
            <motion.div
              className="fixed inset-0 bg-black/30 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
            />

            {/* Sidebar comes in from the left */}
            <motion.aside
              className="fixed top-0 left-0 z-20 w-100 h-full bg-white dark:bg-zinc-900 shadow-lg p-4 overflow-y-auto pt-10"
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
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
        <div className="mt-4 border-2 border-zinc-300 dark:border-zinc-700 p-4 rounded-xl shadow-md bg-white dark:bg-zinc-900">
          <Board
            rows={rows}
            columns={columns}
            mineCount={mines}
            restart={restart}
            setRestart={setRestart}
            showProbability={showProbability}
          />
          <ProbabilityLegend />
          <button onClick={() => setShowProbability((prob) => !prob)}>
            toggle probability
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game;
