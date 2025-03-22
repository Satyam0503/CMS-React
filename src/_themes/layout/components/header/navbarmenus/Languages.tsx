import { FC, useState } from "react";

import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Stack,
} from "@mui/material";
import { setLanguage, useLang } from "../../../../i18n/Metronici18n";
import { toAbsoluteUrl } from "../../../../helpers";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";

const languages = [
  {
    id:1,
    lang: "en",
    name: "English",
    flag: toAbsoluteUrl("media/flags/united-states.svg"),
  },
  {
    id:2,
    lang: "zh",
    name: "Mandarin",
    flag: toAbsoluteUrl("media/flags/china.svg"),
  },
  {
    id:3,
    lang: "es",
    name: "Spanish",
    flag: toAbsoluteUrl("media/flags/spain.svg"),
  },
  {
    id:4,
    lang: "ja",
    name: "Japanese",
    flag: toAbsoluteUrl("media/flags/japan.svg"),
  },
  {
    id:5,
    lang: "de",
    name: "German",
    flag: toAbsoluteUrl("media/flags/germany.svg"),
  },
  {
    id:6,
    lang: "fr",
    name: "French",
    flag: toAbsoluteUrl("media/flags/france.svg"),
  },
];

const Languages: FC = () => {
  const lang = useLang();
  const currentLanguage = languages.find((x) => x.lang === lang);
  const [languageAnchorEl, setLanguangeAnchorEl] =
    useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setLanguangeAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setLanguangeAnchorEl(null);
  };

  const handleChangeLanguage = (lang: (typeof languages)[0]) => {
    setLanguage(lang.lang);
  };
  const open = Boolean(languageAnchorEl);
  const id = open ? "language-popover" : undefined;
  return (
    <div
      className="menu-item px-5"
      data-kt-menu-trigger="hover"
      data-kt-menu-placement="left-start"
      data-kt-menu-flip="bottom"
    >
      <Stack className="d-flex flex-row align-items-center gap-2">
        <span className="text-muted">{currentLanguage?.name}</span>
        <img
          className="w-15px h-15px rounded-circle"
          src={currentLanguage?.flag}
          alt="countryflag"
        />
        <IconButton
          onClick={handleClick}
          className="p-0 border-0 bg-transparent"
        >
          {open ? <ArrowDropUp /> : <ArrowDropDown />}
        </IconButton>
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
                  handleClose();
                }}
                selected={currentLanguage?.lang === lang.lang}
              >
                <ListItemIcon>
                  <img
                    className="w-15px h-15px rounded-circle"
                    src={lang.flag}
                    alt="countryflag"
                  />
                </ListItemIcon>
                <ListItemText primary={lang.name}/>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Popover>
    </div>
  );
};

export { Languages };
