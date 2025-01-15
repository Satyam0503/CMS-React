import React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { CardHeader } from "@mui/material";

type PropsTypes = {
  title?: string;
  icon: React.ReactElement;
};

export const StyledCard = (props: PropsTypes) => {
  const { title, icon } = props;

  return (
    <Card sx={{ minWidth: 275 }} elevation={5}>
      <CardHeader title={title} />
      <CardContent>{icon}</CardContent>
    </Card>
  );
};
