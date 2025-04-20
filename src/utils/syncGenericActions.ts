import { Transaction } from "sequelize";
import FpsHelper from "../models/FpsHelper";
import User from "../models/User";
import { sendNotification } from "./sendNotification";
import { io } from "../index";

export type SyncBaseItem = {
  userService: string;
  userCategory: string;
  [key: string]: any;
};

type SyncParams<T extends SyncBaseItem> = {
  fpsId: string;
  newItems: T[];
  senderName: string;
  transaction: Transaction;
  model: any; // Sequelize model (ImmediateActions, SortingResults, etc.)
  notifyTitle: string;
  notifyMessage: (item: T, fpsId: string) => string;
  role: "immediate" | "sorting" | "defensive";
};

export async function syncGenericActions<T extends SyncBaseItem>({
  fpsId,
  newItems,
  senderName,
  transaction,
  model,
  notifyTitle,
  notifyMessage,
  role,
}: SyncParams<T>) {
  // Use fpsImmediateActionsId for immediate/sorting roles
  const keyField = role === "defensive" ? "fpsId" : "immediateActionsId";

  const existing = await model.findAll({
    where: { [keyField]: fpsId },
    transaction,
  });
  const existingMap = new Map<string, T>(
    existing.map((e: T) => [e.userService, e])
  );
  const incomingMap = new Map<string, T>(
    newItems.map((e) => [e.userService, e])
  );

  const toCreate = newItems.filter(
    (item) => !existingMap.has(item.userService)
  );
  const toUpdate = newItems.filter((item) => {
    const existingItem = existingMap.get(item.userService);
    return (
      existingItem &&
      Object.keys(item).some((key) => item[key] !== existingItem[key])
    );
  });
  const toDelete = [...existingMap.keys()].filter(
    (key) => !incomingMap.has(key)
  );

  if (toDelete.length > 0) {
    await model.destroy({
      where: { [keyField]: fpsId, userService: toDelete },
      transaction,
    });

    const userIds = await User.findAll({
      where: { userService: toDelete },
    }).then((users) => users.map((u) => u.id));

    await FpsHelper.destroy({
      where: { fpsId, userId: userIds },
      transaction,
    });
  }
// 
  for (const item of toCreate) {
    const { userService, userCategory } = item;
    await model.create({ ...item, [keyField]: fpsId }, { transaction });

    const users = await User.findAll({ where: { userService, userCategory } });

    await Promise.all(
      users.map(async (user) => {
        const existingHelper = await FpsHelper.findOne({
          where: { fpsId, userId: user.id },
          transaction,
        });

        if (!existingHelper) {
          await FpsHelper.create(
            { fpsId, userId: user.id, roles: [role], scanStatus: "unscanned" },
            { transaction }
          );
        } else if (!existingHelper.roles.includes(role)) {
          existingHelper.roles.push(role);
          await existingHelper.save({ transaction });
        }

        await sendNotification(io, {
          userId: user.id.toString(),
          fpsId,
          title: notifyTitle,
          message: notifyMessage(item, fpsId),
          sender: senderName,
          priority: "High",
        });
      })
    );
  }

  for (const item of toUpdate) {
    await model.update(
      { ...item },
      {
        where: { [keyField]: fpsId, userService: item.userService },
        transaction,
      }
    );
  }

  return {
    created: toCreate.length,
    updated: toUpdate.length,
    deleted: toDelete.length,
  };
}
