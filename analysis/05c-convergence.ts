#!/usr/bin/env bun
/**
 * Phase 5C: Triple-Anchor Convergence Analysis
 *
 * For each Phase 5C pair x model, computes:
 * - Positional convergence profiles (7-waypoint forward vs reverse mirror-match)
 * - W-shape contrast statistic (bridge creates third anchor point)
 * - Bridge-present vs bridge-absent W-shape comparison
 * - Bridge-variable natural experiment (music -> mathematics)
 * - Gemini-specific U-shape vs W-shape analysis (tree -> ecosystem)
 *
 * Loads data from:
 *   results/convergence/   (Phase 5C forward + reverse 7-waypoint runs)
 *
 * Usage:
 *   bun run analysis/05c-convergence.ts
 *   bun run analysis/05c-convergence.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  seededRandom,
  computePositionalConvergence,
  computeWShapeContrast,
  bootstrapCI,
  mean,
} from "../metrics.ts";
import { MODELS } from "../pairs.ts";
import { PHASE5C_PAIRS } from "../triples-phase5.ts";
import type {
  ConvergenceAnalysisOutput,
  ConvergenceProfileMetrics,
  Phase5ConvergencePair,
  ElicitationResult,
} from "../types.ts";

// ── Data Loading ───────────────────────────────────────────────────

async function readJsonFilesRecursive(dir: string): Promise<string[]> {
  const paths: string[] = [];
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return paths;
  }
  for (const name of names) {
    const fullPath = join(dir, name);
    let info;
    try {
      info = await stat(fullPath);
    } catch {
      continue;
    }
    if (info.isDirectory()) {
      paths.push(...(await readJsonFilesRecursive(fullPath)));
    } else if (info.isFile() && name.endsWith(".json")) {
      if (name.includes("summary") || name.includes("status")) continue;
      paths.push(fullPath);
    }
  }
  return paths;
}

async function loadResultsFromDir(dir: string): Promise<ElicitationResult[]> {
  const jsonPaths = await readJsonFilesRecursive(dir);
  const results: ElicitationResult[] = [];
  for (const p of jsonPaths) {
    try {
      const content = await readFile(p, "utf-8");
      const parsed = JSON.parse(content) as ElicitationResult;
      if (
        parsed.model &&
        parsed.pair &&
        Array.isArray(parsed.canonicalizedWaypoints)
      ) {
        results.push(parsed);
      }
    } catch {
      // Skip malformed
    }
  }
  return results;
}

/**
 * Build a lookup: pairId::modelId -> ElicitationResult[] (successful runs only).
 */
function buildWaypointLookup(
  results: ElicitationResult[],
): Map<string, ElicitationResult[]> {
  const lookup = new Map<string, ElicitationResult[]>();
  for (const r of results) {
    if (r.failureMode) continue;
    if (r.canonicalizedWaypoints.length === 0) continue;
    const key = `${r.pair.id}::${r.modelShortId}`;
    if (!lookup.has(key)) lookup.set(key, []);
    lookup.get(key)!.push(r);
  }
  return lookup;
}

/**
 * Extract just the waypoint arrays from results.
 */
