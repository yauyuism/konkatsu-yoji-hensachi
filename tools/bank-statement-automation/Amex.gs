/**
 * AMEXカード明細 勘定科目仕分けモジュール
 *
 * 月次フォルダ（会計データ ※月ごと/YYYYMM）にアップロード済みの AMEX.csv を読み取り、
 * 利用先名のキーワードルールで勘定科目を自動仕分けした
 * 「【AMEX】明細（科目仕分け）」スプレッドシートを同じフォルダに生成する。
 *
 * 銀行明細ツール（Code.gs）と同じスプレッドシートに追加して使う。
 */

const AMEX_RULE_SHEET_NAME = 'AMEX仕分けルール';
const AMEX_CSV_NAME = 'AMEX.csv';
const AMEX_OUTPUT_NAME = '【AMEX】明細（科目仕分け）';
const AMEX_UNCLASSIFIED = '未分類';
const AMEX_EXCLUDED = '対象外（口座振替）';

// 初期ルール（上から順に判定。設定タブで自由に編集・追加できる）
// ※科目名はあくまで初期案。税理士さんの科目体系に合わせて調整すること。
const AMEX_DEFAULT_RULES = [
  [AMEX_EXCLUDED, '口座振替'],
  ['諸会費', '基本カード年会費,消費税'],
  ['広告宣伝費', 'FACEBK,GOOGLE*ADS,GOOGLE *ADS'],
  ['通信費', 'SLACK,WORKSPACE,ソフトバング,ソフトバンク,楽天モバイル,ＵＱ　ＷｉＭＡＸ,FONDESK,MIXHOST,エックスサーバー,お名前,ロリポップ,ＧａｍｅＷｉｔｈ光,レジストリ,ＣｏｎｏＨａ,さくらインターネット,ＪＥＴＢＯＹ,レンタルサ,オプテージ,ａｕ電話'],
  ['支払手数料', 'OPENAI,ANTHROPIC,CLAUDE,AHREFS,MICROSOFT,SHUTTERSTOCK,RAKKO,X CORP,SHOPIFY,PAYPAL,YOUTUBEPREMIUM,ZOOM,NOTION,CANVA,Ａｐｐｌｅ　ｉＴｕｎｅｓ,クラウドサイン,アドビ'],
  ['旅費交通費', 'モバイルＳｕｉｃａ,モバイルSuica,モバイルＰＡＳＭＯ,ＧＯアプリ,LUUP,CHARGESPOT,タクシー,駐車場,スマートＥＸ,スマートEX,ＥＴＣ,レンタカー,石油,自動車交通'],
  ['福利厚生費', 'UBER EATS,出前館,でまえかん,ｍｅｎｕ'],
  ['接待交際費', 'MIJIKAYO'],
  ['消耗品費', 'アマゾン,ヨドバシ,ビックカメラ,KOKYUNAVI'],
  ['外注費', 'クラウドワークス'],
  ['荷造運賃', 'プラスシッピング'],
  ['会議費', 'ｉｎｓｔａｂａｓｅ,貸会議室,珈琲,喫茶,ルノアール,カフェ,スターバックス,ドトール,タリーズ,バーガーキング,マクドナルド,すき家,ガスト,サイゼリヤ,マンマパスタ,レストラン,一蘭,ココス,デニーズ,ロイヤルホスト'],
  ['採用教育費', 'ＯｐｅｎＷｏｒｋ'],
  ['保険料', '海上火災保険'],
];

