import PDFDocument from "pdfkit";

function money(value = 0) {
  return `Rs ${Number(value || 0).toLocaleString()}`;
}

export function generatePayslipPdf(item) {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  doc.fontSize(22).fillColor("#e30613").text("Dream EMS", { align: "center" });
  doc.fontSize(14).fillColor("#111").text("Employee Salary Slip", { align: "center" });
  doc.moveDown();

  doc.fontSize(10).fillColor("#555").text(`Month: ${item.payroll_month}/${item.payroll_year}`);
  doc.text(`Employee: ${item.full_name}`);
  doc.text(`Employee Code: ${item.employee_code}`);
  doc.text(`Department: ${item.department || "-"}`);
  doc.moveDown();

  doc.fontSize(13).fillColor("#111").text("Earnings", { underline: true });
  doc.moveDown(0.5);
  doc.text(`Basic Salary: ${money(item.basic_salary)}`);
  doc.text(`Allowances: ${money(item.total_allowances)}`);
  doc.text(`Overtime Amount: ${money(item.overtime_amount)}`);
  doc.text(`Gross Salary: ${money(item.gross_salary)}`);
  doc.moveDown();

  doc.fontSize(13).text("Deductions", { underline: true });
  doc.moveDown(0.5);
  doc.text(`Late Deduction: ${money(item.late_deduction)}`);
  doc.text(`Absent Deduction: ${money(item.absent_deduction)}`);
  doc.text(`Leave Deduction: ${money(item.leave_deduction)}`);
  doc.text(`Total Deductions: ${money(item.total_deductions)}`);
  doc.moveDown();

  doc.fontSize(16).fillColor("#e30613").text(`Net Salary: ${money(item.net_salary)}`);
  doc.moveDown();

  doc.fontSize(11).fillColor("#111").text("Note:", { underline: true });
  doc.fontSize(10).fillColor("#555").text(
    item.note ||
      "We have sent you your full salary. Please be careful next time regarding attendance, leaves and late arrivals."
  );

  doc.moveDown(2);
  doc.fontSize(9).fillColor("#777").text("This is a system generated salary slip.", {
    align: "center",
  });

  return doc;
}