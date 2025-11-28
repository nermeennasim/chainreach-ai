// Check Excel file structure
const XLSX = require('xlsx');

const filePath = process.argv[2] || './ChainReach_AI_Customers_1000.xlsx';

console.log('📂 Reading Excel file:', filePath);
console.log('');

try {
  const workbook = XLSX.readFile(filePath);
  
  console.log('📊 Workbook info:');
  console.log(`   Sheets: ${workbook.SheetNames.length}`);
  console.log('');
  
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`📄 Sheet ${index + 1}: "${sheetName}"`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`   Rows: ${data.length}`);
    
    if (data.length > 0) {
      console.log('   Columns:', Object.keys(data[0]).join(', '));
      console.log('');
      console.log('   First 3 rows:');
      data.slice(0, 3).forEach((row, i) => {
        console.log(`   ${i + 1}. ${JSON.stringify(row)}`);
      });
    }
    console.log('');
  });
  
} catch (error) {
  console.error('❌ Error reading file:', error.message);
}
