const fs = require('fs');
const path = require('path');
// converter.js の場所に合わせて調整してください
const converter = require('./modules/converter'); 

// 設定ファイルの読み込み（テンプレート情報を解決するため）
const storageDir = path.join(__dirname, '../storage');
const templatePath = path.join(storageDir, 'templates.json');

async function run() {
  // コマンドライン引数を取得
  // node src/worker.js [input] [output] [templateId]
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error("引数が不足しています: input output templateId");
    process.exit(1);
  }

  const [inputDir, outputDir, templateId] = args;

  console.log(`開始: ${new Date().toISOString()}`);
  console.log(`Input: ${inputDir}`);
  
  try {
    // 1. テンプレート情報の取得
    if (!fs.existsSync(templatePath)) throw new Error("テンプレートファイルが見つかりません");
    const templates = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
    const targetTemplate = templates.find(t => t.id === templateId);

    if (!targetTemplate) throw new Error("テンプレートが見つかりません ID:" + templateId);

    // 2. 入力フォルダ内のファイルを検索 (csv/txt)
    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.csv') || f.endsWith('.txt'));
    
    if (files.length === 0) {
      console.log("処理対象ファイルがありませんでした。");
      return;
    }

    // 3. 各ファイルを変換
    for (const file of files) {
      const fullInputPath = path.join(inputDir, file);
      console.log(`変換中: ${file}`);
      
      await converter.convert(fullInputPath, outputDir, targetTemplate);
    }
    
    console.log("全処理完了");

  } catch (err) {
    console.error("エラー発生:", err);
    process.exit(1);
  }
}

run();