/**
 * 銀行明細 月次シート自動生成ツール
 *
 * ネットバンクの照会画面（入出金明細・残高照会）を貼り付けタブにコピペして
 * メニューから「月次シート生成」を実行すると、
 * 「会計データ ※月ごと」配下の対象月フォルダ（例: 202606）に
 * 従来と同じ形式・同じファイル名のスプレッドシートを自動作成します。
 *
 * 使い方は同梱の README.md を参照してください。
 */

const CONFIG_SHEET_NAME = '設定';
const USAGE_SHEET_NAME = '使い方';

// 設定タブ内の位置（行番号は1始まり）
const CFG_PARENT_FOLDER_CELL = 'B2';
const CFG_SALARY_MIN_CELL = 'B3';
const CFG_OUTPUT_DEF_START_ROW = 7; // 出力定義の1行目
const CFG_OUTPUT_DEF_COUNT = 6;
const CFG_RULE_START_ROW = 16; // 分類ルールの1行目

// デフォルト値（初期セットアップ時に設定タブへ書き込まれる。以後は設定タブが正）
const DEFAULT_PARENT_FOLDER_ID = '18FBfcMiEjRkHQScRpcjWXrlmjlWEe-Sf'; // 会計データ ※月ごと
const DEFAULT_SALARY_MIN = 100000;

const DEFAULT_OUTPUT_DEFS = [
  // [貼り付けタブ名, 出力ファイル名, 種別, 分類列を付ける]
  ['SPみずほ明細', '【SP】みずほ銀行明細', '明細', true],
  ['SPみずほ残高', '【SP】みずほ銀行月末残高', '残高', false],
  ['EMみずほ明細', '【EM】みずほ銀行明細', '明細', false],
  ['EMみずほ残高', '【EM】みずほ銀行月末残高', '残高', false],
  ['西武明細', '【西武信用金庫】明細', '明細', false],
  ['西武残高', '【西武信用金庫】月末残高', '残高', false],
];

const DEFAULT_RULES = [
  // [カテゴリ, キーワード（カンマ区切り・摘要の部分一致）]
  ['販管費', 'ｱﾒﾂｸｽ'],
  ['人件費', 'ﾅﾙｻﾜ ﾐｽﾞｷ,ｺﾊﾞﾔｼ ｴﾘ,ﾔﾏﾀﾞ ﾕｳﾔ,ｲｼﾓﾘ ﾀｲｾｲ,ﾀｹｳﾁ ｺｳｷ,ﾐﾔｳﾁ ﾕｳｽｹ,ﾔﾏﾄ ｶｽﾞﾋﾛ,ｶﾄｳ ﾐﾕｳ,ｲﾅｶﾞｷ ﾕﾐｺ,ﾀｹｳﾁ ﾕｳﾔ'],
  ['税金', 'ｺｸｾﾞｲ,ﾁﾎｳｾﾞｲ,ｾﾞｲﾑｼﾖ'],
  ['社保', 'ｼﾔｶｲﾎｹﾝ'],
];

const CATEGORY_ORDER = ['販管費', '人件費', '税金', '社保'];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏦 銀行明細ツール')
    .addItem('① 初期セットアップ（タブ作成）', 'setupControlPanel')
    .addItem('② 月次シート生成', 'generateMonthlySheets')
    .addItem('③ 貼り付けタブをクリア', 'clearPasteSheets')
    .addToUi();
}

