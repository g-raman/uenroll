import { Section } from "@/types/Types";
import React, { useState } from "react";
import Image from "next/image";
import { ComponentResult } from "../ComponentResult/ComponentResult";

interface SectionResultProps {
  section: Section;
  partialKey: string;
}
export const SectionResult: React.FC<SectionResultProps> = ({
  section,
  partialKey,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center w-full p-2 bg-slate-200">
        <span>Section {section.section}</span>
        <button onClick={() => setIsOpen((is) => !is)}>
          <Image
            className={`transition-all ease-in delay-100 ${isOpen ? "-rotate-90" : "rotate-0"}`}
            width={24}
            height={24}
            src={"/chevron-left.svg"}
            alt="Expand"
          />
        </button>
      </div>

      {section.components.map((component) => {
        return (
          <div
            className={`transition-all ease-in delay-100 ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}
            key={`${partialKey}${section.section}${component.subSection}`}
          >
            <ComponentResult partialKey={partialKey} component={component} />
          </div>
        );
      })}
    </div>
  );
};
