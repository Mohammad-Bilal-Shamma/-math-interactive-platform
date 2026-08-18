import katex from "katex";
import "katex/dist/katex.min.css";
import React, { useMemo } from "react";

type MathFormulaProps = {
  latex: string;
  display?: boolean;
  className?: string;
};

export function MathFormula({ latex, display = true, className = "" }: MathFormulaProps) {
  const html = useMemo(
    () =>
      katex.renderToString(latex, {
        displayMode: display,
        output: "htmlAndMathml",
        throwOnError: false,
        strict: "ignore",
      }),
    [latex],
  );

  return <div className={`math-formula ${display ? "math-formula--block" : ""} ${className}`} dir="ltr" dangerouslySetInnerHTML={{ __html: html }} />;
}
