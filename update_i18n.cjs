const fs = require('fs');

const esPath = '/Users/josesalcedo/app climavolt/src/i18n/es.json';
const enPath = '/Users/josesalcedo/app climavolt/src/i18n/en.json';

const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const esNewKeys = {
  "create_post": "Crear Post",
  "search_community": "Buscar consultas, marcas o errores...",
  "no_posts_found": "No se encontraron publicaciones.",
  "create_post_title": "Crear Publicación",
  "category": "Categoría",
  "content": "Contenido",
  "post_placeholder": "Escribe tu consulta, tip o recomendación aquí...",
  "cancel": "Cancelar",
  "publish": "Publicar",
  "tag_all": "Todos",
  "tag_doubts": "Dudas",
  "tag_tips": "Tips",
  "tag_tools": "Herramientas",
  "tag_spare_parts": "Repuestos",
  "just_now": "Justo ahora",
  "technician_you": "Técnico (Tú)",
  "post_1_time": "Hace 2 horas",
  "post_1_content": "Compañeros, ¿alguien ha tenido problemas con la tarjeta inverter de un LG Dual Inverter 18K? Me marca error CH38 pero las presiones están normales.",
  "post_2_time": "Hace 5 horas",
  "post_2_content": "Hoy realicé un mantenimiento profundo a un equipo de 5 toneladas. Recuerden siempre verificar los capacitores del fan exterior, estaban a punto de fallar por el calor de estos días.",
  "post_3_time": "Ayer",
  "post_3_content": "¿Qué marca de gas refrigerante R-410A están recomendando actualmente? He notado variaciones de calidad en los cilindros genéricos.",
  "author_1": "Carlos Técnico",
  "author_2": "Mantenimiento Pro",
  "author_3": "Refrigeración Express"
};

const enNewKeys = {
  "create_post": "Create Post",
  "search_community": "Search queries, brands or errors...",
  "no_posts_found": "No posts found.",
  "create_post_title": "Create Publication",
  "category": "Category",
  "content": "Content",
  "post_placeholder": "Write your query, tip or recommendation here...",
  "cancel": "Cancel",
  "publish": "Publish",
  "tag_all": "All",
  "tag_doubts": "Doubts",
  "tag_tips": "Tips",
  "tag_tools": "Tools",
  "tag_spare_parts": "Spare Parts",
  "just_now": "Just now",
  "technician_you": "Technician (You)",
  "post_1_time": "2 hours ago",
  "post_1_content": "Colleagues, has anyone had issues with the inverter board of an LG Dual Inverter 18K? It shows CH38 error but pressures are normal.",
  "post_2_time": "5 hours ago",
  "post_2_content": "Today I performed a deep maintenance on a 5-ton unit. Always remember to check the outdoor fan capacitors, they were about to fail due to the heat these days.",
  "post_3_time": "Yesterday",
  "post_3_content": "Which brand of R-410A refrigerant gas are you currently recommending? I've noticed quality variations in generic cylinders.",
  "author_1": "Carlos Technician",
  "author_2": "Pro Maintenance",
  "author_3": "Express Cooling"
};

fs.writeFileSync(esPath, JSON.stringify({ ...esData, ...esNewKeys }, null, 2));
fs.writeFileSync(enPath, JSON.stringify({ ...enData, ...enNewKeys }, null, 2));
console.log("i18n files updated");
