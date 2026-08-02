"use client";

import { useMemo, useState, useEffect } from "react";
import type { PortalStudent } from "@/lib/types";
import { generateNextChestNumberSync } from "@/lib/chest-utils";

interface ChestNumberPreviewProps {
  teamName: string;
  teamStudents: PortalStudent[];
  defaultGender?: "boy" | "girl";
}

export function ChestNumberPreview({
  teamName,
  teamStudents,
  defaultGender,
}: ChestNumberPreviewProps) {
  const [selectedGender, setSelectedGender] = useState<"boy" | "girl" | undefined>(defaultGender);

  useEffect(() => {
    if (defaultGender) {
      setSelectedGender(defaultGender);
      return;
    }

    const checkFormGender = () => {
      const selectElem = document.querySelector('select[name="gender"]') as HTMLSelectElement | null;
      const inputElem = document.querySelector('input[name="gender"]') as HTMLInputElement | null;

      if (inputElem && (inputElem.value === "boy" || inputElem.value === "girl")) {
        setSelectedGender(inputElem.value as "boy" | "girl");
      } else if (selectElem) {
        if (selectElem.value === "boy" || selectElem.value === "girl") {
          setSelectedGender(selectElem.value as "boy" | "girl");
        }
      }
    };

    checkFormGender();

    const selectElem = document.querySelector('select[name="gender"]') as HTMLSelectElement | null;
    if (selectElem) {
      const handleChange = (e: Event) => {
        const val = (e.target as HTMLSelectElement).value;
        if (val === "boy" || val === "girl") {
          setSelectedGender(val as "boy" | "girl");
        } else {
          setSelectedGender(undefined);
        }
      };
      selectElem.addEventListener("change", handleChange);
      return () => {
        selectElem.removeEventListener("change", handleChange);
      };
    }
  }, [defaultGender]);

  const nextChestNumber = useMemo(() => {
    const genderToUse = selectedGender || "boy";
    return generateNextChestNumberSync(teamName, genderToUse, teamStudents);
  }, [teamName, selectedGender, teamStudents]);

  return (
    <p className="mt-2 text-xs text-white/60">
      Next chest number: <span className="font-semibold text-emerald-300">{nextChestNumber}</span>
      {!selectedGender && !defaultGender && (
        <span className="text-white/40 text-[10px] ml-1.5">(Select gender to update)</span>
      )}
    </p>
  );
}
