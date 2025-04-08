import { Dispatch, SetStateAction } from "react";


export type CellData = {

    // Static
    row: number;
    column: number;
    isMine: boolean;
    numColumns: number; 
    encodedValue: string; 
    adjacentMineCount: number;
    adjacentCellCount: number; 

    // Dynamic
    revealed: boolean; 
    probability: number; 
    someInformation: boolean; 
    flagged: boolean; 
    adjacentUndeterminedMineCount: number; 
    adjacentUndeterminedCellCount: number; 
    isDetermined: boolean; 
    clicked: boolean; 

};

export type RuleData = {
    numUndeterminedMines: number; 
    undeterminedCells: string[];
};

export type BoardData = {
    rows: number; 
    columns: number; 
    mineCount: number; 
    restart: number; 
    setRestart: Dispatch<SetStateAction<number>>;
};

export type SettingsData = {
    rows: number; 
    columns: number; 
    mines: number; 
    applySettings: (rows: number, columns: number, mines: number) => void;
};