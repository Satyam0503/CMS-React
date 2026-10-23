import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Stack, Typography } from "@mui/material";
import { useState } from "react";
import { sortAscendingOrder, sortingDescendingOrder } from "../../../utils/common";
import { useIntl } from "react-intl";

interface Props<Row> {
  rows: Row[];
  columnKey: string;
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  label: string;
}

export const TableSorting = <Row,>({ rows, setRows, label, columnKey }: Props<Row>) => {
  const [isAscending, setIsAscending] = useState(false);
  const { formatMessage } = useIntl();
  const handleSorting = (sortingType: string, columnKey: string) => {
    setIsAscending(sortingType === "ascending");
    if (sortingType === "ascending") {
      setRows(sortAscendingOrder([...rows], columnKey as keyof Row));
    }
    if (sortingType === "decending") {
      setRows(sortingDescendingOrder([...rows], columnKey as keyof Row));
    }
  }

  return (
    <Stack className="flex-row align-items-center gap-1" >
      <>
        {formatMessage({ id: label })}
      </>
      {isAscending ? <ExpandLess onClick={() => handleSorting("decending", columnKey)} /> : <ExpandMore onClick={() => handleSorting("ascending", columnKey)} />}
    </Stack>
  );
};