function waypointsOnly(results: ElicitationResult[]): string[][] {
  return results.map((r) => r.canonicalizedWaypoints);
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: ConvergenceAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 5C: Triple-Anchor Convergence Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // ── 1. Experiment Overview ──────────────────────────────────────
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Pairs analyzed:** ${output.metadata.pairs.length}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **Waypoint count:** ${output.metadata.waypointCount}`);
  lines.push(`- **Total runs loaded:** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Profile entries:** ${output.profiles.length}`);
  lines.push("");

  // ── 2. Per-Pair Convergence Profiles ────────────────────────────
  lines.push("## 2. Per-Pair Convergence Profiles");
  lines.push("");

  // Build position headers
  const posHeaders: string[] = [];
  for (let i = 1; i <= output.metadata.waypointCount; i++) {
    posHeaders.push(`P${i}`);
  }

  lines.push(
    `| Pair | Model | ${posHeaders.join(" | ")} | W-Shape Contrast |`,
  );
  lines.push(
    `|------|-------|${posHeaders.map(() => "----").join("|")}|-----------------|`,
  );

  // Group profiles by pair for readability
  for (const pair of PHASE5C_PAIRS) {
    const pairProfiles = output.profiles.filter(
      (p) => p.pairId === pair.id,
    );
    for (const profile of pairProfiles) {
      const posValues = profile.perPositionMatchRate
        .map((v) => v.toFixed(3))
        .join(" | ");
      lines.push(
        `| ${profile.pairId} | ${profile.modelId} | ${posValues} | ${profile.wShapeContrast.toFixed(4)} |`,
      );
    }
  }
  lines.push("");

  // ── 3. W-Shape Detection ───────────────────────────────────────
  lines.push("## 3. W-Shape Detection");
  lines.push("");

  const ws = output.wShapeComparison;
  lines.push(`- **Bridge-present mean W-shape contrast:** ${ws.bridgePresentMeanContrast.toFixed(4)}`);
  lines.push(`  - 95% CI: [${ws.bridgePresentContrastCI[0].toFixed(4)}, ${ws.bridgePresentContrastCI[1].toFixed(4)}]`);
  lines.push(`- **Bridge-absent mean W-shape contrast:** ${ws.bridgeAbsentMeanContrast.toFixed(4)}`);
  lines.push(`  - 95% CI: [${ws.bridgeAbsentContrastCI[0].toFixed(4)}, ${ws.bridgeAbsentContrastCI[1].toFixed(4)}]`);
  lines.push(`- **Difference (present - absent):** ${ws.difference.toFixed(4)}`);
  lines.push(`  - 95% CI: [${ws.differenceCI[0].toFixed(4)}, ${ws.differenceCI[1].toFixed(4)}]`);
  lines.push(`- **Significantly positive:** ${ws.significantlyPositive ? "YES" : "NO"}`);
  lines.push("");

  if (ws.significantlyPositive) {
    lines.push(
      "**W-shape confirmed:** Bridge-present pairs show significantly higher W-shape contrast " +
        "than bridge-absent pairs, consistent with the triple-anchor hypothesis. The bridge " +
        "concept creates a third convergence point at the middle waypoint position.",
    );
  } else {
    lines.push(
      "**W-shape not confirmed:** The difference in W-shape contrast between bridge-present " +
        "and bridge-absent pairs is not statistically significant. The 95% CI on the " +
        "difference includes zero.",
    );
  }
  lines.push("");

  // ── 4. Bridge-Variable Natural Experiment ──────────────────────
  lines.push("## 4. Bridge-Variable Natural Experiment");
  lines.push("");

  const bv = output.bridgeVariableAnalysis;
  if (bv) {
    lines.push(`**Pair:** ${bv.pairId} (music -> mathematics)`);
    lines.push("");
    lines.push("| Model | W-Shape Contrast | Has Bridge? |");
    lines.push("|-------|-----------------|-------------|");

    for (const pm of bv.perModel) {
      lines.push(
        `| ${pm.modelId} | ${pm.wShapeContrast.toFixed(4)} | ${pm.hasBridge ? "YES" : "NO"} |`,
      );
    }
    lines.push("");

    // Compute bridge vs no-bridge means for the variable pair
    const bridgeModels = bv.perModel.filter((pm) => pm.hasBridge);
    const noBridgeModels = bv.perModel.filter((pm) => !pm.hasBridge);

    if (bridgeModels.length > 0 && noBridgeModels.length > 0) {
      const bridgeMean = mean(bridgeModels.map((pm) => pm.wShapeContrast));
      const noBridgeMean = mean(noBridgeModels.map((pm) => pm.wShapeContrast));
      lines.push(
        `- **Models with bridge (claude, grok) mean contrast:** ${bridgeMean.toFixed(4)}`,
      );
      lines.push(
        `- **Models without bridge (gpt, gemini) mean contrast:** ${noBridgeMean.toFixed(4)}`,
      );
      lines.push(
        `- **Difference:** ${(bridgeMean - noBridgeMean).toFixed(4)}`,
      );
      lines.push("");

      if (bridgeMean > noBridgeMean) {
        lines.push(
          "Models expected to discover a 'harmony' bridge show higher W-shape contrast " +
            "than models without the bridge, consistent with the triple-anchor hypothesis.",
        );
      } else {
        lines.push(
          "Contrary to prediction, models without the expected bridge do not show lower " +
            "W-shape contrast. The bridge-variable natural experiment does not support " +
            "the triple-anchor hypothesis for this pair.",
        );
      }
    }
  } else {
    lines.push("_No bridge-variable pair data available._");
  }
  lines.push("");

  // ── 5. Gemini-Specific Analysis ────────────────────────────────
  lines.push("## 5. Gemini-Specific Analysis");
  lines.push("");
  lines.push("**Pair: tree -> ecosystem** (Gemini not expected to produce 'forest' bridge)");
  lines.push("");

  const treeEcoPair = PHASE5C_PAIRS.find((p) => p.id === "p5c-tree-ecosystem");
  if (treeEcoPair) {
    const treeEcoProfiles = output.profiles.filter(
      (p) => p.pairId === "p5c-tree-ecosystem",
    );

    if (treeEcoProfiles.length > 0) {
      lines.push("| Model | W-Shape Contrast | Expected Pattern |");
      lines.push("|-------|-----------------|------------------|");

      for (const profile of treeEcoProfiles) {
        const isGemini = profile.modelId === "gemini";
        const expectedPattern = isGemini ? "U-shape (no bridge)" : "W-shape (bridge)";
        lines.push(
          `| ${profile.modelId} | ${profile.wShapeContrast.toFixed(4)} | ${expectedPattern} |`,
        );
      }
      lines.push("");

      const geminiProfile = treeEcoProfiles.find((p) => p.modelId === "gemini");
      const otherProfiles = treeEcoProfiles.filter((p) => p.modelId !== "gemini");

      if (geminiProfile && otherProfiles.length > 0) {
        const otherMeanContrast = mean(otherProfiles.map((p) => p.wShapeContrast));
        lines.push(
          `- **Gemini W-shape contrast:** ${geminiProfile.wShapeContrast.toFixed(4)}`,
        );
        lines.push(
          `- **Other models mean W-shape contrast:** ${otherMeanContrast.toFixed(4)}`,
        );

        if (geminiProfile.wShapeContrast < otherMeanContrast) {
          lines.push(
            "\nGemini shows lower W-shape contrast (closer to U-shape) compared to other models, " +
              "consistent with Phase 4 findings that Gemini does not reliably produce the 'forest' bridge.",
          );
        } else {
          lines.push(
            "\nContrary to prediction, Gemini does not show lower W-shape contrast than other models " +
              "on this pair.",
          );
        }
      }
    } else {
      lines.push("_No tree -> ecosystem profile data available._");
    }
  }
  lines.push("");

  // ── 6. Predictions Summary ─────────────────────────────────────
  lines.push("## 6. Predictions Summary");
  lines.push("");
  lines.push("| Prediction | Result |");
  lines.push("|------------|--------|");

  // P1: Bridge-present > bridge-absent W-shape
  lines.push(
    `| Bridge-present pairs have higher W-shape contrast than bridge-absent | ${ws.significantlyPositive ? "CONFIRMED" : "NOT CONFIRMED"} |`,
  );

  // P2: Bridge-variable natural experiment
  if (bv) {
    const bridgeModels = bv.perModel.filter((pm) => pm.hasBridge);
    const noBridgeModels = bv.perModel.filter((pm) => !pm.hasBridge);
    if (bridgeModels.length > 0 && noBridgeModels.length > 0) {
      const bridgeMean = mean(bridgeModels.map((pm) => pm.wShapeContrast));
      const noBridgeMean = mean(noBridgeModels.map((pm) => pm.wShapeContrast));
      lines.push(
        `| music->mathematics: bridge-models show higher W-shape | ${bridgeMean > noBridgeMean ? "CONFIRMED" : "NOT CONFIRMED"} |`,
      );
    }
  }

  // P3: Gemini U-shape on tree->ecosystem
  const geminiTreeProfile = output.profiles.find(
    (p) => p.pairId === "p5c-tree-ecosystem" && p.modelId === "gemini",
  );
  const otherTreeProfiles = output.profiles.filter(
    (p) => p.pairId === "p5c-tree-ecosystem" && p.modelId !== "gemini",
  );
  if (geminiTreeProfile && otherTreeProfiles.length > 0) {
    const otherMean = mean(otherTreeProfiles.map((p) => p.wShapeContrast));
    lines.push(
      `| Gemini shows U-shape (lower contrast) on tree->ecosystem | ${geminiTreeProfile.wShapeContrast < otherMean ? "CONFIRMED" : "NOT CONFIRMED"} |`,
    );
  }

  // P4: No-bridge-control has near-zero contrast
  const controlProfiles = output.profiles.filter(
    (p) => {
      const pair = PHASE5C_PAIRS.find((cp) => cp.id === p.pairId);
      return pair?.pairType === "no-bridge-control";
    },
  );
  if (controlProfiles.length > 0) {
    const controlMean = mean(controlProfiles.map((p) => p.wShapeContrast));
    lines.push(
      `| No-bridge-control pairs show near-zero W-shape contrast | ${Math.abs(controlMean) < 0.05 ? "CONFIRMED" : "NOT CONFIRMED"} (mean: ${controlMean.toFixed(4)}) |`,
    );
  }

  lines.push("");

  return lines.join("\n");
}

// ── Main Pipeline ───────────────────────────────────────────────────

async function analyze(opts: {
  input: string;
  output: string;
  findings: string;
}): Promise<void> {
  const inputDir = resolve(opts.input);
  const outputDir = resolve(opts.output);
  const findingsPath = resolve(opts.findings);

  setMetricsSeed(42);

  console.log(
    "Conceptual Topology Mapping Benchmark - Triple-Anchor Convergence Analysis",
  );
  console.log(
    "===========================================================================",
  );
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data ─────────────────────────────────────────────────────

  console.log("Loading convergence data...");

  const convergenceDir = join(inputDir, "convergence");
  const allResults = await loadResultsFromDir(convergenceDir);
  console.log(`  Loaded ${allResults.length} results from ${convergenceDir}/`);
  console.log("");

  // Build lookup: pairId::modelId -> results[]
  const lookup = buildWaypointLookup(allResults);
  console.log(`  Lookup keys: ${lookup.size}`);
  console.log("");

  // ── Compute convergence profiles per pair x model ──────────────────

  const WAYPOINT_COUNT = 7;
  const modelIds = MODELS.map((m) => m.id);

  console.log("Computing convergence profiles...");
  const profiles: ConvergenceProfileMetrics[] = [];

  for (const pair of PHASE5C_PAIRS) {
    for (const modelId of modelIds) {
      const fwdKey = `${pair.id}--fwd::${modelId}`;
      const revKey = `${pair.id}--rev::${modelId}`;

      const fwdResults = lookup.get(fwdKey) ?? [];
      const revResults = lookup.get(revKey) ?? [];

      if (fwdResults.length === 0 || revResults.length === 0) {
        console.log(
          `  SKIP ${pair.id} (${modelId}): missing directions — fwd:${fwdResults.length} rev:${revResults.length}`,
        );
        continue;
      }

      const fwdWaypoints = waypointsOnly(fwdResults);
      const revWaypoints = waypointsOnly(revResults);

      // Compute positional convergence with waypointCount=7
      const convergence = computePositionalConvergence(
        pair.id,
        modelId,
        fwdWaypoints,
        revWaypoints,
        WAYPOINT_COUNT,
      );

      // Compute W-shape contrast on the per-position match rates
      const wShapeContrast = computeWShapeContrast(convergence.perPositionMatchRate);

      const profile: ConvergenceProfileMetrics = {
        pairId: pair.id,
        modelId,
        direction: "forward", // Profile is computed from fwd vs rev comparison
        perPositionMatchRate: convergence.perPositionMatchRate,
        wShapeContrast,
        runCount: fwdResults.length + revResults.length,
      };

      profiles.push(profile);

      console.log(
        `  ${pair.id} (${modelId}): wContrast=${wShapeContrast.toFixed(4)} ` +
          `runs=${fwdResults.length}fwd+${revResults.length}rev ` +
          `midMatch=${convergence.perPositionMatchRate[3]?.toFixed(3) ?? "N/A"}`,
      );
    }
  }

  console.log("");
  console.log(`Computed ${profiles.length} convergence profiles`);
  console.log("");

  // ── Aggregate: W-shape comparison (bridge-present vs bridge-absent) ──

  console.log("Computing W-shape comparison...");

  // Categorize profiles by pair type
  // For bridge-present pairs, only include models that are expected to have the bridge
  // (e.g., tree→ecosystem excludes Gemini since bridgeModels = ["claude", "gpt", "grok"])
  const bridgePresentPairs = PHASE5C_PAIRS.filter((p) => p.pairType === "bridge-present");
  const bridgeAbsentPairIds = new Set(
    PHASE5C_PAIRS.filter((p) => p.pairType === "bridge-absent").map((p) => p.id),
  );

  const bridgePresentContrasts = profiles
    .filter((p) => {
      const pair = bridgePresentPairs.find((bp) => bp.id === p.pairId);
      if (!pair) return false;
      // If bridgeModels is specified, only include listed models
      if (pair.bridgeModels && pair.bridgeModels.length > 0) {
        return pair.bridgeModels.includes(p.modelId);
      }
      return true; // No restriction — all models expected to have bridge
    })
    .map((p) => p.wShapeContrast);

  const bridgeAbsentContrasts = profiles
    .filter((p) => bridgeAbsentPairIds.has(p.pairId))
    .map((p) => p.wShapeContrast);

  const bridgePresentMeanContrast = mean(bridgePresentContrasts);
  const bridgePresentContrastCI = bootstrapCI(bridgePresentContrasts);

  const bridgeAbsentMeanContrast = mean(bridgeAbsentContrasts);
  const bridgeAbsentContrastCI = bootstrapCI(bridgeAbsentContrasts);

  // Difference with bootstrapped CI
  const difference = bridgePresentMeanContrast - bridgeAbsentMeanContrast;

  // Bootstrap CI on the difference by resampling both groups
  const allBridgePresent = [...bridgePresentContrasts];
  const allBridgeAbsent = [...bridgeAbsentContrasts];
  let differenceCI: [number, number] = [0, 0];

  if (allBridgePresent.length > 0 && allBridgeAbsent.length > 0) {
    const nBootstrap = 1000;
    const bootstrapDiffs: number[] = [];

    for (let i = 0; i < nBootstrap; i++) {
      // Resample bridge-present contrasts
      const samplePresent: number[] = [];
      for (let j = 0; j < allBridgePresent.length; j++) {
        samplePresent.push(allBridgePresent[Math.floor(seededRandom() * allBridgePresent.length)]);
      }
      // Resample bridge-absent contrasts
      const sampleAbsent: number[] = [];
      for (let j = 0; j < allBridgeAbsent.length; j++) {
        sampleAbsent.push(allBridgeAbsent[Math.floor(seededRandom() * allBridgeAbsent.length)]);
      }
      bootstrapDiffs.push(mean(samplePresent) - mean(sampleAbsent));
    }

    bootstrapDiffs.sort((a, b) => a - b);
    differenceCI = [
      bootstrapDiffs[Math.floor(nBootstrap * 0.025)],
      bootstrapDiffs[Math.floor(nBootstrap * 0.975)],
    ];
  }

  // Significant if CI excludes zero
  const significantlyPositive = differenceCI[0] > 0;

  console.log(`  Bridge-present mean contrast: ${bridgePresentMeanContrast.toFixed(4)} [${bridgePresentContrastCI[0].toFixed(4)}, ${bridgePresentContrastCI[1].toFixed(4)}]`);
  console.log(`  Bridge-absent mean contrast:  ${bridgeAbsentMeanContrast.toFixed(4)} [${bridgeAbsentContrastCI[0].toFixed(4)}, ${bridgeAbsentContrastCI[1].toFixed(4)}]`);
  console.log(`  Difference:                   ${difference.toFixed(4)} [${differenceCI[0].toFixed(4)}, ${differenceCI[1].toFixed(4)}]`);
  console.log(`  Significantly positive:       ${significantlyPositive}`);
  console.log("");

  // ── Bridge-Variable Analysis (music -> mathematics) ────────────────

  console.log("Computing bridge-variable analysis (music -> mathematics)...");

  const musicMathPair = PHASE5C_PAIRS.find((p) => p.id === "p5c-music-mathematics");
  let bridgeVariableAnalysis: ConvergenceAnalysisOutput["bridgeVariableAnalysis"] = null;

  if (musicMathPair) {
    const musicMathProfiles = profiles.filter((p) => p.pairId === "p5c-music-mathematics");

    if (musicMathProfiles.length > 0) {
      const bridgeModelIds = new Set(musicMathPair.bridgeModels ?? []);

      const perModel = musicMathProfiles.map((p) => ({
        modelId: p.modelId,
        wShapeContrast: p.wShapeContrast,
        hasBridge: bridgeModelIds.has(p.modelId),
      }));

      bridgeVariableAnalysis = {
        pairId: "p5c-music-mathematics",
        perModel,
      };

      for (const pm of perModel) {
        console.log(
          `  ${pm.modelId}: wContrast=${pm.wShapeContrast.toFixed(4)} bridge=${pm.hasBridge}`,
        );
      }
    } else {
      console.log("  No data for music -> mathematics");
    }
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: ConvergenceAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      pairs: PHASE5C_PAIRS.map((p) => p.id),
      models: MODELS.map((m) => m.id),
      waypointCount: WAYPOINT_COUNT,
      totalNewRuns: allResults.length,
    },
    profiles,
    wShapeComparison: {
      bridgePresentMeanContrast,
      bridgePresentContrastCI,
      bridgeAbsentMeanContrast,
      bridgeAbsentContrastCI,
      difference,
      differenceCI,
      significantlyPositive,
    },
    bridgeVariableAnalysis,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "convergence-metrics.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(
    0,
    findingsPath.lastIndexOf("/"),
  );
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Triple-anchor convergence analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("convergence-analysis")
    .description(
      "Analyze triple-anchor convergence profiles across Phase 5C concept pairs",
    )
    .option("--input <dir>", "base results directory", "results")
    .option(
      "--output <dir>",
      "output directory for analysis JSON",
      "results/analysis",
    )
    .option(
      "--findings <path>",
      "path for findings markdown output",
      "findings/05c-convergence.md",
    );

  program.parse();
  const opts = program.opts();

  analyze({
    input: opts.input,
    output: opts.output,
    findings: opts.findings,
  }).catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
