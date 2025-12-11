import { Card, CardContent, Typography } from "@mui/material";

export default function Dashboard() {
  return (
    <div className="grid gap-4">
      <Typography variant="h4">Dashboard</Typography>
      <Card>
        <CardContent>
          <Typography>Base pronta. Próximo: autenticação e consumo da API.</Typography>
        </CardContent>
      </Card>
    </div>
  );
}
