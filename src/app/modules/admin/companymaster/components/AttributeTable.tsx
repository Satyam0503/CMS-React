import {
  Box,
  Card,
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { useIntl } from "react-intl";
import { AddNewAttributeItem } from "./AddNewAttributeItem";
import { AttributeItemRow, ReqProps } from "./AttributeItemRow";
import { languages } from "../../../../../utils/constant/Constant";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../../../Redux/hooks";
import { Add } from "@mui/icons-material";
import { useAppLang } from "../../../../../_themes/i18n/Metronici18n";
import { LanguageNameMapper } from "../../../../../utils/common";
import { AttributeTitleRow } from "./AttributeTitleRow";

interface Props<T> {
  isDefaultAttribute?: boolean;
  attributeName: string;
  attributeTitle?: Record<string, string>;
  attributeData: T[];
  keyName: keyof T;
  handleAttributeUpdate: (
    data: T[],
    attributeTitle?: Record<string, string>
  ) => Promise<void>;
  handleDeleteAttribute: (id: string) => Promise<void>;
}

const initialItemsId = ["1", "2", "3", "4", "5"];

export const AttributeTable = <T extends ReqProps>(props: Props<T>) => {
  const {
    isDefaultAttribute = true,
    attributeData,
    attributeName,
    keyName,
    handleAttributeUpdate,
    handleDeleteAttribute,
    attributeTitle,
  } = props;

  const { formatMessage: i } = useIntl();
  const applicationLanguage = useAppSelector(
    (state) => state.user.userData?.applicationLanguage!
  );
  const currentLanguage = useAppSelector(
    (state) => state.user.userData?.defaultLanguage!
  );
  const [translationLang, setTranslationLang] = useState<string>(
    applicationLanguage.find((lang) => lang !== currentLanguage) ?? ""
  );
  const [itemsList, setItemsList] = useState<T[]>([]);
  const [newItemsList, setNewItemsList] = useState<T[]>([]);
  const [newItemIds, setNewItemIds] = useState<string[]>([]);
  const [title, setTitle] = useState<Record<string, string>>({});
  const [initialAttributeValue, setInitialAttributeValue] = useState<T[]>([]);
  const initialAttributeTitle = useRef<Record<string, string>>({});

  const handleReset = () => {
    if (newItemsList.length) {
      setNewItemIds([]);
    }
    setNewItemsList([]);
    setItemsList(structuredClone(initialAttributeValue));
    if (!isDefaultAttribute) {
      setTitle(initialAttributeTitle.current);
    }
  };

  const UpdateExistingItemData = (updatedItem: T) => {
    if (updatedItem[keyName]) {
      setItemsList(
        itemsList.map((item) => {
          if (item[keyName] === updatedItem[keyName]) {
            return updatedItem;
          }
          return item;
        })
      );
    } else {
      setItemsList([...itemsList, updatedItem]);
    }
  };

  const UpdateNewItemsList = (list: T[]) => {
    setNewItemsList(list);
  };

  const handleUpdate = async () => {
    const allItems = newItemsList.concat(itemsList);
    for (const element of allItems) {
      delete element.newItemKey;
    }
    if (!allItems.length) return;
    if (!isDefaultAttribute) {
      await handleAttributeUpdate(allItems, title);
    } else {
      await handleAttributeUpdate(allItems);
    }
    handleReset();
  };

  const updateAttributeTitle = (updatedTitle: Record<string, string>) => {
    setTitle({ ...updatedTitle });
  };

  useEffect(() => {
    if (attributeData?.length) {
      setItemsList(structuredClone(attributeData));
      setInitialAttributeValue(structuredClone(attributeData));
      setNewItemIds([]);
    } else {
      setNewItemIds(initialItemsId);
    }
  }, [attributeData]);

  useEffect(() => {
    if (!isDefaultAttribute && attributeTitle) {
      setTitle(attributeTitle);
      initialAttributeTitle.current = structuredClone(attributeTitle);
    }
  }, [attributeTitle]);
  return (
    <Stack spacing={1} className="flex-grow-1">
      <Card className="p-6 p-lg-10 py-8 d-flex flex-row gap-6 align-items-center">
        <Typography variant="h6">
          {i({ id: "COMPANY_MASTER.CUSTOM_ATTRIBUTE.NAME" }) + ":"}
        </Typography>
        <TextField
          variant="outlined"
          value={attributeName}
          disabled={true}
          placeholder={i({ id: "COMPANY_MASTER.CUSTOM_ATTRIBUTE.NAME" })}
        />
      </Card>
      <Card className="p-6 p-lg-10 d-flex flex-column gap-8 flex-grow-1">
        <Stack
          direction="row"
          className="justify-content-end align-items-center flex-wrap gap-4"
        >
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="language-translation">
              {i({ id: "COMPANY_MASTER.SELECT_TRAN_LANG" })}
            </InputLabel>

            <Select
              label={i({ id: "COMPANY_MASTER.SELECT_TRAN_LANG" })}
              labelId="language-translation"
              variant="outlined"
              value={translationLang}
              onChange={(e) => setTranslationLang(e.target.value)}
              disabled={applicationLanguage.length <= 1}
            >
              {languages
                .filter(
                  (lang) =>
                    applicationLanguage.includes(lang.lang) &&
                    lang.lang !== currentLanguage
                )
                .map((lang) => {
                  return (
                    <MenuItem key={lang.id} value={lang.lang}>
                      {i({ id: lang.name })}
                    </MenuItem>
                  );
                })}
            </Select>
          </FormControl>
        </Stack>
        {!isDefaultAttribute && (
          <Box className="attribute-container">
            <AttributeTitleRow
              translationLang={translationLang}
              attributeTitle={title ?? {}}
              updateAttributeTitle={updateAttributeTitle}
            />
          </Box>
        )}
        <Stack className="attribute-container">
          <Box className="attribute-row">
            <Typography variant="body1" className="fw-bolder">
              {i(
                { id: "COMPANY_MASTER.TITLE" },
                {
                  language: i({
                    id: languages.find((lang) => lang.lang === currentLanguage)
                      ?.name,
                  }),
                }
              )}
            </Typography>
            <Typography variant="body1" className="fw-bolder">
              {Boolean(translationLang) &&
                i(
                  { id: "COMPANY_MASTER.TITLE2" },
                  {
                    language: i({
                      id: languages.find(
                        (lang) => lang.lang === translationLang
                      )?.name,
                    }),
                  }
                )}
            </Typography>
            <Typography variant="body1" className="fw-bolder">
              {i({ id: "STATUS" })}
            </Typography>
          </Box>

          {itemsList.map((item) => (
            <AttributeItemRow
              key={item[keyName] as string}
              itemData={item}
              UpdatedItemData={UpdateExistingItemData}
              translationLanguage={translationLang}
              keyName={keyName}
              handleDeleteAttribute={handleDeleteAttribute}
            />
          ))}
          {newItemIds.map((item) => (
            <AddNewAttributeItem
              key={item}
              translationLang={translationLang}
              newItemKey={item}
              newItemsList={newItemsList}
              setNewItemList={UpdateNewItemsList}
            />
          ))}
          <span
            role="button"
            className="fw-bolder d-flex align-items-center align-self-start mt-6"
            onClick={() =>
              setNewItemIds([...newItemIds, Date.now().toString()])
            }
          >
            {" "}
            <Add /> {i({ id: "COMPANY_MASTER.ADD_NEW" })}{" "}
          </span>
          <Stack
            spacing={1}
            direction={"row"}
            sx={{ justifyContent: "flex-end", mt: 3, flexShrink: 0 }}
          >
            <CustomisedButton
              variant="outlined"
              label={i({ id: "BUTTON.CANCEL" })}
              handleClick={handleReset}
            />
            <CustomisedButton
              label={i({ id: "BUTTON.UPDATE" })}
              handleClick={handleUpdate}
            />
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
};
