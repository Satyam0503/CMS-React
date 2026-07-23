import {
  useState } from "react";
import { Box,
} from "@mui/material";
import { useAppSelector } from "../../../../Redux/hooks";
import { ReqProps } from "./AttributeItemRow";
import { toast } from "react-toastify";
import { useIntl } from "react-intl";
import { LanguageNameMapper } from "../../../../../utils/common";

import { AppSwitch, AppTextField } from "../../../../shared/components/ui";
interface Props<T> {
  translationLang: string;
  newItemKey: string;
  newItemsList: T[];
  setNewItemList: (items: T[]) => void;
}

const AddNewAttributeItem = <T extends ReqProps>({
  translationLang,
  newItemKey,
  newItemsList,
  setNewItemList,
}: Props<T>) => {
  const [newAttributeValue, setNewAttributeValue] = useState<T>({
    isActive: true,
    newItemKey: newItemKey,
    titles: {},
  } as T);
  const { formatMessage: i } = useIntl();
  const currentLang = useAppSelector(
    (state) => state.user.userData?.defaultLanguage ?? ""
  );
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

  return (
    <Box className="attribute-row">
      <AppTextField
        value={currentLanguageTitle}
        onChange={handleChange}
        name={currentLang}
        onBlur={validateAndUpdateNewItemData}
        error={Boolean(error)}
      />
      <AppTextField
        disabled={!translationLang}
        value={translationLanguageTitle}
        onChange={handleChange}
        name={translationLang}
        onBlur={validateAndUpdateNewItemData}
      />
      <AppSwitch
        checked={newAttributeValue.isActive}
        onChange={(_, checked) => handleSwitchChange(checked)}
      />
    </Box>
  );
};
export { AddNewAttributeItem };
