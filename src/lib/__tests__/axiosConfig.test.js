import HTTP_REQUEST from "@/lib/axiosConfig";

// Run the request through the interceptors without hitting the network
const sendAndCapture = async () => {
  let captured;
  await HTTP_REQUEST.get("/anything", {
    adapter: async (config) => {
      captured = config;
      return { data: {}, status: 200, statusText: "OK", headers: {}, config };
    },
  });
  return captured;
};

describe("HTTP_REQUEST", () => {
  it("adds the bearer token of the stored user", async () => {
    localStorage.setItem("user", JSON.stringify({ token: "abc123" }));
    const config = await sendAndCapture();
    expect(config.headers.Authorization).toBe("Bearer abc123");
  });

  it("sends no Authorization header when logged out", async () => {
    const config = await sendAndCapture();
    expect(config.headers.Authorization).toBeUndefined();
  });
});
