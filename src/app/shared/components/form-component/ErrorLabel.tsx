import { FormHelperText } from "@mui/material";
import { useIntl } from "react-intl";
interface Props {
  errorLabel?: string;
}
export const ErrorLabel = ({ errorLabel }: Props) => {
  const { formatMessage: i } = useIntl();
  return (
    <FormHelperText
      sx={{
        fontSize: "10px",
        color: 'error.main',
        marginInline: "8px",
        marginTop: "3px",
      }}
    >
      {i({ id: errorLabel })}
    </FormHelperText>
  );
};
