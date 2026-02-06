import { useEffect, useRef, useState, useCallback } from "react";
import { RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { useJournalStore, type JournalEntry, type JournalOption } from "../stores/journalStore";
import { useResultStore } from "../stores/resultStore";
import { useProjectStore } from "../stores/projectStore";
import { useNavigationStore } from "../stores/navigationStore";
import { useOutputStore } from "../stores/outputStore";
import { useActiveDataset } from "../hooks/useDataset";
import { getInitialOptions, getSubMenu, getNextSteps, COMMAND_LABELS } from "../lib/journalFlow";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { executeCommand } from "../lib/executeCommand";
import { getChartForCommand } from "../lib/resultCharts";
import { IRFChart } from "../components/charts/IRFChart";
import { FEVDChart } from "../components/charts/FEVDChart";
import { HDChart } from "../components/charts/HDChart";
import { ForecastChart } from "../components/charts/ForecastChart";
import { ScreePlot } from "../components/charts/ScreePlot";

// ── Inline command form ─────────────────────────────────────────────────────

interface CommandFormProps {
  command: string;
  entryId: string;
  onComplete: (command: string, params: Record<string, unknown>, result: unknown) => void;
  onError: (message: string) => void;
}

function CommandForm({ command, entryId, onComplete, onError }: CommandFormProps) {
  const activeDataset = useActiveDataset();
  const dataPath = activeDataset?.path ?? "";
  const addLine = useOutputStore((s) => s.addLine);
  const updateFormStatus = useJournalStore((s) => s.updateFormStatus);
  const [loading, setLoading] = useState(false);

  // Generic form state
  const [fields, setFields] = useState<Record<string, string>>({
    data: dataPath,
  });

  useEffect(() => {
    if (dataPath && !fields.data) {
      setFields((f) => ({ ...f, data: dataPath }));
    }
  }, [dataPath, fields.data]);

  const setField = (key: string, value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  async function handleRun() {
    if (!fields.data) return;
    setLoading(true);
    updateFormStatus(entryId, "running");

    const label = COMMAND_LABELS[command] ?? command;
    addLine("info", `Running ${label}...`);

    // Build params from fields, converting numbers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Record<string, any> = { data: fields.data };

    // Add optional fields based on command
    const addNum = (key: string, field: string) => {
      const raw = fields[field];
      if (raw != null && raw.trim() !== "") {
        const n = Number(raw);
        if (!isNaN(n)) params[key] = n;
      }
    };
    const addStr = (key: string, field: string) => {
      if (fields[field] && fields[field].trim() !== "") params[key] = fields[field].trim();
    };
    // Command-specific param mapping
    switch (command) {
      case "var-estimate":
        addNum("lags", "lags");
        addStr("trend", "trend");
        break;
      case "var-lagselect":
        addNum("max_lags", "max_lags");
        addStr("criterion", "criterion");
        break;
      case "var-stability":
        addNum("lags", "lags");
        break;
      case "bvar-estimate":
        addNum("lags", "lags");
        addStr("prior", "prior");
        addNum("draws", "draws");
        addStr("sampler", "sampler");
        addStr("config", "config");
        break;
      case "bvar-posterior":
        addNum("lags", "lags");
        addNum("draws", "draws");
        addStr("sampler", "sampler");
        addStr("method", "method");
        addStr("config", "config");
        break;
      case "var-irf":
        addNum("lags", "lags");
        addNum("shock", "shock");
        addNum("horizons", "horizons");
        addStr("id", "id");
        addStr("ci", "ci");
        addNum("replications", "replications");
        addStr("config", "config");
        break;
      case "var-fevd":
        addNum("lags", "lags");
        addNum("horizons", "horizons");
        addStr("id", "id");
        addStr("config", "config");
        break;
      case "var-hd":
        addNum("lags", "lags");
        addStr("id", "id");
        addStr("config", "config");
        break;
      case "var-forecast":
        addNum("lags", "lags");
        addNum("horizons", "horizons");
        addNum("confidence", "confidence");
        break;
      case "bvar-irf":
        addNum("lags", "lags");
        addNum("shock", "shock");
        addNum("horizons", "horizons");
        addStr("id", "id");
        addNum("draws", "draws");
        addStr("sampler", "sampler");
        addStr("config", "config");
        break;
      case "bvar-fevd":
        addNum("lags", "lags");
        addNum("horizons", "horizons");
        addStr("id", "id");
        addNum("draws", "draws");
        addStr("sampler", "sampler");
        addStr("config", "config");
        break;
      case "bvar-hd":
        addNum("lags", "lags");
        addStr("id", "id");
        addNum("draws", "draws");
        addStr("sampler", "sampler");
        addStr("config", "config");
        break;
      case "bvar-forecast":
        addNum("lags", "lags");
        addNum("horizons", "horizons");
        addNum("draws", "draws");
        addStr("sampler", "sampler");
        addStr("config", "config");
        break;
      case "lp-estimate":
        addStr("method", "method");
        addNum("shock", "shock");
        addNum("horizons", "horizons");
        addNum("control_lags", "control_lags");
        addStr("vcov", "vcov");
        addStr("instruments", "instruments");
        addNum("knots", "knots");
        addNum("lambda", "lambda");
        addNum("state_var", "state_var");
        addNum("gamma", "gamma");
        addStr("transition", "transition");
        addNum("treatment", "treatment");
        addStr("score_method", "score_method");
        break;
      case "lp-irf":
        addNum("shock", "shock");
        addStr("shocks", "shocks");
        addNum("horizons", "horizons");
        addNum("lags", "lags");
        addNum("var_lags", "var_lags");
        addStr("id", "id");
        addStr("ci", "ci");
        addNum("replications", "replications");
        addNum("conf_level", "conf_level");
        addStr("vcov", "vcov");
        addStr("config", "config");
        break;
      case "lp-fevd":
        addNum("horizons", "horizons");
        addNum("lags", "lags");
        addNum("var_lags", "var_lags");
        addStr("id", "id");
        addStr("vcov", "vcov");
        addStr("config", "config");
        break;
      case "lp-hd":
        addNum("lags", "lags");
        addNum("var_lags", "var_lags");
        addStr("id", "id");
        addStr("vcov", "vcov");
        addStr("config", "config");
        break;
      case "lp-forecast":
        addNum("shock", "shock");
        addNum("horizons", "horizons");
        addNum("shock_size", "shock_size");
        addNum("lags", "lags");
        addStr("vcov", "vcov");
        addStr("ci_method", "ci_method");
        addNum("conf_level", "conf_level");
        addNum("n_boot", "n_boot");
        break;
      case "factor-estimate":
        addStr("model_type", "model_type");
        addNum("nfactors", "nfactors");
        addStr("criterion", "criterion");
        addNum("factor_lags", "factor_lags");
        addStr("method", "method");
        addNum("dynamic_rank", "dynamic_rank");
        break;
      case "test-adf":
      case "test-pp":
      case "test-np":
        addNum("column", "column");
        addNum("max_lags", "max_lags");
        addStr("trend", "trend");
        break;
      case "test-kpss":
        addNum("column", "column");
        addStr("trend", "trend");
        break;
      case "test-za":
        addNum("column", "column");
        addStr("trend", "trend");
        addNum("trim", "trim");
        break;
      case "test-johansen":
        addNum("lags", "lags");
        addStr("trend", "trend");
        break;
      case "gmm-estimate":
        addStr("config", "config");
        addStr("weighting", "weighting");
        break;
      case "arima-estimate":
        addNum("column", "column");
        addNum("p", "p");
        addNum("d", "d");
        addNum("q", "q");
        addStr("method", "method");
        addNum("max_p", "max_p");
        addNum("max_d", "max_d");
        addNum("max_q", "max_q");
        addStr("criterion", "criterion");
        break;
      case "arima-forecast":
        addNum("column", "column");
        addNum("p", "p");
        addNum("d", "d");
        addNum("q", "q");
        addNum("horizons", "horizons");
        addNum("confidence", "confidence");
        addStr("method", "method");
        break;
      case "factor-forecast":
        addNum("nfactors", "nfactors");
        addNum("horizon", "horizon");
        addStr("ci_method", "ci_method");
        addNum("conf_level", "conf_level");
        addStr("model", "model");
        addNum("factor_lags", "factor_lags");
        addStr("method", "method");
        addNum("dynamic_rank", "dynamic_rank");
        break;
      case "nongaussian-fastica":
        addNum("lags", "lags");
        addStr("method", "method");
        addStr("contrast", "contrast");
        break;
      case "nongaussian-ml":
        addNum("lags", "lags");
        addStr("distribution", "distribution");
        break;
      case "nongaussian-heteroskedasticity":
        addNum("lags", "lags");
        addStr("method", "method");
        addStr("config", "config");
        addNum("regimes", "regimes");
        break;
      case "nongaussian-normality":
        addNum("lags", "lags");
        break;
      case "nongaussian-identifiability":
        addNum("lags", "lags");
        addStr("test", "test");
        addStr("method", "method");
        addStr("contrast", "contrast");
        break;
    }

    try {
      const result = await executeCommand(command, params);
      addLine("success", `${label} completed.`);
      updateFormStatus(entryId, "done", params);
      onComplete(command, params, result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLine("error", `${label} failed: ${msg}`);
      updateFormStatus(entryId, "done");
      onError(msg);
    } finally {
      setLoading(false);
    }
  }

  const label = COMMAND_LABELS[command] ?? command;

  // Render form fields based on command type
  const renderFields = () => {
    const inputClass = "w-full px-2 py-1.5 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors min-h-[44px] md:min-h-0";
    const selectClass = inputClass;
    const labelClass = "block text-xs text-[var(--text-secondary)] mb-1 font-medium";

    const NumField = ({ name, label, placeholder, min, max }: { name: string; label: string; placeholder?: string; min?: number; max?: number }) => (
      <div>
        <label className={labelClass}>{label}</label>
        <input type="number" value={fields[name] ?? ""} onChange={(e) => setField(name, e.target.value)} placeholder={placeholder ?? ""} min={min} max={max} className={inputClass} />
      </div>
    );

    const SelectField = ({ name, label, options }: { name: string; label: string; options: { value: string; label: string }[] }) => (
      <div>
        <label className={labelClass}>{label}</label>
        <select value={fields[name] ?? options[0]?.value ?? ""} onChange={(e) => setField(name, e.target.value)} className={selectClass}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );

    const TextField = ({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) => (
      <div>
        <label className={labelClass}>{label}</label>
        <input type="text" value={fields[name] ?? ""} onChange={(e) => setField(name, e.target.value)} placeholder={placeholder ?? ""} className={inputClass} />
      </div>
    );

    const trendOpts = [
      { value: "none", label: "None" },
      { value: "constant", label: "Constant" },
      { value: "trend", label: "Trend" },
      { value: "both", label: "Both" },
    ];

    const vcovOpts = [
      { value: "hac", label: "HAC" },
      { value: "hc", label: "HC" },
      { value: "ols", label: "OLS" },
    ];

    const idOpts = [
      { value: "cholesky", label: "Cholesky" },
      { value: "sign", label: "Sign Restrictions" },
      { value: "narrative", label: "Narrative" },
      { value: "longrun", label: "Long-Run" },
      { value: "arias", label: "Arias" },
    ];

    const criterionOpts = [
      { value: "aic", label: "AIC" },
      { value: "bic", label: "BIC" },
      { value: "hqc", label: "HQC" },
    ];

    switch (command) {
      case "var-estimate":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="trend" label="Trend" options={trendOpts} />
          </div>
        );

      case "var-lagselect":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NumField name="max_lags" label="Max Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="criterion" label="Criterion" options={criterionOpts} />
          </div>
        );

      case "var-stability":
        return <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />;

      case "bvar-estimate":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="prior" label="Prior" options={[
              { value: "minnesota", label: "Minnesota" },
              { value: "normal-wishart", label: "Normal-Wishart" },
              { value: "ssvs", label: "SSVS" },
            ]} />
            <NumField name="draws" label="Draws" placeholder="1000" min={100} />
            <SelectField name="sampler" label="Sampler" options={[
              { value: "gibbs", label: "Gibbs" },
              { value: "mh", label: "Metropolis-Hastings" },
            ]} />
          </div>
        );

      case "bvar-posterior":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <NumField name="draws" label="Draws" placeholder="1000" min={100} />
            <SelectField name="sampler" label="Sampler" options={[
              { value: "gibbs", label: "Gibbs" },
              { value: "mh", label: "Metropolis-Hastings" },
            ]} />
            <TextField name="method" label="Method" placeholder="optional" />
          </div>
        );

      case "var-irf":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumField name="shock" label="Shock" placeholder="1" min={1} />
            <NumField name="horizons" label="Horizons" placeholder="20" min={1} max={100} />
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="id" label="Identification" options={idOpts} />
            <SelectField name="ci" label="Confidence Interval" options={[
              { value: "none", label: "None" },
              { value: "bootstrap", label: "Bootstrap" },
              { value: "theoretical", label: "Theoretical" },
            ]} />
            <NumField name="replications" label="Replications" placeholder="500" min={100} />
          </div>
        );

      case "var-fevd":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumField name="horizons" label="Horizons" placeholder="20" min={1} max={100} />
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="id" label="Identification" options={idOpts} />
          </div>
        );

      case "var-hd":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="id" label="Identification" options={idOpts} />
          </div>
        );

      case "var-forecast":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <NumField name="horizons" label="Horizons" placeholder="12" min={1} max={100} />
            <NumField name="confidence" label="Confidence" placeholder="0.95" />
          </div>
        );

      case "bvar-irf":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumField name="shock" label="Shock" placeholder="1" min={1} />
            <NumField name="horizons" label="Horizons" placeholder="20" min={1} max={100} />
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="id" label="Identification" options={idOpts} />
            <NumField name="draws" label="Draws" placeholder="1000" min={100} />
            <SelectField name="sampler" label="Sampler" options={[
              { value: "gibbs", label: "Gibbs" },
              { value: "mh", label: "Metropolis-Hastings" },
            ]} />
          </div>
        );

      case "bvar-fevd":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumField name="horizons" label="Horizons" placeholder="20" min={1} max={100} />
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="id" label="Identification" options={idOpts} />
            <NumField name="draws" label="Draws" placeholder="1000" min={100} />
            <SelectField name="sampler" label="Sampler" options={[
              { value: "gibbs", label: "Gibbs" },
              { value: "mh", label: "Metropolis-Hastings" },
            ]} />
          </div>
        );

      case "bvar-hd":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="id" label="Identification" options={idOpts} />
            <NumField name="draws" label="Draws" placeholder="1000" min={100} />
            <SelectField name="sampler" label="Sampler" options={[
              { value: "gibbs", label: "Gibbs" },
              { value: "mh", label: "Metropolis-Hastings" },
            ]} />
          </div>
        );

      case "bvar-forecast":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <NumField name="horizons" label="Horizons" placeholder="12" min={1} max={100} />
            <NumField name="draws" label="Draws" placeholder="1000" min={100} />
            <SelectField name="sampler" label="Sampler" options={[
              { value: "gibbs", label: "Gibbs" },
              { value: "mh", label: "Metropolis-Hastings" },
            ]} />
          </div>
        );

      case "lp-estimate":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SelectField name="method" label="Method" options={[
              { value: "standard", label: "Standard" },
              { value: "iv", label: "Instrumental Variables" },
              { value: "smooth", label: "Smooth" },
              { value: "state", label: "State-Dependent" },
              { value: "propensity", label: "Propensity Score" },
              { value: "robust", label: "Robust" },
            ]} />
            <NumField name="shock" label="Shock (column)" placeholder="auto" min={0} />
            <NumField name="horizons" label="Horizons" placeholder="auto" min={1} max={100} />
            <NumField name="control_lags" label="Control Lags" placeholder="auto" min={0} max={24} />
            <SelectField name="vcov" label="VCov" options={vcovOpts} />
            {fields.method === "iv" && <TextField name="instruments" label="Instruments" placeholder="column indices" />}
            {fields.method === "smooth" && <NumField name="knots" label="Knots" placeholder="auto" min={1} />}
            {fields.method === "smooth" && <NumField name="lambda" label="Lambda" placeholder="auto" />}
            {fields.method === "state" && <NumField name="state_var" label="State Variable" placeholder="column" min={0} />}
            {fields.method === "state" && <NumField name="gamma" label="Gamma" placeholder="auto" />}
            {fields.method === "state" && <TextField name="transition" label="Transition" placeholder="optional" />}
            {(fields.method === "propensity" || fields.method === "robust") && <NumField name="treatment" label="Treatment (column)" placeholder="auto" min={0} />}
            {(fields.method === "propensity" || fields.method === "robust") && <TextField name="score_method" label="Score Method" placeholder="optional" />}
          </div>
        );

      case "lp-irf":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumField name="shock" label="Shock" placeholder="1" min={1} />
            <TextField name="shocks" label="Shocks (multi)" placeholder="e.g. 1,2" />
            <NumField name="horizons" label="Horizons" placeholder="20" min={1} max={100} />
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="id" label="Identification" options={idOpts} />
            <SelectField name="ci" label="Confidence Interval" options={[
              { value: "none", label: "None" },
              { value: "bootstrap", label: "Bootstrap" },
            ]} />
            <NumField name="replications" label="Replications" placeholder="500" min={100} />
            <SelectField name="vcov" label="VCov" options={vcovOpts} />
          </div>
        );

      case "lp-fevd":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumField name="horizons" label="Horizons" placeholder="20" min={1} max={100} />
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="id" label="Identification" options={idOpts} />
            <SelectField name="vcov" label="VCov" options={vcovOpts} />
          </div>
        );

      case "lp-hd":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="id" label="Identification" options={idOpts} />
            <SelectField name="vcov" label="VCov" options={vcovOpts} />
          </div>
        );

      case "lp-forecast":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumField name="shock" label="Shock" placeholder="1" min={1} />
            <NumField name="horizons" label="Horizons" placeholder="12" min={1} max={100} />
            <NumField name="shock_size" label="Shock Size" placeholder="1.0" />
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="vcov" label="VCov" options={vcovOpts} />
            <NumField name="conf_level" label="Conf. Level" placeholder="0.95" />
            <NumField name="n_boot" label="Bootstrap Reps" placeholder="500" min={100} />
          </div>
        );

      case "factor-estimate":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SelectField name="model_type" label="Model Type" options={[
              { value: "static", label: "Static" },
              { value: "dynamic", label: "Dynamic" },
              { value: "gdfm", label: "GDFM" },
            ]} />
            <NumField name="nfactors" label="Number of Factors" placeholder="auto" min={1} />
            <TextField name="criterion" label="Criterion" placeholder="optional" />
            {(fields.model_type === "dynamic" || fields.model_type === "gdfm") && <NumField name="factor_lags" label="Factor Lags" placeholder="auto" min={1} />}
            {fields.model_type === "dynamic" && <TextField name="method" label="Method" placeholder="optional" />}
            {fields.model_type === "gdfm" && <NumField name="dynamic_rank" label="Dynamic Rank" placeholder="auto" min={1} />}
          </div>
        );

      case "test-adf":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumField name="column" label="Column" placeholder="1" min={1} />
            <NumField name="max_lags" label="Max Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="trend" label="Trend" options={trendOpts} />
          </div>
        );

      case "test-kpss":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NumField name="column" label="Column" placeholder="1" min={1} />
            <SelectField name="trend" label="Trend" options={trendOpts} />
          </div>
        );

      case "test-pp":
      case "test-np":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NumField name="column" label="Column" placeholder="1" min={1} />
            <SelectField name="trend" label="Trend" options={trendOpts} />
          </div>
        );

      case "test-za":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumField name="column" label="Column" placeholder="1" min={1} />
            <SelectField name="trend" label="Trend" options={trendOpts} />
            <NumField name="trim" label="Trim" placeholder="0.15" />
          </div>
        );

      case "test-johansen":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="trend" label="Trend" options={trendOpts} />
          </div>
        );

      case "gmm-estimate":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TextField name="config" label="Config (JSON)" placeholder='{"formula": "..."}' />
            <SelectField name="weighting" label="Weighting" options={[
              { value: "optimal", label: "Optimal" },
              { value: "two-step", label: "Two-Step" },
              { value: "identity", label: "Identity" },
            ]} />
          </div>
        );

      case "arima-estimate":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumField name="column" label="Column" placeholder="1" min={1} />
            <NumField name="p" label="p (AR)" placeholder="omit for auto" min={0} />
            <NumField name="d" label="d (Diff)" placeholder="0" min={0} max={3} />
            <NumField name="q" label="q (MA)" placeholder="0" min={0} />
            <TextField name="method" label="Method" placeholder="optional" />
            {!fields.p && (
              <>
                <NumField name="max_p" label="Max p" placeholder="5" min={0} max={24} />
                <NumField name="max_d" label="Max d" placeholder="2" min={0} max={3} />
                <NumField name="max_q" label="Max q" placeholder="5" min={0} max={24} />
                <SelectField name="criterion" label="Criterion" options={criterionOpts} />
              </>
            )}
          </div>
        );

      case "arima-forecast":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumField name="column" label="Column" placeholder="1" min={1} />
            <NumField name="p" label="p (AR)" placeholder="1" min={0} />
            <NumField name="d" label="d (Diff)" placeholder="0" min={0} max={3} />
            <NumField name="q" label="q (MA)" placeholder="0" min={0} />
            <NumField name="horizons" label="Horizons" placeholder="10" min={1} />
            <NumField name="confidence" label="Confidence" placeholder="0.95" />
            <TextField name="method" label="Method" placeholder="optional" />
          </div>
        );

      case "factor-forecast":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SelectField name="model" label="Model" options={[
              { value: "static", label: "Static" },
              { value: "dynamic", label: "Dynamic" },
              { value: "gdfm", label: "GDFM" },
            ]} />
            <NumField name="nfactors" label="Number of Factors" placeholder="auto" min={1} />
            <NumField name="horizon" label="Horizon" placeholder="6" min={1} />
            <TextField name="ci_method" label="CI Method" placeholder="optional" />
            <NumField name="conf_level" label="Conf. Level" placeholder="0.95" />
            {(fields.model === "dynamic" || fields.model === "gdfm") && <NumField name="factor_lags" label="Factor Lags" placeholder="auto" min={1} />}
            {fields.model === "dynamic" && <TextField name="method" label="Method" placeholder="optional" />}
            {fields.model === "gdfm" && <NumField name="dynamic_rank" label="Dynamic Rank" placeholder="auto" min={1} />}
          </div>
        );

      case "nongaussian-fastica":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="method" label="Method" options={[
              { value: "fastica", label: "FastICA" },
              { value: "infomax", label: "Infomax" },
              { value: "jade", label: "JADE" },
              { value: "sobi", label: "SOBI" },
              { value: "dcov", label: "dCov" },
              { value: "hsic", label: "HSIC" },
            ]} />
            <SelectField name="contrast" label="Contrast" options={[
              { value: "logcosh", label: "LogCosh" },
              { value: "exp", label: "Exp" },
              { value: "kurtosis", label: "Kurtosis" },
            ]} />
          </div>
        );

      case "nongaussian-ml":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="distribution" label="Distribution" options={[
              { value: "student_t", label: "Student-t" },
              { value: "skew_t", label: "Skew-t" },
              { value: "ghd", label: "GHD" },
              { value: "mixture_normal", label: "Mixture Normal" },
              { value: "pml", label: "PML" },
              { value: "skew_normal", label: "Skew Normal" },
            ]} />
          </div>
        );

      case "nongaussian-heteroskedasticity":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="method" label="Method" options={[
              { value: "markov", label: "Markov Switching" },
              { value: "garch", label: "GARCH" },
              { value: "smooth_transition", label: "Smooth Transition" },
              { value: "external", label: "External" },
            ]} />
            <NumField name="regimes" label="Regimes" placeholder="2" min={2} max={5} />
          </div>
        );

      case "nongaussian-normality":
        return <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />;

      case "nongaussian-identifiability":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumField name="lags" label="Lags" placeholder="auto" min={1} max={24} />
            <SelectField name="test" label="Test" options={[
              { value: "strength", label: "Strength" },
              { value: "gaussianity", label: "Gaussianity" },
              { value: "independence", label: "Independence" },
              { value: "all", label: "All" },
              { value: "overidentification", label: "Over-identification" },
            ]} />
            <SelectField name="method" label="Method" options={[
              { value: "fastica", label: "FastICA" },
              { value: "infomax", label: "Infomax" },
              { value: "jade", label: "JADE" },
              { value: "sobi", label: "SOBI" },
              { value: "dcov", label: "dCov" },
              { value: "hsic", label: "HSIC" },
            ]} />
            <SelectField name="contrast" label="Contrast" options={[
              { value: "logcosh", label: "LogCosh" },
              { value: "exp", label: "Exp" },
              { value: "kurtosis", label: "Kurtosis" },
            ]} />
          </div>
        );

      default:
        return <p className="text-xs text-[var(--text-muted)]">No form available for this command.</p>;
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4">
      <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
        {label}
      </h4>

      {/* Dataset info */}
      {activeDataset && (
        <p className="text-[11px] text-[var(--text-muted)] mb-3">
          Dataset: {activeDataset.name} ({activeDataset.columns.join(", ")}) — {activeDataset.row_count} obs
        </p>
      )}

      {renderFields()}

      <button
        onClick={handleRun}
        disabled={loading || !fields.data}
        className="mt-4 flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[var(--accent)] text-[var(--text-on-accent)] rounded hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] md:min-h-0"
      >
        {loading && <LoadingSpinner size={14} />}
        {loading ? "Running..." : "Run"}
      </button>
    </div>
  );
}

