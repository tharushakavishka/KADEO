"use client";
import icons from "@/lib/store-icons.json";
import { storeIcons, StoreIcon } from "../storefront/StoreIcon";
import { StoreContent } from "../storefront/StoreContent";
import s from "./StoreContentEditor.module.css";

export function StoreIconEditor({name,values,busy,onChange,onUpload}:{name:string;values:Record<string,string>;busy:boolean;onChange:(changes:Record<string,string|undefined>)=>void;onUpload:(file:File)=>void}) {
 const imageKey=`icon-image:${name}`, libraryKey=`icon:${name}`;
 return <fieldset className={s.customIconEditor} disabled={busy}>
   <p>Use your own image or choose an icon below. This updates every {name} icon in your store.</p>
   <div className={s.customIconPreview}><StoreContent values={values}><StoreIcon name={name} size={36}/></StoreContent><span>Current icon<small>Preview before publishing</small></span></div>
   <label>Upload your icon<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.target.files?.[0];if(file)onUpload(file);e.target.value="";}}/></label>
   <p>PNG, JPEG or WebP, up to 4 MB. A square transparent PNG works best.</p>
   <label>Or paste an icon image link<input type="url" aria-label="Custom icon image URL" maxLength={2000} placeholder="https://example.com/icon.png" value={values[imageKey] || ""} onChange={e=>onChange({[imageKey]:e.target.value.trim() || undefined})}/></label>
   <p>Use a direct HTTPS image link. If it cannot load, your library icon appears instead.</p>
   {values[imageKey] && <button type="button" onClick={()=>onChange({[imageKey]:undefined})}>Remove custom image</button>}
   <h3 className={s.iconLibraryHeading}>Icon library</h3>
   <div className={s.iconGrid}>{icons.map(icon=>{const Icon=storeIcons[icon as keyof typeof storeIcons];return <button type="button" key={icon} aria-label={`Use ${icon} icon`} aria-pressed={!values[imageKey] && (values[libraryKey] || name)===icon} onClick={()=>onChange({[libraryKey]:icon,[imageKey]:undefined})}><Icon size={22}/><small>{icon}</small></button>;})}</div>
   <button type="button" onClick={()=>onChange({[libraryKey]:undefined,[imageKey]:undefined})}>Reset icon</button>
 </fieldset>;
}