/** メニュー「④ AMEX明細を仕分け」 */
function amexClassify() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cfg = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!cfg) {
    ui.alert('設定タブがありません。先に「① 初期セットアップ」を実行してください。');
    return;
  }
  ensureAmexRuleSheet(ss);

  // 対象月の入力（デフォルト＝先月）
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const defaultMonth = prev.getFullYear() + ('0' + (prev.getMonth() + 1)).slice(-2);
  const resp = ui.prompt(
    'AMEX明細の仕分け',
    `対象月をYYYYMM形式で入力してください（例: ${defaultMonth}）。\n空欄のままOKで ${defaultMonth} を使います。`,
    ui.ButtonSet.OK_CANCEL
  );
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  const month = (resp.getResponseText().trim() || defaultMonth);
  if (!/^\d{6}$/.test(month)) {
    ui.alert('YYYYMM形式（例: 202606）で入力してください。');
    return;
  }

  // 月次フォルダとAMEX.csvの取得
  const parentFolderId = String(cfg.getRange(CFG_PARENT_FOLDER_CELL).getValue()).trim();
  const parent = DriveApp.getFolderById(parentFolderId);
  const folderIt = parent.getFoldersByName(month);
  if (!folderIt.hasNext()) {
    ui.alert(`フォルダ「${month}」が見つかりません。先にAMEX.csvを月次フォルダへアップロードしてください。`);
    return;
  }
  const folder = folderIt.next();
  const csvIt = folder.getFilesByName(AMEX_CSV_NAME);
  if (!csvIt.hasNext()) {
    ui.alert(`フォルダ「${month}」に ${AMEX_CSV_NAME} がありません。カード会社からダウンロードしてアップロードしてください。`);
    return;
  }
  if (folder.getFilesByName(AMEX_OUTPUT_NAME).hasNext()) {
    ui.alert(`「${AMEX_OUTPUT_NAME}」が既に存在するため中止しました（上書き防止）。作り直す場合は既存ファイルを削除してください。`);
    return;
  }

  // CSV読み取り（AMEXのCSVはShift_JIS）
  const csvText = csvIt.next().getBlob().getDataAsString('Shift_JIS');
  const rules = getAmexRules(ss);
  const result = amexBuildOutput(csvText, rules);

  // 出力スプレッドシート作成
  const newSs = SpreadsheetApp.create(AMEX_OUTPUT_NAME);
  const sheet = newSs.getSheets()[0];
  sheet.getRange(1, 1, result.rows.length, result.rows[0].length).setValues(result.rows);
  sheet.getRange(1, 1, 1, result.rows[0].length).setFontWeight('bold');
  sheet.getRange(result.summaryHeaderRow, 1, 1, 3).setFontWeight('bold');
  sheet.getRange(2, 6, result.txCount, 1).setNumberFormat('#,##0');
  sheet.getRange(result.summaryHeaderRow + 1, 2, result.summaryCount, 1).setNumberFormat('#,##0');
  sheet.setFrozenRows(1);
  DriveApp.getFileById(newSs.getId()).moveTo(folder);

  const lines = [
    `✓ ${AMEX_OUTPUT_NAME} を ${month} フォルダに作成しました。`,
    `明細 ${result.txCount}件 / 経費合計 ¥${fmt(result.total)}`,
    '',
    '科目別合計:',
  ];
  result.summary.forEach(([cat, sum, cnt]) => lines.push(`  ${cat}: ¥${fmt(sum)}（${cnt}件）`));
  if (result.unclassified > 0) {
    lines.push('', `⚠ 未分類が ${result.unclassified}件 あります。出力シートで科目を手入力し、` +
      `よく出る利用先は「${AMEX_RULE_SHEET_NAME}」タブにキーワード追加してください。`);
  }
  ui.alert('AMEX仕分け結果', lines.join('\n'), ui.ButtonSet.OK);
}

/**
 * CSVテキストとルールから出力シートの二次元配列と集計を作る（純粋関数・テスト可能）。
 * 返り値: { rows, txCount, total, summary, summaryHeaderRow, summaryCount, unclassified }
 */
