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
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { languages } from "../../../../../utils/constant/Constant";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { LANGUAGE } from "../../../../../utils/enums";

const Languages: FC = () => {
  const lang = useLang();
  const appLanguages = useAppSelector(state => state.user.userData?.applicationLanguage) ?? [LANGUAGE.ENGLISH];
  const currentLanguage = languages.find((x) => x.lang === lang);
  const [languageAnchorEl, setLanguangeAnchorEl] =
    useState<HTMLElement | null>(null);

  const handleClick = (event:React.MouseEvent<HTMLElement>) => {
    setLanguangeAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setLanguangeAnchorEl(null);
  };

  const handleChangeLanguage = (language: (typeof languages)[0]) => {
    if (language.lang !== currentLanguage?.lang) {
      setLanguage(language.lang);
    }
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
      <Stack className="d-flex flex-row align-items-center gap-2" onClick={handleClick}> {/* Setting Popper to open on whole Language instead of just the icon */}
        <span className="text-muted">{currentLanguage?.name}</span>
        <img
          className="w-15px h-15px rounded-circle"
          src={currentLanguage?.flag}
          alt="countryflag"
        />
        <IconButton
          // onClick={handleClick}
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
          {languages.filter(lang => appLanguages.includes(lang.lang)).map((lang) => (
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
                <ListItemText primary={lang.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Popover>
    </div>
  );
};

export { Languages };
