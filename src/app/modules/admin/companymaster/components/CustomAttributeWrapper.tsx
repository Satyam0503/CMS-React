import { useParams } from "react-router-dom";
import { CustomAttribute } from "./CustomAttribute";

export const CustomAttributeWrapper = () => {
  const customAttributeId = useParams()?.customAttributeId;
  {
    /* key property help to force react to remount CustomAttribute component every time key value change  */
  }

  return <CustomAttribute key={customAttributeId} />;
};