/** ① 貼り付けタブ・設定タブ・使い方タブを作成する（既存タブは壊さない） */
function setupControlPanel() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 設定タブ
  let cfg = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!cfg) {
    cfg = ss.insertSheet(CONFIG_SHEET_NAME);
    cfg.getRange('A1:B1').setValues([['設定項目', '値']]).setFontWeight('bold');
    cfg.getRange('A2').setValue('出力先親フォルダID（会計データ ※月ごと）');
    cfg.getRange(CFG_PARENT_FOLDER_CELL).setValue(DEFAULT_PARENT_FOLDER_ID);
    cfg.getRange('A3').setValue('人件費とみなす最低金額（円）');
    cfg.getRange(CFG_SALARY_MIN_CELL).setValue(DEFAULT_SALARY_MIN);

    cfg.getRange('A6:D6')
      .setValues([['貼り付けタブ名', '出力ファイル名', '種別（明細/残高）', '分類列を付ける']])
      .setFontWeight('bold');
    cfg.getRange(CFG_OUTPUT_DEF_START_ROW, 1, DEFAULT_OUTPUT_DEFS.length, 4).setValues(DEFAULT_OUTPUT_DEFS);

    cfg.getRange('A15:B15')
      .setValues([['分類カテゴリ', 'キーワード（カンマ区切り・摘要の部分一致）']])
      .setFontWeight('bold');
    cfg.getRange(CFG_RULE_START_ROW, 1, DEFAULT_RULES.length, 2).setValues(DEFAULT_RULES);
    cfg.setColumnWidths(1, 2, 320);
  }

  // 貼り付けタブ
  getOutputDefs(cfg).forEach(def => {
    if (!ss.getSheetByName(def.pasteTab)) {
      const sh = ss.insertSheet(def.pasteTab);
      sh.setTabColor('#4a86e8');
    }
  });

  // 使い方タブ
  if (!ss.getSheetByName(USAGE_SHEET_NAME)) {
    const usage = ss.insertSheet(USAGE_SHEET_NAME);
    usage.getRange('A1:A8').setValues([
      ['【毎月の手順】'],
      ['1. 各ネットバンクで対象月の「入出金明細照会」「残高照会」画面を開く'],
      ['2. 画面全体を選択してコピーし、対応する貼り付けタブへ A1 起点でそのまま貼り付ける（従来、新規シートに貼っていたのと同じ操作）'],
      ['3. メニュー「🏦 銀行明細ツール」→「② 月次シート生成」を実行'],
      ['4. 対象月フォルダに6ファイルが自動作成される（既存の同名ファイルがある場合はスキップ）'],
      ['5. 生成結果ダイアログで件数・合計・分類額を確認（分類は摘要キーワードによる自動判定なので最終確認は目視で）'],
      [''],
      ['※ 貼り付けるタブが一部だけでもOK。空のタブはスキップされます。'],
    ]);
    usage.setColumnWidth(1, 900);
  }

  SpreadsheetApp.getUi().alert('セットアップ完了。貼り付けタブと設定タブを作成しました。');
}

/** ② メイン処理：貼り付け内容から月次シートを生成 */
function generateMonthlySheets() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cfg = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!cfg) {
    ui.alert('設定タブがありません。先に「① 初期セットアップ」を実行してください。');
    return;
  }

  const parentFolderId = String(cfg.getRange(CFG_PARENT_FOLDER_CELL).getValue()).trim();
  const salaryMin = Number(cfg.getRange(CFG_SALARY_MIN_CELL).getValue()) || 0;
  const rules = getRules(cfg);
  const defs = getOutputDefs(cfg);

  // 貼り付け済みタブを収集
  const jobs = [];
  defs.forEach(def => {
    const sh = ss.getSheetByName(def.pasteTab);
    if (!sh || sh.getLastRow() === 0) return;
    const values = sh.getDataRange().getValues();
    if (values.every(row => row.every(c => c === ''))) return;
    jobs.push({ def, values });
  });

  if (jobs.length === 0) {
    ui.alert('貼り付けタブがすべて空です。ネットバンクの照会画面を貼り付けてから実行してください。');
    return;
  }

  // 対象月の判定（貼り付け内容の日付から多数決）
  const month = detectTargetMonth(jobs);
  if (!month) {
    ui.alert('貼り付け内容から対象月（勘定日・照会期間）を読み取れませんでした。');
    return;
  }

  const resp = ui.alert(
    '月次シート生成',
    `対象月: ${month} のフォルダに ${jobs.length} ファイルを作成します。よろしいですか？`,
    ui.ButtonSet.OK_CANCEL
  );
  if (resp !== ui.Button.OK) return;

  const folder = getOrCreateMonthFolder(parentFolderId, month);
  const report = [`対象月: ${month}`, `出力先: ${folder.getName()}`, ''];

  jobs.forEach(job => {
    try {
      report.push(processJob(job, folder, rules, salaryMin));
    } catch (e) {
      report.push(`✗ ${job.def.fileName}: エラー ${e.message}`);
    }
  });

  ui.alert('生成結果', report.join('\n'), ui.ButtonSet.OK);
}

