import { getRequest } from "../../../server/axios"
import { GetProcessLogResponseModel } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant"

export const getProcessLogData = async ()=>{
    return getRequest<GetProcessLogResponseModel>(ServiceUrl.GET_PROCESS_LOG);
}

