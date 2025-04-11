import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import {  useState } from "react";
import { sortAscendingOrder, sortingDescendingOrder } from "../../../utils/common";
import { useIntl } from "react-intl";

interface Props<Row> {
  rows: Row[];
  columnKey:string;
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  label: string;
}

export const TableSorting = <Row,>({ rows, setRows, label,columnKey }: Props<Row>) => {
  const [isAscending, setIsAscending] = useState(false);  
  const {formatMessage}= useIntl();
  const handleSorting = (sortingType:string,columnKey:string)=>{
    setIsAscending(sortingType === "ascending");
    if(sortingType === "ascending") {
       setRows(sortAscendingOrder([...rows],columnKey as keyof Row));
    }
    if(sortingType === "decending") {
       setRows(sortingDescendingOrder([...rows],columnKey as keyof Row));
    }
  }

  return (
    <Stack direction={"row"} spacing={0.5} >
      <Typography sx={{ fontSize: "12px", fontWeight: "bolder" }}>
        {formatMessage({id:label})}
      </Typography>
      {isAscending ? <ExpandLess onClick={()=>handleSorting("decending",columnKey ) }/> : <ExpandMore onClick={()=>handleSorting("ascending",columnKey)} />}
    </Stack>
  );
};
