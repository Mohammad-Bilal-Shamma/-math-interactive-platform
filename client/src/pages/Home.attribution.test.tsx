import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, isAuthenticated: false, loading: false }),
}));

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/LearningShell", () => ({
  LearningShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock("@/components/MathFormula", () => ({
  MathFormula: () => <span>معادلة</span>,
}));

vi.mock("@/components/StreakCard", () => ({
  StreakCard: () => <aside>سلسلة الإنجاز</aside>,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    learning: {
      progress: {
        useQuery: () => ({ data: undefined }),
      },
    },
  },
}));

import Home from "./Home";

describe("Home attribution", () => {
  it("renders the requested academic-supervision and programming credits in Arabic", () => {
    const markup = renderToStaticMarkup(<Home />);

    expect(markup).toContain("تحت إشراف الدكتورة نسرين الحميش");
    expect(markup).toContain("برمجة بلال شما");
    expect(markup).toContain("الاعتماد الأكاديمي والتقني للمنصة");
  });
});
