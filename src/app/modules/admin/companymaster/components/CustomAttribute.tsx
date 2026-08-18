import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { AttributeTable } from "./AttributeTable";
import {
  CustomAttributeModel,
  CustomAttributeValueModel,
  OutletContextType,
  UpdateCustomAttributePayload,
} from "../../models";
import { Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import {
  deleteCustomAttribute,
  deleteAttributeItem,
  getCustomAttributeById,
  updateCustomAttribute,
} from "../../adminservices";
import { useAppLang } from "../../../../../_themes/i18n/Metronici18n";
import { transformAttributeObjectToList } from "../../../../../utils/common";
import { toast } from "react-toastify";
import { ServiceUrl } from "../../../../../utils/constant/Constant";
import { ConfirmationModal } from "../../../../shared/components/ConfirmModal";

export const CustomAttribute = () => {
  const { updateAttribute, removeAttribute } = useOutletContext<OutletContextType>();
  const { formatMessage: i } = useIntl();
  const navigate = useNavigate();
  const [customAttributeData, setCustomAttributeData] =
    useState<CustomAttributeModel>({} as CustomAttributeModel);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { currentLanguage } = useAppLang();
  const param = useParams();
  const customAttributeId = param?.customAttributeId;
  const customAttributeName =
    customAttributeData?.customAttributeTitle?.[currentLanguage] ??
    `${i({ id: "COMPANY_MASTER.CUSTOM_ATTRIBUTE.TITLE" })} - ${customAttributeData.customAttributeNumber
    }`;
  // Keep an empty fallback stable. A new [] on every parent render was treated
  // as new server data by AttributeTable and cleared a value immediately after
  // a successful save.
  const attributeValues = useMemo(
    () => customAttributeData.customAttributeValues ?? [],
    [customAttributeData.customAttributeValues],
  );

  const fetchCustomAttribute = useCallback(async () => {
    if (!customAttributeId) return;

    // Always re-read the canonical record after a mutation. This avoids a
    // cached response replacing saved values with an earlier empty snapshot.
    const { data } = await getCustomAttributeById(customAttributeId, false, true);
    if (!data.success || !data.methodResult) {
      throw new Error(data.message || "Custom attribute could not be loaded.");
    }

    setCustomAttributeData(data.methodResult);
  }, [customAttributeId]);

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
      if (!data.success) throw new Error(data.message || "Custom attribute could not be updated.");
      toast.success(i({ id: "TOAST.SUCCESS.UPDATE" }));
      updateAttribute({
        customAttributeId: customAttributeData.customAttributeId,
        customAttributeNumber: customAttributeData.customAttributeNumber,
        customAttributeTitle: attributeTitle ?? customAttributeData.customAttributeTitle,
      });
      // Reload the saved document rather than leaving the form backed by a
      // temporary draft. This also supplies generated value IDs for later edits.
      await fetchCustomAttribute();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Custom attribute could not be updated.";
      toast.error(message);
      throw error;
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
      await fetchCustomAttribute();
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  const handleCustomAttributeDelete = async (confirmation: string) => {
    if (confirmation !== "ok" || !customAttributeId) return;

    try {
      const { data } = await deleteCustomAttribute(customAttributeId);
      if (!data.success) {
        throw new Error(
          data.message === "CUSTOM_ATTRIBUTE_IN_USE"
            ? "This custom attribute is in use by one or more employees and cannot be deleted."
            : data.message || "Custom attribute could not be deleted.",
        );
      }

      removeAttribute(customAttributeId);
      setDeleteConfirmOpen(false);
      toast.success("Custom attribute deleted.");
      navigate("/admin/companymaster/department");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Custom attribute could not be deleted.");
    }
  };

  useEffect(() => {
    if (!customAttributeId) {
      return;
    }
    (async () => {
      try {
        await fetchCustomAttribute();
      } catch (error) {
        console.error((error as Error).message);
      }
    })();
  }, [fetchCustomAttribute]);

  // naviagate to error page if customAttributeId is not present
  if (!customAttributeId) {
    return <Navigate to={"/error"} />;
  }

  return (
    <>
      <AttributeTable
        attributeName={customAttributeName}
        attributeTitle={customAttributeData.customAttributeTitle}
        attributeData={attributeValues}
        keyName="customAttributeValueId"
        handleAttributeUpdate={handleCustomAttributeUpdate}
        handleDeleteAttribute={handleCustomAttributeItemDelete}
        isDefaultAttribute={false}
        onDeleteCustomAttribute={() => setDeleteConfirmOpen(true)}
      />
      <ConfirmationModal
        open={isDeleteConfirmOpen}
        title="Delete custom attribute?"
        content="This removes the custom attribute and its values. Attributes assigned to employees cannot be deleted."
        handleClose={() => setDeleteConfirmOpen(false)}
        handleConfirmation={handleCustomAttributeDelete}
      />
    </>
  );
};
