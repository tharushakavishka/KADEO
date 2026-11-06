"use client";
import { ShoppingBag, MessageCircle, Search, Heart, Truck, RotateCcw, ShieldCheck, Headphones, Shirt, Home, Sparkles, Activity, Gift, BookOpen, LayoutGrid, Star, Plus, Check, ArrowRight, ChevronRight, Mail, Menu, Phone, Clock, ExternalLink, Package, SlidersHorizontal, X, type LucideProps } from "lucide-react";
import { useStoreText } from "./StoreContent";
import { useState } from "react";
export const storeIcons = {ShoppingBag,MessageCircle,Search,Heart,Truck,RotateCcw,ShieldCheck,Headphones,Shirt,Home,Sparkles,Activity,Gift,BookOpen,LayoutGrid,Star,Plus,Check,ArrowRight,ChevronRight,Mail,Menu,Phone,Clock,ExternalLink,Package,SlidersHorizontal,X};
export function StoreIcon({name,...props}:LucideProps & {name:string}) {
 const t=useStoreText(); const choice=t(`icon:${name}`,name);
 const source=t(`icon-image:${name}`, "");
 const [failedSource,setFailedSource]=useState("");
 const Icon=storeIcons[choice as keyof typeof storeIcons] || storeIcons[name as keyof typeof storeIcons] || Package;
 const safeSource = source.length <= 2000 && (/^https:\/\//i.test(source) || /^\/uploads\/[a-zA-Z0-9/_-]+\.(png|jpg|webp)$/.test(source));
 if (safeSource && failedSource !== source) return <img src={source} alt="" aria-hidden="true" data-store-icon={name} className={props.className} width={props.width || props.size || 24} height={props.height || props.size || 24} style={{width:props.width || props.size || 24,height:props.height || props.size || 24,objectFit:"contain",flexShrink:0,display:"inline-block",...props.style}} onError={()=>setFailedSource(source)}/>;
 return <Icon {...props} data-store-icon={name}/>;
}
