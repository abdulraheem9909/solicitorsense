import { act, renderHook, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const renderAuth = () => renderHook(() => useAuth(), { wrapper: AuthProvider });

describe("AuthContext", () => {
  it("starts logged out with an empty localStorage", () => {
    const { result } = renderAuth();
    expect(result.current.user).toBeNull();
    expect(result.current.sessionId).toBeNull();
  });

  it("restores the user and session from localStorage", async () => {
    localStorage.setItem("user", JSON.stringify({ name: "Jane", token: "t" }));
    localStorage.setItem("sessionId", JSON.stringify("session-1"));

    const { result } = renderAuth();

    await waitFor(() => expect(result.current.user).toEqual({ name: "Jane", token: "t" }));
    expect(result.current.sessionId).toBe("session-1");
  });

  it("loginContext stores the user and redirects to /chat", () => {
    const { result } = renderAuth();
    act(() => result.current.loginContext({ name: "Jane", token: "t" }));

    expect(result.current.user).toEqual({ name: "Jane", token: "t" });
    expect(JSON.parse(localStorage.getItem("user"))).toEqual({ name: "Jane", token: "t" });
    expect(mockRouter.push).toHaveBeenCalledWith("/chat");
  });

  it("logoutContext clears everything and redirects to /login", () => {
    const { result } = renderAuth();
    act(() => {
      result.current.loginContext({ name: "Jane", token: "t" });
      result.current.setSessionId("session-1");
    });
    act(() => result.current.logoutContext());

    expect(result.current.user).toBeNull();
    expect(result.current.sessionId).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("sessionId")).toBeNull();
    expect(mockRouter.push).toHaveBeenLastCalledWith("/login");
  });

  it("persists the session id so it survives a page reload", () => {
    const { result, unmount } = renderAuth();
    act(() => result.current.setSessionId("session-2"));
    unmount();

    expect(JSON.parse(localStorage.getItem("sessionId"))).toBe("session-2");
  });

  it("removeSessionId starts a fresh chat without logging out", () => {
    const { result } = renderAuth();
    act(() => {
      result.current.loginContext({ name: "Jane", token: "t" });
      result.current.setSessionId("session-1");
    });
    act(() => result.current.removeSessionId());

    expect(result.current.sessionId).toBeNull();
    expect(localStorage.getItem("sessionId")).toBeNull();
    expect(result.current.user).not.toBeNull();
  });
});
