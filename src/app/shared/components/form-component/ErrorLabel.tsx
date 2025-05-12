import { FormHelperText } from "@mui/material";
interface Props {
  children: React.ReactNode;
}
export const ErrorLabel = ({ children }: Props) => {
  return (
    <FormHelperText
      sx={{
        fontSize: "10px",
        color: 'error.main',
        marginInline: "8px",
        marginTop: "3px",
      }}
    >
      {children}
    </FormHelperText>
  );
};