/** 1タブ分を新規スプレッドシートとして出力する */
function processJob(job, folder, rules, salaryMin) {
  const { def, values } = job;

  // 同名ファイルが既にあればスキップ（上書き事故防止）
  const existing = folder.getFilesByName(def.fileName);
  if (existing.hasNext()) {
    return `− ${def.fileName}: 同名ファイルが既に存在するためスキップ`;
  }

  const newSs = SpreadsheetApp.create(def.fileName);
  const sheet = newSs.getSheets()[0];

  // 貼り付け内容をそのまま転記（税理士さんが見慣れた形式を維持）
  const numCols = Math.max(...values.map(r => r.length));
  const rect = values.map(r => {
    const row = r.slice();
    while (row.length < numCols) row.push('');
    return row;
  });
  sheet.getRange(1, 1, rect.length, numCols).setValues(rect);

  let note = '';
  if (def.kind === '明細') {
    note = decorateMeisai(sheet, values, def, rules, salaryMin);
  }

  DriveApp.getFileById(newSs.getId()).moveTo(folder);
  return `✓ ${def.fileName}: 作成${note}`;
}

/**
 * 明細シートに合計行と（設定に応じて）分類列を追記する。
 * 返り値はレポート用の補足文字列。
 */
function decorateMeisai(sheet, values, def, rules, salaryMin) {
  const headerIdx = values.findIndex(
    r => String(r[0]).trim() === '番号' && r.some(c => String(c).indexOf('勘定日') >= 0)
  );
  if (headerIdx < 0) return '（明細ヘッダー行が見つからず、貼り付け内容のみ転記）';

  const header = values[headerIdx];
  const col = name => header.findIndex(c => String(c).indexOf(name) >= 0);
  const cOut = col('出金');
  const cIn = col('入金');
  const cDesc = col('摘要');
  if (cOut < 0 || cIn < 0 || cDesc < 0) return '（列構成を認識できず、貼り付け内容のみ転記）';

  // 明細行の抽出（合計行・空行は除外）
  const txRows = [];
  for (let i = headerIdx + 1; i < values.length; i++) {
    const r = values[i];
    const first = String(r[0]).trim();
    if (first.indexOf('合計') >= 0) break;
    if (parseAmount(first) === null) continue; // 番号列が数値の行のみ明細とみなす（合計行・注記行を除外）
    const out = parseAmount(r[cOut]);
    const inn = parseAmount(r[cIn]);
    if (out === null && inn === null) continue;
    txRows.push({ row: i, out: out || 0, inn: inn || 0, desc: String(r[cDesc] || '') });
  }
  if (txRows.length === 0) return '（明細行が見つからず、貼り付け内容のみ転記）';

  const totalOut = txRows.reduce((s, t) => s + t.out, 0);
  const totalIn = txRows.reduce((s, t) => s + t.inn, 0);

  // 合計行（貼り付け内容に合計行が含まれていない場合のみ追記）
  const hasTotalRow = values.some(r => String(r[0]).indexOf('合計') >= 0);
  if (!hasTotalRow) {
    const lastDataRow = txRows[txRows.length - 1].row + 1; // 1始まり
    sheet.getRange(lastDataRow + 1, cOut + 1, 1, 2)
      .setValues([[totalOut, totalIn]])
      .setNumberFormat('¥#,##0');
  }

  let note = `（明細${txRows.length}件 / 出金計 ¥${fmt(totalOut)} / 入金計 ¥${fmt(totalIn)}）`;

  // 分類列（出金のみを摘要キーワードで集計し、ヘッダー行の右に追記）
  if (def.classify) {
    const sums = {};
    CATEGORY_ORDER.forEach(c => (sums[c] = 0));
    txRows.forEach(t => {
      if (!t.out) return;
      const cat = classify(t.desc, t.out, rules, salaryMin);
      if (cat) sums[cat] += t.out;
    });

    const startCol = header.length + 1; // 既存列の右隣
    sheet.getRange(headerIdx + 1, startCol, 1, CATEGORY_ORDER.length)
      .setValues([CATEGORY_ORDER])
      .setFontWeight('bold');
    sheet.getRange(headerIdx + 2, startCol, 1, CATEGORY_ORDER.length)
      .setValues([CATEGORY_ORDER.map(c => sums[c])])
      .setNumberFormat('#,##0');

    note += ' 分類: ' + CATEGORY_ORDER.map(c => `${c} ¥${fmt(sums[c])}`).join(' / ');
  }
  return note;
}

