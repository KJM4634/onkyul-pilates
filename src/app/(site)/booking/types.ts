import type { FieldErrors } from "@/lib/validation";

export type AvailableSession = {
  id: string;
  title: string;
  instructor: string;
  start_at: string;
  duration_min: number;
  capacity: number;
  remaining: number;
};

export type BookingState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: FieldErrors }
  | { status: "success"; bookingId: string; name: string };
