"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  MessageCircle,
  Package,
  Image as ImageIcon,
  Truck,
  Store,
  Pencil,
  Plus,
  Settings,
  Rocket,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import styles from "./OnboardingChecklist.module.css";

export interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  href: string;
  actionText: string;
}

export interface LowStockItem {
  id: string;
  name: string;
  stock_quantity: number;
}

export interface OnboardingChecklistProps {
  shopName: string;
  shopSlug: string;
  steps: ChecklistStep[];
  lowStockItems?: LowStockItem[];
}

export function OnboardingChecklist({
  steps,
}: OnboardingChecklistProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kadeo_checklist_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // localStorage may be disabled
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("kadeo_checklist_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const getStepIcon = (id: string, completed: boolean) => {
    switch (id) {
      case "whatsapp":
        return <MessageCircle className="w-5 h-5" />;
      case "product":
        return <Package className="w-5 h-5" />;
      case "photos":
        return <ImageIcon className="w-5 h-5" />;
      case "delivery":
        return <Truck className="w-5 h-5" />;
      case "branding":
        return <Store className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getActionIcon = (id: string, completed: boolean) => {
    switch (id) {
      case "whatsapp":
      case "branding":
        return <Pencil className="w-3.5 h-3.5" />;
      case "product":
        return <Plus className="w-3.5 h-3.5" />;
      case "photos":
        return <ImageIcon className="w-3.5 h-3.5" />;
      case "delivery":
        return <Settings className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.checklistCard} ${collapsed ? styles.checklistCardCollapsed : ""}`}>
      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span className={styles.badge}>
              <Rocket className="w-3.5 h-3.5 text-emerald-600" />
              <span>STORE SETUP CHECKLIST</span>
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#059669",
                background: "#ecfdf5",
                padding: "2px 8px",
                borderRadius: "9999px",
                border: "1px solid #a7f3d0",
              }}
            >
              {completedCount}/{totalCount} Completed ({percentage}%)
            </span>
          </div>

          <h2 className={styles.title}>
            {collapsed ? "Store Setup Progress" : "Complete Your Store Launch Setup"}
          </h2>
          <p className={styles.subtitle}>
            {collapsed
              ? `${completedCount} of ${totalCount} steps verified. Click expand to manage steps or policies.`
              : "Follow these verified setup steps to prepare your WhatsApp catalog for customers."}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 10 }}>
          <button
            type="button"
            onClick={toggleCollapsed}
            className={styles.collapseToggleBtn}
            title={collapsed ? "Expand checklist steps" : "Minimize checklist to save screen space"}
          >
            {collapsed ? (
              <>
                <span>Expand Steps</span>
                <ChevronDown size={15} />
              </>
            ) : (
              <>
                <span>Minimize</span>
                <ChevronUp size={15} />
              </>
            )}
          </button>
        </div>

        {/* 3D Clipboard & Target illustration (only if not collapsed) */}
        {!collapsed && (
          <img
            src="/images/dashboard-checklist-target.png"
            alt="Target Checklist"
            className={styles.targetArt}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
        )}
      </div>

      {/* Progress Bar Strip */}
      <div className={`${styles.progressContainer} ${collapsed ? styles.progressContainerCompact : ""}`}>
        <div className={styles.progressHeader}>
          <div className={styles.progressLabel}>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {completedCount} of {totalCount} steps completed
            </span>
          </div>
          <span className={styles.progressPercent}>{percentage}%</span>
        </div>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* 5 Step Items List (hidden if collapsed) */}
      {!collapsed && (
        <div className={styles.stepsList}>
          {steps.map((step) => {
            const isPending = !step.completed;
            const isPurpleHighlight = isPending && step.id === "delivery";

            return (
              <div
                key={step.id}
                className={`${styles.stepItem} ${
                  isPurpleHighlight ? styles.stepItemPendingHighlight : ""
                }`}
              >
                <div className={styles.stepLeft}>
                  {/* Category Icon box (WhatsApp, Product, Photo, Truck, Store) */}
                  <div
                    className={`${styles.stepCategoryIcon} ${
                      isPurpleHighlight
                        ? styles.stepCategoryIconPurple
                        : styles.stepCategoryIconGreen
                    }`}
                  >
                    {getStepIcon(step.id, step.completed)}
                  </div>

                  {/* Status Indicator */}
                  <div className={styles.statusCheck}>
                    {step.completed ? (
                      <CheckCircle2 className={`w-5 h-5 ${styles.statusDone}`} />
                    ) : (
                      <Circle className={`w-5 h-5 stroke-[2.2] ${styles.statusPending}`} />
                    )}
                  </div>

                  {/* Step info */}
                  <div className={styles.stepInfo}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDesc}>{step.description}</p>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={step.href}
                  className={isPurpleHighlight ? styles.btnPurple : styles.btnSecondary}
                >
                  {getActionIcon(step.id, step.completed)}
                  <span>{step.actionText}</span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
