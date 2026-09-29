import React, { useMemo, useState } from "react";

const SIGMA = 5.670374419e-8;

const BASE = {
  S: 1361,
  albedo: 0.30,
  T_obs: 288.0,
};

/*
 * Baseline greenhouse contribution required to reproduce
 * T = 288 K when alpha = 0.30 and S = 1361 W/m².
 *
 * This is kept internal to the model and is not something
 * students need to calculate.
 */
function baselineGreenhouseF0() {
  const absorbed = (1 - BASE.albedo) * BASE.S / 4;
  const sigmaT4 = SIGMA * Math.pow(BASE.T_obs, 4);

  return sigmaT4 - absorbed;
}

const F0 = baselineGreenhouseF0();

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

export default function EnergyBalanceExercise() {
  const [S, setS] = useState(BASE.S);

  // Students calculate this independently from their lecture notes
  // and enter the result here.
  const [co2Forcing, setCO2Forcing] = useState(0);

  const [otherForcing, setOtherForcing] = useState(0);
  const [iceFrac, setIceFrac] = useState(0.12);
  const [cloudAlbedoDelta, setCloudAlbedoDelta] = useState(0);
  const [landFrac, setLandFrac] = useState(0.29);

  const ALBEDO = {
    ocean: 0.06,
    land: 0.25,
    ice: 0.60,
  };

  const derived = useMemo(() => {
    const nonIceFrac = clamp(1 - iceFrac, 0, 1);

    const oceanFrac =
      clamp(1 - landFrac, 0, 1) * nonIceFrac;

    const landOnlyFrac =
      landFrac * nonIceFrac;

    const albedo_surface =
      oceanFrac * ALBEDO.ocean +
      landOnlyFrac * ALBEDO.land +
      iceFrac * ALBEDO.ice;

    const alpha = clamp(
      albedo_surface + cloudAlbedoDelta,
      0.0,
      0.8
    );

    /*
     * F0 is the baseline greenhouse contribution.
     * co2Forcing and otherForcing are changes relative
     * to that baseline.
     */
    const Fnet =
      F0 +
      co2Forcing +
      otherForcing;

    const absorbed =
      (1 - alpha) * S / 4;

    const rhs =
      Math.max(1e-3, absorbed + Fnet);

    const T =
      Math.pow(rhs / SIGMA, 0.25);

    const Te_noGHG =
      Math.pow(absorbed / SIGMA, 0.25);

    const toC = (K) =>
      K - 273.15;

    return {
      alpha,
      absorbed,
      Fnet,
      T,
      T_C: toC(T),
      Te_noGHG,
      Te_noGHG_C: toC(Te_noGHG),
      dT_from_baseline_C:
        T - BASE.T_obs,
      oceanFrac,
      landOnlyFrac,
    };
  }, [
    S,
    co2Forcing,
    otherForcing,
    iceFrac,
    cloudAlbedoDelta,
    landFrac,
  ]);

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1>
        Earth Energy Balance — Interactive Exercise
      </h1>

      <div style={{ marginBottom: "1.5rem" }}>
        <label>
          Solar constant (S):{" "}
          {S.toFixed(0)} W/m²
          <br />

          <input
            type="range"
            min={1200}
            max={1500}
            step={1}
            value={S}
            onChange={(e) =>
              setS(parseFloat(e.target.value))
            }
            style={{ width: "100%" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label>
          CO₂ radiative forcing ΔF:{" "}
          {co2Forcing.toFixed(2)} W/m²
          <br />

          <input
            type="range"
            min={-5}
            max={10}
            step={0.01}
            value={co2Forcing}
            onChange={(e) =>
              setCO2Forcing(
                parseFloat(e.target.value)
              )
            }
            style={{ width: "100%" }}
          />
        </label>

        <p
          style={{
            marginTop: "0.4rem",
            fontSize: "0.9rem",
          }}
        >
          Calculate the CO₂ radiative forcing
          from the relevant equation in your
          lecture notes and enter the value here.
        </p>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label>
          Other forcing:{" "}
          {otherForcing.toFixed(2)} W/m²
          <br />

          <input
            type="range"
            min={-5}
            max={5}
            step={0.01}
            value={otherForcing}
            onChange={(e) =>
              setOtherForcing(
                parseFloat(e.target.value)
              )
            }
            style={{ width: "100%" }}
          />
        </label>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>Results</h2>

        <p>
          Planetary albedo (α):{" "}
          {derived.alpha.toFixed(3)}
        </p>

        <p>
          Absorbed shortwave:{" "}
          {derived.absorbed.toFixed(1)} W/m²
        </p>

        <p>
          CO₂ forcing ΔF:{" "}
          {co2Forcing.toFixed(2)} W/m²
        </p>

        <p>
          Equilibrium T:{" "}
          {derived.T.toFixed(2)} K (
          {derived.T_C.toFixed(2)} °C)
        </p>

        <p>
          ΔT from baseline:{" "}
          {derived.dT_from_baseline_C.toFixed(2)} °C
        </p>

        <p>
          No-GHG effective T:{" "}
          {derived.Te_noGHG.toFixed(1)} K (
          {derived.Te_noGHG_C.toFixed(1)} °C)
        </p>
      </div>

      <div
        style={{
          marginTop: "2.5rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid #ccc",
        }}
      >
        <h2>Model Notes</h2>

        <ul>
          <li>
            Energy balance: (1−α)S/4 + F₀ + ΔF
            = σT⁴.
          </li>

          <li>
            Baseline (reset): α = 0.30 and
            surface T = 288 K.
          </li>

          <li>
            Canonical no-greenhouse temperature
            for α = 0.30 is approximately 255 K.
          </li>

          <li>
            Calculate the CO₂ radiative forcing
            for the required change in CO₂
            concentration using the relevant
            equation from your lecture notes,
            then enter the resulting ΔF above.
          </li>
        </ul>
      </div>
    </div>
  );
}
