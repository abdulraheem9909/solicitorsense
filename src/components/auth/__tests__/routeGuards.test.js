import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoutes";

const loggedIn = () => localStorage.setItem("user", JSON.stringify({ name: "Jane", token: "t" }));
const renderWith = (Guard) =>
  render(
    <AuthProvider>
      <Guard>
        <p>secret content</p>
      </Guard>
    </AuthProvider>
  );

describe("ProtectedRoute", () => {
  it("redirects to /login when logged out", () => {
    renderWith(ProtectedRoute);
    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("secret content")).not.toBeInTheDocument();
  });

  it("renders children when logged in", async () => {
    loggedIn();
    renderWith(ProtectedRoute);
    expect(await screen.findByText("secret content")).toBeInTheDocument();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});

describe("PublicRoute", () => {
  it("renders children when logged out", async () => {
    renderWith(PublicRoute);
    expect(await screen.findByText("secret content")).toBeInTheDocument();
  });

  it("redirects logged-in users to /chat", async () => {
    loggedIn();
    renderWith(PublicRoute);
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/chat"));
    expect(screen.queryByText("secret content")).not.toBeInTheDocument();
  });
});
