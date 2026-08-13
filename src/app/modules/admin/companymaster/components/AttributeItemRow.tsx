import { Box, FormControl, InputLabel, MenuItem } from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Delete } from "@mui/icons-material";
import { ConfirmationModal } from "../../../../shared/components/ConfirmModal";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { LanguageNameMapper } from "../../../../../utils/common";
import { LANGUAGE } from "../../../../../utils/enums";
import { useAppLang } from "../../../../../_themes/i18n/Metronici18n";

import { AppIconButton, AppSelect, AppSwitch, AppTextField } from "../../../../shared/components/ui";
type Props<T> = {
  itemData: T;
  UpdatedItemData: (item: T) => void;
  translationLanguage: string;
  keyName: keyof T;
  handleDeleteAttribute: (id: string) => Promise<void>;
  selectField?: keyof T;
  selectOptions?: Array<{ value: string; label: string }>;
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
  selectField,
  selectOptions,
}: Props<T>) => {
  const { formatMessage } = useIntl();
  const [item, setItem] = useState<T>(structuredClone(itemData));
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const { currentLanguage: selectedUiLanguage } = useAppLang();
  const currentLanguage = selectedUiLanguage || LANGUAGE.ENGLISH;
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
    const updatedItem = {
      ...item,
      titles: updatedTitles,
    } as T;
    setItem(updatedItem);
    UpdatedItemData(updatedItem);
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

  const handleSelectChange = (value: string) => {
    if (!selectField) return;
    const updatedItem = { ...item, [selectField]: value } as T;
    setItem(updatedItem);
    UpdatedItemData(updatedItem);
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
      <Box className={`attribute-row${translationLanguage ? " attribute-row--translated" : ""}${selectField ? " attribute-row--department" : ""}`}>
        <>
          <AppTextField
            name={currentLanguage}
            value={currentTitle ?? ""}
            onChange={handleChange}
            onBlur={validateAndUpdateNewItemData}
            error={!currentTitle?.length}
            required
          />
          {translationLanguage && (
            <AppTextField
              name={translationLanguage}
              value={translatedTitle ?? ""}
              onChange={handleChange}
              onBlur={validateAndUpdateNewItemData}
            />
          )}
          {selectField && (
            <FormControl fullWidth size="small">
              <InputLabel id={`${String(selectField)}-label`}>Department</InputLabel>
              <AppSelect
                labelId={`${String(selectField)}-label`}
                label="Department"
                value={(item[selectField] as string) ?? ""}
                onChange={(event) => handleSelectChange(event.target.value)}
              >
                {selectOptions?.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
              </AppSelect>
            </FormControl>
          )}
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
