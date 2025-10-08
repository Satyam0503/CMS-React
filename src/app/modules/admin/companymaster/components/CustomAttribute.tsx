import { Box, Card, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { AttributeTable } from "./AttributeTable";
import {
  CustomAttributeModel,
  CustomAttributeValueModel,
  OutletContextType,
  UpdateCustomAttributePayload,
} from "../../models";
import { Navigate, useOutletContext, useParams } from "react-router-dom";
import {
  deleteAttributeItem,
  getCustomAttributeById,
  updateCustomAttribute,
} from "../../adminservices";
import { useAppLang } from "../../../../../_themes/i18n/Metronici18n";
import { transformAttributeObjectToList } from "../../../../../utils/common";
import { toast } from "react-toastify";
import { ServiceUrl } from "../../../../../utils/constant/Constant";

export const CustomAttribute = () => {
  const { updateAttribute } = useOutletContext<OutletContextType>();
  const { formatMessage: i } = useIntl();
  const [customAttributeData, setCustomAttributeData] =
    useState<CustomAttributeModel>({} as CustomAttributeModel);
  const { currentLanguage } = useAppLang();
  const param = useParams();
  const [refresh, setRefresh] = useState(false);
  const customAttributeId = param?.customAttributeId;
  const customAttributeName =
    customAttributeData?.customAttributeTitle?.[currentLanguage] ??
    `${i({ id: "COMPANY_MASTER.CUSTOM_ATTRIBUTE.TITLE" })} - ${customAttributeData.customAttributeNumber
    }`;

  const handleCustomAttributeUpdate = async (
    attributeValue: CustomAttributeValueModel[],
    attributeTitle?: Record<string, string>
  ) => {
    const payload: UpdateCustomAttributePayload = {
      customAttributeId: customAttributeId,
      customAttributeTitle: attributeTitle
        ? transformAttributeObjectToList(attributeTitle)
        : [],
      customAttributeValues: [],
    } as UpdateCustomAttributePayload;

    attributeValue.forEach((value) => {
      payload.customAttributeValues.push({
        ...value,
        titles: transformAttributeObjectToList(value.titles),
      });
    });
    try {
      const { data } = await updateCustomAttribute(payload);
      if (data.success) {
        toast.success(i({ id: "TOAST.SUCCESS.UPDATE" }));
        updateAttribute({
          customAttributeId: customAttributeData.customAttributeId,
          customAttributeNumber: customAttributeData.customAttributeNumber,
          customAttributeTitle: attributeTitle!
        })
        setRefresh(!refresh);
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  const handleCustomAttributeItemDelete = async (
    customAttributeValueId: string
  ) => {
    try {
      const response = await deleteAttributeItem(
        ServiceUrl.DELETE_CUSTOM_ATTRIBUTE_VALUE,
        customAttributeValueId
      );
      const { success, message } = response.data;
      if (!success) {
        throw new Error(message);
      }
      toast.success(i({ id: "TOAST.SUCCESS.DELETE" }));
      setRefresh(!refresh);
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  // naviagate to error page if customAttributeId is not present
  if (!customAttributeId) {
    return <Navigate to={"/error"} />;
  }

  useEffect(() => {
    // fetch custom attribute data by id
    (async () => {
      try {
        const { data } = await getCustomAttributeById(customAttributeId);
        if (data.success) {
          setCustomAttributeData(data.methodResult);
        }
      } catch (error) {
        console.error((error as Error).message);
      }
    })();
  }, [customAttributeId, refresh]);

  return (
    <Stack spacing={1} className="flex-grow-1">
      <AttributeTable
        attributeName={customAttributeName}
        attributeTitle={customAttributeData.customAttributeTitle}
        attributeData={customAttributeData?.customAttributeValues ?? []}
        keyName="customAttributeValueId"
        handleAttributeUpdate={handleCustomAttributeUpdate}
        handleDeleteAttribute={handleCustomAttributeItemDelete}
        isDefaultAttribute={false}
      />
    </Stack>
  );
};
