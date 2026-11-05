import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "@/components/sidebar/sidebar";
import HTTP_REQUEST from "@/lib/axiosConfig";

jest.mock("@/lib/axiosConfig", () => ({ __esModule: true, default: { post: jest.fn(), get: jest.fn() } }));

const renderSidebar = async () => {
  localStorage.setItem("user", JSON.stringify({ name: "Jane Smith", token: "t" }));
  HTTP_REQUEST.get.mockResolvedValue({ data: [] });
  render(
    <AuthProvider>
      <Sidebar
        sessionId={null}
        fetchDataForSession={jest.fn()}
        initiateNewChat={jest.fn()}
        mobileOpen={false}
        setMobileOpen={jest.fn()}
      >
        <p>chat</p>
      </Sidebar>
    </AuthProvider>
  );
  await screen.findByText("chat");
};

// Both drawers (mobile + desktop) render the profile button; jsdom applies no CSS
const openProfileMenu = async () => {
  const [profileButton] = await screen.findAllByText("JS");
  await userEvent.click(profileButton);
  return screen.findByRole("menu");
};

describe("Sidebar profile menu", () => {
  it("opens a single menu with one Logout item", async () => {
    await renderSidebar();
    await openProfileMenu();

    // hidden: true also counts menus MUI has aria-hidden behind another open modal
    expect(screen.getAllByRole("menu", { hidden: true })).toHaveLength(1);
    expect(screen.getAllByRole("menuitem", { name: /logout/i, hidden: true })).toHaveLength(1);
  });

  it("links the profile button to the menu it opens", async () => {
    await renderSidebar();
    const menu = await openProfileMenu();
    const [profileButton] = screen.getAllByText("JS");

    // MUI puts the Menu's id on its popover root, which wraps the role="menu" list
    const controlsId = profileButton.closest("[aria-controls]")?.getAttribute("aria-controls");
    expect(controlsId).toBeTruthy();
    expect(document.getElementById(controlsId)).toContainElement(menu);
  });

  it("logs out and redirects to /login", async () => {
    await renderSidebar();
    const menu = await openProfileMenu();

    await userEvent.click(within(menu).getByRole("menuitem", { name: /logout/i }));

    expect(localStorage.getItem("user")).toBeNull();
    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });
});
