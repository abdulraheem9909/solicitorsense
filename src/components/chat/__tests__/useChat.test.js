import { act, renderHook, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import useChat from "@/components/chat/useChat";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import HTTP_REQUEST from "@/lib/axiosConfig";

jest.mock("@/lib/axiosConfig", () => ({ __esModule: true, default: { post: jest.fn(), get: jest.fn() } }));

const renderChat = () =>
  renderHook(() => ({ chat: useChat(), auth: useAuth() }), { wrapper: AuthProvider });

const serverReply = (sessionId, msg, answer = "Answer") => ({
  data: {
    sessionId,
    userMessage: { _id: "u1", type: "Human", msg },
    aiMessage: { _id: "a1", type: "AI", msg: answer },
  },
});

const sentForm = (call = 0) => HTTP_REQUEST.post.mock.calls[call][1];

beforeAll(() => {
  // jsdom has no layout engine
  Element.prototype.scrollIntoView = jest.fn();
});
afterEach(() => jest.clearAllMocks());

describe("sending messages", () => {
  it("sends the typed message, stores the new session and shows the reply", async () => {
    HTTP_REQUEST.post.mockResolvedValueOnce(serverReply("s1", "Hello"));
    const { result } = renderChat();

    act(() => result.current.chat.setMsg("Hello"));
    await act(() => result.current.chat.onMsgSend());

    expect(HTTP_REQUEST.post).toHaveBeenCalledWith("/chat", expect.any(FormData), expect.anything());
    expect(sentForm().get("msg")).toBe("Hello");
    expect(sentForm().get("sessionId")).toBeNull();

    expect(result.current.auth.sessionId).toBe("s1");
    expect(result.current.chat.chat.map((m) => m.msg)).toEqual(["Hello", "Answer"]);
    expect(result.current.chat.msg).toBe("");
  });

  it("sends the current session id on follow-up messages", async () => {
    HTTP_REQUEST.post
      .mockResolvedValueOnce(serverReply("s1", "First"))
      .mockResolvedValueOnce(serverReply("s1", "Second"));
    const { result } = renderChat();

    await act(() => result.current.chat.onMsgSend("First"));
    await act(() => result.current.chat.onMsgSend("Second"));

    expect(sentForm(1).get("sessionId")).toBe("s1");
    expect(result.current.chat.chat).toHaveLength(4);
  });

  it("does not reuse the old session after New Chat", async () => {
    HTTP_REQUEST.post
      .mockResolvedValueOnce(serverReply("s1", "First"))
      .mockResolvedValueOnce(serverReply("s2", "Fresh start"));
    const { result } = renderChat();

    await act(() => result.current.chat.onMsgSend("First"));
    act(() => result.current.chat.initiateNewChat());

    expect(result.current.chat.chat).toEqual([]);
    expect(result.current.auth.sessionId).toBeNull();

    await act(() => result.current.chat.onMsgSend("Fresh start"));

    expect(sentForm(1).get("sessionId")).toBeNull();
    expect(result.current.chat.chat.map((m) => m.msg)).toEqual(["Fresh start", "Answer"]);
  });

  it("shows the server's error message and offers a retry", async () => {
    HTTP_REQUEST.post.mockRejectedValueOnce(
      Object.assign(new Error("Request failed"), {
        isAxiosError: true,
        response: { data: { error: "Files must be under 10MB each" } },
      })
    );
    const { result } = renderChat();

    await act(() => result.current.chat.onMsgSend("Hello"));

    expect(result.current.chat.toast).toMatchObject({
      open: true,
      severity: "error",
      message: "Files must be under 10MB each",
    });
    expect(result.current.chat.reload).toBe(true);
    expect(result.current.chat.loading).toBe(false);
  });

  it("Enter sends but Shift+Enter does not", async () => {
    HTTP_REQUEST.post.mockResolvedValue(serverReply("s1", "Hi"));
    const { result } = renderChat();
    act(() => result.current.chat.setMsg("Hi"));

    const preventDefault = jest.fn();
    act(() => result.current.chat.handleKeyPress({ key: "Enter", shiftKey: true, preventDefault }));
    expect(HTTP_REQUEST.post).not.toHaveBeenCalled();

    await act(async () =>
      result.current.chat.handleKeyPress({ key: "Enter", shiftKey: false, preventDefault })
    );
    expect(preventDefault).toHaveBeenCalled();
    expect(HTTP_REQUEST.post).toHaveBeenCalledTimes(1);
  });
});

describe("documents", () => {
  const pdf = new File(["%PDF"], "contract.pdf", { type: "application/pdf" });

  it("attaches selected files to the next message and clears them afterwards", async () => {
    HTTP_REQUEST.post.mockResolvedValueOnce(serverReply("s1", "Analyze"));
    const { result } = renderChat();

    act(() => result.current.chat.handleFileSelect([pdf]));
    expect(result.current.chat.selectedFiles).toEqual([pdf]);

    await act(() => result.current.chat.onMsgSend());

    expect(sentForm().getAll("documents").map((f) => f.name)).toEqual(["contract.pdf"]);
    expect(result.current.chat.selectedFiles).toEqual([]);
  });

  it("rejects unsupported files with a warning", () => {
    const { result } = renderChat();
    act(() => result.current.chat.handleFileSelect([pdf, new File(["x"], "virus.exe")]));

    expect(result.current.chat.selectedFiles).toEqual([pdf]);
    expect(result.current.chat.toast).toMatchObject({ open: true, severity: "warning" });
  });

  it("removes a selected file", () => {
    const { result } = renderChat();
    const txt = new File(["text"], "notes.txt");
    act(() => result.current.chat.handleFileSelect([pdf, txt]));
    act(() => result.current.chat.removeFile(0));

    expect(result.current.chat.selectedFiles).toEqual([txt]);
  });
});

describe("history", () => {
  it("loads a session's messages from the sidebar", async () => {
    HTTP_REQUEST.get.mockResolvedValueOnce({
      data: [{ _id: "1", type: "Human", msg: "Old question" }],
    });
    const { result } = renderChat();

    await act(() => result.current.chat.fetchDataForSession("s9"));

    expect(HTTP_REQUEST.get).toHaveBeenCalledWith("/chat?&sessionId=s9");
    expect(result.current.auth.sessionId).toBe("s9");
    expect(result.current.chat.chat).toEqual([{ _id: "1", type: "Human", msg: "Old question" }]);
  });

  it("restores the open session after a page reload", async () => {
    localStorage.setItem("user", JSON.stringify({ name: "Jane", token: "t" }));
    localStorage.setItem("sessionId", JSON.stringify("s7"));
    HTTP_REQUEST.get.mockResolvedValue({ data: [{ _id: "1", type: "Human", msg: "Restored" }] });

    // Mirror the real tree: /chat mounts the chat only once ProtectedRoute has
    // seen the restored user, which is also when the saved sessionId is available.
    const { result } = renderHook(() => ({ chat: useChat() }), {
      wrapper: ({ children }) => (
        <AuthProvider>
          <ProtectedRoute>{children}</ProtectedRoute>
        </AuthProvider>
      ),
    });

    await waitFor(() => expect(result.current.chat.chat).toHaveLength(1));
    expect(HTTP_REQUEST.get).toHaveBeenCalledWith("/chat?&sessionId=s7");
  });
});
