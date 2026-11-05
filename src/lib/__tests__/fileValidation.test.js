import { validateFiles, MAX_FILE_SIZE } from "@/lib/fileValidation";

const file = (name, size = 100) => ({ name, size });

describe("validateFiles", () => {
  it("accepts supported document types regardless of case", () => {
    const files = [file("a.pdf"), file("b.DOCX"), file("c.doc"), file("d.txt")];
    expect(validateFiles(files)).toEqual({ accepted: files, rejectedMessage: null });
  });

  it("rejects unsupported extensions", () => {
    const { accepted, rejectedMessage } = validateFiles([file("ok.pdf"), file("virus.exe")]);
    expect(accepted.map((f) => f.name)).toEqual(["ok.pdf"]);
    expect(rejectedMessage).toMatch(/Only PDF, DOC, DOCX, and TXT/);
  });

  it("rejects files over 10MB", () => {
    const { accepted, rejectedMessage } = validateFiles([file("big.pdf", MAX_FILE_SIZE + 1)]);
    expect(accepted).toEqual([]);
    expect(rejectedMessage).toMatch(/under 10MB/);
  });

  it("accepts a file of exactly 10MB", () => {
    expect(validateFiles([file("edge.pdf", MAX_FILE_SIZE)]).accepted).toHaveLength(1);
  });

  it("caps the total at 5 files including already-selected ones", () => {
    const files = [1, 2, 3].map((i) => file(`f${i}.txt`));
    const { accepted, rejectedMessage } = validateFiles(files, 3);
    expect(accepted.map((f) => f.name)).toEqual(["f1.txt", "f2.txt"]);
    expect(rejectedMessage).toMatch(/up to 5 files/);
  });

  it("lists every distinct rejection reason once", () => {
    const { rejectedMessage } = validateFiles([
      file("a.exe"),
      file("b.exe"),
      file("c.pdf", MAX_FILE_SIZE + 1),
    ]);
    expect(rejectedMessage.match(/Only PDF/g)).toHaveLength(1);
    expect(rejectedMessage).toMatch(/under 10MB/);
  });
});
