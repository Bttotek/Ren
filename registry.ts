import { createElement, type ComponentType } from "react";
import { SpecCalculator } from "./spec-calculator";
import { TOOL_SPECS } from "@/lib/tool-specs";
import { BBSCalculator } from "./civil/bar-bending-schedule";
import { ConcreteCalculator } from "./civil/concrete-mortar";
import { BrickworkCalculator } from "./civil/brickwork";
import { PlasterCalculator } from "./civil/plastering";
import { ExcavationCalculator } from "./civil/excavation";
import { BeamCalculator } from "./civil/beam-concrete";
import { ColumnCalculator } from "./civil/column-concrete";
import { SlabCalculator } from "./civil/slab-concrete";
import { FootingCalculator } from "./civil/footing-concrete";
import {
  AreaValuationCalculator,
  ConstructionCostCalculator,
  EmiCalculator,
  LandConverter,
  RentalYieldCalculator,
  StampDutyCalculator,
} from "./realestate";

const REGISTRY: Record<string, ComponentType> = {
  "bar-bending-schedule": BBSCalculator,
  "concrete-mortar": ConcreteCalculator,
  brickwork: BrickworkCalculator,
  plastering: PlasterCalculator,
  excavation: ExcavationCalculator,
  "beam-concrete": BeamCalculator,
  "column-concrete": ColumnCalculator,
  "slab-concrete": SlabCalculator,
  "footing-concrete": FootingCalculator,
  "land-area-converter": LandConverter,
  "stamp-duty": StampDutyCalculator,
  "rental-yield": RentalYieldCalculator,
  "area-valuation": AreaValuationCalculator,
  "home-loan-emi": EmiCalculator,
  "construction-cost": ConstructionCostCalculator,
};

for (const spec of TOOL_SPECS) {
  if (!REGISTRY[spec.slug]) {
    REGISTRY[spec.slug] = () => createElement(SpecCalculator, { spec });
  }
}

export function getCalculator(slug: string): ComponentType | undefined {
  return REGISTRY[slug];
}
