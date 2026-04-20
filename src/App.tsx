import { useEffect, useState } from "react";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const authStatus = searchParams.get("auth");

    if (authStatus === "google-success") {
      setIsAuthenticated(true);
      searchParams.delete("auth");
      const nextQuery = searchParams.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }
  }, []);

  if (isAuthenticated) {
    return <DashboardPage />;
  }

  return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
}

export default App;
