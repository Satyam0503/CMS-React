import { Container, Grid } from "@mui/material";
import PageHeader from "../../modules/dashboard/PageHeader";
import DashboardMain from "../../modules/dashboard/DashboardMain";

export default function AdminDashboard() {
  return (
    <Container sx={{ p: "16px" }}>
      <PageHeader />
      <DashboardMain />
    </Container>
  );
}
