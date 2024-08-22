export const REPORT_STATES = {
    /** La denuncia está abierta.  */
    OPENED: "opened",
    /** En curso */
    IN_PROGRESS: "in progress",
    /** Cerrada, no se realizará */
    CLOSED: "closed",
    /** Cerrada, completada correctamente */
    SOLVED: "solved"
} as const;

export type ReportState = typeof REPORT_STATES[keyof typeof REPORT_STATES];

export const ALLOWED_REPORT_STATES: ReportState[] = Object.values(REPORT_STATES);