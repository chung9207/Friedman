import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileSelector } from "../../components/common/FileSelector";

describe("FileSelector", () => {
  it("renders input with placeholder text", () => {
    render(<FileSelector value="" onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText(/select a file/i);
    expect(input).toBeInTheDocument();
  });

  it("typing into input updates draft (doesn't trigger parent onChange)", () => {
    const onChange = vi.fn();
    render(<FileSelector value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText(/select a file/i);
    fireEvent.change(input, { target: { value: "/new/path.csv" } });
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("/new/path.csv");
  });

  it("pressing Enter calls onChange with typed value", () => {
    const onChange = vi.fn();
    render(<FileSelector value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText(/select a file/i);
    fireEvent.change(input, { target: { value: "/my/data.csv" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("/my/data.csv");
  });

  it("empty input + Enter does not call onChange", () => {
    const onChange = vi.fn();
    render(<FileSelector value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText(/select a file/i);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });
});
