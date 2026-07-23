import {
  Box,
} from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Delete } from "@mui/icons-material";
import { ConfirmationModal } from "../../../../shared/components/ConfirmationModal";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { useAppSelector } from "../../../../Redux/hooks";
import { LanguageNameMapper } from "../../../../../utils/common";

import { AppIconButton, AppSwitch, AppTextField } from "../../../../shared/components/ui";
type Props<T> = {
  itemData: T;
  UpdatedItemData: (item: T) => void;
  translationLanguage: string;
  keyName: keyof T;
  handleDeleteAttribute: (id: string) => Promise<void>;
};

export type ReqProps = {
  titles: Record<string, string>;
  isActive: boolean;
  newItemKey?: string;
};

export const AttributeItemRow = <T extends ReqProps>({
  itemData,
  UpdatedItemData,
  translationLanguage,
  keyName,
  handleDeleteAttribute,
}: Props<T>) => {
  const { formatMessage } = useIntl();
  const [item, setItem] = useState<T>(structuredClone(itemData));
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const currentLanguage = useAppSelector(
    (state) => state.user.userData?.defaultLanguage ?? ""
  );
  const translatedTitle = item.titles[translationLanguage];
  const currentTitle = item.titles[currentLanguage];
  const [, setError] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const updatedLanguage = e.target.name;
    const updatedTitles = { ...item.titles };
    if (e.target.value.length === 0) {
      delete updatedTitles[updatedLanguage];
    } else {
      updatedTitles[updatedLanguage] = e.target.value;
    }
    setItem({
      ...item,
      titles: updatedTitles,
    });
  };

  const handleItemDelete = async (str: string) => {
    if (str === "ok") {
      await handleDeleteAttribute(item[keyName] as string);
      setConfirmModalOpen(false);
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    const updateItem = {
      ...item,
      isActive: checked,
    };
    setItem(updateItem);
    const hasDefaultLangTitle = Boolean(currentTitle?.trim()?.length);
    if (hasDefaultLangTitle) {
      UpdatedItemData(updateItem);
    }
  };

  const validateAndUpdateNewItemData = () => {
    const currentLanguageName = formatMessage({
      id: LanguageNameMapper[currentLanguage],
    });
    // check if default language title is present and not empty
    const hasDefaultLangTitle = Boolean(currentTitle?.trim()?.length);
    if (!hasDefaultLangTitle) {
      setError(true);
      toast.error(
        formatMessage(
          { id: "MESSAGE.ADD_LANGUAGE_TITLE" },
          { language: currentLanguageName }
        )
      );
      return;
    } else {
      setError(false);
      UpdatedItemData(item);
    }
  };

  useEffect(() => {
    setItem(itemData);
  }, [itemData]);

  return (
    <>
      <Box className="attribute-row">
        <>
          <AppTextField
            name={currentLanguage}
            value={currentTitle ?? ""}
            onChange={handleChange}
            onBlur={validateAndUpdateNewItemData}
            error={!currentTitle?.length}
            required
          />
          <AppTextField
            disabled={!translationLanguage}
            name={translationLanguage}
            value={translatedTitle ?? ""}
            onChange={handleChange}
            onBlur={validateAndUpdateNewItemData}
          />
          <AppSwitch
            checked={item.isActive}
            onChange={(_, checked) => handleSwitchChange(checked)}
          />
        </>
        <div className="d-flex align-items-center gap-2">
          <AppIconButton
            onClick={() => setConfirmModalOpen(true)}
            className="border-0"
          >
            <Delete color="error" />
          </AppIconButton>
        </div>
      </Box>
      {isConfirmModalOpen && (
        <ConfirmationModal
          open={isConfirmModalOpen}
          title={formatMessage({ id: "CONFIRMATION.TITLE.DELETE_ATR_ITEM" })}
          content={formatMessage({
            id: "CONFIRMATION.CONTENT.DELETE_ATR_ITEM",
          })}
          handleClose={() => setConfirmModalOpen(false)}
          handleConfirmation={handleItemDelete}
        />
      )}
    </>
  );
};
