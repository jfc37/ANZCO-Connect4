import { Component } from '@angular/core';
import { range, timer, of, interval, lastValueFrom } from 'rxjs';
import { tap, delay, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public disableInteraction = false;
  public turn: 'player' | 'computer' = 'player';
  public get currentToken() {
    return this.turn === 'player' ? 'x' : 'o';
  }

  public boardState: (string | null)[][] = [
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
  ];

  public async playerPlacedToken(column: number): Promise<void> {
    if (this.disableInteraction) {
      return;
    }

    // if the column clicked is full, not a valid move
    if (this.isColumnFull(column)) {
      return;
    }

    this.disableInteraction = true;

    // drop the token into the column
    await this.dropToken(column);
    this.toggleTurn();

    await this.computerTurn();
    this.toggleTurn();
    this.disableInteraction = false;
  }

  private async computerTurn(): Promise<void> {
    await this.dropToken(2);
  }

  private toggleTurn(): void {
    if (this.turn === 'player') {
      this.turn = 'computer';
    } else {
      this.turn = 'player';
    }
  }

  private dropToken(column: number): Promise<any> {
    // create an observable that will emit a number for each row
    // range(0, this.boardState.length)
    const drop = timer(0, 500).pipe(
      // delay each frame so the user can see the token drop
      // update the board with the next frame of the token drop
      tap((row) => (this.boardState = this.getNextBoardFrame(row, column))),
      // continue until the token lands (either at the bottom row, or on another token)
      takeWhile((row: number) => !this.hasTokenLanded(row, column))
    );

    return lastValueFrom(drop);
  }

  private hasTokenLanded(row: number, column: number): boolean {
    const isOnLastRow = this.boardState[row + 1] == null;
    if (isOnLastRow) {
      return true;
    }

    const underneathRow = this.boardState[row + 1];
    const hasLandedOnAnotherToken = underneathRow[column] != null;
    return hasLandedOnAnotherToken;
  }

  private isColumnFull(columnNumber: number): boolean {
    const topRow = this.boardState[0];
    const topCellOfColumn = topRow[columnNumber];

    return topCellOfColumn != null;
  }

  private getNextBoardFrame(tokenInRow: number, column: number) {
    const tokensCurrentRow = [...this.boardState[tokenInRow]];
    tokensCurrentRow[column] = this.currentToken;
    // if first row
    if (tokenInRow === 0) {
      return [tokensCurrentRow, ...this.boardState.slice(1)];
    }

    const tokensPreviousRow = [...this.boardState[tokenInRow - 1]];
    tokensPreviousRow[column] = null;

    // if last row
    if (tokenInRow === this.boardState.length - 1) {
      return [
        ...this.boardState.slice(0, -2),
        tokensPreviousRow,
        tokensCurrentRow,
      ];
    }

    // if in the middle of the board
    return [
      ...this.boardState.slice(0, tokenInRow - 1),
      tokensPreviousRow,
      tokensCurrentRow,
      ...this.boardState.slice(tokenInRow + 1),
    ];
  }
}
