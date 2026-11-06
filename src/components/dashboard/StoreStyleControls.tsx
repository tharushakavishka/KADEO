"use client";
import { customControls, styleAreas, type StyleArea } from "@/lib/store-custom-styles";
import s from "./StoreContentEditor.module.css";
import layouts from "@/lib/store-layout-options.json";

export function StoreStyleControls({ areaId, values, onChange, onReset }: { areaId: StyleArea; values: Record<string,string>; onChange: (key: string, value: string) => void; onReset: () => void }) {
  const area = styleAreas.find(area => area.id === areaId)!;
  const layout = layouts.find(item => item.area === areaId);
  return <div className={s.customStyles}>
    {layout && <fieldset className={s.layoutChoices}><legend>UI layout</legend>{layout.options.map(option=><label key={option.value}><input type="radio" name={`layout-${areaId}`} checked={(values[layout.key] || layout.default)===option.value} onChange={()=>onChange(layout.key,option.value)}/><span><strong>{option.label}</strong><small>{option.description}</small></span></label>)}<button type="button" onClick={()=>onChange(layout.key,layout.default)}>Reset layout</button></fieldset>}
    <details className={s.appearanceSettings} open={!layout}><summary>Colours & appearance<span>Colour, spacing, blur and shadow</span></summary>
    {customControls.map(control => {
      const key = `custom:${areaId}:${control.id}`;
      const fallback = control.id === "borderColor" ? "#ffffff" : control.id === "borderWidth" ? 1 : control.id === "shadow" ? 6 : area[control.id as keyof typeof area];
      const value = values[key] ?? String(fallback);
      return <label key={key}>{control.label}
        {control.type === "color" ? <div className={s.colorControl}><input type="color" aria-label={control.label} value={value} onChange={e=>onChange(key,e.target.value)}/><output>{value}</output></div>
          : <div className={s.rangeControl}><input type="range" aria-label={control.label} min={control.min} max={control.max} step={1} value={value} onChange={e=>onChange(key,e.target.value)}/><output>{value}{control.unit}</output></div>}
      </label>;
    })}
    <button type="button" onClick={onReset}>Reset appearance</button></details><p className={s.settingsNote}>Changes stay in your draft until you publish.</p>
  </div>;
}
