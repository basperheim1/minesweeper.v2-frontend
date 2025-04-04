import { encode } from "./Util";
import React, { useState } from "react";
import { CellData } from "@/types/types";
import styles from "../styles/Cell.module.css";

type CellProps = {
  cellData: CellData;
  onClick: (row: number, column: number) => void;
};

const Cell = ({ cellData, onClick }: CellProps) => {

    const [clicked, setClicked] = useState<boolean>(false);

  const handleClick = (): void => {
    console.log("CLICKED");

    if (cellData.revealed) {
      return;
    }

    setClicked(true);
    onClick(cellData.row, cellData.column);
  };

  // Code that handles how the cell is rendered
  let content: React.ReactNode = "";

  if (cellData.revealed) {
    if (cellData.isMine && !clicked) {
        content = <img 
        src="/mine.png"
        alt="flag"
        className={styles.flagIcon}
    />;
    } else if (cellData.isMine && clicked){
        content = <img 
        src="/clicked_mine.png"
        alt="flag"
        className={styles.flagIcon}
    />;
    }
    
    else if (cellData.adjacentMineCount > 0) {
      content = cellData.adjacentMineCount.toString();
    }
  } else if (cellData.flagged) {
    content = <img 
        src="/flag.png"
        alt="flag"
        className={styles.flagIcon}
    />;
  }

  let className = styles.cell;
  if (cellData.revealed) className += ` ${styles.revealed}`;
  if (cellData.flagged) className += ` ${styles.flagged}`;

  return (
    <div
      className={className}
      onClick={handleClick}
      data-count={cellData.adjacentMineCount || undefined}
    >
      {content}
    </div>
  );
};

export default Cell;
