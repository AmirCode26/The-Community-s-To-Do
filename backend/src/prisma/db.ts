import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import postgres from "@prisma/orm-postgres/runtime";
import "temporal-polyfill/global";

import service from "../../service.ts";
import type { Contract } from "./contract.d.ts";
import contractJson from "./contract.json" with { type: "json" };

// Carga el .env de la raíz del backend sin depender del directorio de arranque.
// Si el archivo no existe, no pasa nada (en producción las variables vienen del entorno).
loadEnv({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

function loadComposerDatabase() {
  try {
    return service.load().database.client;
  } catch {
    return undefined;
  }
}

const composerClient = loadComposerDatabase();

if (!composerClient && !process.env.DATABASE_URL) {
  console.warn(
    "[db] DATABASE_URL no está definida y no hay base de datos de Composer. Las queries van a fallar.",
  );
}

export const db =
  composerClient ??
  (process.env.DATABASE_URL
    ? postgres<Contract>({ contractJson, url: process.env.DATABASE_URL })
    : postgres<Contract>({ contractJson }));

let connection: Promise<void> | undefined;

export function connectDatabase(): Promise<void> {
  connection ??= db
    .connect()
    .then(() => undefined)
    .catch((error: unknown) => {
      connection = undefined;
      throw error;
    });
  return connection;
}
