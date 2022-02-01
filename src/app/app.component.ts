import { Component } from '@angular/core';
import { timer, lastValueFrom } from 'rxjs';
import { tap, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  /**
   * Determines if the user is able to interact with the board
   * Allows the "animation" to complete before another turn is taken
   */
  public disableInteraction = false;

  /**
   * Keeps track of whose turn it is
   */
  public isPlayersTurn = true;

  /**
   * Determines the current token to render dropping based on whose turn it is
   */
  public get currentToken() {
    return this.isPlayersTurn ? 'x' : 'o';
  }

  /**
   * The representation of the board
   * Each cell will either be empty (represented by null), or container a token (x or o)
   */
  public boardState: (string | null)[][] = [
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
  ];

  /**
   * Handles when the player tries to insert a token
   * Will block if animation is still completing, or invalid move is attempted
   * @param column the column to drop a token into
   */
  public async playerPlacedToken(column: number): Promise<void> {
    if (this.disableInteraction) {
      return;
    }

    // can't put a token on a full column, invalid move
    if (this.isColumnFull(column)) {
      return;
    }

    // disable interaction so we can animate the dropping of the player and computers' tokens
    this.disableInteraction = true;

    // drop the token into the column
    await this.dropToken(column);
    this.toggleTurn();

    await this.computerTurn();
    this.toggleTurn();

    this.disableInteraction = false;
  }

  /**
   * Computer takes its turn by deciding which column to drop its token into
   * TODO: implement super smart logic so the machine always wins...
   */
  private async computerTurn(): Promise<void> {
    // I rolled a dice and got 2, so guaranteed to be random...
    const randomNumber = 2;
    await this.dropToken(randomNumber);
  }

  /**
   * Switch who's turn it is
   */
  private toggleTurn(): void {
    this.isPlayersTurn = !this.isPlayersTurn;
  }

  /**
   * Updates the state of the board every 200ms
   * First update adds the current player's token to the top row of the selected column
   * Subsequent updates removes the token from the previous row, and adds it to the next row
   * Continues until token lands either on the last row, or a row with a token underneath
   * @param column the column to drop the token into
   * @returns a promise that completes when the drop has ended
   */
  private dropToken(column: number): Promise<any> {
    //emit every 200ms
    const drop = timer(0, 200).pipe(
      // update the board with the next frame of the token drop
      tap((row) => (this.boardState = this.getNextBoardFrame(row, column))),
      // continue until the token lands (either at the bottom row, or on another token)
      takeWhile((row: number) => !this.hasTokenLanded(row, column))
    );

    // Converts the observable into a promise that will resolve when the final board state is reached
    return lastValueFrom(drop);
  }

  /**
   * Determines if a token, at a given row and column, has landed
   * We consider it landed if
   * - the token is on the bottom row
   * - OR the token is sitting on top of another token
   *
   * @param row current
   * @param column
   * @returns
   */
  private hasTokenLanded(row: number, column: number): boolean {
    const underneathRow = this.boardState[row + 1];

    const isOnLastRow = underneathRow == null;
    if (isOnLastRow) {
      return true;
    }

    const hasLandedOnAnotherToken = underneathRow[column] != null;
    return hasLandedOnAnotherToken;
  }

  /**
   * Determines if a given column is full of tokens
   * @param columnNumber column to check
   * @returns
   */
  private isColumnFull(columnNumber: number): boolean {
    const topRow = this.boardState[0];
    const topCellOfColumn = topRow[columnNumber];

    return topCellOfColumn != null;
  }

  /**
   * Given the row and column a token is in, will return the next frame of it falling down
   * e.g. if the current board is in the below state
   * | |x| |
   * | | | |
   * |o| |x|
   *
   * calling this function with row 1 and column 1 will result in
   * | | | |
   * | |x| |
   * |o| |x|
   * @param tokenInRow
   * @param column
   * @returns
   */
  private getNextBoardFrame(tokenInRow: number, column: number) {
    // make a copy of the current row and place the token
    // using the spread operator to make a copy, we don't want to cause side effects and update the existing state
    const tokensCurrentRow = [...this.boardState[tokenInRow]];
    tokensCurrentRow[column] = this.currentToken;

    // if first row, we only need to replace the first row
    if (tokenInRow === 0) {
      return [tokensCurrentRow, ...this.boardState.slice(1)];
    }

    // if it's not the first row, we need to remove the token from the previous row
    // this simulates it falling from the row above to the row below
    const tokensPreviousRow = [...this.boardState[tokenInRow - 1]];
    tokensPreviousRow[column] = null;

    // if last row, we need to replace the last two row
    if (tokenInRow === this.boardState.length - 1) {
      return [
        ...this.boardState.slice(0, -2),
        tokensPreviousRow,
        tokensCurrentRow,
      ];
    }

    // if not the first or last row, the rows above and below the current and previous rows remain the same
    return [
      ...this.boardState.slice(0, tokenInRow - 1),
      tokensPreviousRow,
      tokensCurrentRow,
      ...this.boardState.slice(tokenInRow + 1),
    ];
  }
}
