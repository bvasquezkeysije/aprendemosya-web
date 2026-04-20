import { useEffect, useState } from "react";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import {
  clearAuthSession,
  readAuthSession,
  resolveApiBaseUrl,
  type AuthUserProfile,
} from "./features/auth/utils/auth-session";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

function App() {
  const [user, setUser] = useState<AuthUserProfile | null>(null);

  async function loadProfileByUserId(userId: number) {
    const response = await fetch(`${resolveApiBaseUrl()}/api/auth/profile/${userId}`);
    const payload = (await response.json()) as ApiResponse<AuthUserProfile>;

    if (!response.ok || !payload.success || !payload.data) {
      throw new Error("profile-load-failed");
    }

    return payload.data;
  }

  useEffect(() => {
    const session = readAuthSession();

    if (!session) {
      return;
    }

    const { userId } = session;

    let cancelled = false;

    async function loadProfile() {
      try {
        const profile = await loadProfileByUserId(userId);

        if (!cancelled) {
          setUser(profile);
        }
      } catch {
        clearAuthSession();

        if (!cancelled) {
          setUser(null);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const authStatus = searchParams.get("auth");

    if (authStatus === "google-success") {
      searchParams.delete("auth");
      const nextQuery = searchParams.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }
  }, []);

  if (user) {
    return (
      <DashboardPage
        user={user}
        onLogout={() => {
          clearAuthSession();
          setUser(null);
        }}
      />
    );
  }

  return (
    <LoginPage
      onLoginSuccess={async (nextUser) => {
        try {
          const profile = await loadProfileByUserId(nextUser.userId);
          setUser(profile);
        } catch {
          setUser(nextUser);
        }
      }}
    />
  );
}

export default App;
