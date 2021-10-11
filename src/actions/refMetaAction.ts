import { processHttpRegionActions } from '../utils';
import { ActionType, HttpRegionAction } from '../models';
import { ImportProcessorContext } from './importMetaAction';
export interface RefMetaHttpRegionData {
  name: string;
  force: boolean;
}

export class RefMetaAction implements HttpRegionAction {
  id = ActionType.ref;

  constructor(private readonly data: RefMetaHttpRegionData) { }

  async process(context: ImportProcessorContext): Promise<boolean> {
    for (const refHttpRegion of context.httpFile.httpRegions) {
      if (refHttpRegion.metaData.name === this.data.name
        && !refHttpRegion.metaData.disabled
        && refHttpRegion !== context.httpRegion) {
        if (this.data.force || !context.variables[this.data.name]) {
          const refContext = { ...context, httpRegion: refHttpRegion };
          await processHttpRegionActions(refContext);
        }
        return true;
      }
    }
    if (context.options.httpFiles) {
      for (const refHttpFile of context.options.httpFiles) {
        const cloneContext = {
          ...context,
          options: {
            ...context.options,
          },
          httpFile: refHttpFile
        };
        delete cloneContext.options.httpFiles;
        await this.process(cloneContext);
      }
    }
    return true;
  }
}
