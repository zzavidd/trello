# Trello Card Cleanup

Archives all empty auto-generated lists from a Trello board.

First, install [Deno](https://deno.land/manual@v1.28.2/getting_started/installation):

Populate the following environment variables:
```
TRELLO_API_KEY=
TRELLO_API_TOKEN=
TRELLO_BOARD_ID=
```

Run `yarn run start` to archive the empty lists on the specified board.