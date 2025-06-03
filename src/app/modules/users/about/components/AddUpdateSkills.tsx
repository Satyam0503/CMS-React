import Typography from "@mui/material/Typography";
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { FC, useEffect, useState } from "react";
import { SkillModel } from "../../models";
import React from "react";
import { getSkillsList, udpateEmployeeSkills } from "../../userservices";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { useParams } from "react-router-dom";
import { useDebounce } from "../../../../hooks/useDebounce";

type PropsType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userSkills: SkillModel[];
  refresh: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AddUpdateSkills: FC<PropsType> = ({
  userSkills,
  open,
  setOpen,
  refresh,
  setRefresh,
}) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [isListOpen, setListOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [skillsOption, setSkillsOptions] = useState<SkillModel[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SkillModel[]>(userSkills);
  const employeeId = useParams().employeeid;
  const debouncedSearch = useDebounce(searchValue, 500);

  function handleClose() {
    setOpen(false);
  }

  const handleListClose = () => {
    setSearchValue("");
    setListOpen(false);
    setSkillsOptions([]);
  };

  const handleSelectedSkillsChange = (
    values: SkillModel[],
    reason: AutocompleteChangeReason,
    details: AutocompleteChangeDetails<SkillModel> | undefined
  ) => {
    if (reason === "selectOption") {
      const exist = selectedSkills.findIndex(
        (skill) => skill.id === details?.option.id
      );
      if (exist > -1) {
        return;
      }
    }
    setSelectedSkills(values);
  };

  async function handleSkillUpdate() {
    const selectedSkillsId = selectedSkills.map((skill) => skill.id);
    try {
      const response = await udpateEmployeeSkills({
        skills: selectedSkillsId,
        userId: employeeId ?? "",
      });
      const { message, success } = response.data;
      if (success) {
        toast.success(message);
        setRefresh(!refresh);
      }
    } catch (error) {
      toast.error((error as AxiosError).message);
    } finally {
      setOpen(false);
    }
  }

  useEffect(() => {
    const sanitizedValue = debouncedSearch.trim().toLowerCase();
    if (sanitizedValue.length === 0) {
      setSkillsOptions([]);
      setListOpen(false);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const response = await getSkillsList(sanitizedValue);
        const { success, methodResults } = response.data;
        if (success && active) {
          setSkillsOptions(methodResults);
          setListOpen(true);
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [debouncedSearch]);

  return (
    <>
      <CustomisedModal open={open} handleClose={handleClose}>
        <Stack direction={"column"} spacing={2}>
          <Typography variant="h5">
            {intl.formatMessage({ id: "PROFILE.SKILLS" })}
          </Typography>
          <Stack>
            <Autocomplete
              multiple
              size="small"
              open={isListOpen}
              disableCloseOnSelect
              options={skillsOption}
              getOptionLabel={(option) => option.name}
              filterOptions={(x) => x}
              onClose={handleListClose}
              inputValue={searchValue}
              value={selectedSkills}
              onChange={(e, values, reason, details) => {
                handleSelectedSkillsChange(values, reason, details);
              }}
              onInputChange={(e, newValue, reason) => {
                if (reason === "reset") {
                  return;
                }
                setSearchValue(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={intl.formatMessage({
                    id: "PROFILE.SEARCH_SKILLS",
                  })}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
              sx={{
                "& .MuiOutlinedInput-root": {
                  padding: "4px",
                },
              }}
            />
            <Typography variant="body2" className="mt-2 px-2">{intl.formatMessage({ id: "PROFILE.SEARCH_NOTE" })}</Typography>
          </Stack>

          <Stack direction={"row"} spacing={1} justifyContent={"flex-end"}>
            <CustomisedButton
              variant="outlined"
              label={intl.formatMessage({ id: "BUTTON.CLOSE" })}
              handleClick={handleClose}
            />
            <CustomisedButton
              variant="contained"
              label={intl.formatMessage({ id: "BUTTON.ADD" })}
              handleClick={handleSkillUpdate}
            />
          </Stack>
        </Stack>
      </CustomisedModal>
    </>
  );
};
