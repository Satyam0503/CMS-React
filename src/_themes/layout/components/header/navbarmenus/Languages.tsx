import { useState } from "react";

import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { languages } from "../../../../../utils/constant/Constant";
import { useIntl } from "react-intl";
import { LanguageNameMapper, } from "../../../../../utils/common";
import { useAppLang } from "../../../../i18n/Metronici18n";

import { AppIconButton } from "../../../../../app/shared/components/ui";
const Languages = () => {
  const { currentLanguage, changeAppLanguage } = useAppLang();
  const { formatMessage } = useIntl();
  const [languageAnchorEl, setLanguangeAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setLanguangeAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setLanguangeAnchorEl(null);
  };

  const handleChangeLanguage = (language: (typeof languages)[0]) => {
    if (language.lang !== currentLanguage) {
      changeAppLanguage?.(language.lang);
    }
    setLanguangeAnchorEl(null);
  };

  const open = Boolean(languageAnchorEl);
  const id = open ? "language-popover" : undefined;
  const currentLanguageIcon = languages.find(lang => lang.lang === currentLanguage) ?? languages[0];

  return (
    <>
      <Stack role="button" direction="row" className="align-items-center gap-2 mx-1 px-3 py-1" onClick={handleClick} >
        <Typography variant="body1">{formatMessage({ id: LanguageNameMapper[currentLanguage] })}</Typography>
        <img
          className="rounded-circle country-flag"
          src={currentLanguageIcon?.flag}
          alt="countryflag"
        />
        <AppIconButton
          className="p-0 border-0 bg-transparent"
        >
          {open ? <ArrowDropUp /> : <ArrowDropDown />}
        </AppIconButton>
      </Stack>
      <Popover
        id={id}
        open={open}
        anchorEl={languageAnchorEl}
        onClose={handleClose}
        anchorOrigin={{
          horizontal: "right",
          vertical: "bottom",
        }}
        transformOrigin={{
          horizontal: "right",
          vertical: "top",
        }}
      >
        <List>
          {languages.map((lang) => (
            <ListItem disablePadding className="mb-1" key={lang.id}>
              <ListItemButton
                onClick={() => {
                  handleChangeLanguage(lang);
                }}
                selected={currentLanguage === lang.lang}
              >
                <ListItemIcon>
                  <img
                    className="country-flag rounded-circle"
                    src={lang.flag}
                    alt="countryflag"
                  />
                </ListItemIcon>
                <ListItemText primary={formatMessage({ id: lang.name })} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Popover>
    </ >
  );
};

export { Languages };
