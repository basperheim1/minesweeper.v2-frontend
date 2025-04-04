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

};

export type RuleData = {
    numUndeterminedMines: number; 
    undeterminedCells: string[];
};