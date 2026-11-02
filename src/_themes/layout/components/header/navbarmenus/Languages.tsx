import { useState } from "react";

import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Tooltip,
} from "@mui/material";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { allLanguages, languages } from "../../../../../utils/constant/Constant";
import { useIntl } from "react-intl";
import { LanguageNameMapper, } from "../../../../../utils/common";
import { useAppLang } from "../../../../i18n/Metronici18n";

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
  const currentLanguageIcon = (allLanguages || languages).find(lang => lang.lang === currentLanguage) ?? languages[0];

  return (
    <>
      <Tooltip title={formatMessage({ id: LanguageNameMapper[currentLanguage] })}>
        <button
          type="button"
          className="border-0 bg-transparent d-flex align-items-center justify-content-center p-1 rounded-circle"
          onClick={handleClick}
          aria-describedby={id}
          aria-haspopup="listbox"
          aria-label={formatMessage({ id: LanguageNameMapper[currentLanguage] })}
          aria-expanded={open}
          style={{ width: 42, height: 32 }}
        >
          <img
            className="rounded-circle country-flag"
            src={currentLanguageIcon.flag}
            alt=""
          />
          {open ? <ArrowDropUp fontSize="small" /> : <ArrowDropDown fontSize="small" />}
        </button>
      </Tooltip>
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
