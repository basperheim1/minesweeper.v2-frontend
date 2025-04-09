// components/HamburgerMenu.tsx
"use client";

import React from "react";

type HamburgerMenuProps = {
  onClick: () => void;
};

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 z-50 flex flex-col justify-center items-center w-10 h-10 space-y-1 group"
      aria-label="Open Settings"
    >
      <span className="w-6 h-0.5 bg-zinc-700 dark:bg-zinc-200 transition-all group-hover:w-7" />
      <span className="w-6 h-0.5 bg-zinc-700 dark:bg-zinc-200 transition-all group-hover:w-7" />
      <span className="w-6 h-0.5 bg-zinc-700 dark:bg-zinc-200 transition-all group-hover:w-7" />
    </button>
  );
};

export default HamburgerMenu;
