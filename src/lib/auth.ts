import { cookies } from "next/headers";
import { ADMIN_COOKIE, ADMIN_CREDENTIALS, JURY_COOKIE, TEAM_COOKIE } from "./config";
import { connectDB } from "./db";
import { AdminSettingsModel } from "./models";
import { getJuries as loadJuries } from "./data";
import { getPortalTeams } from "./team-data";
import type { Jury, PortalTeam } from "./types";

export async function getAdminCredentials() {
  await connectDB();
  let settings = await AdminSettingsModel.findOne();
  if (!settings) {
    // Seed default credentials if not found
    settings = await AdminSettingsModel.create({
      username: ADMIN_CREDENTIALS.username,
      password: ADMIN_CREDENTIALS.password,
    });
  }
  return { username: settings.username, password: settings.password };
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  const credentials = await getAdminCredentials();
  return token === credentials.username;
}

export async function findJury(
  identifier: string,
): Promise<Jury | undefined> {
  const juries = await loadJuries();
  const lower = identifier.trim().toLowerCase();
  return juries.find(
    (jury) =>
      jury.id.toLowerCase() === lower || jury.name.toLowerCase() === lower,
  );
}

export async function getCurrentJury() {
  const store = await cookies();
  const token = store.get(JURY_COOKIE)?.value;
  if (!token) return undefined;
  const [, juryId] = token.split(":");
  if (!juryId) return undefined;
  const jury = await findJury(juryId);
  return jury;
}

export async function findPortalTeam(teamName: string): Promise<PortalTeam | undefined> {
  const teams = await getPortalTeams();
  const lower = teamName.trim().toLowerCase();
  return teams.find((team) => team.teamName.toLowerCase() === lower);
}

export async function authenticateTeam(teamName: string, password: string) {
  const team = await findPortalTeam(teamName);
  if (!team) return undefined;
  if (team.password !== password) return undefined;
  const store = await cookies();
  store.set(TEAM_COOKIE, `team:${team.id}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return team;
}

export async function logoutTeam() {
  const store = await cookies();
  store.delete(TEAM_COOKIE);
}

export async function getCurrentTeam(): Promise<PortalTeam | undefined> {
  const store = await cookies();
  const token = store.get(TEAM_COOKIE)?.value;
  if (!token) return undefined;
  const [, teamId] = token.split(":");
  if (!teamId) return undefined;
  const teams = await getPortalTeams();
  return teams.find((team) => team.id === teamId);
}

