import { ModelMutateResultData } from '../bindings/index.js';
import { ensure_ModelMutateResultData } from '../bindings/type_asserts.js';
import { ipc_invoke } from '../ts/ipc.js';

/**
 * Base Frontend Model Controller class with basic CRUD except `list` which will be per subclass for now.
 * 
 * - M - For the Enity model type (e.g., Project)
 * - C - For the Create data type (e.g., ProjectForCreate)
 * - U - For the update data type (e.g., ProjectForUpdate)
 */
export class BaseFmc<M, C, U> {
  #cmd_suffix: string
  get cmd_suffix() { return this.#cmd_suffix; }

  constructor(cmd_suffix: string) {
    this.#cmd_suffix = cmd_suffix;
  }

  async get(id: string): Promise<M> {
    return ipc_invoke(`get_${this.#cmd_suffix}`, { id }).then(res => res.data);
  }

  async create(data: C): Promise<ModelMutateResultData> {
    return ipc_invoke(`create_${this.#cmd_suffix}`, { data }).then(res => {
      return ensure_ModelMutateResultData(res.data);
    });
  }

  async update(id: string, data: U): Promise<ModelMutateResultData> {
    return ipc_invoke(`update_${this.#cmd_suffix}`, { id, data }).then(res => {
      return ensure_ModelMutateResultData(res.data);
    });
  }

  async delete(id: string): Promise<ModelMutateResultData> {
    return ipc_invoke(`delete_${this.#cmd_suffix}`, { id }).then(res => res.data);
  }
}