// ── Entry renderers ─────────────────────────────────────────────────────────

function SystemEntry({ entry, onOption }: { entry: Extract<JournalEntry, { type: "system" }>; onOption: (opt: JournalOption) => void }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm text-[var(--text-secondary)] mb-3">{entry.text}</p>
      {entry.options && entry.options.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {entry.options.map((opt) => (
            <button
              key={opt.command}
              onClick={() => onOption(opt)}
              className="px-3 py-2 text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent)] transition-colors min-h-[44px] md:min-h-0"
              title={opt.description}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UserChoiceEntry({ entry }: { entry: Extract<JournalEntry, { type: "user-choice" }> }) {
  return (
    <div className="flex justify-end">
      <div className="px-4 py-2 bg-[var(--accent)] text-[var(--text-on-accent)] rounded-lg text-sm font-medium max-w-[85%] sm:max-w-xs">
        {entry.label}
      </div>
    </div>
  );
}

function ResultEntry({ entry }: { entry: Extract<JournalEntry, { type: "result" }> }) {
  const label = COMMAND_LABELS[entry.command] ?? entry.command;
  const chart = getChartForCommand(entry.command, entry.data);
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="max-w-full sm:max-w-3xl bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-[var(--success)] mb-2">
        {label} — Result
      </h4>

      {chart ? (
        <>
          <div className="h-[350px] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded">
            {chart.type === "irf" && <IRFChart data={chart.data} />}
            {chart.type === "fevd" && <FEVDChart data={chart.data} />}
            {chart.type === "hd" && <HDChart data={chart.data} />}
            {chart.type === "forecast" && <ForecastChart data={chart.data} />}
            {chart.type === "scree" && <ScreePlot data={chart.data} />}
          </div>
          <button
            onClick={() => setShowRaw((v) => !v)}
            className="flex items-center gap-1 mt-2 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            {showRaw ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Raw Data
          </button>
          {showRaw && (
            <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-mono max-h-60 overflow-auto bg-[var(--bg-primary)] border border-[var(--border-color)] rounded p-3 mt-1">
              {JSON.stringify(entry.data, null, 2)}
            </pre>
          )}
        </>
      ) : (
        <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-mono max-h-60 overflow-auto bg-[var(--bg-primary)] border border-[var(--border-color)] rounded p-3">
          {JSON.stringify(entry.data, null, 2)}
        </pre>
      )}

      <p className="text-[10px] text-[var(--text-muted)] mt-2">
        Auto-saved to Results
      </p>
    </div>
  );
}

function ErrorEntry({ entry }: { entry: Extract<JournalEntry, { type: "error" }> }) {
  return (
    <div className="max-w-2xl bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg p-4">
      <p className="text-sm text-[var(--error)]">{entry.message}</p>
    </div>
  );
}

// ── Main Journal Page ───────────────────────────────────────────────────────

export default function JournalPage() {
  const entries = useJournalStore((s) => s.entries);
  const addSystemMessage = useJournalStore((s) => s.addSystemMessage);
  const addUserChoice = useJournalStore((s) => s.addUserChoice);
  const addForm = useJournalStore((s) => s.addForm);
  const addResult = useJournalStore((s) => s.addResult);
  const addError = useJournalStore((s) => s.addError);
  const clearAll = useJournalStore((s) => s.clearAll);

  const addSavedResult = useResultStore((s) => s.addResult);
  const datasets = useProjectStore((s) => s.datasets);
  const setActivePage = useNavigationStore((s) => s.setActivePage);

  const hasData = datasets.length > 0;
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevHasData = useRef(hasData);

  // Initialize journal on first mount
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && entries.length === 0) {
      initialized.current = true;
      const flow = getInitialOptions(hasData);
      addSystemMessage(flow.message, flow.options);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When data becomes available (user imported on Data page), refresh the journal
  useEffect(() => {
    if (hasData && !prevHasData.current) {
      const flow = getInitialOptions(true);
      addSystemMessage(flow.message, flow.options);
    }
    prevHasData.current = hasData;
  }, [hasData, addSystemMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  const handleOption = useCallback(
    (opt: JournalOption) => {
      // Navigation commands
      if (opt.command === "__navigate_data") {
        setActivePage("data");
        return;
      }

      // Main menu
      if (opt.command === "__main_menu") {
        addUserChoice(opt.label);
        const flow = getInitialOptions(hasData);
        addSystemMessage(flow.message, flow.options);
        return;
      }

      // Sub-menu commands
      const subMenu = getSubMenu(opt.command);
      if (subMenu) {
        addUserChoice(opt.label);
        addSystemMessage(subMenu.message, subMenu.options);
        return;
      }

      // Actual command — show form
      addUserChoice(opt.label);
      addForm(opt.command);
    },
    [hasData, addUserChoice, addSystemMessage, addForm, setActivePage],
  );

  const handleFormComplete = useCallback(
    (command: string, params: Record<string, unknown>, result: unknown) => {
      const label = COMMAND_LABELS[command] ?? command;
      const resultId = addSavedResult({ command, label, params, data: result });
      addResult(command, result, resultId);

      // Show next steps
      const nextFlow = getNextSteps(command, result);
      addSystemMessage(nextFlow.message, nextFlow.options);
    },
    [addResult, addSavedResult, addSystemMessage],
  );

  const handleFormError = useCallback(
    (message: string) => {
      addError(message);
      // Offer to retry or go back
      addSystemMessage("Something went wrong. Would you like to try again?", [
        { label: "Main Menu", command: "__main_menu", description: "Back to main menu" },
      ]);
    },
    [addError, addSystemMessage],
  );

  const handleNewSession = useCallback(() => {
    clearAll();
    const flow = getInitialOptions(hasData);
    addSystemMessage(flow.message, flow.options);
  }, [clearAll, hasData, addSystemMessage]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Analysis Journal
        </h2>
        <button
          onClick={handleNewSession}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors min-h-[44px] md:min-h-0"
        >
          <RotateCcw size={12} />
          New Session
        </button>
      </div>

      {/* Chat-like entries */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {entries.map((entry) => {
          switch (entry.type) {
            case "system":
              return <SystemEntry key={entry.id} entry={entry} onOption={handleOption} />;
            case "user-choice":
              return <UserChoiceEntry key={entry.id} entry={entry} />;
            case "form":
              return (
                <CommandForm
                  key={entry.id}
                  command={entry.command}
                  entryId={entry.id}
                  onComplete={handleFormComplete}
                  onError={handleFormError}
                />
              );
            case "result":
              return <ResultEntry key={entry.id} entry={entry} />;
            case "error":
              return <ErrorEntry key={entry.id} entry={entry} />;
            default:
              return null;
          }
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
