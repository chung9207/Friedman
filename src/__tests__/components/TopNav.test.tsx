import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TopNav } from "../../components/layout/TopNav";
import { useNavigationStore } from "../../stores/navigationStore";

describe("TopNav", () => {
  beforeEach(() => {
    useNavigationStore.setState({ activePage: "data" });
  });

  it("renders all 4 nav buttons", () => {
    render(<TopNav />);
    expect(screen.getByText("Data")).toBeInTheDocument();
    expect(screen.getByText("Journal")).toBeInTheDocument();
    expect(screen.getByText("Result")).toBeInTheDocument();
    expect(screen.getByText("Backlog")).toBeInTheDocument();
  });

  it("active page button has accent styling", () => {
    render(<TopNav />);
    const dataButton = screen.getByText("Data").closest("button")!;
    expect(dataButton.className).toContain("text-[var(--accent)]");
  });

  it("inactive page button has muted styling", () => {
    render(<TopNav />);
    const journalButton = screen.getByText("Journal").closest("button")!;
    expect(journalButton.className).toContain("text-[var(--text-muted)]");
  });

  it("clicking a button updates the store", () => {
    render(<TopNav />);
    fireEvent.click(screen.getByText("Journal"));
    expect(useNavigationStore.getState().activePage).toBe("journal");
  });
});
