import { Typography } from "@mui/material";
import { FC } from "react";
import { useIntl } from "react-intl";

interface PropsTypes {
  className: string;
  label: string;
}

const style = {
  paddingInline: "6px",
  paddingBlock: "4px",
  borderRadius: "4px",
  textAlign: "center",
  display: "inline-block",
  fontSize: "12px",
};

export const StyleStatus: FC<PropsTypes> = ({ className, label }) => {
  const { formatMessage } = useIntl();
  return (
    <div>
      <Typography sx={style} className={className}>
        {formatMessage({ id: label })}
      </Typography>
    </div>
  );
};
