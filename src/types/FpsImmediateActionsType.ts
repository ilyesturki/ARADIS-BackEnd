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
  alert?: string[];
  startSorting?: boolean;
  sortingResults?: SortingResultsType[];
  concludeFromSorting?: string;
  immediateActions?: ImmediatActionsType[];
};
