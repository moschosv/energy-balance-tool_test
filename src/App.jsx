import React, { useMemo, useState } from 'react';

// Stefan–Boltzmann constant (W m^-2 K^-4)
const SIGMA = 5.670374419e-8;

// Baseline reference values (preindustrial Earth)
const BASE = {
  S: 1361,       // Solar constant (W/m^2)
  albedo: 0.3,   // Canonical planetary albedo
  T_obs: 288.0,  // Observed preindustrial mean surface temp (K)
  C0: 280        // Preindustrial CO₂ concentration (ppm)
};

// Derived: baseline greenhouse forcing F0 so the model hits 288 K at α = 0.30
function baselineGreenhouseF0() {
  const absorbed = ((1 - BASE.albedo) * BASE.S) / 4;
  const sigmaT4 = SIGMA * Math.pow(BASE.T_obs, 4);
  return sigmaT4 - absorbed;
}

const F0 = baselineGreenhouseF0();

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

export default function EnergyBalanceExercise() {
  // --- Controls ---
  const [S, setS] = useState(BASE.S);
  const [deltaF, setDeltaF] = useState(0); // Student-provided ΔF (anthropogenic CO₂ forcing)
  const [otherForcing, setOtherForcing] = useState(0); // −5 … +5 W/m^2
  const [albedo, setAlbedo] = useState(BASE.albedo);

  const derived = useMemo(() => {
    // Canonical no-greenhouse effective T (fixed α = 0.30)
    const Te_canonical = Math.pow(((1 - 0.3) * BASE.S / 4) / SIGMA, 0.25);

    // Total forcing = natural greenhouse (F0) + anthropogenic ΔF + other forcings
    const Fnet = F0 + deltaF + otherForcing;

    // Energy balance with current albedo
    const absorbed = ((1 - albedo) * S) / 4;
    const rhs = Math.max(1e-3, absorbed + Fnet);
    const T = Math.pow(rhs / SIGMA, 0.25);

    // No-greenhouse effective T at current albedo
    const Te_noGHG = Math.pow(absorbed / SIGMA, 0.25);

    const dT_from_baseline = T - BASE.T_obs;
    const toC = (K) => K - 273.15;

    return {
      albedo,
      absorbed,
      Fnet,
      T,
      T_C: toC(T),
      Te_noGHG,
      Te_noGHG_C: toC(Te_noGHG),
      Te_canonical,
      dT_from_baseline,
      dT_from_baseline_C: toC(T) - toC(BASE.T_obs),
    };
  }, [S, deltaF, otherForcing, albedo]);

  function resetAll() {
    setS(BASE.S);
    setDeltaF(0);
    setOtherForcing(0);
    setAlbedo(BASE.albedo);
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Earth Energy Balance — Interactive Exercise
          </h1>
          <button
            onClick={resetAll}
            className="px-4 py-2 rounded-2xl bg-gray-900 text-white shadow hover:opacity-90"
          >
            Reset to baseline
          </button>
        </header>

        <p className="text-sm text-gray-600 leading-relaxed">
          The model is calibrated so that with planetary albedo = 0.30, Earth’s
          mean surface temperature is 288 K (preindustrial climate with natural
          greenhouse gases, C₀). The canonical no-greenhouse effective temperature
          (α=0.30) is 255 K. Please enter additional anthropogenic CO₂ forcing
          (ΔF) relative to preindustrial levels (C₀ ppm) to see its warming effect.
        </p>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold mb-2">Incoming Energy</h2>
            <Slider
              label={`Solar constant S = ${S.toFixed(0)} W/m²`}
              min={1200}
              max={1500}
              step={1}
              value={S}
              onChange={setS}
            />
            <Slider
              label={`Planetary albedo α = ${albedo.toFixed(2)}`}
              min={0.1}
              max={0.6}
              step={0.01}
              value={albedo}
              onChange={setAlbedo}
            />
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-2">Forcings</h2>
            <Slider
              label={`ΔF anthropogenic CO₂ (input) = ${deltaF.toFixed(2)} W/m²`}
              min={0}
              max={8}
              step={0.01}
              value={deltaF}
              onChange={setDeltaF}
            />
            <Slider
              label={`Other forcing (aerosols, volcanoes, etc.) = ${otherForcing.toFixed(2)} W/m²`}
              min={-5}
              max={5}
              step={0.01}
              value={otherForcing}
              onChange={setOtherForcing}
            />
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-2">Model Notes</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>
                Energy balance: <code>(1−α)S/4 + F₀ + ΔF = σT⁴</code>.
              </li>
              <li>
                Baseline (reset): α = 0.30 → Surface T = 288 K (preindustrial).
              </li>
              <li>
                Canonical no-greenhouse T (α=0.30): 255 K.
              </li>
              <li>
                Use the Myhre et al. (1998) CO₂ forcing equation:
                <br />
                <code>ΔF = 5.35 × ln(C / C₀)</code> (W/m²)
              </li>
              <li>
                Take C₀ (preindustrial CO₂). Compute ΔF for a chosen CO₂
                level C (e.g., today), then enter ΔF in the slider above.
              </li>
            </ul>
          </Card>
        </div>

        {/* Outputs */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SummaryCard title="Planetary Albedo & Radiation">
            <Stat label="Albedo α = " value={derived.albedo.toFixed(2)} />
            <Stat
              label="Absorbed shortwave (W/m²) = "
              value={derived.absorbed.toFixed(1)}
            />
          </SummaryCard>

          <SummaryCard title="Forcings">
            <Stat
              label="Baseline greenhouse F₀ (W/m²) = "
              value={F0.toFixed(2)}
            />
            <Stat label="ΔF anthropogenic (W/m²) = " value={deltaF.toFixed(2)} />
            <Stat label="Other forcing (W/m²) = " value={otherForcing.toFixed(2)} />
            <Stat
              label="Total forcing F₀+ΔF (W/m²) = "
              value={derived.Fnet.toFixed(2)}
            />
          </SummaryCard>

          <SummaryCard title="Temperatures">
            <Stat label="Surface T (K) = " value={derived.T.toFixed(2)} big />
            <Stat label="Surface T (°C) = " value={derived.T_C.toFixed(2)} />
            <Stat
              label="ΔT from 288 K (°C) = "
              value={derived.dT_from_baseline_C.toFixed(2)}
            />
            <div className="mt-2 text-xs text-gray-500 space-y-1">
            </div>
          </SummaryCard>
        </section>
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 space-y-3">{children}</div>
  );
}

function SummaryCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Stat({ label, value, big }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={'font-mono ' + (big ? 'text-2xl' : 'text-base')}>
        {value}
      </span>
    </div>
  );
}

function Slider({ label, min, max, step, value, onChange }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700">{label}</label>
        <span className="text-xs text-gray-500">
          {min}–{max}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
