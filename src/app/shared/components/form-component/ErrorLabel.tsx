import { FormHelperText } from "@mui/material";
interface Props {
  children: React.ReactNode;
}
export const ErrorLabel = ({ children }: Props) => {
  return (
    <FormHelperText
      sx={{
        fontSize: "12px",
        color: "#d32f2f",
        marginInline: "8px",
        marginTop: "3px",
      }}
    >
      {children}
    </FormHelperText>
  );
};
