import { describe, it, expect } from "vitest";
import {
  DEFAULT_RECEIVE_NUMBERS,
  RECEIVE_SETTING_KEYS,
} from "../EdtechBookings";

describe("EdtechBookings RECEIVE_NUMBERS", () => {
  it("maps Rocket to the Personal number 01756004037", () => {
    expect(DEFAULT_RECEIVE_NUMBERS.rocket).toBe("01756004037");
  });

  it("uses the same Personal number for bKash, Nagad, and Rocket", () => {
    expect(DEFAULT_RECEIVE_NUMBERS.bkash).toBe("01756004037");
    expect(DEFAULT_RECEIVE_NUMBERS.nagad).toBe("01756004037");
    expect(DEFAULT_RECEIVE_NUMBERS.rocket).toBe("01756004037");
  });

  it("each number is a valid 11-digit BD mobile number", () => {
    for (const num of Object.values(DEFAULT_RECEIVE_NUMBERS)) {
      expect(num).toMatch(/^01[3-9]\d{8}$/);
    }
  });

  it("exposes site_settings key for rocket override", () => {
    expect(RECEIVE_SETTING_KEYS.rocket).toBe("receive_number_rocket");
  });
});