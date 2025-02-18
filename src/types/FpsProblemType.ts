export type FpsProblemType = {
  type: "Securite" | "Environnement" | "Qualite" | "TRS/Efficience" | "Maintenence" | "Autre";
  quoi: string;
  ref: string;
  quand: string;
  ou: string;
  userCategory: string;
  userService: string;
  comment: string;
  combien: string;
  pourqoui: string;
  image?: string;
  images?: string[];
  clientRisck: boolean;
};
