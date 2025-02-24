import { FpsCauseType } from "./FpsCauseType";
import { FpsDefensiveActionType } from "./FpsDefensiveActionType";
import { FpsImmediateActionsType } from "./FpsImmediateActionsType";
import { FpsProblemType } from "./FpsProblemType";

export interface FpsType {
  fpsId?: string;
  userId?: number;
  problemId?: number;
  causeId?: number;
  immediateActionsId?: number;
  currentStep: "problem" | "immediateActions" | "cause" | "defensiveActions";
  problem?: FpsProblemType;
  cause?: FpsCauseType;
  immediateActions?: FpsImmediateActionsType;
  defensiveActions?: FpsDefensiveActionType[];
}
