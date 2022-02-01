# ConnectFour

Super basic version of connect four, with not many smarts at all.
Built on angular with help from the angular cli

## To run

```
npm install
npm start
```

Navigate to `http://localhost:4200/`

## For review

Very basic implementation, but I've used the smart containers/dumb components pattern.

### GameBoardComponent (src/app/game-board/game-board.component.ts)

Simply takes the current board and displays in. When the user clicks on a column, it passes that information up to the smart container. It handles none of the logic.

### AppComponent (src/app/app.component.ts)

This is the smart container. It is responsible for handling the state transitions of the game board.
Whenever the game board changes, it passes it to the dumb component to render.