function amexBuildOutput(csvText, rules) {
  const records = amexParseCsv(csvText);
  if (records.length < 2) throw new Error('CSVに明細行がありません');
  const header = records[0];
  const data = records.slice(1).filter(r => r.length >= 6 && r[0]);

  const rows = [header.concat(['勘定科目'])];
  const width = rows[0].length;
  const sums = {}; // cat -> {sum, cnt}
  let total = 0;
  let unclassified = 0;

  data.forEach(r => {
    const desc = String(r[2] || '');
    const amount = amexParseAmount(r[5]);
    const cat = amexClassifyRow(desc, rules);
    if (cat === AMEX_UNCLASSIFIED) unclassified++;
    if (!sums[cat]) sums[cat] = { sum: 0, cnt: 0 };
    sums[cat].sum += amount;
    sums[cat].cnt++;
    if (cat !== AMEX_EXCLUDED) total += amount;
    const row = r.slice(0, width - 1);
    while (row.length < width - 1) row.push('');
    row[5] = amount; // 金額は数値化
    rows.push(row.concat([cat]));
  });

  // 集計ブロック
  rows.push(new Array(width).fill(''));
  const summaryHeaderRow = rows.length + 1; // 1始まり行番号
  rows.push(pad(['勘定科目', '金額合計', '件数'], width));
  const summary = Object.keys(sums)
    .sort((a, b) => sums[b].sum - sums[a].sum)
    .map(cat => [cat, sums[cat].sum, sums[cat].cnt]);
  summary.forEach(s => rows.push(pad(s, width)));
  rows.push(pad(['合計（対象外を除く）', total, ''], width));

  return {
    rows,
    txCount: data.length,
    total,
    summary,
    summaryHeaderRow,
    summaryCount: summary.length + 1,
    unclassified,
  };
}

/** 利用内容のキーワード一致（大文字小文字・全角半角の英数字を無視、上のルール優先） */
function amexClassifyRow(desc, rules) {
  const norm = amexNormalize(desc);
  for (const rule of rules) {
    if (rule.keywords.some(kw => kw && norm.indexOf(amexNormalize(kw)) >= 0)) {
      return rule.category;
    }
  }
  return AMEX_UNCLASSIFIED;
}

/** 全角英数字・全角スペースを半角化して大文字に揃える */
function amexNormalize(s) {
  return String(s)
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    .replace(/　/g, ' ')
    .toUpperCase();
}

/** ルールタブを取得（なければ作成） */
function ensureAmexRuleSheet(ss) {
  let sh = ss.getSheetByName(AMEX_RULE_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(AMEX_RULE_SHEET_NAME);
    sh.getRange('A1:B1')
      .setValues([['勘定科目', 'キーワード（カンマ区切り・利用内容の部分一致・上の行が優先）']])
      .setFontWeight('bold');
    sh.getRange(2, 1, AMEX_DEFAULT_RULES.length, 2).setValues(AMEX_DEFAULT_RULES);
    sh.setColumnWidth(1, 180);
    sh.setColumnWidth(2, 700);
  }
  return sh;
}

function getAmexRules(ss) {
  const sh = ensureAmexRuleSheet(ss);
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, 2).getValues()
    .filter(r => r[0] && r[1])
    .map(r => ({
      category: String(r[0]).trim(),
      keywords: String(r[1]).split(',').map(s => s.trim()).filter(Boolean),
    }));
}

/** 「"150,000"」「-1,700」「918」→ 数値（マイナス対応） */
function amexParseAmount(v) {
  if (typeof v === 'number') return v;
  const s = String(v).replace(/["¥,，\s]/g, '');
  const n = Number(s);
  return isNaN(n) ? 0 : n;
}

/** RFC4180準拠の簡易CSVパーサ（引用符内のカンマ・改行に対応） */
function amexParseCsv(text) {
  const records = [];
  let field = '', record = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      record.push(field); field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      record.push(field); field = '';
      if (record.some(f => f !== '')) records.push(record);
      record = [];
    } else field += ch;
  }
  record.push(field);
  if (record.some(f => f !== '')) records.push(record);
  return records;
}

function pad(arr, width) {
  const row = arr.slice();
  while (row.length < width) row.push('');
  return row;
}
