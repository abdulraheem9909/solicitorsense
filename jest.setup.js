import "@testing-library/jest-dom";

// The App Router isn't mounted in tests; every test gets a fresh spy router.
const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), prefetch: jest.fn() };
jest.mock("next/navigation", () => ({ useRouter: () => mockRouter }));
global.mockRouter = mockRouter;

beforeEach(() => {
  localStorage.clear();
  Object.values(mockRouter).forEach((fn) => fn.mockClear());
});
