import { db } from "../db.ts";

export interface UpsertLayoutInput {
  structureType: "GLOBAL" | "S_NIG" | "TOWER";
  structureId: string;
  layoutJson: any; // Mantenemos el JSON totalmente dinámico y flexible
}

export async function getLayout(structureType: "GLOBAL" | "S_NIG" | "TOWER", structureId: string) {
  const layout = await db.orm.public.CommunityLayout.where({
    structureType,
    structureId,
  }).first();

  if (!layout) {
    throw new Error("LAYOUT_NOT_FOUND");
  }

  return layout;
}
export async function listLayouts() {
  const layouts = await db.orm.public.CommunityLayout.all();

  return layouts;
}
export async function upsertLayout(input: UpsertLayoutInput, requesterRole: string) {
  // Solo líderes pueden guardar o actualizar mapas/layouts
  if (requesterRole !== "L_NIG" && requesterRole !== "L_SNIG" && requesterRole !== "L_T") {
    throw new Error("ACCESS_DENIED_LEADERSHIP_REQUIRED");
  }

  const existingLayout = await db.orm.public.CommunityLayout.where({
    structureType: input.structureType,
    structureId: input.structureId,
  }).first();

  if (existingLayout) {
    return await db.orm.public.CommunityLayout.where({ id: existingLayout.id }).update({
      layoutJson: input.layoutJson,
    });
  }

  return await db.orm.public.CommunityLayout.create({
    structureType: input.structureType,
    structureId: input.structureId,
    layoutJson: input.layoutJson,
  });
}
