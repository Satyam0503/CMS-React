import { Box, FormLabel, Stack, TextField } from "@mui/material";
import { LanguageNameMapper } from "../../../../../utils/common";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useAppSelector } from "../../../../Redux/hooks";

interface AttributeTitleProps {
  translationLang: string;
  attributeTitle: Record<string, string>;
  updateAttributeTitle: (title: Record<string, string>) => void;
}

export const AttributeTitleRow = ({
  translationLang,
  attributeTitle,
  updateAttributeTitle,
}: AttributeTitleProps) => {
  const { formatMessage: i } = useIntl();
  const [title, setTitle] = useState<Record<string, string>>(attributeTitle);
  const defaultLanguage = useAppSelector(
    (state) => state.user.userData?.defaultLanguage!
  );
  const [error, setError] = useState(false);
  const translationLanguageTitle = title[translationLang] ?? "";
  const currentLanguageTitle = title[defaultLanguage] ?? "";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const updatedTitle = { ...title };
    const { value, name } = e.target;
    if (value.length === 0) {
      delete updatedTitle[name];
    } else {
      updatedTitle[name] = value;
    }
    setTitle({ ...updatedTitle });
  };

  const validateAndUpdateNewItemData = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => {
    // check if default language title is present and not empty
    const hasDefaultLangTitle = Boolean(title[defaultLanguage]?.trim().length);
    if (!hasDefaultLangTitle) {
      setError(true);
    } else {
      setError(false);
      updateAttributeTitle(title);
    }
  };

  useEffect(() => {
    setTitle(attributeTitle);
  }, [attributeTitle]);

  return (
    <Box className="attribute-row">
      <Stack>
        <FormLabel sx={{ color: "text.secondary" }}>
          {i(
            { id: "COMPANY_MASTER.CUSTOM_ATTRIBUTE.ATTRIBUTE_NAME" },
            { language: i({ id: LanguageNameMapper[defaultLanguage] }) }
          )}
        </FormLabel>
        <TextField
          variant="standard"
          value={currentLanguageTitle}
          onChange={handleChange}
          name={defaultLanguage}
          onBlur={validateAndUpdateNewItemData}
          error={Boolean(error)}
        />
      </Stack>

      {Boolean(translationLang) && (
        <Stack>
          <FormLabel sx={{ color: "text.secondary" }}>
            {i(
              { id: "COMPANY_MASTER.CUSTOM_ATTRIBUTE.ATTRIBUTE_NAME" },
              { language: i({ id: LanguageNameMapper[translationLang] }) }
            )}
          </FormLabel>
          <TextField
            variant="standard"
            disabled={!Boolean(translationLang)}
            value={translationLanguageTitle}
            onChange={handleChange}
            name={translationLang}
            onBlur={validateAndUpdateNewItemData}
          />
        </Stack>
      )}
    </Box>
  );
};
