import * as _ from "lodash";
import { validateFields } from "./validation";

export const convertToObject = (data: any) => {
  return _.isString(data) ? { error: data } : data;
};

export { validateFields };
