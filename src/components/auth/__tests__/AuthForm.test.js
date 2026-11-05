import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/context/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import HTTP_REQUEST from "@/lib/axiosConfig";

jest.mock("@/lib/axiosConfig", () => ({ __esModule: true, default: { post: jest.fn(), get: jest.fn() } }));

const renderForm = () =>
  render(
    <AuthProvider>
      <AuthForm />
    </AuthProvider>
  );

const field = (label) => screen.getByLabelText(new RegExp(`^${label}`), { selector: "input" });

afterEach(() => jest.clearAllMocks());

describe("login", () => {
  it("shows validation errors without calling the API", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(HTTP_REQUEST.post).not.toHaveBeenCalled();
  });

  it("logs in and redirects to /chat", async () => {
    HTTP_REQUEST.post.mockResolvedValueOnce({
      data: { token: "t", email: "jane@test.com", name: "Jane" },
    });
    renderForm();

    await userEvent.type(field("Email"), "jane@test.com");
    await userEvent.type(field("Password"), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(HTTP_REQUEST.post).toHaveBeenCalledWith("/auth/login", {
      email: "jane@test.com",
      password: "secret123",
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/chat");
    expect(JSON.parse(localStorage.getItem("user")).token).toBe("t");
  });

  it("submits when pressing Enter", async () => {
    HTTP_REQUEST.post.mockResolvedValueOnce({ data: { token: "t", name: "Jane" } });
    renderForm();

    await userEvent.type(field("Email"), "jane@test.com");
    await userEvent.type(field("Password"), "secret123{Enter}");

    expect(HTTP_REQUEST.post).toHaveBeenCalledTimes(1);
  });

  it("shows the server error on failure", async () => {
    HTTP_REQUEST.post.mockRejectedValueOnce({ response: { data: { error: "Invalid credentials" } } });
    renderForm();

    await userEvent.type(field("Email"), "jane@test.com");
    await userEvent.type(field("Password"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});

describe("signup", () => {
  const openSignup = () => userEvent.click(screen.getByRole("tab", { name: "Sign Up" }));

  it("rejects mismatched passwords", async () => {
    renderForm();
    await openSignup();

    await userEvent.type(field("Full Name"), "Jane Smith");
    await userEvent.type(field("Email"), "jane@test.com");
    await userEvent.type(field("Password"), "secret123");
    await userEvent.type(field("Confirm Password"), "different");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(HTTP_REQUEST.post).not.toHaveBeenCalled();
  });

  it("signs up, logs the user in and redirects to /chat", async () => {
    HTTP_REQUEST.post.mockResolvedValueOnce({
      data: { message: "Signup successful", user: { token: "t", email: "jane@test.com", name: "Jane Smith" } },
    });
    renderForm();
    await openSignup();

    await userEvent.type(field("Full Name"), "Jane Smith");
    await userEvent.type(field("Email"), "jane@test.com");
    await userEvent.type(field("Password"), "secret123");
    await userEvent.type(field("Confirm Password"), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(HTTP_REQUEST.post).toHaveBeenCalledWith("/auth/signup", {
      name: "Jane Smith",
      email: "jane@test.com",
      password: "secret123",
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/chat");
    expect(JSON.parse(localStorage.getItem("user"))).toMatchObject({ token: "t", name: "Jane Smith" });
  });
});
