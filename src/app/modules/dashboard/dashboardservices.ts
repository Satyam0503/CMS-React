import { deleteRequest, getRequest, patchRequest, postRequest } from "../../../server/axios";
import { ApiResponse } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import { getAllGenderDetailsResponseData  } from "./model";


// Gender
export const getAllGenderInfo = async () => {
  return getRequest<getAllGenderDetailsResponseData>(ServiceUrl.GET_ALL_GENDERS);
};
