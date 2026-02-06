import { describe, it, expect, beforeEach } from "vitest";
import { useJournalStore } from "../../stores/journalStore";

describe("journalStore", () => {
  beforeEach(() => {
    useJournalStore.setState({ entries: [] });
  });

  it("initial state: empty entries", () => {
    expect(useJournalStore.getState().entries).toEqual([]);
  });

  it("addSystemMessage creates system entry with text", () => {
    useJournalStore.getState().addSystemMessage("Hello world");
    const entries = useJournalStore.getState().entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("system");
    if (entries[0].type === "system") {
      expect(entries[0].text).toBe("Hello world");
      expect(entries[0].id).toBeTruthy();
    }
  });

  it("addSystemMessage creates system entry with options", () => {
    const opts = [{ label: "Go", command: "go", description: "Do it" }];
    useJournalStore.getState().addSystemMessage("Choose", opts);
    const entries = useJournalStore.getState().entries;
    if (entries[0].type === "system") {
      expect(entries[0].options).toEqual(opts);
    }
  });

  it("addUserChoice creates user-choice entry", () => {
    useJournalStore.getState().addUserChoice("VAR");
    const entries = useJournalStore.getState().entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("user-choice");
    if (entries[0].type === "user-choice") {
      expect(entries[0].label).toBe("VAR");
    }
  });

  it("addForm creates form with 'filling' status and returns unique id", () => {
    const id = useJournalStore.getState().addForm("var-estimate");
    const entries = useJournalStore.getState().entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("form");
    if (entries[0].type === "form") {
      expect(entries[0].command).toBe("var-estimate");
      expect(entries[0].status).toBe("filling");
      expect(entries[0].params).toEqual({});
      expect(entries[0].id).toBe(id);
    }
  });

  it("updateFormStatus changes status", () => {
    const id = useJournalStore.getState().addForm("test-adf");
    useJournalStore.getState().updateFormStatus(id, "running");
    const entries = useJournalStore.getState().entries;
    if (entries[0].type === "form") {
      expect(entries[0].status).toBe("running");
    }
  });

  it("updateFormStatus can update params", () => {
    const id = useJournalStore.getState().addForm("test-adf");
    useJournalStore.getState().updateFormStatus(id, "done", { data: "/path.csv" });
    const entries = useJournalStore.getState().entries;
    if (entries[0].type === "form") {
      expect(entries[0].status).toBe("done");
      expect(entries[0].params).toEqual({ data: "/path.csv" });
    }
  });

  it("updateFormStatus only affects matching id", () => {
    const id1 = useJournalStore.getState().addForm("test-adf");
    useJournalStore.getState().addForm("test-kpss");
    useJournalStore.getState().updateFormStatus(id1, "done");
    const entries = useJournalStore.getState().entries;
    if (entries[0].type === "form") expect(entries[0].status).toBe("done");
    if (entries[1].type === "form") expect(entries[1].status).toBe("filling");
  });

  it("addResult creates result entry", () => {
    useJournalStore.getState().addResult("var-estimate", { coefs: [1, 2] }, "r1");
    const entries = useJournalStore.getState().entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("result");
    if (entries[0].type === "result") {
      expect(entries[0].command).toBe("var-estimate");
      expect(entries[0].data).toEqual({ coefs: [1, 2] });
      expect(entries[0].resultId).toBe("r1");
    }
  });

  it("addError creates error entry", () => {
    useJournalStore.getState().addError("Something failed");
    const entries = useJournalStore.getState().entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("error");
    if (entries[0].type === "error") {
      expect(entries[0].message).toBe("Something failed");
    }
  });

  it("clearAll empties entries", () => {
    useJournalStore.getState().addSystemMessage("hi");
    useJournalStore.getState().addUserChoice("bye");
    useJournalStore.getState().clearAll();
    expect(useJournalStore.getState().entries).toEqual([]);
  });

  it("entry ids are unique across types", () => {
    useJournalStore.getState().addSystemMessage("sys");
    useJournalStore.getState().addUserChoice("usr");
    useJournalStore.getState().addForm("cmd");
    useJournalStore.getState().addResult("cmd", {}, "r");
    useJournalStore.getState().addError("err");
    const ids = useJournalStore.getState().entries.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
