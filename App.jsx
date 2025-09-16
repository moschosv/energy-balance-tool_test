import React, { useMemo, useState } from "react";

const SIGMA = 5.670374419e-8;

const BASE = {
  S: 1361,
  albedo: 0.30,
  T_obs: 288.0,
  C0: 280,
  C_now: 420,
};

function baselineGreenhouseF0() {
  const absorbed = (1 - BASE.albedo) * BASE.S / 4;
  const sigmaT4 = SIGMA * Math.pow(BASE.T_obs, 4);
  return sigmaT4 - absorbed;
}

const F0 = baselineGreenhouseF0();

function forcingCO2(C, C0 = BASE.C0) {
  return 5.35 * Math.log(C / C0);
}

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

export default function EnergyBalanceExercise() {
  const [S, setS] = useState(BASE.S);
  const [co2, setCO2] = useState(BASE.C_now);
  const [otherForcing, setOtherForcing] = useState(0);
  const [iceFrac, setIceFrac] = useState(0.12);
  const [cloudAlbedoDelta, setCloudAlbedoDelta] = useState(0);
  const [landFrac, setLandFrac] = useState(0.29);

  const ALBEDO = { ocean: 0.06, land: 0.25, ice: 0.60 };

  const derived = useMemo(() => {
    const nonIceFrac = clamp(1 - iceFrac, 0, 1);
    const oceanFrac = clamp(1 - landFrac, 0, 1) * nonIceFrac;
    const landOnlyFrac = landFrac * nonIceFrac;

    const albedo_surface =
      oceanFrac * ALBEDO.ocean + landOnlyFrac * ALBEDO.land + iceFrac * ALBEDO.ice;

    const alpha = clamp(albedo_surface + cloudAlbedoDelta, 0.0, 0.8);

    const Fco2 = forcingCO2(co2, BASE.C0);
    const Fnet = F0 + otherForcing + Fco2;

    const absorbed = (1 - alpha) * S / 4;
    const rhs = Math.max(1e-3, absorbed + Fnet);
    const T = Math.pow(rhs / SIGMA, 0.25);

    const Te_noGHG = Math.pow(absorbed / SIGMA, 0.25);

    const toC = (K) => K - 273.15;

    return {
      alpha,
      absorbed,
      Fco2,
      Fnet,
      T,
      T_C: toC(T),
      Te_noGHG,
      Te_noGHG_C: toC(Te_noGHG),
      dT_from_baseline_C: toC(T) - toC(BASE.T_obs),
      oceanFrac,
      landOnlyFrac,
    };
  }, [S, co2, otherForcing, iceFrac, cloudAlbedoDelta, landFrac]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Earth Energy Balance — Interactive Exercise</h1>
      <div>
        <label>
          Solar constant (S): {S.toFixed(0)} W/m²
          <input type="range" min={1200} max={1500} step={1} value={S}
            onChange={(e) => setS(parseFloat(e.target.value))} />
        </label>
      </div>
      <div>
        <label>
          CO₂ concentration: {co2.toFixed(0)} ppm
          <input type="range" min={150} max={1200} step={1} value={co2}
            onChange={(e) => setCO2(parseFloat(e.target.value))} />
        </label>
      </div>
      <div>
        <label>
          Other forcing: {otherForcing.toFixed(2)} W/m²
          <input type="range" min={-5} max={5} step={0.01} value={otherForcing}
            onChange={(e) => setOtherForcing(parseFloat(e.target.value))} />
        </label>
      </div>
      <div style={{ marginTop: "2rem" }}>
        <h2>Results</h2>
        <p>Planetary albedo (α): {derived.alpha.toFixed(3)}</p>
        <p>Absorbed shortwave: {derived.absorbed.toFixed(1)} W/m²</p>
        <p>CO₂ forcing ΔF: {derived.Fco2.toFixed(2)} W/m²</p>
        <p>Total forcing: {derived.Fnet.toFixed(2)} W/m²</p>
        <p>Equilibrium T: {derived.T.toFixed(2)} K ({derived.T_C.toFixed(2)} °C)</p>
        <p>ΔT from baseline: {derived.dT_from_baseline_C.toFixed(2)} °C</p>
        <p>No-GHG effective T: {derived.Te_noGHG.toFixed(1)} K ({derived.Te_noGHG_C.toFixed(1)} °C)</p>
      </div>
    </div>
  );
}
