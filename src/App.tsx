import { useState } from "react";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (isAuthenticated) {
    return <DashboardPage />;
  }

  return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
}

export default App;
