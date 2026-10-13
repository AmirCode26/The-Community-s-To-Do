import { db } from "../db.ts";
import {
    loadRequester,
    canManageSubNig,
    getSubNigIdOfUser,
} from "./apartments.ts";
import type { RequesterRef } from "./apartments.ts";

export { db };

// ------------------------------------------------------
// CONSTANTS & TYPES
// ------------------------------------------------------
const DAY_MS = 24 * 60 * 60 * 1000;
export const REPORT_COOLDOWN_MS = 5 * DAY_MS;
export const BAN_THRESHOLD = 3; // distinct reporters
const MAX_REASON_LENGTH = 500;

export interface CreateReportInput {
    reportedUserId: string;
    reason: string;
}

// Reports are immutable on purpose (no update): they are evidence.

// ------------------------------------------------------
// INTERNAL HELPERS
// ------------------------------------------------------
function cleanReason(raw: string): string {
    const reason = raw.trim();
    if (reason.length === 0 || reason.length > MAX_REASON_LENGTH) {
        throw new Error(
            `Report reason must be between 1 and ${MAX_REASON_LENGTH} characters.`,
        );
    }
    return reason;
}

function requireModeratorRole(role: string) {
    if (role !== "L_NIG" && role !== "L_SNIG") {
        throw new Error("Insufficient role permissions.");
    }
}

// L_NIG: any user. L_SNIG: only users living in a sector it leads.
async function canModerateUser(
    moderator: { id: string; role: string },
    targetUserId: string,
): Promise<boolean> {
    if (moderator.role === "L_NIG") return true;
    if (moderator.role !== "L_SNIG") return false;

    const subNigId = await getSubNigIdOfUser(targetUserId);
    if (!subNigId) return false;

    return await canManageSubNig(moderator, subNigId);
}

// Re-evaluates the status of a user from the distinct reporters it has.
//   >= 3 distinct reporters -> TEMPORARY_BAN
//   1-2                     -> REPORTED (only if ACTIVE)
//   0                       -> back to ACTIVE (only if REPORTED)
// A ban is never lifted here: that is a human decision.
async function refreshReportedStatus(userId: string) {
    const user = await db.orm.public.User.select("id", "status")
    .where({ id: userId })
    .first();

    if (!user) return;

    const rows = await db.orm.public.Report.select("reporterId")
    .where({ reportedUserId: userId })
    .all();

    const distinctReporters = new Set(rows.map((row) => row.reporterId)).size;

    if (distinctReporters >= BAN_THRESHOLD) {
        if (user.status !== "TEMPORARY_BAN" && user.status !== "BANNED") {
            await db.orm.public.User.where({ id: userId }).update({
                status: "TEMPORARY_BAN",
            });
        }
    } else if (distinctReporters >= 1) {
        if (user.status === "ACTIVE") {
            await db.orm.public.User.where({ id: userId }).update({
                status: "REPORTED",
            });
        }
    } else if (user.status === "REPORTED") {
        await db.orm.public.User.where({ id: userId }).update({
            status: "ACTIVE",
        });
    }
}

// ------------------------------------------------------
// 1. CREATE REPORT (5-day cooldown per reporter -> reported pair)
// ------------------------------------------------------
export async function createReport(
    input: CreateReportInput,
    requesterRef: RequesterRef,
) {
    const requester = await loadRequester(requesterRef);

    // Unverified accounts cannot report: otherwise 3 fake sign-ups could ban anyone.
    if (requester.status === "PENDING") {
        throw new Error("Your account must be verified before you can report users.");
    }

    if (input.reportedUserId === requester.id) {
        throw new Error("You cannot report yourself.");
    }

    const reason = cleanReason(input.reason);

    const reported = await db.orm.public.User.select("id", "status")
    .where({ id: input.reportedUserId })
    .first();

    if (!reported) throw new Error("User not found.");
    if (reported.status === "BANNED") {
        throw new Error("This user is already banned.");
    }

    // Cooldown: look at every previous report of this exact pair.
    const previous = await db.orm.public.Report.select("createdAt")
    .where({ reporterId: requester.id, reportedUserId: reported.id })
    .all();

    if (previous.length > 0) {
        const lastReportAt = Math.max(
            ...previous.map((report) => new Date(report.createdAt).getTime()),
        );
        const remainingMs = lastReportAt + REPORT_COOLDOWN_MS - Date.now();

        if (remainingMs > 0) {
            throw new Error(
                `You already reported this user. Please wait ${Math.ceil(remainingMs / DAY_MS)} day(s) before reporting again.`,
            );
        }
    }

    const report = await db.orm.public.Report.create({
        reporterId: requester.id,
        reportedUserId: reported.id,
        reason,
    });

    await refreshReportedStatus(reported.id);

    return report;
}

// ------------------------------------------------------
// 2. LIST MY REPORTS (reports I have filed)
// ------------------------------------------------------
export async function listMyReports(
    requesterRef: RequesterRef,
    limit = 50,
) {
    const requester = await loadRequester(requesterRef);

    return await db.orm.public.Report.select(
        "id",
        "reportedUserId",
        "reason",
        "createdAt",
    )
    .where({ reporterId: requester.id })
    .limit(limit)
    .all();
}

// ------------------------------------------------------
// 3. LIST REPORTS AGAINST A USER (moderators only)
// ------------------------------------------------------
export async function listReportsAgainstUser(
    userId: string,
    requesterRef: RequesterRef,
    limit = 50,
) {
    const requester = await loadRequester(requesterRef);
    requireModeratorRole(requester.role);

    if (!(await canModerateUser(requester, userId))) {
        throw new Error("Access denied: this user is outside your sector.");
    }

    return await db.orm.public.Report.select(
        "id",
        "reporterId",
        "reason",
        "createdAt",
    )
    .where({ reportedUserId: userId })
    .limit(limit)
    .all();
}

// ------------------------------------------------------
// 4. GET REPORT (the reporter or a moderator of the reported user)
// ------------------------------------------------------
export async function getReport(
    reportId: string,
    requesterRef: RequesterRef,
) {
    const requester = await loadRequester(requesterRef);

    const report = await db.orm.public.Report.select(
        "id",
        "reporterId",
        "reportedUserId",
        "reason",
        "createdAt",
    )
    .where({ id: reportId })
    .first();

    if (!report) throw new Error("Report not found.");

    const isReporter = report.reporterId === requester.id;
    const isModerator =
    (requester.role === "L_NIG" || requester.role === "L_SNIG") &&
    (await canModerateUser(requester, report.reportedUserId));

    if (!isReporter && !isModerator) {
        throw new Error("Access denied: you cannot view this report.");
    }

    return report;
}

// ------------------------------------------------------
// 5. DELETE REPORT (moderators dismiss a false report)
// ------------------------------------------------------
export async function deleteReport(
    reportId: string,
    requesterRef: RequesterRef,
) {
    const requester = await loadRequester(requesterRef);
    requireModeratorRole(requester.role);

    const report = await db.orm.public.Report.select("id", "reportedUserId")
    .where({ id: reportId })
    .first();

    if (!report) throw new Error("Report not found.");

    if (!(await canModerateUser(requester, report.reportedUserId))) {
        throw new Error("Access denied: this user is outside your sector.");
    }

    await db.orm.public.Report.where({ id: reportId }).delete();

    await refreshReportedStatus(report.reportedUserId);

    return { success: true, deletedId: reportId };
}