/** 摘要のキーワード一致でカテゴリを返す。人件費のみ金額の下限条件あり。 */
function classify(desc, amount, rules, salaryMin) {
  for (const rule of rules) {
    const hit = rule.keywords.some(kw => kw && desc.indexOf(kw) >= 0);
    if (!hit) continue;
    if (rule.category === '人件費' && amount < salaryMin) continue;
    return rule.category;
  }
  return null;
}

/** ③ 貼り付けタブを空にする */
function clearPasteSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cfg = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!cfg) return;
  getOutputDefs(cfg).forEach(def => {
    const sh = ss.getSheetByName(def.pasteTab);
    if (sh) sh.clear();
  });
  SpreadsheetApp.getUi().alert('貼り付けタブをクリアしました。');
}

// ---------- ヘルパー ----------

function getOutputDefs(cfg) {
  const rows = cfg.getRange(CFG_OUTPUT_DEF_START_ROW, 1, CFG_OUTPUT_DEF_COUNT, 4).getValues();
  const defs = rows
    .filter(r => r[0] && r[1])
    .map(r => ({
      pasteTab: String(r[0]).trim(),
      fileName: String(r[1]).trim(),
      kind: String(r[2]).trim(),
      classify: r[3] === true || String(r[3]).toUpperCase() === 'TRUE',
    }));
  return defs.length ? defs : DEFAULT_OUTPUT_DEFS.map(r => ({
    pasteTab: r[0], fileName: r[1], kind: r[2], classify: r[3],
  }));
}

function getRules(cfg) {
  const rows = cfg.getRange(CFG_RULE_START_ROW, 1, 20, 2).getValues();
  return rows
    .filter(r => r[0] && r[1])
    .map(r => ({
      category: String(r[0]).trim(),
      keywords: String(r[1]).split(',').map(s => s.trim()).filter(Boolean),
    }));
}

/** 「1,838,911」「¥1,234」「1234」→ 数値。数値でなければ null */
function parseAmount(v) {
  if (typeof v === 'number') return v;
  const s = String(v).replace(/[¥,，\s]/g, '');
  if (!s || !/^\d+$/.test(s)) return null;
  return Number(s);
}

/** 貼り付け内容の日付（yyyy年MM月dd日 / 照会期間）から対象月 yyyyMM を多数決で決める */
function detectTargetMonth(jobs) {
  const counts = {};
  jobs.forEach(job => {
    job.values.forEach(row => {
      row.forEach(cell => {
        const m = String(cell).match(/(\d{4})年(\d{1,2})月\d{1,2}日/);
        if (m) {
          const key = m[1] + ('0' + m[2]).slice(-2);
          counts[key] = (counts[key] || 0) + 1;
        }
      });
    });
  });
  const keys = Object.keys(counts);
  if (!keys.length) return null;
  keys.sort((a, b) => counts[b] - counts[a]);
  return keys[0];
}

function getOrCreateMonthFolder(parentFolderId, month) {
  const parent = DriveApp.getFolderById(parentFolderId);
  const it = parent.getFoldersByName(month);
  return it.hasNext() ? it.next() : parent.createFolder(month);
}

function fmt(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
