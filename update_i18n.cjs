const fs = require('fs');

const esPath = '/Users/josesalcedo/app climavolt/src/i18n/es.json';
const enPath = '/Users/josesalcedo/app climavolt/src/i18n/en.json';

const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const esNewKeys = {
  "subscription_plans": "Planes de Suscripción",
  "free_plan": "Plan Gratis",
  "free_plan_desc": "Funciones básicas para empezar",
  "current_plan": "Actual",
  "recommended": "Recomendado",
  "pro_plan": "Plan Pro",
  "pro_plan_desc": "Todo ilimitado + IA y Soporte",
  "feature_unlimited_equipment": "Historial de equipos ilimitado",
  "feature_unlimited_clients": "Registro de clientes ilimitado",
  "feature_ai_diagnostics": "Diagnósticos con Inteligencia Artificial",
  "feature_pdf_generator": "Generador de presupuestos y facturas en PDF",
  "feature_estimate_history": "Historial de presupuestos",
  "feature_invoice_management": "Gestión de facturas (Pagadas / Pendientes)",
  "feature_error_codes": "Acceso a códigos de error exclusivos",
  "upgrade_to_pro": "Mejorar a Pro - US$ 9.99/mes",
  "technician": "Técnico"
};

const enNewKeys = {
  "subscription_plans": "Subscription Plans",
  "free_plan": "Free Plan",
  "free_plan_desc": "Basic features to get started",
  "current_plan": "Current",
  "recommended": "Recommended",
  "pro_plan": "Pro Plan",
  "pro_plan_desc": "Everything unlimited + AI & Support",
  "feature_unlimited_equipment": "Unlimited equipment history",
  "feature_unlimited_clients": "Unlimited client registry",
  "feature_ai_diagnostics": "Artificial Intelligence diagnostics",
  "feature_pdf_generator": "PDF estimate and invoice generator",
  "feature_estimate_history": "Estimates history",
  "feature_invoice_management": "Invoice management (Paid / Pending)",
  "feature_error_codes": "Access to exclusive error codes",
  "upgrade_to_pro": "Upgrade to Pro - US$ 9.99/month",
  "technician": "Technician"
};

fs.writeFileSync(esPath, JSON.stringify({ ...esData, ...esNewKeys }, null, 2));
fs.writeFileSync(enPath, JSON.stringify({ ...enData, ...enNewKeys }, null, 2));
console.log("i18n files updated");
