"use client";

import React, { useEffect, useState, useRef } from "react";
import Cell from "./Cell";
import { CellData, RuleData, BoardData, SolverRequest } from "@/types/types";
import { decode, encode } from "./Util";
import styles from "../styles/Board.module.css";
import "@fontsource/press-start-2p";
import BoardHeader from "./BoardHeader";
import { request } from "http";

const API_URL: string =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const generateBoard = (rows: number, columns: number): CellData[][] => {
  let board: CellData[][] = [];

  console.log("generating board");

  for (let row = 0; row < rows; row++) {
    let newRow: CellData[] = [];
    for (let column = 0; column < columns; column++) {
      newRow.push({
        // Static
        row: row,
        column: column,
        isMine: false,
        numColumns: columns,
        encodedValue: encode(row, column, columns),
        adjacentCellCount: 0,
        adjacentMineCount: 0,

        // Dynamic
        revealed: false,
        probability: 0,
        someInformation: false,
        flagged: false,
        adjacentUndeterminedCellCount: 0,
        adjacentUndeterminedMineCount: 0,
        isDetermined: false,
        clicked: false,
      });
    }

    board.push(newRow);
  }

  return board;
};

const Board: React.FC<BoardData> = ({
  rows,
  columns,
  mineCount,
  restart,
  setRestart,
  showProbability,
}) => {
  // Static
  const cellCount: number = rows * columns;
  const safeCount: number = cellCount - mineCount;

  // Dynamic - State
  const [undeterminedMineCount, setUndeterminedMineCount] =
    useState<number>(mineCount);
  const [cellsWithNoInformation, setCellsWithNoInformation] =
    useState<number>(cellCount);
  const [uncoveredCellCount, setUncoveredCellCount] = useState<number>(0);
  const [amassedRisk, setAmassedRisk] = useState<number>(0);
  const [determinedFirstProbability, setDeterminedFirstProbability] =
    useState<boolean>(false);

  // State variables for win / loss
  const [continuePlaying, setContinuePlaying] = useState<boolean>(true);
  const [lost, setLost] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Board
  const [board, setBoard] = useState<CellData[][]>(() => {
    console.log("85");
    return generateBoard(rows, columns);
  });

  // Flags
  const [flags, setFlags] = useState<number>(mineCount);

  // Probability toggle
  const [keepGoingAI, setKeepGoingAI] = useState<number>(0);
  const [stopEverything, setStopEverything] = useState<boolean>(true);
  const AISolvingRef = useRef<boolean>(false);

  // For first click 
  const firstClickRef = useRef<boolean>(true); 

  // Whenver the parameter restart changes value then we will
  // call this function to regenerate state variables including
  // the board itself. Essentially, it sets the state back to
  // zero, where nothing has been pressed
  useEffect(() => {
    resetState();
  }, [restart, stopEverything]);

  useEffect(() => {
    playGameAI()
  }, [keepGoingAI])



  // Hook to increment the time, if we should be doing so
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerActive && time < 999) {
      interval = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerActive]);

  const resetState = () => {
    console.log("Line 113");
    const newBoard = generateBoard(rows, columns);

    console.log("setting board: 130")
    setBoard(newBoard);
    setUncoveredCellCount(0);
    setUndeterminedMineCount(mineCount);
    setCellsWithNoInformation(rows * columns);
    setAmassedRisk(0);
    setLost(false);
    setContinuePlaying(true);
    setTimerActive(false);
    setTime(0);
    setFlags(0);
    setDeterminedFirstProbability(false);
    setKeepGoingAI(0);
    AISolvingRef.current = false;
    firstClickRef.current = true; 
    // setAISolving(false);
  };

  const cloneBoard = (board: CellData[][]): CellData[][] => {
    console.log("cloning board ");

    return board.map((row) => row.map((cell) => ({ ...cell })));
  };

  // Takes the current board, and adds the mines to it. Note, when the board
  // is generated, it must be safe for the first click, so when intially created,
  // none of the cells are mines
  const addMines = (
    currentBoard: CellData[][],
    mineCount: number,
    safeRow: number,
    safeColumn: number
  ): CellData[][] => {
    const rows = currentBoard.length;
    const cols = currentBoard[0].length;
    const totalCells = rows * cols;

    if (mineCount > totalCells - 1) {
      throw new Error(
        "Too many mines for the size of the board (excluding safe cell)"
      );
    }

    const allIndices: number[] = [];

    // Generate flattened indices, excluding the safe cell
    for (let i = 0; i < totalCells; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      if (row === safeRow && col === safeColumn) continue;
      allIndices.push(i);
    }

    // Shuffle the indices
    for (let i = allIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
    }

    const newBoard: CellData[][] = cloneBoard(board);

    // Place mines at the first `mineCount` shuffled positions
    for (let i = 0; i < mineCount; i++) {
      const index = allIndices[i];
      const row = Math.floor(index / cols);
      const col = index % cols;
      newBoard[row][col].isMine = true;
    }

    return newBoard;
  };

  // Reveal all of the cells
  const revealAll = (board: CellData[][]): void => {
    const updatedBoard = cloneBoard(board);

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        updatedBoard[row][column].revealed = true;
        updatedBoard[row][column].flagged = false;
      }
    }

    console.log("setting board: 212")
    setBoard(updatedBoard);
  };

  const revealFlags = (board: CellData[][]): void => {
    const updatedBoard = cloneBoard(board);

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        if (updatedBoard[row][column].isMine) {
          updatedBoard[row][column].flagged = true;
        }
      }
    }

    setFlags(mineCount);

    console.log("setting board: 229")

    setBoard(updatedBoard);
  };

  /*
        This function counts the number of mines and cells 
        adjacent to some cell in our board
        
        This function is called many times by the count_board_adjacent_mines_and_cells
        at the start of our code. This function only counts the number of adjacent 
        mines and cells for one cell in our code, and that is why it is ran many times
    */
  const countBoardAdjacentMinesAndCells = (
    board: CellData[][]
  ): CellData[][] => {
    const newBoard = cloneBoard(board);

    const deltas = [-1, 0, 1];

    for (let row = 0; row < newBoard.length; row++) {
      for (let col = 0; col < newBoard[0].length; col++) {
        let cellCount = 0;
        let mineCount = 0;

        for (const dr of deltas) {
          for (const dc of deltas) {
            const nr = row + dr;
            const nc = col + dc;
            if (
              nr >= 0 &&
              nr < newBoard.length &&
              nc >= 0 &&
              nc < newBoard[0].length &&
              (dr !== 0 || dc !== 0)
            ) {
              cellCount++;
              if (newBoard[nr][nc].isMine) mineCount++;
            }
          }
        }

        newBoard[row][col].adjacentCellCount = cellCount;
        newBoard[row][col].adjacentMineCount = mineCount;
        newBoard[row][col].adjacentUndeterminedCellCount = cellCount;
        newBoard[row][col].adjacentUndeterminedMineCount = mineCount;
      }
    }

    return newBoard;
  };

  /*
        This function is called when a cell is determined to be a mine or safe
        
        There are two different ways a cell can be determined, either it is 
        determined because it is clicked, or it is determined because of our 
        probabilistic analysis. Either way, if we know a cell's state, then we 
        need to update the cells adjacent to it. Specifically, we need to 
        change the adjacent_undetermined_cell_count variable and possibly the
        adjacent_undetermined_mine_count as well if the determined cell is a 
        mine. 
        
        One slight difference between this function being called by a click,
        and it being called as a result of our analysis, is whether or not 
        the cells adjacent to it now have "some information." Note, we use 
        this variable to determine how we should render the cell to the 
        screen, i.e. should it be a blank cell or should it be a probability.
        If the cell is clicked, then all it's adjacent cells should not be 
        blank, and thus, we need to set the some_information bool true. 
    */
  const updateAdjacentCells = (
    row: number,
    column: number,
    isMine: boolean,
    clicked: boolean,
    previouslyDetermined: boolean,
    updatedBoard: CellData[][],
    currentCellsWithNoInformation: number
  ): number => {
    const deltas: number[] = [-1, 0, 1];

    //Click all of the adjacent cells as well
    for (const dr of deltas) {
      for (const dc of deltas) {
        const nr = row + dr;
        const nc = column + dc;

        // Check bounds
        if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length) {
          const adjacentCell: CellData = updatedBoard[nr][nc];

          // Edits information status of the cell and of
          // overall board counter
          if (!adjacentCell.someInformation && clicked) {
            currentCellsWithNoInformation--;
            adjacentCell.someInformation = true;
          }

          if (isMine && !previouslyDetermined) {
            adjacentCell.adjacentUndeterminedCellCount -= 1;
            adjacentCell.adjacentUndeterminedMineCount -= 1;
          } else if (!isMine && !previouslyDetermined) {
            adjacentCell.adjacentUndeterminedCellCount -= 1;
          }
        }
      }
    }

    return currentCellsWithNoInformation;
  };

  const updateProbabilities = (
    probabilities: { [key: string]: number },
    board: CellData[][],
    newCellsWithNoInformation: number
  ): void => {
    const updatedBoard: CellData[][] = cloneBoard(board);
    const ENM: string = "expected_number_of_mines";

    let expectedMinesNotYetDetermined: number = probabilities[ENM];

    let localUndeterminedMineCount = undeterminedMineCount;

    for (const cellEncodedValue in probabilities) {
      if (cellEncodedValue !== ENM) {
        const [row, column] = decode(cellEncodedValue, columns);

        const cell: CellData = updatedBoard[row][column];
        cell.probability = probabilities[cellEncodedValue];

        if (probabilities[cellEncodedValue] === 0) {
          cell.isDetermined = true;
          updateAdjacentCells(
            row,
            column,
            false,
            false,
            false,
            updatedBoard,
            newCellsWithNoInformation
          );
        } else if (probabilities[cellEncodedValue] === 1) {
          cell.isDetermined = true;
          localUndeterminedMineCount -= 1;
          //   setUndeterminedMineCount(
          //     (undeterminedMineCount) => undeterminedMineCount - 1
          //   );
          updateAdjacentCells(
            row,
            column,
            true,
            false,
            false,
            updatedBoard,
            newCellsWithNoInformation
          );
          expectedMinesNotYetDetermined -= 1;
        }
      }
    }

    setUndeterminedMineCount(localUndeterminedMineCount);

    if (cellsWithNoInformation > 0) {
      const probabilityNoInformationCell =
        (localUndeterminedMineCount - expectedMinesNotYetDetermined) /
        newCellsWithNoInformation;

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          if (!updatedBoard[row][column].someInformation) {
            updatedBoard[row][column].probability =
              probabilityNoInformationCell;
          }
        }
      }
    }

    console.log("setting board: 408")

    setBoard(updatedBoard);

    return;
  };

  const getLowestProbabilityChoice = (): [number, number] => {
    let probability: number = 1;
    let encodedCell: string = "";

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const currentCell: CellData = board[row][column];

        if (!currentCell.revealed) {
          if (currentCell.probability < probability) {
            probability = currentCell.probability;
            encodedCell = currentCell.encodedValue;
          }
        }
      }
    }

    const [row, column] = decode(encodedCell, columns);

    console.log("row: ", row);
    console.log("column: ", column);

    setAmassedRisk((amassedRisk) => amassedRisk + probability);

    return [row, column];
  };

  /*
        Generates the rules for the current state of the game
        
        A cell only generates a rule, if it is a non_mine cell, and it is 
        revealed, i.e. it has been clicked by the user. In this case, it 
        will have a certain number of mines around it, and this must hold, 
        creating an axiom for our game. If all the cells around it are also 
        determined, then we will not create a rule, as there is no point, as 
        we already know everything around the cell. However, if there are 
        some cells that are not determined adjacent to the cell, then these 
        will generate a rule. Note, that we do not use the adjacent_mine_count
        variable for the mine count, we instead use the adjacent_undetermined_mine_count
        varibale, as this limits the amount of redundant computation we need 
        to do. Since we are only considering the undetermined mines, then we 
        also need to only consider the undetermined cells, which is why we check 
        to see if a cell is undetermined before adding it to the list which will 
        ultimately make the rule. 
    */
  const generateRules = (localBoard: CellData[][]): RuleData[] => {
    let rules: RuleData[] = [];

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        let currentCell: CellData = localBoard[row][column];
        if (currentCell.revealed && !currentCell.isMine) {
          let adjacentUndeterminedCells: string[] = [];

          const deltas: number[] = [-1, 0, 1];

          for (const dr of deltas) {
            for (const dc of deltas) {
              const nr = row + dr;
              const nc = column + dc;

              // Check bounds
              if (
                nr >= 0 &&
                nr < localBoard.length &&
                nc >= 0 &&
                nc < localBoard[0].length &&
                (dr !== 0 || dc !== 0)
              ) {
                const adjacentCell: CellData = localBoard[nr][nc];
                if (!adjacentCell.isDetermined) {
                  adjacentUndeterminedCells.push(adjacentCell.encodedValue);
                }
              }
            }
          }

          // There are some cells around the revealed cell that are not yet determined,
          // meaning that we have a rule
          if (adjacentUndeterminedCells.length > 0) {
            rules.push({
              num_undetermined_mines: currentCell.adjacentUndeterminedMineCount,
              undetermined_cells: adjacentUndeterminedCells,
            });
          }
        }
      }
    }

    return rules;
  };

  const generateRequest = (board: CellData[][]): SolverRequest => {
    const rules: RuleData[] = generateRules(board);
    const solverRequest: SolverRequest = {
      rules: rules,
      undetermined_mine_count: undeterminedMineCount,
      num_uninformed_cells: cellsWithNoInformation,
    };

    return solverRequest;
  };

  // Will return true if the clicked cell resulted in the game terminating
  const clickCell = async (
    row: number,
    column: number,
    e: React.MouseEvent
  ): Promise<boolean> => {
    delay(0);

    let updatedBoard: CellData[][];
    let clickedCell: CellData;

    // First click
    if (firstClickRef.current) {

      console.log("FIRST CLICK FIRST CLICK ")
      firstClickRef.current = false; 
      setTimerActive(true);

      console.log("525");

      let freshBoard = generateBoard(rows, columns);
      freshBoard = addMines(freshBoard, mineCount, row, column);
      freshBoard = countBoardAdjacentMinesAndCells(freshBoard);
      updatedBoard = freshBoard;
      clickedCell = updatedBoard[row][column];
    } else {
      updatedBoard = cloneBoard(board);
      clickedCell = updatedBoard[row][column];
    }

    if (!continuePlaying) return false;
    let numClickedCells: number = 0;

    // User is simply flagging a cell
    if (e.button !== 0) {
      if (clickedCell.flagged) {
        setFlags((flags) => flags - 1);
      } else {
        setFlags((flags) => flags + 1);
      }
      clickedCell.flagged = !clickedCell.flagged;

      console.log("setting board: 559")
      setBoard(updatedBoard);

      return false;
    }

    // If the cell is flagged and they left click it, nothing should happen
    if (e.button === 0 && clickedCell.flagged) return false;

    clickedCell.clicked = true;

    if (clickedCell.revealed) {
      return false;
    }

    // If the cell is a mine, end the game
    if (clickedCell.isMine) {
      setLost(true);
      setContinuePlaying(false);
      revealAll(updatedBoard);
      setTimerActive(false);
      // setAISolving(false);
      AISolvingRef.current = false
      return true;
    }

    let newCellsWithNoInformation = cellsWithNoInformation;

    if (clickedCell.adjacentMineCount === 0) {
      const stack: [number, number][] = [[row, column]];

      while (stack.length > 0) {
        const [r, c] = stack.pop()!;

        const cell = updatedBoard[r][c];

        if (cell.revealed) continue;

        numClickedCells++;
        newCellsWithNoInformation = updateAdjacentCells(
          r,
          c,
          cell.isMine,
          true,
          cell.isDetermined,
          updatedBoard,
          newCellsWithNoInformation
        );
        cell.revealed = true;
        cell.isDetermined = true;
        cell.someInformation = true;
        cell.probability = Number(cell.isMine);
        cell.clicked = true;

        if (cell.adjacentMineCount === 0) {
          const deltas = [-1, 0, 1];

          //Click all of the adjacent cells as well
          for (const dr of deltas) {
            for (const dc of deltas) {
              const nr = r + dr;
              const nc = c + dc;

              // Check bounds
              if (
                nr >= 0 &&
                nr < board.length &&
                nc >= 0 &&
                nc < board[0].length &&
                (dr !== 0 || dc !== 0)
              ) {
                const neighbor: CellData = updatedBoard[nr][nc];
                if (!neighbor.revealed) {
                  stack.push([nr, nc]);
                }
              }
            }
          }
        }
      }
    } else {
      newCellsWithNoInformation = updateAdjacentCells(
        row,
        column,
        clickedCell.isMine,
        true,
        clickedCell.isDetermined,
        updatedBoard,
        newCellsWithNoInformation
      );

      // Increment the number of uncovered cells
      numClickedCells++;

      clickedCell.revealed = true;
      clickedCell.isDetermined = true;
      clickedCell.someInformation = true;
      clickedCell.probability = Number(clickedCell.isMine);
    }

    console.log("setting board: 658")
    setBoard(updatedBoard);
    console.log("Updated board: ", updatedBoard);

    if (uncoveredCellCount + numClickedCells === safeCount) {
      setLost(false);
      setContinuePlaying(false);
      revealAll(updatedBoard);
      revealFlags(updatedBoard);
      setTimerActive(false);
      // setAISolving(false);
      AISolvingRef.current = false
      return true;
    }

    setUncoveredCellCount((x) => x + numClickedCells);

    // Although the board has been updated, it has not added the probabilities, something that we now need to do
    const requestData: SolverRequest = generateRequest(updatedBoard);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const frequencies = await response.json();


    setCellsWithNoInformation(newCellsWithNoInformation);
    updateProbabilities(frequencies, updatedBoard, newCellsWithNoInformation);
    setDeterminedFirstProbability(true);

    return false;
  };

  const clickCellAI = async (
    row: number,
    column: number,
  ): Promise<boolean> => {

    if (!AISolvingRef.current){
      return true; 
    }

    if (!continuePlaying) return false;

    console.log("first click ref: ", firstClickRef.current)

    let updatedBoard: CellData[][];
    let clickedCell: CellData;

    // First click
    if (firstClickRef.current) {
      console.log("FIRST CLICK FIRS TCLICK")
      setTimerActive(true);
      firstClickRef.current = false;

      console.log("525");

      let freshBoard: CellData[][] = generateBoard(rows, columns);
      freshBoard = addMines(freshBoard, mineCount, row, column);
      freshBoard = countBoardAdjacentMinesAndCells(freshBoard);
      updatedBoard = freshBoard;
      clickedCell = updatedBoard[row][column];
    } else {
      updatedBoard = cloneBoard(board);
      clickedCell = updatedBoard[row][column];
    }

    let numClickedCells: number = 0;
    clickedCell.clicked = true;

    if (clickedCell.revealed) {
      return false;
    }

    // If the cell is a mine, end the game
    if (clickedCell.isMine) {
      setLost(true);
      setContinuePlaying(false);
      revealAll(updatedBoard);
      setTimerActive(false);
      // setAISolving(false);
      AISolvingRef.current = false
      return true;
    }

    let newCellsWithNoInformation = cellsWithNoInformation;

    if (clickedCell.adjacentMineCount === 0) {
      const stack: [number, number][] = [[row, column]];

      while (stack.length > 0) {
        const [r, c] = stack.pop()!;

        const cell = updatedBoard[r][c];

        if (cell.revealed) continue;

        numClickedCells++;
        newCellsWithNoInformation = updateAdjacentCells(
          r,
          c,
          cell.isMine,
          true,
          cell.isDetermined,
          updatedBoard,
          newCellsWithNoInformation
        );
        cell.revealed = true;
        cell.isDetermined = true;
        cell.someInformation = true;
        cell.probability = Number(cell.isMine);
        cell.clicked = true;

        if (cell.adjacentMineCount === 0) {
          const deltas = [-1, 0, 1];

          //Click all of the adjacent cells as well
          for (const dr of deltas) {
            for (const dc of deltas) {
              const nr = r + dr;
              const nc = c + dc;

              // Check bounds
              if (
                nr >= 0 &&
                nr < board.length &&
                nc >= 0 &&
                nc < board[0].length &&
                (dr !== 0 || dc !== 0)
              ) {
                const neighbor: CellData = updatedBoard[nr][nc];
                if (!neighbor.revealed) {
                  stack.push([nr, nc]);
                }
              }
            }
          }
        }
      }
    } else {
      newCellsWithNoInformation = updateAdjacentCells(
        row,
        column,
        clickedCell.isMine,
        true,
        clickedCell.isDetermined,
        updatedBoard,
        newCellsWithNoInformation
      );

      // Increment the number of uncovered cells
      numClickedCells++;

      clickedCell.revealed = true;
      clickedCell.isDetermined = true;
      clickedCell.someInformation = true;
      clickedCell.probability = Number(clickedCell.isMine);
    }

    console.log("setting board: 810")
    setBoard(updatedBoard);
    console.log("Updated board: ", updatedBoard);

    if (uncoveredCellCount + numClickedCells === safeCount) {
      setLost(false);
      setContinuePlaying(false);
      revealAll(updatedBoard);
      revealFlags(updatedBoard);
      setTimerActive(false);
      // setAISolving(false);
      AISolvingRef.current = false

      return true;
    }

    setUncoveredCellCount((x) => x + numClickedCells);

    // Although the board has been updated, it has not added the probabilities, something that we now need to do
    const requestData: SolverRequest = generateRequest(updatedBoard);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const frequencies = await response.json();

    if (!AISolvingRef.current){
      console.log("WHAT THE FUCK WHAT THE FUCK")
      return true; 
    }


    console.log("Ai solving ref: ", AISolvingRef.current)


    setCellsWithNoInformation(newCellsWithNoInformation);
    updateProbabilities(frequencies, updatedBoard, newCellsWithNoInformation);
    setDeterminedFirstProbability(true);

    return false;
  };

  const playGameAI = async () => {

    console.log("first click yes or no: ", firstClickRef.current)

    console.log("Playing game AI")

    if (!AISolvingRef.current) return; 

    let row: number; 
    let column: number; 
    if (firstClickRef.current){
      row = 0;
      column = 0; 
    }
    else{
      [row, column] = getLowestProbabilityChoice();
    }

    await clickCellAI(row, column);


    setKeepGoingAI(old => old+1);
    // await new Promise(resolve => setTimeout(resolve, 200));


  };

  return (
    <div className="board">
      {board.length > 0 && (
        <>
          <button onClick={() => {

            if (AISolvingRef.current){
              return; 
            }

            if (!continuePlaying  && firstClickRef){
              console.log("need a board to do this");
              return; 
            }

            if (!AISolvingRef.current && !continuePlaying){

              firstClickRef.current = true; 
              console.log("SET FIRST CLICK ")
            } 


            AISolvingRef.current = true
            setKeepGoingAI(x => x + 1);
          }}>Watch AI</button>
          <BoardHeader
            undeterminedMines={mineCount - flags}
            time={time}
            continuePlaying={continuePlaying}
            lost={lost}
            onReset={() => {
              setStopEverything(x => !x);
            }}
          />
          <div className={styles.board}>
            {board.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className={styles.boardRow}>
                {row.map((cell) => (
                  <Cell
                    key={cell.encodedValue}
                    cellData={cell}
                    onClick={clickCell}
                    determinedFirstProbability={determinedFirstProbability}
                    showProbability={showProbability}
                    AISolving={AISolvingRef.current}
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Board;
