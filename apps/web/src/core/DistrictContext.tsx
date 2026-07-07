import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface DistrictInfo {
  id: number;
  slug: string;
  name: string;
  province: string;
  department: string;
  centerLat?: number | null;
  centerLng?: number | null;
  defaultZoom?: number | null;
  isActive: boolean;
}

interface DistrictContextValue {
  currentDistrictId: number | null;
  currentDistrict: string;
  province: string;
  department: string;
  districtInfo: DistrictInfo | null;
  districts: DistrictInfo[];
  setDistrict: (slug: string) => void;
  locatedDistrict: DistrictInfo | null;
  manualDistrict: DistrictInfo | null;
  availableDistricts: DistrictInfo[];
  setManualDistrict: (slug: string) => void;
  detectingLocation: boolean;
  isLocked: boolean;
  needsSelection: boolean;
  isLocationApproximate: boolean;
}

const DistrictContext = createContext<DistrictContextValue | null>(null);

const LS_LEGACY = "radarvecinal_district_slug";

export function DistrictProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [districts, setDistricts] = useState<DistrictInfo[]>([]);
  const [locatedDistrict, setLocatedDistrict] = useState<DistrictInfo | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(true);
  const [isLocationApproximate, setIsLocationApproximate] = useState(false);
  const [manualSlug, setManualSlug] = useState<string | null>(() => {
    return localStorage.getItem(LS_LEGACY);
  });
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/districts")
      .then(res => res.json())
      .then(data => {
        setDistricts(data.districts ?? []);
      })
      .catch(() => {
        setDistricts([]);
      });
  }, []);

  const setDistrict = (slug: string) => {
    localStorage.setItem(LS_LEGACY, slug);
    setActiveSlug(slug);
  };

  const setManualDistrict = (slug: string) => {
    setManualSlug(slug);
    setDistrict(slug);
  };

  const activeDistrict = useMemo(() => {
    if (!activeSlug && !locatedDistrict && districts.length === 0) return null;
    const slug = activeSlug || locatedDistrict?.slug || (districts.length > 0 ? districts[0].slug : null);
    if (!slug) return null;
    return districts.find(d => d.slug === slug) ?? null;
  }, [activeSlug, locatedDistrict, districts]);

  const value: DistrictContextValue = {
    currentDistrictId: activeDistrict?.id ?? null,
    currentDistrict: activeDistrict?.name ?? "",
    province: activeDistrict?.province ?? "",
    department: activeDistrict?.department ?? "",
    districtInfo: activeDistrict ?? null,
    districts,
    setDistrict,
    locatedDistrict,
    manualDistrict: manualSlug ? districts.find(d => d.slug === manualSlug) ?? null : null,
    availableDistricts: districts.slice(0, 2),
    setManualDistrict,
    detectingLocation,
    isLocked: !!user && ["admin", "moderator"].includes(user.role),
    needsSelection: !activeDistrict && !detectingLocation,
    isLocationApproximate,
  };

  return (
    <DistrictContext.Provider value={value}>
      {children}
    </DistrictContext.Provider>
  );
}

export function useDistrict() {
  const ctx = useContext(DistrictContext);
  if (!ctx) throw new Error("useDistrict must be used inside DistrictProvider");
  return ctx;
}
