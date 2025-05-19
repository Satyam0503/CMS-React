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
  Typography,
} from "@mui/material";
import { setLanguage, useLang } from "../../../../i18n/Metronici18n";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { languages } from "../../../../../utils/constant/Constant";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { useIntl } from "react-intl";

const Languages: FC = () => {
  const { formatMessage } = useIntl();
  const lang = useLang();
  const appLanguages = useAppSelector(state => state.user.userData?.applicationLanguage);
  const defaultLanguage = useAppSelector(state => state.user.userData?.defaultLanguage);
  const supportedLanguages = appLanguages ? (appLanguages.length > 0 ? appLanguages : [defaultLanguage]) : ["en"]
  const currentLanguage = languages.find((x) => x.lang === lang);
  const [languageAnchorEl, setLanguangeAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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
      <Stack className="d-flex flex-row align-items-center gap-2">
        <Typography variant="body1">{formatMessage({ id: currentLanguage?.name })}</Typography>
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
          {languages.filter(lang => supportedLanguages.includes(lang.lang)).map((lang) => (
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
                <ListItemText primary={formatMessage({ id: lang.name })} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Popover>
    </div>
  );
};

export { Languages };
