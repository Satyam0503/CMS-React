import {
  useState } from "react";
import { Box, FormControl, InputLabel, MenuItem } from "@mui/material";
import { ReqProps } from "./AttributeItemRow";
import { toast } from "react-toastify";
import { useIntl } from "react-intl";
import { LanguageNameMapper } from "../../../../../utils/common";
import { LANGUAGE } from "../../../../../utils/enums";
import { normalizeAppLanguage } from "../../../../../_themes/i18n/languageUtils";
import { useAppSelector } from "../../../../Redux/hooks";

import { AppSelect, AppSwitch, AppTextField } from "../../../../shared/components/ui";
interface Props<T> {
  translationLang: string;
  newItemKey: string;
  newItemsList: T[];
  setNewItemList: (items: T[]) => void;
  selectField?: keyof T;
  selectOptions?: Array<{ value: string; label: string }>;
}

const AddNewAttributeItem = <T extends ReqProps>({
  translationLang,
  newItemKey,
  newItemsList,
  setNewItemList,
  selectField,
  selectOptions,
}: Props<T>) => {
  const [newAttributeValue, setNewAttributeValue] = useState<T>({
    isActive: true,
    newItemKey: newItemKey,
    titles: {},
  } as T);
  const { formatMessage: i } = useIntl();
  const defaultCompanyLanguage = useAppSelector(
    (state) => state.user.userData?.defaultLanguage
  );
  const currentLang = normalizeAppLanguage(defaultCompanyLanguage) ?? LANGUAGE.ENGLISH;
  const [error, setError] = useState(false);
  const translationLanguageTitle = newAttributeValue.titles[translationLang] ?? "";
  const currentLanguageTitle = newAttributeValue.titles[currentLang] ?? "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const titles = newAttributeValue.titles;
    const { value, name } = e.target;
    if (value.length === 0) {
      delete titles[name];
    } else {
      titles[name] = value;
    }
    setNewAttributeValue({ ...newAttributeValue, titles: titles });
  };

  const validateAndUpdateNewItemData = () => {
    const index = newItemsList.findIndex(
      (item) => newAttributeValue?.newItemKey === item?.newItemKey
    );
    const currentLanguageName = i({ id: LanguageNameMapper[currentLang] });
    // check if default language title is present and not empty
    const hasDefaultLangTitle = Boolean(
      newAttributeValue.titles[currentLang]?.trim().length
    );
    if (index > -1) {
      if (!hasDefaultLangTitle) {
        setError(true);
        toast.error(
          i(
            { id: "MESSAGE.ADD_LANGUAGE_TITLE" },
            { language: currentLanguageName }
          )
        );
        setNewItemList(
          newItemsList.filter(
            (item) => item.newItemKey !== newAttributeValue?.newItemKey
          )
        );
      } else {
        setError(false);
        setNewItemList(
          newItemsList.map((item) => {
            if (item?.newItemKey === newAttributeValue?.newItemKey) {
              return newAttributeValue;
            } else {
              return item;
            }
          })
        );
      }
    } else {
      if (hasDefaultLangTitle) {
        setError(false);
        setNewItemList([...newItemsList, newAttributeValue]);
      } else {
        setError(true);
        toast.error(
          i(
            { id: "MESSAGE.ADD_LANGUAGE_TITLE" },
            { language: currentLanguageName }
          )
        );
      }
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    const updatedItem = {
      ...newAttributeValue,
      isActive: checked,
    };
    setNewAttributeValue(updatedItem);
    setNewItemList(
      newItemsList.map((item) => {
        if (item?.newItemKey === newAttributeValue?.newItemKey) {
          return updatedItem;
        } else {
          return item;
        }
      })
    );
  };

  const handleSelectChange = (value: string) => {
    if (!selectField) return;
    const updatedItem = { ...newAttributeValue, [selectField]: value } as T;
    setNewAttributeValue(updatedItem);
    setNewItemList(newItemsList.map((item) => item?.newItemKey === newAttributeValue?.newItemKey ? updatedItem : item));
  };

  return (
    <Box className={`attribute-row${translationLang ? " attribute-row--translated" : ""}${selectField ? " attribute-row--department" : ""}`}>
      <AppTextField
        value={currentLanguageTitle}
        onChange={handleChange}
        name={currentLang}
        onBlur={validateAndUpdateNewItemData}
        error={Boolean(error)}
      />
      {translationLang && <AppTextField
        value={translationLanguageTitle}
        onChange={handleChange}
        name={translationLang}
        onBlur={validateAndUpdateNewItemData}
      />}
      {selectField && (
        <FormControl fullWidth size="small">
          <InputLabel id={`${String(selectField)}-new-label`}>Department</InputLabel>
          <AppSelect
            labelId={`${String(selectField)}-new-label`}
            label="Department"
            value={(newAttributeValue[selectField] as string) ?? ""}
            onChange={(event) => handleSelectChange(event.target.value)}
          >
            {selectOptions?.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
          </AppSelect>
        </FormControl>
      )}
      <AppSwitch
        checked={newAttributeValue.isActive}
        onChange={(_, checked) => handleSwitchChange(checked)}
      />
    </Box>
  );
};
export { AddNewAttributeItem };
