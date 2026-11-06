"use client";
import fields from "@/lib/store-hero-visibility.json";
import s from "./StoreContentEditor.module.css";
export function HeroVisibilityControls({values,onChange}:{values:Record<string,string>;onChange:(changes:Record<string,string|undefined>)=>void}) {
 const hidden=fields.filter(field=>values[field.key]==="hidden").length;
 return <details className={s.heroVisibility}><summary><span><strong>Hero section visibility</strong><small>Show or hide text, buttons and cards</small></span><span>{hidden ? `${hidden} hidden` : "All shown"}</span></summary><p>Hidden content stays saved. Switch it back on whenever you need it, then publish.</p><div className={s.visibilityGrid}>{fields.map(field=>{
 const parentHidden=values["visibility:hero:content"]==="hidden" && !["visibility:hero:content","visibility:hero:note"].includes(field.key);
 return <label key={field.key}><span>{field.label}{parentHidden && <small>Main text card is hidden</small>}</span><input type="checkbox" role="switch" aria-label={`Show ${field.label.toLowerCase()}`} checked={values[field.key]!=="hidden"} disabled={parentHidden} onChange={e=>onChange({[field.key]:e.target.checked?undefined:"hidden"})}/></label>;
 })}</div><button type="button" onClick={()=>onChange(Object.fromEntries(fields.map(field=>[field.key,undefined])))}>Show all hero content</button></details>;
}
