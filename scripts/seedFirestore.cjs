const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const keyPath = path.resolve(__dirname, '../firebase-key.json');
if (!fs.existsSync(keyPath)) {
  console.error("Error: No se encontró el archivo firebase-key.json en la raíz del proyecto.");
  process.exit(1);
}

const serviceAccount = require(keyPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seed() {
  const csvPath = path.resolve(__dirname, '../Media/clean_ufc_dataset.csv');
  const jsonPath = path.resolve(__dirname, '../Media/win_and_title_data-ufc.json');

  if (!fs.existsSync(csvPath) || !fs.existsSync(jsonPath)) {
    console.error("Error: No se encontraron los archivos de datos en la carpeta Media.");
    process.exit(1);
  }

  console.log("Leyendo archivos de datos...");
  const csvDataText = fs.readFileSync(csvPath, 'utf8');
  const jsonDataText = fs.readFileSync(jsonPath, 'utf8');
  const winTitleMap = JSON.parse(jsonDataText);

  console.log("Parseando archivo CSV...");
  const parsed = Papa.parse(csvDataText, {
    header: true,
    skipEmptyLines: true
  });

  const rows = parsed.data;
  console.log(`Se encontraron ${rows.length} registros de peleas en el CSV.`);

  const collectionRef = db.collection('ufc_fights');

  console.log("Subiendo datos a Firestore en lotes (batches) de 500...");
  let batch = db.batch();
  let count = 0;
  let batchCount = 0;

  for (const row of rows) {
    if (!row.fight_url) continue;

    // Obtener datos del JSON
    const extra = winTitleMap[row.fight_url] || {};
    const winner = extra.winner || "";
    const is_title_fight = extra.is_title_fight !== undefined ? extra.is_title_fight : false;

    // Limpiar y tipar datos
    const fightDoc = {
      event_name: row.event_name || "",
      event_date: row.event_date || "",
      fighter_1: row.fighter_1 || "",
      fighter_2: row.fighter_2 || "",
      method: row.method || "",
      round_num: parseInt(row.round_num, 10) || 0,
      time: row.time || "",
      f1_Height_cm: parseFloat(row.f1_Height_cm) || 0,
      f1_Weight_kg: parseFloat(row.f1_Weight_kg) || 0,
      f1_Reach_cm: parseFloat(row.f1_Reach_cm) || 0,
      f2_Height_cm: parseFloat(row.f2_Height_cm) || 0,
      f2_Weight_kg: parseFloat(row.f2_Weight_kg) || 0,
      f2_Reach_cm: parseFloat(row.f2_Reach_cm) || 0,
      event_url: row.event_url || "",
      fight_url: row.fight_url || "",
      fighter_1_url: row.fighter_1_url || "",
      fighter_2_url: row.fighter_2_url || "",
      weight_class: row.weight_class || "",
      f1_KD: parseFloat(row.f1_KD) || 0,
      f2_KD: parseFloat(row.f2_KD) || 0,
      f1_Ctrl: row.f1_Ctrl || "00:00",
      f2_Ctrl: row.f2_Ctrl || "00:00",
      event_location: row.event_location || "",
      f1_Stance: row.f1_Stance || "Orthodox",
      f1_DOB: row.f1_DOB || "",
      f2_Stance: row.f2_Stance || "Orthodox",
      f2_DOB: row.f2_DOB || "",
      f1_Sig_str_landed: parseFloat(row.f1_Sig_str_landed) || 0,
      f1_Sig_str_attempted: parseFloat(row.f1_Sig_str_attempted) || 0,
      f1_Td_landed: parseFloat(row.f1_Td_landed) || 0,
      f1_Td_attempted: parseFloat(row.f1_Td_attempted) || 0,
      f2_Sig_str_landed: parseFloat(row.f2_Sig_str_landed) || 0,
      f2_Sig_str_attempted: parseFloat(row.f2_Sig_str_attempted) || 0,
      f2_Td_landed: parseFloat(row.f2_Td_landed) || 0,
      f2_Td_attempted: parseFloat(row.f2_Td_attempted) || 0,
      winner: winner,
      is_title_fight: is_title_fight
    };

    // Usar la ID de la pelea como la ID del documento en Firestore
    const docId = row.fight_url.split('/').pop() || `fight_${count}`;
    const docRef = collectionRef.doc(docId);
    batch.set(docRef, fightDoc);

    count++;
    batchCount++;

    if (batchCount === 500) {
      await batch.commit();
      console.log(`Progreso: ${count} / ${rows.length} peleas migradas.`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  // Remanente
  if (batchCount > 0) {
    await batch.commit();
    console.log(`Lote final enviado: ${count} peleas registradas en total.`);
  }

  console.log("¡Seeding completado con éxito!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Error durante el seeding:", err);
  process.exit(1);
});
