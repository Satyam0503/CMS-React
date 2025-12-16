import {
  KeyOutlined,
} from "@mui/icons-material";
import {
  Card,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { PasswordResetModel } from "./components/PasswordResetModal";
import { NotificationSetting } from "./components/NotificationSetting";

export default function Setting() {
  const intl = useIntl();
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };
  return (
    <Stack>
      <NotificationSetting />
      <Card className="p-4 d-flex justify-content-between flex-wrap gap-2 mt-2">
        <Typography variant="h5">
          {intl.formatMessage({ id: "AUTH.RESET_PROFILE_PASSWORD" })}
        </Typography>
        <CustomisedButton
          label={intl.formatMessage({ id: "AUTH.PASSWORD_RESET" })}
          Icon={<KeyOutlined />}
          handleClick={handleOpenModal}
        />
      </Card>
      {
        isModalOpen && <PasswordResetModel open={isModalOpen} handleClose={handleCloseModal} />
      }
    </Stack>
  );
}

