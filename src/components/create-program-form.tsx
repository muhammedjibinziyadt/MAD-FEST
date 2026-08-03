"use client";

import React, { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchSelect } from "@/components/ui/search-select";

interface CreateProgramFormProps {
  action: (formData: FormData) => Promise<void>;
}

function SaveSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="md:col-span-2" loading={pending}>
      Save Program
    </Button>
  );
}

export function CreateProgramForm({ action }: CreateProgramFormProps) {
  const [section, setSection] = useState("single");
  const [category, setCategory] = useState("KIDDIES");

  const handleSectionChange = (val: string) => {
    setSection(val);
    if (val === "general") {
      setCategory("GENERAL");
    } else if (category === "GENERAL") {
      setCategory("KIDDIES");
    }
  };

  const isGeneral = section === "general";

  return (
    <form
      action={action}
      className="mt-6 grid gap-4 md:grid-cols-2"
    >
      <Input name="name" placeholder="Program name" required />
      <SearchSelect
        name="section"
        value={section}
        onValueChange={handleSectionChange}
        required
        options={[
          { value: "single", label: "Single" },
          { value: "group", label: "Group" },
          { value: "general", label: "General" },
        ]}
        placeholder="Select section"
      />
      <SearchSelect
        name="category"
        value={isGeneral ? "GENERAL" : category}
        onValueChange={(val) => {
          if (!isGeneral) {
            setCategory(val);
          }
        }}
        disabled={isGeneral}
        options={[
          { value: "KIDDIES", label: "KIDDIES" },
          { value: "SUB-JUNIOR", label: "SUB-JUNIOR" },
          { value: "JUNIOR", label: "JUNIOR" },
          { value: "SENIOR", label: "SENIOR" },
          { value: "SUPER-SENIOR", label: "SUPER-SENIOR" },
          { value: "GENERAL", label: "GENERAL" },
          { value: "none", label: "None" },
        ]}
        placeholder="Select category"
      />
      <SearchSelect
        name="stage"
        defaultValue="true"
        options={[
          { value: "true", label: "On Stage" },
          { value: "false", label: "Off Stage" },
        ]}
        placeholder="Select stage"
      />
      <Input
        name="candidateLimit"
        type="number"
        min={1}
        defaultValue={1}
        placeholder="Candidate limit"
        required
      />
      <SaveSubmitButton />
    </form>
  );
}
