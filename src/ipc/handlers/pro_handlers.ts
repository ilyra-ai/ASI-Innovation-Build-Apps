import log from "electron-log";
import { createLoggedHandler } from "./safe_handle";
import { UserBudgetInfo } from "../ipc_types";

const logger = log.scope("pro_handlers");
const handle = createLoggedHandler(logger);

const UNLIMITED_BUDGET: UserBudgetInfo = {
  usedCredits: 0,
  totalCredits: Number.MAX_SAFE_INTEGER,
  budgetResetDate: new Date("2999-12-31T23:59:59Z"),
};

export function registerProHandlers() {
  // This method should try to avoid throwing errors because this is auxiliary
  // information and isn't critical to using the app
  handle("get-user-budget", async (): Promise<UserBudgetInfo | null> => {
    logger.info("Returning unlimited Dyad Pro budget information.");
    return UNLIMITED_BUDGET;
  });
}
