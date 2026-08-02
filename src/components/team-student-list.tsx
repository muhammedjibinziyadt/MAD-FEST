"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  Pencil, 
  Trash2, 
  X, 
  Check,
  User,
  Hash,
  Search,
  Lock,
  Printer
} from "lucide-react";
import type { PortalStudent } from "@/lib/types";
import { ReportPrintModal } from "@/components/ui/report-print-modal";

interface Props {
  students: PortalStudent[];
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  isRegistrationOpen: boolean;
  teamGender?: "boys" | "girls" | "mixed";
}

export function TeamStudentList({ students, updateAction, deleteAction, isRegistrationOpen, teamGender }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editChestNumber, setEditChestNumber] = useState("");
  const [editGender, setEditGender] = useState<string>("");
  const [editCategory, setEditCategory] = useState<string>("none");
  const [editAvatar, setEditAvatar] = useState<File | null>(null);
  const [editAvatarError, setEditAvatarError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) {
      return students;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return students.filter((student) => {
      const nameMatch = student.name.toLowerCase().includes(query);
      const chestMatch = student.chestNumber.toLowerCase().includes(query);
      const teamMatch = student.teamName.toLowerCase().includes(query);
      const genderMatch = (student.gender ?? "").toLowerCase().includes(query);
      const categoryMatch = (student.category ?? "").toLowerCase().includes(query);
      return nameMatch || chestMatch || teamMatch || genderMatch || categoryMatch;
    });
  }, [students, searchQuery]);

  const handleEdit = (student: PortalStudent) => {
    setEditingId(student.id);
    setEditName(student.name);
    setEditChestNumber(student.chestNumber);
    setEditGender(student.gender ?? "");
    setEditCategory(student.category ?? "none");
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName("");
    setEditChestNumber("");
    setEditGender("");
    setEditCategory("none");
    setEditAvatar(null);
    setEditAvatarError(null);
  };

  const handleSave = async (studentId: string) => {
    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("name", editName.trim());
    formData.append("chestNumber", editChestNumber.trim().toUpperCase());
    const finalGender = teamGender === "boys" ? "boy" : teamGender === "girls" ? "girl" : editGender;
    formData.append("gender", finalGender);
    formData.append("category", editCategory);
    await updateAction(formData);
    setEditingId(null);
    setEditName("");
    setEditChestNumber("");
    setEditGender("");
    setEditCategory("none");
    setEditAvatar(null);
    setEditAvatarError(null);
  };

  const handleDelete = async (studentId: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      const formData = new FormData();
      formData.append("studentId", studentId);
      await deleteAction(formData);
    }
  };

  if (students.length === 0) {
    return (
      <Card className="rounded-2xl border-white/10 bg-white/5 p-8 text-center text-white">
        <User className="mx-auto h-12 w-12 text-white/30 mb-4" />
        <p className="text-sm text-white/60">No students added yet.</p>
      </Card>
    );
  }

  const [showReportModal, setShowReportModal] = useState(false);

  const teamName = students[0]?.teamName || "TEAM REPORT";
  const subtitle = teamGender === "boys" ? "Boys" : teamGender === "girls" ? "Girls" : "Boys & Girls";

  const reportConfig = useMemo(() => ({
    title: teamName.toUpperCase(),
    subtitle: subtitle,
    columns: [
      { header: "no", render: (_: any, idx: number) => idx + 1, align: "center" as const, width: "60px" },
      { header: "Students name", render: (student: PortalStudent) => student.name, align: "left" as const },
      { header: "Chest number", render: (student: PortalStudent) => student.chestNumber, align: "center" as const, width: "140px" },
      { header: "Category", render: (student: PortalStudent) => student.category || "GENERAL", align: "center" as const, width: "160px" },
    ],
    data: filteredStudents,
    filename: `${teamName}_students_report`,
  }), [teamName, subtitle, filteredStudents]);

  return (
    <div className="space-y-4">
      {/* Search Bar & Download Report Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            type="text"
            placeholder="Search by name, chest number, or team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          onClick={() => setShowReportModal(true)}
          className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shrink-0"
        >
          <Printer className="h-4 w-4" /> Download / Print Report
        </Button>
      </div>

      <ReportPrintModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        config={reportConfig}
      />

      {/* Search Results Info */}
      {searchQuery && (
        <div className="text-sm text-white/60 px-1">
          {filteredStudents.length === 0 ? (
            <span>No students found matching "{searchQuery}"</span>
          ) : (
            <span>
              Found {filteredStudents.length} of {students.length} student{students.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Students List */}
      {filteredStudents.length === 0 && searchQuery ? (
        <Card className="rounded-2xl border-white/10 bg-white/5 p-8 text-center text-white">
          <Search className="mx-auto h-12 w-12 text-white/30 mb-4" />
          <p className="text-sm text-white/60 mb-2">No results found</p>
          <p className="text-xs text-white/40">Try a different search term</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => {
        const isEditing = editingId === student.id;
        const isViewing = viewingId === student.id;

        return (
          <Card
            key={student.id}
            className="rounded-2xl group border border-white/10 bg-white/5 p-4 text-white transition-all hover:bg-white/10 hover:border-white/20"
          >
            {isEditing ? (
              // Edit Mode
              <div className="space-y-3">
                {!isRegistrationOpen && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3">
                    <Lock className="h-4 w-4 text-amber-400" />
                    <p className="text-xs text-amber-300">Registration window is closed. Changes cannot be saved.</p>
                  </div>
                )}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white/70">Editing Student</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Student Name</label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Student name"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Chest Number</label>
                    <Input
                      value={editChestNumber}
                      onChange={(e) => setEditChestNumber(e.target.value.toUpperCase())}
                      placeholder="Chest number"
                      className="bg-white/10 border-white/20 text-white"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Gender</label>
                    {teamGender && teamGender !== "mixed" ? (
                      <div className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-white/60 h-10 flex items-center capitalize">
                        {teamGender === "boys" ? "Boy" : "Girl"}
                      </div>
                    ) : (
                      <select
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value)}
                        className="w-full rounded-2xl border border-white/20 bg-slate-900 px-4 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="boy">Boy</option>
                        <option value="girl">Girl</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full rounded-2xl border border-white/20 bg-slate-900 px-4 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="none">General / None</option>
                      <option value="KIDDIES">KIDDIES</option>
                      <option value="SUB-JUNIOR">SUB-JUNIOR</option>
                      <option value="JUNIOR">JUNIOR</option>
                      <option value="SENIOR">SENIOR</option>
                      <option value="SUPER-SENIOR">SUPER-SENIOR</option>
                      <option value="GENERAL">GENERAL</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-white/60 mb-1.5 block">Update Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                          if (!validTypes.includes(file.type)) {
                            setEditAvatarError("Only JPG, JPEG, PNG, or WEBP images are allowed.");
                            setEditAvatar(null);
                            e.target.value = "";
                            return;
                          }
                          if (file.size > 2 * 1024 * 1024) {
                            setEditAvatarError("Image size must be less than 2 MB.");
                            setEditAvatar(null);
                            e.target.value = "";
                            return;
                          }
                        }
                        setEditAvatarError(null);
                        setEditAvatar(file);
                      }}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30 file:cursor-pointer"
                    />
                    {editAvatarError && <p className="text-xs text-red-400 mt-1">{editAvatarError}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSave(student.id)}
                    disabled={!isRegistrationOpen}
                    className="flex-1"
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-1.5" />
                    Save Changes
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {student.avatar ? (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-cyan-500/30">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-2.5 shrink-0">
                      <User className="h-5 w-5 text-cyan-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white truncate">{student.name}</p>
                      {student.gender && (
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            student.gender === "boy"
                              ? "border-sky-500/40 bg-sky-500/10 text-sky-400"
                              : "border-pink-500/40 bg-pink-500/10 text-pink-400"
                          }`}
                        >
                          {student.gender === "boy" ? "Boy" : "Girl"}
                        </span>
                      )}
                      {student.category && student.category !== "none" && (
                        <span className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          {student.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-white/60">
                      <Hash className="h-3 w-3" />
                      <span className="font-mono">{student.chestNumber}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingId(isViewing ? null : student.id)}
                    className="h-9 w-9 p-0 hover:bg-cyan-500/20 hover:text-cyan-300"
                    title="View details"
                  >
                    <Eye className={`h-4 w-4 ${isViewing ? 'text-cyan-400' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(student)}
                    disabled={!isRegistrationOpen}
                    className="h-9 w-9 p-0 hover:bg-emerald-500/20 hover:text-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    title={isRegistrationOpen ? "Edit student" : "Registration window is closed"}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(student.id)}
                    disabled={!isRegistrationOpen}
                    className="h-9 w-9 p-0 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    title={isRegistrationOpen ? "Delete student" : "Registration window is closed"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* View Details Panel */}
            {isViewing && !isEditing && (
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-4">
                {student.avatar && (
                  <div className="shrink-0 flex justify-center sm:justify-start">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-cyan-500/30">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Student Name</p>
                      <p className="font-medium text-white">{student.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Chest Number</p>
                      <p className="font-mono font-medium text-white">{student.chestNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Gender</p>
                      <p className="font-medium text-white capitalize">{student.gender || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Category</p>
                      <p className="font-medium text-white">{student.category || "General / None"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Team</p>
                      <p className="font-medium text-white">{student.teamName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Total Points</p>
                      <p className="font-medium text-white">{student.score || 0}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingId(null)}
                    className="mt-4 w-full"
                  >
                    Close Details
                  </Button>
                </div>
              </div>
            )}
          </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}
