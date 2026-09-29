import React, { useMemo, useState } from "react";

const SIGMA = 5.670374419e-8;

const BASE = {
  S: 1361,
  albedo: 0.30,
  T_obs: 288.0,
};

/*
 * Baseline greenhouse contribution required to reproduce
 * T = 288 K when planetary albedo = 0.30 and S = 1361 W/m².
 */
function baselineGreenhouseF0() {
  const absorbed = (1 - BASE.albedo) * BASE.S / 4;
  const sigmaT4 = SIGMA * Math.pow(BASE.T_obs, 4);

  return sigmaT4 - absorbed;
}

const F0 = baselineGreenhouseF0();

export default function EnergyBalanceExercise() {
  const [S, setS] = useState(BASE.S);
  const [albedo, setAlbedo] = useState(BASE.albedo);
  const [anthropogenicForcing, setAnthropogenicForcing] = useState(0);
  const [otherForcing, setOtherForcing] = useState(0);

  const derived = useMemo(() => {
    const absorbed = (1 - albedo) * S / 4;

    const totalForcing =
      F0 +
      anthropogenicForcing +
      otherForcing;

    const rhs = Math.max(
      1e-6,
      absorbed + totalForcing
    );

    const T = Math.pow(rhs / SIGMA, 0.25);
    const T_C = T - 273.15;

    const dT = T - BASE.T_obs;

    return {
      absorbed,
      totalForcing,
      T,
      T_C,
      dT,
    };
  }, [
    S,
    albedo,
    anthropogenicForcing,
    otherForcing,
  ]);

  const resetBaseline = () => {
    setS(BASE.S);
    setAlbedo(BASE.albedo);
    setAnthropogenicForcing(0);
    setOtherForcing(0);
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        lineHeight: 1.5,
      }}
    >
      <h1>
        Earth Energy Balance — Interactive Exercise
      </h1>

      <button
        onClick={resetBaseline}
        style={{
          padding: "0.6rem 1rem",
          marginBottom: "1.5rem",
          cursor: "pointer",
        }}
      >
        Reset to baseline
      </button>

      <p>
        The model is calibrated so that with planetary
        albedo = 0.30, Earth’s mean surface temperature is
        288 K (preindustrial climate with natural greenhouse
        gases). The canonical no-greenhouse effective
        temperature (α=0.30) is 255 K.
      </p>

      <h2>Incoming Energy</h2>

      <div style={{ marginBottom: "1.5rem" }}>
        <label>
          Solar constant S ={" "}
          <strong>{S.toFixed(0)} W/m²</strong>
        </label>

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
          style={{
            width: "100%",
            maxWidth: "600px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: "600px",
            fontSize: "0.9rem",
          }}
        >
          <span>1200</span>
          <span>1500</span>
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label>
          Planetary albedo α ={" "}
          <strong>{albedo.toFixed(2)}</strong>
        </label>

        <br />

        <input
          type="range"
          min={0.1}
          max={0.6}
          step={0.01}
          value={albedo}
          onChange={(e) =>
            setAlbedo(parseFloat(e.target.value))
          }
          style={{
            width: "100%",
            maxWidth: "600px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: "600px",
            fontSize: "0.9rem",
          }}
        >
          <span>0.1</span>
          <span>0.6</span>
        </div>
      </div>

      <h2>Forcings</h2>

      <div style={{ marginBottom: "1.5rem" }}>
        <label>
          ΔF anthropogenic CO₂ (input) ={" "}
          <strong>
            {anthropogenicForcing.toFixed(2)} W/m²
          </strong>
        </label>

        <br />

        <input
          type="range"
          min={0}
          max={8}
          step={0.01}
          value={anthropogenicForcing}
          onChange={(e) =>
            setAnthropogenicForcing(
              parseFloat(e.target.value)
            )
          }
          style={{
            width: "100%",
            maxWidth: "600px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: "600px",
            fontSize: "0.9rem",
          }}
        >
          <span>0</span>
          <span>8</span>
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label>
          Other forcing (aerosols, volcanoes, etc.) ={" "}
          <strong>
            {otherForcing.toFixed(2)} W/m²
          </strong>
        </label>

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
          style={{
            width: "100%",
            maxWidth: "600px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: "600px",
            fontSize: "0.9rem",
          }}
        >
          <span>-5</span>
          <span>5</span>
        </div>
      </div>

      <h2>Notes</h2>

      <ul>
        <li>
          Energy balance:{" "}
          <code>
            (1−α)S/4 + F₀ + ΔF = σT⁴
          </code>
          .
        </li>

        <li>
          Baseline (reset): α = 0.30 → Surface T =
          288 K (preindustrial).
        </li>

        <li>
          Canonical no-greenhouse T (α=0.30): 255 K.
        </li>

        <li>
          Compute ΔF using lecture materials, then enter it in the slider above.
        </li>
      </ul>

      <h3>Planetary Albedo &amp; Radiation</h3>

      <p>
        Albedo α ={" "}
        <strong>{albedo.toFixed(2)}</strong>
      </p>

      <p>
        Absorbed shortwave (W/m²) ={" "}
        <strong>
          {derived.absorbed.toFixed(1)}
        </strong>
      </p>

      <h3>Forcings</h3>

      <p>
        Baseline greenhouse F₀ (W/m²) ={" "}
        <strong>{F0.toFixed(2)}</strong>
      </p>

      <p>
        ΔF anthropogenic (W/m²) ={" "}
        <strong>
          {anthropogenicForcing.toFixed(2)}
        </strong>
      </p>

      <p>
        Other forcing (W/m²) ={" "}
        <strong>
          {otherForcing.toFixed(2)}
        </strong>
      </p>

      <p>
        Total forcing F₀+ΔF (W/m²) ={" "}
        <strong>
          {derived.totalForcing.toFixed(2)}
        </strong>
      </p>

      <h3>Temperatures</h3>

      <p>
        Surface T (K) ={" "}
        <strong>{derived.T.toFixed(2)}</strong>
      </p>

      <p>
        Surface T (°C) ={" "}
        <strong>{derived.T_C.toFixed(2)}</strong>
      </p>

      <p>
        ΔT from 288 K (°C) ={" "}
        <strong>{derived.dT.toFixed(2)}</strong>
      </p>
    </div>
  );
}
