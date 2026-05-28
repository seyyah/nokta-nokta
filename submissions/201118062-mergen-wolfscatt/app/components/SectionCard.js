import React from "react";
import Surface from "./Surface";

export default function SectionCard({ children, style, tone, padded }) {
  return (
    <Surface style={style} tone={tone} padded={padded}>
      {children}
    </Surface>
  );
}
