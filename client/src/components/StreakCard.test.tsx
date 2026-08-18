import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StreakCard } from "./StreakCard";

describe("StreakCard", () => {
  it("renders the saved streak and a continuation prompt for an authenticated learner", () => {
    const markup = renderToStaticMarkup(<StreakCard currentStreak={4} longestStreak={9} isAuthenticated />);

    expect(markup).toContain("سلسلة الإنجازات");
    expect(markup).toContain("4 يوم");
    expect(markup).toContain("أفضل سلسلة: 9");
    expect(markup).toContain("استمر");
  });
});
