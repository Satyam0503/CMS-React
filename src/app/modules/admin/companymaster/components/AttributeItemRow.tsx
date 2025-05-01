import { IconButton, Switch, TextField, Typography } from "@mui/material";
import React, { ChangeEvent, FC, useEffect, useState } from "react";
import { DepartmentModel } from "../../models";
import { Delete, Edit } from "@mui/icons-material";
import { ConfirmationModal } from "../../../../shared/components/ConfirmationModal";
import { useIntl } from "react-intl";
import { deleteDepartment } from "../../adminservices";
import { toast } from "react-toastify";
import { useLang } from "../../../../../_themes/i18n/Metronici18n";

type Props = {
  itemData: DepartmentModel;
  setUpdatedItemData: (item: DepartmentModel) => void;
  translationLanguage: string;
  refresh: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AttributeItemRow: FC<Props> = React.memo(
  ({
    itemData,
    setUpdatedItemData,
    translationLanguage,
    refresh, setRefresh
  }) => {
    const { formatMessage } = useIntl();
    const [item, setItem] = useState<DepartmentModel>(itemData);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const currentLanguage = useLang();

    const translatedTitle = item.titles.find((title) => title.language === translationLanguage)?.label;
    const currentTitle = item.titles.find(title => title.language === currentLanguage)?.label;


    const handleChange = (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const updatedLanguage = e.target.name;
      const updatedTitles = item.titles.findIndex(title => title.language === updatedLanguage) > -1 ? item.titles.map(title => {
        if (title.language === updatedLanguage) {
          return {
            ...title,
            label: e.target.value
          }
        }
        return title;
      }) : [...item.titles, { language: updatedLanguage, label: e.target.value }];
      setItem({
        ...item,
        titles: updatedTitles
      });
    };

    const handleDepartmentDelete = async () => {
      try {
        const response = await deleteDepartment(item.departmentId!)
        const { success, message } = response.data;
        if (!success) {
          throw new Error(message);
        }
        toast.success(message);
        setConfirmModalOpen(false);
        setRefresh(!refresh);
      } catch (error) {
        toast.error((error as Error).message);
      }
    };
    const handleSwitchChange = (
      event: React.ChangeEvent<HTMLInputElement>,
      checked: boolean
    ) => {
      const updatedDepartment = {
        ...item,
        isActive: checked,
      }
      setItem(updatedDepartment);
      setUpdatedItemData(updatedDepartment);
    };

    useEffect(() => {
      setItem(itemData);
    }, [itemData])

    return (
      <>
        <form className="attribute-row">
          <>
            <TextField
              name={currentLanguage}
              value={currentTitle ?? ""}
              onChange={handleChange}
              onBlur={() => setUpdatedItemData(item)}
              required
            />
            <TextField
              name={translationLanguage}
              value={translatedTitle ?? ""}
              onChange={handleChange}
              onBlur={() => setUpdatedItemData(item)}
            />
            <Switch
              checked={item.isActive}
              onChange={handleSwitchChange}
            />
          </>
          <div className="d-flex align-items-center gap-2">
            <IconButton
              onClick={() => setConfirmModalOpen(true)}
              className="border-0"
            >
              <Delete color="error" />
            </IconButton>
          </div>
        </form>
        {isConfirmModalOpen && (
          <ConfirmationModal
            open={isConfirmModalOpen}
            title={formatMessage({ id: "Department.Delete" })}
            content={formatMessage({ id: "Department.Delete.Alert" })}
            handleClose={() => setConfirmModalOpen(false)}
            handleConfirmation={handleDepartmentDelete}
          />
        )}
      </>
    );
  }
);
