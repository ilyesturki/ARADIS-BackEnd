export type SortingResultsType = {
  product: string;
  sortedQuantity: string;
  quantityNOK: string;
  userCategory: string;
  userService: string;
};

export type ImmediatActionsType = {
  description: string;
  userCategory: string;
  userService: string;
};

export type FpsImmediateActionsType = {

  startSorting?: boolean;
  sortingResults?: SortingResultsType[];
  concludeFromSorting?: string;
  immediateActions?: ImmediatActionsType[];
};
