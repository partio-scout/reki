import { Model, ModelCtor } from 'sequelize'

export interface DateRange {
  startDate: string
  endDate: string
}

export interface TransferModel<SourceObjectType> {
  targetModel: ModelCtor<Model>
  getFromSource: (
    dateRange: undefined | DateRange,
  ) => Promise<SourceObjectType[]>
  transform?: (sourceObject: SourceObjectType) => any
  joinTable?: boolean
  dateRange?: DateRange
}

export async function transferModel<SourceObjectType>(
  model: TransferModel<SourceObjectType>,
): Promise<void> {
  const sourceObjects = await model.getFromSource(model.dateRange)
  const transform =
    model.transform !== undefined
      ? model.transform
      : (input: SourceObjectType): any => input
  const objects = sourceObjects.map((sourceObject) => transform(sourceObject))

  if (model.joinTable) {
    // LoopBack can't upsert join tables for some reason, let's delete the possible old object first
    // TODO: Is this even valid anymore, now that we're using sequelize?
    await recreateObjects(model.targetModel, objects)
  } else if (model.dateRange) {
    // If date range is set we can't delete all items first or we would lose the items
    // outside the given date range. Thus we must upsert instead.
    await upsertObjects(model.targetModel, objects)
  } else {
    await model.targetModel.destroy({ where: {} })
    await model.targetModel.bulkCreate(objects)
  }
}

async function recreateObjects(
  model: ModelCtor<Model>,
  objects: readonly any[],
): Promise<void> {
  for (const obj of objects) {
    await model.destroy({ where: obj as any })
    await model.create(obj)
  }
}

async function upsertObjects(
  model: ModelCtor<Model>,
  objects: readonly any[],
): Promise<void> {
  for (const obj of objects) {
    await model.upsert(obj)
  }
}
